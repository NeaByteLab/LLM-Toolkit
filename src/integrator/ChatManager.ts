import type { ChatMessage } from '@neabyte/ollama-native'
import type { ChatSession } from '@interfaces/Chat'
import { generateId } from '@utils/Generator'

/**
 * Manages chat sessions and message storage.
 * @description Handles creation, storage, and retrieval of chat sessions and their messages.
 */
export class ChatManager {
  /** Map storing chat sessions by session ID */
  private readonly sessions: Map<string, ChatSession> = new Map()

  /**
   * Creates a new chat session.
   * @description Generates a unique session ID and initializes a new chat session.
   * @param initialMessage - Optional initial message to add to the session
   * @returns The generated session ID
   */
  createSession(initialMessage?: string): string {
    const id: string = generateId('session')
    const now: number = Date.now()
    const session: ChatSession = {
      id,
      messages:
        initialMessage !== undefined && initialMessage.length > 0
          ? [
              {
                role: 'user',
                content: initialMessage
              }
            ]
          : [],
      created_at: now
    }
    this.sessions.set(id, session)
    return id
  }

  /**
   * Adds a message to an existing chat session.
   * @description Appends a new message to the specified session's message array.
   * @param id - The session ID to add the message to
   * @param message - The message to add to the session
   * @returns True if message was added successfully, false if session not found
   */
  addMessage(id: string, message: ChatMessage): boolean {
    const session: ChatSession | undefined = this.sessions.get(id)
    if (!session) {
      return false
    }
    session.messages.push(message)
    return true
  }

  /**
   * Retrieves all messages from a chat session.
   * @description Returns the message array for the specified session.
   * @param id - The session ID to retrieve messages from
   * @returns Array of messages or undefined if session not found
   */
  getMessages(id: string): ChatMessage[] | undefined {
    const session: ChatSession | undefined = this.sessions.get(id)
    return session?.messages
  }

  /**
   * Retrieves a chat session by ID.
   * @description Returns the complete session object for the specified ID.
   * @param id - The session ID to retrieve
   * @returns Chat session object or undefined if not found
   */
  getSession(id: string): ChatSession | undefined {
    return this.sessions.get(id)
  }

  /**
   * Deletes a chat session.
   * @description Removes the session from the sessions map.
   * @param id - The session ID to delete
   * @returns True if session was deleted, false if session not found
   */
  deleteSession(id: string): boolean {
    return this.sessions.delete(id)
  }
}
