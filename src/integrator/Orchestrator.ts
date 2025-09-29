import type {
  ChatMessage,
  OllamaService,
  RequestChat,
  ResponseChat,
  ResponseChatStream,
  ToolCall
} from '@neabyte/ollama-native'
import type {
  OrchestratorConfig,
  OrchestratorOptions,
  OrchestratorPermission,
  OrchestratorPermissionResponse,
  OrchestratorSession,
  OrchestratorToolCall,
  OrchestratorToolResult
} from '@interfaces/Orchestrator'
import { ToolExecutor } from '@core/index'
import { ChatManager, ContextSys } from '@integrator/index'
import { generateId, downloadRipgrep, resolveRipgrepPath } from '@utils/index'
import allToolSchemas from '@schemas/index'

/**
 * Orchestrates chat interactions with tool execution and permission management.
 * @description Manages chat sessions, handles tool calls, and coordinates between chat and tool execution.
 */
export class Orchestrator {
  /** Active sessions map */
  private readonly activeSessions: Map<string, boolean> = new Map()
  /** Manages chat sessions and message storage */
  private readonly chatManager: ChatManager
  /** The Ollama service client for chat interactions */
  private readonly client: OllamaService
  /** System context generator */
  private readonly contextSys: ContextSys
  /** Session permission settings - tracks which sessions have "allow all" enabled */
  private readonly sessionPermissions: Map<string, { allowAll: boolean }> = new Map()
  /** Available tools for the orchestrator */
  private readonly tools: ToolCall[]
  /** Executes tool operations */
  private readonly toolExecutor: ToolExecutor

  /**
   * Creates a new Orchestrator instance.
   * @description Initializes the orchestrator with client and tools.
   * @param config - Configuration object containing client and optional tools
   */
  constructor(config: OrchestratorConfig) {
    this.chatManager = new ChatManager()
    this.client = config.client
    this.contextSys = new ContextSys()
    this.toolExecutor = new ToolExecutor()
    this.tools = (config.tools ?? allToolSchemas) as ToolCall[]
  }

  /**
   * Initializes Ripgrep binary if not already available.
   * @description Checks if Ripgrep is available locally, downloads it if needed.
   * @throws {Error} When Ripgrep initialization fails
   */
  private async initializeRipgrep(): Promise<void> {
    const ripgrepPath: string | null = resolveRipgrepPath()
    if (ripgrepPath === null) {
      try {
        await downloadRipgrep()
      } catch (error) {
        const errorMessage: string = error instanceof Error ? error.message : 'Unknown error'
        throw new Error(`Failed to download Ripgrep: ${errorMessage}`)
      }
    }
  }

  /**
   * Aborts all active sessions.
   * @description Marks all sessions as inactive and aborts the client.
   */
  abort(): void {
    this.activeSessions.clear()
    this.client.abort()
  }

  /**
   * Aborts a specific session.
   * @description Marks a session as inactive and aborts the client.
   * @param sessionId - The session ID to abort
   */
  private abortSession(sessionId: string): void {
    this.activeSessions.set(sessionId, false)
    this.client.abort()
  }

  /**
   * Processes a chat request with tool execution and permission support.
   * @description Handles chat interactions, tool calls, and emits real-time events.
   * @param message - The user message to process
   * @param options - Chat options including event callbacks and settings
   * @returns Promise that resolves to a chat session
   * @throws {Error} When message processing fails or permission is denied
   */
  async chat(message: string, options: OrchestratorOptions): Promise<OrchestratorSession> {
    await this.initializeRipgrep()
    const sessionId: string = this.chatManager.createSession()
    this.activeSessions.set(sessionId, true)
    const session: OrchestratorSession = {
      id: sessionId,
      abort: () => {
        this.abortSession(sessionId)
      },
      isActive: () => (this.activeSessions.get(sessionId) ?? false) === true
    }
    try {
      await this.processChatLoop(sessionId, message, options)
      return session
    } catch (error) {
      this.activeSessions.set(sessionId, false)
      throw error
    }
  }

  /**
   * Emits tool call event.
   * @description Emits the tool call event to notify listeners.
   * @param toolName - Name of the tool
   * @param toolArguments - Tool arguments
   * @param sessionId - Session ID
   * @param options - Chat options
   */
  private emitToolCallEvent(
    toolName: string,
    toolArguments: Record<string, unknown>,
    sessionId: string,
    options: OrchestratorOptions
  ): void {
    const toolCallEvent: OrchestratorToolCall = {
      sessionId,
      toolName,
      arguments: toolArguments
    }
    options.onToolCall?.(toolCallEvent)
  }

  /**
   * Executes a tool and handles the result.
   * @description Executes the tool and adds the result to the session.
   * @param sessionId - Session ID
   * @param toolName - Name of the tool
   * @param toolArguments - Tool arguments
   * @param options - Chat options
   */
  private async executeTool(
    toolName: string,
    toolArguments: Record<string, unknown>,
    sessionId: string,
    options: OrchestratorOptions
  ): Promise<void> {
    const result: string = await this.toolExecutor.execute(toolName, toolArguments)
    const toolResultEvent: OrchestratorToolResult = {
      sessionId,
      toolName,
      result
    }
    options.onToolResult?.(toolResultEvent)
    const toolMessage: ChatMessage = {
      role: 'tool',
      content: result,
      tool_name: toolName
    }
    this.chatManager.addMessage(sessionId, toolMessage)
  }

  /**
   * Extracts tool name and arguments from a tool call.
   * @description Parses the tool call object to extract name and arguments.
   * @param toolCall - The tool call object
   * @returns Object containing tool name and arguments
   */
  private extractToolCallData(toolCall: unknown): {
    toolName: string
    toolArguments: Record<string, unknown>
  } {
    const toolCallObj: { function?: { name?: string; arguments?: Record<string, unknown> } } =
      toolCall as { function?: { name?: string; arguments?: Record<string, unknown> } }
    return {
      toolName: toolCallObj.function?.name ?? '',
      toolArguments: toolCallObj.function?.arguments ?? {}
    }
  }

  /**
   * Finalizes a streaming message when done.
   * @description Adds message to session and handles tool calls.
   * @param sessionId - The session ID
   * @param message - The message to finalize
   * @param options - Chat options
   */
  private async finalizeStreamingMessage(
    sessionId: string,
    message: ChatMessage,
    options: OrchestratorOptions
  ): Promise<void> {
    this.chatManager.addMessage(sessionId, message)
    if (message.tool_calls !== undefined && message.tool_calls.length > 0) {
      await this.handleToolCalls(sessionId, message.tool_calls, options)
    }
  }

  /**
   * Handles permission denied scenario.
   * @description Aborts the session and emits abort event.
   * @param sessionId - Session ID
   * @param options - Chat options
   */
  private handlePermissionDenied(sessionId: string, options: OrchestratorOptions): void {
    options.onAbort?.({
      sessionId,
      reason: 'Permission denied by user'
    })
    this.activeSessions.set(sessionId, false)
  }

  /**
   * Handles tool call execution with permission management.
   * @description Executes tool calls and adds tool responses to the chat session.
   * @param sessionId - The session ID to add tool responses to
   * @param toolCalls - Array of tool calls to execute
   * @param options - Chat options
   */
  private async handleToolCalls(
    sessionId: string,
    toolCalls: unknown[],
    options: OrchestratorOptions
  ): Promise<void> {
    for (const toolCall of toolCalls) {
      if ((this.activeSessions.get(sessionId) ?? false) !== true) {
        break
      }
      const {
        toolName,
        toolArguments
      }: { toolName: string; toolArguments: Record<string, unknown> } =
        this.extractToolCallData(toolCall)
      this.emitToolCallEvent(toolName, toolArguments, sessionId, options)
      const approved: boolean = await this.requestPermission(
        sessionId,
        toolName,
        toolArguments,
        options
      )
      if (!approved) {
        this.handlePermissionDenied(sessionId, options)
        return
      }
      await this.executeTool(toolName, toolArguments, sessionId, options)
    }
  }

  /**
   * Processes the main chat loop with tool execution and permissions.
   * @description Handles iterative chat processing until no more tool calls are needed.
   * @param sessionId - The session ID to process
   * @param message - The user message
   * @param options - Chat options
   */
  private async processChatLoop(
    sessionId: string,
    message: string,
    options: OrchestratorOptions
  ): Promise<void> {
    this.chatManager.addMessage(sessionId, {
      role: 'user',
      content: message
    })
    const sessionMessages: ChatMessage[] = this.chatManager.getMessages(sessionId) ?? []
    const hasSystemMessage: boolean = sessionMessages.some(
      (msg: ChatMessage) => msg.role === 'system'
    )
    if (!hasSystemMessage) {
      this.chatManager.addMessage(sessionId, {
        role: 'system',
        content: this.contextSys.getSystemPrompt()
      })
    }
    let hasToolCalls: boolean = true
    let iterationCount: number = 0
    while (hasToolCalls && (this.activeSessions.get(sessionId) ?? false) === true) {
      iterationCount++
      console.log(`🔄 Processing iteration ${iterationCount}...`)
      const sessionMessages: ChatMessage[] = this.chatManager.getMessages(sessionId) ?? []
      const request: RequestChat = {
        model: options.model,
        messages: sessionMessages,
        tools: this.tools,
        stream: options.stream
      }
      const response: ResponseChat | AsyncIterable<ResponseChatStream> =
        await this.client.chat(request)
      if ((this.activeSessions.get(sessionId) ?? false) !== true) {
        break
      }
      if (options.stream && Symbol.asyncIterator in response) {
        const finalMessage: ChatMessage | null = await this.processStreamingResponse(
          sessionId,
          response,
          options
        )
        hasToolCalls = finalMessage?.tool_calls !== undefined && finalMessage.tool_calls.length > 0
      } else {
        const nonStreamResponse: ResponseChat = response as ResponseChat
        await this.processNonStreamingResponse(sessionId, nonStreamResponse, options)
        hasToolCalls =
          nonStreamResponse.message?.tool_calls !== undefined &&
          nonStreamResponse.message.tool_calls.length > 0
      }
    }
  }

  /**
   * Processes non-streaming chat response.
   * @description Handles standard chat responses without streaming.
   * @param sessionId - The session ID
   * @param response - The chat response
   * @param options - Chat options
   */
  private async processNonStreamingResponse(
    sessionId: string,
    response: ResponseChat,
    options: OrchestratorOptions
  ): Promise<void> {
    if (response.message != null) {
      this.chatManager.addMessage(sessionId, response.message)
      options.onMessage?.(response.message)
      if (response.message.tool_calls !== undefined && response.message.tool_calls.length > 0) {
        await this.handleToolCalls(sessionId, response.message.tool_calls, options)
      }
    }
    if (response.thinking !== undefined && response.thinking.length > 0) {
      options.onThinking?.(response.thinking)
    }
  }

  /**
   * Processes a single streaming chunk.
   * @description Handles thinking and content emission for a chunk.
   * @param chunk - The streaming chunk to process
   * @param currentMessage - The current message being built
   * @param options - Chat options
   */
  private processStreamingChunk(
    chunk: ResponseChatStream,
    currentMessage: ChatMessage | null,
    options: OrchestratorOptions
  ): void {
    if (chunk.thinking !== undefined && chunk.thinking.length > 0) {
      options.onThinking?.(chunk.thinking)
    }
    if (chunk.message?.content != null && chunk.message.content.length > 0) {
      options.onMessage?.({
        content: chunk.message.content,
        role: currentMessage?.role ?? 'assistant'
      })
    }
  }

  /**
   * Processes streaming chat response.
   * @description Handles streaming responses with real-time content updates.
   * @param sessionId - The session ID
   * @param stream - The streaming response iterator
   * @param options - Chat options
   * @returns The final message for tool call checking
   */
  private async processStreamingResponse(
    sessionId: string,
    stream: AsyncIterable<ResponseChatStream>,
    options: OrchestratorOptions
  ): Promise<ChatMessage | null> {
    let currentMessage: ChatMessage | null = null
    try {
      for await (const chunk of stream) {
        if ((this.activeSessions.get(sessionId) ?? false) !== true) {
          break
        }
        this.processStreamingChunk(chunk, currentMessage, options)
        currentMessage = this.updateCurrentMessage(chunk, currentMessage)
        if (chunk.done && currentMessage !== null) {
          await this.finalizeStreamingMessage(sessionId, currentMessage, options)
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return currentMessage
      }
      throw error
    }
    return currentMessage
  }

  /**
   * Processes permission response from user.
   * @description Handles the three permission states: approve, deny, allow_all.
   * @param response - Permission response from user
   * @param toolName - Name of the tool
   * @param sessionId - Session ID
   * @returns True if approved, false if denied
   */
  private processPermissionResponse(
    sessionId: string,
    response: OrchestratorPermissionResponse,
    toolName: string
  ): boolean {
    if (response.action === 'approve') {
      console.log(`✅ Permission granted for ${toolName}`)
      return true
    }
    if (response.action === 'allow_all') {
      this.sessionPermissions.set(sessionId, { allowAll: true })
      console.log(`✅ Permission granted for ${toolName} and enabled allow-all for session`)
      return true
    }
    if (response.action === 'deny') {
      console.log(`❌ Permission denied for ${toolName}`)
      return false
    }
    return false
  }

  /**
   * Requests permission for a tool call.
   * @description Handles permission logic including session-level allow-all.
   * @param toolName - Name of the tool
   * @param toolArguments - Tool arguments
   * @param sessionId - Session ID
   * @param options - Chat options
   * @returns Promise that resolves to true if approved, false if denied
   */
  private async requestPermission(
    sessionId: string,
    toolName: string,
    toolArguments: Record<string, unknown>,
    options: OrchestratorOptions
  ): Promise<boolean> {
    const sessionPermission: { allowAll: boolean } | undefined =
      this.sessionPermissions.get(sessionId)
    if (sessionPermission?.allowAll === true) {
      return true
    }
    if (!options.onAskPermission) {
      return true
    }
    const permissionRequest: OrchestratorPermission = {
      sessionId,
      toolName,
      arguments: toolArguments,
      requestId: generateId('permission')
    }
    try {
      const permissionResponse: OrchestratorPermissionResponse =
        await options.onAskPermission(permissionRequest)
      return this.processPermissionResponse(sessionId, permissionResponse, toolName)
    } catch {
      return false
    }
  }

  /**
   * Updates the current message with chunk data.
   * @description Merges chunk data into the current message.
   * @param chunk - The streaming chunk
   * @param currentMessage - The current message being built
   * @returns Updated current message
   */
  private updateCurrentMessage(
    chunk: ResponseChatStream,
    currentMessage: ChatMessage | null
  ): ChatMessage | null {
    if (chunk.message === undefined) {
      return currentMessage
    }
    if (currentMessage === null) {
      return chunk.message
    }
    if (chunk.message.content != null) {
      currentMessage.content = (currentMessage.content ?? '') + chunk.message.content
    }
    if (chunk.message.tool_calls !== undefined) {
      currentMessage.tool_calls = chunk.message.tool_calls
    }
    return currentMessage
  }
}
