import type { ChatMessage } from '@neabyte/ollama-native'

/**
 * Interface for chat session data.
 * @description Defines the structure for storing chat session information and messages.
 */
export interface ChatSession {
  /** Unique session identifier */
  id: string
  /** Array of messages in the conversation */
  messages: ChatMessage[]
  /** Timestamp when session was created */
  created_at: number
}
