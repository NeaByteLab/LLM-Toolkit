import type { EventEmitter } from 'node:events'
import type { RequestChat, OllamaService, ToolCall, ChatMessage } from '@neabyte/ollama-native'
import type {
  ChatSession,
  ToolRequestedEvent,
  ToolResponseEvent,
  StreamContentEvent
} from '@interfaces/index'

/**
 * Configuration for the Orchestrator.
 * @description Defines the required configuration for initializing an orchestrator instance.
 */
export interface OrchestratorConfig {
  /** The Ollama service client for chat interactions */
  client: OllamaService
  /** Array of available tools for the orchestrator */
  tools: ToolCall[]
}

/**
 * Response interface for orchestrator chat operations.
 * @description Extends EventEmitter to provide real-time event handling for chat operations.
 */
export interface OrchestratorResponse extends EventEmitter {
  /** Event listener for error events */
  on(event: 'error', listener: (error: Error) => void): this
  /** Event listener for message events */
  on(event: 'message', listener: (data: ChatMessage) => void): this
  /** Event listener for thinking events */
  on(event: 'thinking', listener: (data: string) => void): this
  /** Event listener for tool requested events */
  on(event: 'toolRequested', listener: (data: ToolRequestedEvent) => void): this
  /** Event listener for tool response events */
  on(event: 'toolResponse', listener: (data: ToolResponseEvent) => void): this
  /** Event listener for streaming content events */
  on(event: 'streamContent', listener: (data: StreamContentEvent) => void): this
}

/**
 * Interface for the Orchestrator class.
 * @description Defines the public API for orchestrator operations.
 */
export interface Orchestrator {
  /**
   * Creates a new chat session.
   * @param initialMessage - Optional initial message for the session
   * @returns The generated session ID
   */
  createSession(initialMessage?: string): string
  /**
   * Processes a chat request with tool execution support.
   * @param sessionId - The session ID to process the chat in
   * @param request - The chat request to process
   * @returns Promise that resolves to an event emitter for real-time updates
   */
  chat(sessionId: string, request: RequestChat): Promise<OrchestratorResponse>
  /**
   * Retrieves a chat session by ID.
   * @param sessionId - The session ID to retrieve
   * @returns Chat session object or undefined if not found
   */
  getSession(sessionId: string): ChatSession | undefined
  /**
   * Retrieves messages from a chat session.
   * @param sessionId - The session ID to retrieve messages from
   * @returns Array of messages or undefined if session not found
   */
  getMessages(sessionId: string): ChatMessage[] | undefined
}
