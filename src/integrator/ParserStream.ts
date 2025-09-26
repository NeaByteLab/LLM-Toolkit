import type { ChatMessage, ResponseChatStream } from '@neabyte/ollama-native'
import type { ChatManager } from '@integrator/index'
import type { StreamContentEvent } from '@interfaces/index'

/**
 * Parser for streaming chat responses.
 * @description Handles processing of streaming chat responses with real-time content updates.
 */
export class ParserStream {
  /**
   * Processes streaming chat response with real-time content updates.
   * @description Handles streaming responses and returns the final message for tool call checking.
   * @param sessionId - The session ID to process the response for
   * @param stream - The streaming response iterator
   * @param chatManager - The chat manager instance
   * @param emit - Function to emit events
   * @param handleToolCalls - Function to handle tool calls
   * @returns The final message for tool call checking
   */
  static async processStreamingResponse(
    sessionId: string,
    stream: AsyncIterable<ResponseChatStream>,
    chatManager: ChatManager,
    emit: (event: string, data: unknown) => void,
    handleToolCalls: (sessionId: string, toolCalls: unknown[]) => Promise<void>
  ): Promise<ChatMessage | null> {
    let currentMessage: ChatMessage | null = null
    try {
      for await (const chunk of stream) {
        this.processStreamingChunk(chunk, currentMessage, emit)
        currentMessage = this.updateCurrentMessage(chunk, currentMessage)
        if (chunk.done && currentMessage !== null) {
          await this.finalizeStreamingMessage(
            sessionId,
            currentMessage,
            chatManager,
            emit,
            handleToolCalls
          )
        }
      }
    } catch (error) {
      // Handle abort errors gracefully
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🛑 Streaming aborted by user')
        return currentMessage
      }
      throw error
    }
    return currentMessage
  }

  /**
   * Processes a single streaming chunk.
   * @description Handles thinking and content emission for a chunk.
   * @param chunk - The streaming chunk to process
   * @param currentMessage - The current message being built
   * @param emit - Function to emit events
   */
  private static processStreamingChunk(
    chunk: ResponseChatStream,
    currentMessage: ChatMessage | null,
    emit: (event: string, data: unknown) => void
  ): void {
    if (chunk.thinking !== undefined && chunk.thinking.length > 0) {
      emit('thinking', chunk.thinking)
    }
    if (chunk.message?.content != null && currentMessage !== null) {
      emit('streamContent', {
        content: chunk.message.content,
        role: currentMessage.role ?? 'assistant',
        done: chunk.done ?? false,
        message: currentMessage
      } as StreamContentEvent)
    }
  }

  /**
   * Updates the current message with chunk data.
   * @description Merges chunk data into the current message.
   * @param chunk - The streaming chunk
   * @param currentMessage - The current message being built
   * @returns Updated current message
   */
  private static updateCurrentMessage(
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

  /**
   * Finalizes a streaming message when done.
   * @description Adds message to session and handles tool calls.
   * @param sessionId - The session ID
   * @param message - The message to finalize
   * @param chatManager - The chat manager instance
   * @param emit - Function to emit events
   * @param handleToolCalls - Function to handle tool calls
   */
  private static async finalizeStreamingMessage(
    sessionId: string,
    message: ChatMessage,
    chatManager: ChatManager,
    emit: (event: string, data: unknown) => void,
    handleToolCalls: (sessionId: string, toolCalls: unknown[]) => Promise<void>
  ): Promise<void> {
    chatManager.addMessage(sessionId, message)
    emit('message', message)
    if (message.tool_calls !== undefined && message.tool_calls.length > 0) {
      await handleToolCalls(sessionId, message.tool_calls)
    }
    emit('streamContent', {
      content: '',
      role: message.role ?? 'assistant',
      done: true,
      message
    } as StreamContentEvent)
  }
}
