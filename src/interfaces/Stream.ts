import type { ChatMessage } from '@neabyte/ollama-native'

/**
 * Event data for streaming content chunks.
 * @description Contains information about streaming content updates.
 */
export interface StreamContentEvent {
  /** The content chunk being streamed */
  content: string
  /** Whether this is the final chunk */
  done: boolean
  /** The complete message being built */
  message?: ChatMessage
  /** The role of the message being streamed */
  role: 'user' | 'assistant' | 'system' | 'tool'
}
