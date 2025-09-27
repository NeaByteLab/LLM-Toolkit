import 'dotenv/config'
import type {
  OrchestratorAbort,
  OrchestratorMessage,
  OrchestratorPermission,
  OrchestratorPermissionResponse,
  OrchestratorSession,
  OrchestratorToolCall,
  OrchestratorToolResult
} from '@interfaces/Orchestrator'
import { OllamaService } from '@neabyte/ollama-native'
import { Orchestrator } from '@integrator/index'

/**
 * Creates and configures an Orchestrator instance.
 * @description Initializes Ollama service with API configuration and returns orchestrator.
 * @returns Configured Orchestrator instance
 */
function getClient(): Orchestrator {
  const ollamaService: OllamaService = new OllamaService({
    host: 'https://ollama.com',
    timeout: 60000 * 10,
    retries: 3,
    headers: {
      Authorization: `Bearer ${process.env['OLLAMA_KEY']}`
    }
  })
  return new Orchestrator({ client: ollamaService })
}

/**
 * Main application function.
 * @description Demonstrates chat interaction with permission handling and event callbacks.
 * @throws {Error} When chat processing fails or environment variables are missing
 */
async function main(): Promise<void> {
  const ollamaClient: Orchestrator = getClient()
  const ollamaPrompt: string = 'check my redis processs on terminal'
  const ollamaSession: OrchestratorSession = await ollamaClient.chat(ollamaPrompt, {
    onAskPermission: (data: OrchestratorPermission): Promise<OrchestratorPermissionResponse> => {
      console.log(`🔒 Permission Request: ${data.toolName}`)
      if (data.toolName === 'TerminalCmd') {
        return Promise.resolve({ action: 'deny' })
      } else if (data.toolName === 'FileCreate' || data.toolName === 'FileEdit') {
        return Promise.resolve({ action: 'approve' })
      } else {
        return Promise.resolve({ action: 'approve' })
      }
    },
    onThinking: (data: string) => {
      console.log(`onThinking: ${data}`)
    },
    onMessage: (data: OrchestratorMessage) => {
      if (data.content.length > 0) {
        console.log(`onMessage: ${data.content}`)
      }
    },
    onToolCall: (data: OrchestratorToolCall) => {
      console.log(`onToolCall: ${JSON.stringify(data, null, 2)}`)
    },
    onToolResult: (data: OrchestratorToolResult) => {
      console.log(`onToolResult: ${JSON.stringify(data, null, 2)}`)
    },
    onAbort: (data: OrchestratorAbort) => {
      console.log(`onAbort: ${JSON.stringify(data, null, 2)}`)
    },
    model: 'qwen3-coder:480b',
    stream: true
  })
  /**
   * Auto-abort after 3 seconds.
   * @description Demonstrates session abort functionality with timeout.
   */
  setTimeout(() => {
    console.log('⏰ Auto-aborting after 3 seconds...')
    ollamaSession.abort()
    console.log(`✅ Session active: ${ollamaSession.isActive()}`)
  }, 3000)
}

/**
 * Executes the main application function.
 * @description Runs the main function with error handling for uncaught exceptions.
 */
main().catch(console.error)
