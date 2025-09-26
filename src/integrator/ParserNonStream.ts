import type { ResponseChat, ResponseChatStream } from '@neabyte/ollama-native'
import type { ChatManager } from '@integrator/index'

/**
 * Parser for non-streaming chat responses.
 * @description Handles processing of standard chat responses without streaming.
 */
export class ParserNonStream {
  /**
   * Processes chat response and handles tool calls.
   * @description Processes the response, adds messages to session, and handles tool calls if present.
   * @param sessionId - The session ID to process the response for
   * @param response - The chat response to process
   * @param chatManager - The chat manager instance
   * @param emit - Function to emit events
   * @param handleToolCalls - Function to handle tool calls
   */
  static async processResponse(
    sessionId: string,
    response: ResponseChat | ResponseChatStream,
    chatManager: ChatManager,
    emit: (event: string, data: unknown) => void,
    handleToolCalls: (sessionId: string, toolCalls: unknown[]) => Promise<void>
  ): Promise<void> {
    if ('message' in response && response.message != null) {
      chatManager.addMessage(sessionId, response.message)
      emit('message', response.message)
      if (response.message.tool_calls !== undefined && response.message.tool_calls.length > 0) {
        await handleToolCalls(sessionId, response.message.tool_calls)
      }
    }
    if (response.thinking !== undefined && response.thinking.length > 0) {
      emit('thinking', response.thinking)
    }
  }
}
