import { EventEmitter } from 'node:events'
import type {
  ChatMessage,
  OllamaService,
  RequestChat,
  ResponseChat,
  ResponseChatStream,
  ToolCall
} from '@neabyte/ollama-native'
import type {
  ChatSession,
  OrchestratorConfig,
  OrchestratorResponse,
  ToolRequestedEvent,
  ToolResponseEvent,
  StreamContentEvent
} from '@interfaces/index'
import { ToolExecutor } from '@core/index'
import { ChatManager } from '@integrator/index'
import { ParserNonStream } from '@integrator/ParserNonStream'
import { ParserStream } from '@integrator/ParserStream'

/**
 * Orchestrates chat interactions with tool execution capabilities.
 * @description Manages chat sessions, handles tool calls, and coordinates between chat and tool execution.
 */
export class Orchestrator extends EventEmitter {
  /** Manages chat sessions and message storage */
  private readonly chatManager: ChatManager
  /** Executes tool operations */
  private readonly toolExecutor: ToolExecutor
  /** The Ollama service client for chat interactions */
  private readonly client: OllamaService
  /** Available tools for the orchestrator */
  private readonly tools: ToolCall[]

  /**
   * Creates a new Orchestrator instance.
   * @description Initializes the orchestrator with client, tools, and internal managers.
   * @param config - Configuration object containing client and tools
   */
  constructor(config: OrchestratorConfig) {
    super()
    this.client = config.client
    this.tools = config.tools
    this.chatManager = new ChatManager()
    this.toolExecutor = new ToolExecutor()
  }

  /**
   * Aborts the current request if one is active.
   * @description Delegates abort to the Ollama client.
   * @returns True if request was aborted, false if no request was active
   */
  abort(): boolean {
    return this.client.abort()
  }

  /**
   * Creates a new chat session.
   * @description Delegates session creation to the chat manager.
   * @param initialMessage - Optional initial message for the session
   * @returns The generated session ID
   */
  createSession(initialMessage?: string): string {
    return this.chatManager.createSession(initialMessage)
  }

  /**
   * Processes a chat request with tool execution support.
   * @description Handles chat interactions, tool calls, and emits real-time events.
   * @param sessionId - The session ID to process the chat in
   * @param request - The chat request to process
   * @returns Promise that resolves to an event emitter for real-time updates
   * @throws {Error} When sessionId is invalid, request processing fails, or tool execution errors occur
   */
  async chat(sessionId: string, request: RequestChat): Promise<OrchestratorResponse> {
    const responseEmitter: OrchestratorResponse = new EventEmitter() as OrchestratorResponse
    this.setupRealtimeEvents(responseEmitter)
    try {
      await this.processChatLoop(sessionId, request)
      return responseEmitter
    } catch (error) {
      responseEmitter.emit('error', error as Error)
      return responseEmitter
    }
  }

  /**
   * Sets up real-time event forwarding.
   * @description Forwards internal events to the response emitter.
   * @param emitter - The response emitter to forward events to
   */
  private setupRealtimeEvents(emitter: OrchestratorResponse): void {
    this.on('message', (data: ChatMessage) => emitter.emit('message', data))
    this.on('thinking', (data: string) => emitter.emit('thinking', data))
    this.on('toolRequested', (data: ToolRequestedEvent) => emitter.emit('toolRequested', data))
    this.on('toolResponse', (data: ToolResponseEvent) => emitter.emit('toolResponse', data))
    this.on('streamContent', (data: StreamContentEvent) => emitter.emit('streamContent', data))
  }

  /**
   * Processes the main chat loop with tool execution.
   * @description Handles iterative chat processing until no more tool calls are needed.
   * @param sessionId - The session ID to process
   * @param request - The chat request to process
   */
  private async processChatLoop(sessionId: string, request: RequestChat): Promise<void> {
    let hasToolCalls: boolean = true
    let iterationCount: number = 0
    while (hasToolCalls) {
      if (!this.client.isActive) {
        break
      }
      iterationCount++
      console.log(`🔄 Processing iteration ${iterationCount}...`)
      const sessionMessages: ChatMessage[] = this.chatManager.getMessages(sessionId) ?? []
      const enhancedRequest: RequestChat = {
        ...request,
        messages: sessionMessages.length > 0 ? sessionMessages : request.messages,
        tools: this.tools
      }
      const response: ResponseChat | AsyncIterable<ResponseChatStream> =
        await this.client.chat(enhancedRequest)
      if (!this.client.isActive) {
        break
      }
      if (request.stream === true && Symbol.asyncIterator in response) {
        const finalMessage: ChatMessage | null = await ParserStream.processStreamingResponse(
          sessionId,
          response,
          this.chatManager,
          this.emit.bind(this),
          this.handleToolCalls.bind(this)
        )
        hasToolCalls = finalMessage?.tool_calls !== undefined && finalMessage.tool_calls.length > 0
      } else {
        await ParserNonStream.processResponse(
          sessionId,
          response as ResponseChat,
          this.chatManager,
          this.emit.bind(this),
          this.handleToolCalls.bind(this)
        )
        const nonStreamResponse: ResponseChat = response as ResponseChat
        hasToolCalls =
          nonStreamResponse.message?.tool_calls !== undefined &&
          nonStreamResponse.message.tool_calls.length > 0
      }
    }
  }

  /**
   * Handles tool call execution and response.
   * @description Executes tool calls and adds tool responses to the chat session.
   * @param sessionId - The session ID to add tool responses to
   * @param toolCalls - Array of tool calls to execute
   */
  private async handleToolCalls(sessionId: string, toolCalls: unknown[]): Promise<void> {
    for (const toolCall of toolCalls) {
      const toolCallObj: { function?: { name?: string; arguments?: Record<string, unknown> } } =
        toolCall as {
          function?: { name?: string; arguments?: Record<string, unknown> }
        }
      const toolName: string = toolCallObj.function?.name ?? ''
      const toolArguments: Record<string, unknown> = toolCallObj.function?.arguments ?? {}
      const toolRequestedEvent: ToolRequestedEvent = {
        toolName,
        arguments: toolArguments
      }
      this.emit('toolRequested', toolRequestedEvent)
      const result: string = await this.toolExecutor.execute(toolName, toolArguments)
      const toolResponseEvent: ToolResponseEvent = {
        toolName,
        arguments: toolArguments,
        result
      }
      this.emit('toolResponse', toolResponseEvent)
      const toolMessage: ChatMessage = {
        role: 'tool',
        content: result,
        tool_name: toolName
      }
      this.chatManager.addMessage(sessionId, toolMessage)
    }
  }

  /**
   * Retrieves a chat session by ID.
   * @description Delegates session retrieval to the chat manager.
   * @param sessionId - The session ID to retrieve
   * @returns Chat session object or undefined if not found
   */
  getSession(sessionId: string): ChatSession | undefined {
    return this.chatManager.getSession(sessionId)
  }

  /**
   * Retrieves messages from a chat session.
   * @description Delegates message retrieval to the chat manager.
   * @param sessionId - The session ID to retrieve messages from
   * @returns Array of messages or undefined if session not found
   */
  getMessages(sessionId: string): ChatMessage[] | undefined {
    return this.chatManager.getMessages(sessionId)
  }
}
