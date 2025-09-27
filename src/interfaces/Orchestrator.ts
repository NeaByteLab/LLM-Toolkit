import type { OllamaService } from '@neabyte/ollama-native'

/**
 * Abort event data.
 * @description Information about an abort event.
 */
export interface OrchestratorAbort {
  /** Reason for abort */
  reason: string
  /** Session ID */
  sessionId: string
}

/**
 * Orchestrator configuration.
 * @description Configuration for creating an Orchestrator instance.
 */
export interface OrchestratorConfig {
  /** The Ollama service client */
  client: OllamaService
  /** Available tools for execution */
  tools?: unknown[]
}

/**
 * Chat message data.
 * @description Message content from the chat interaction.
 */
export interface OrchestratorMessage {
  /** Message content */
  content: string
  /** Message role */
  role: 'user' | 'assistant' | 'system' | 'tool'
  /** Tool name if this is a tool message */
  toolName?: string
}

/**
 * Chat options for the Orchestrator chat method.
 * @description Configuration options for chat interactions including event callbacks and settings.
 */
export interface OrchestratorOptions {
  /** Callback for permission requests - must return a Promise with user decision */
  onAskPermission?: (data: OrchestratorPermission) => Promise<OrchestratorPermissionResponse>
  /** Callback for thinking content */
  onThinking?: (data: string) => void
  /** Callback for message content */
  onMessage?: (data: OrchestratorMessage) => void
  /** Callback for tool calls */
  onToolCall?: (data: OrchestratorToolCall) => void
  /** Callback for tool results */
  onToolResult?: (data: OrchestratorToolResult) => void
  /** Callback for abort events */
  onAbort?: (data: OrchestratorAbort) => void
  /** Model to use for the chat */
  model: string
  /** Whether to stream the response */
  stream: boolean
}

/**
 * Permission request data.
 * @description Information about a tool that requires permission to execute.
 */
export interface OrchestratorPermission {
  /** Name of the tool requesting permission */
  toolName: string
  /** Arguments for the tool */
  arguments: Record<string, unknown>
  /** Session ID */
  sessionId: string
  /** Request ID for tracking */
  requestId: string
}

/**
 * Permission response data.
 * @description User's decision for a permission request.
 */
export interface OrchestratorPermissionResponse {
  /** User's decision: approve, deny, or allow all for session */
  action: 'approve' | 'deny' | 'allow_all'
}

/**
 * Chat session interface.
 * @description Represents an active chat session with abort capability.
 */
export interface OrchestratorSession {
  /** Session ID */
  id: string
  /** Abort the current chat session */
  abort(): void
  /** Check if session is active */
  isActive(): boolean
}

/**
 * Tool call event data.
 * @description Information about a tool being called.
 */
export interface OrchestratorToolCall {
  /** Session ID */
  sessionId: string
  /** Name of the tool being called */
  toolName: string
  /** Arguments for the tool */
  arguments: Record<string, unknown>
}

/**
 * Tool result event data.
 * @description Information about a tool execution result.
 */
export interface OrchestratorToolResult {
  /** Session ID */
  sessionId: string
  /** Name of the tool that was executed */
  toolName: string
  /** Result of the tool execution */
  result: string
}
