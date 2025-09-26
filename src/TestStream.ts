import 'dotenv/config'
import { OllamaService, type RequestChat } from '@neabyte/ollama-native'
import type { ToolRequestedEvent, ToolResponseEvent, StreamContentEvent } from '@interfaces/index'
import { ContextSys, Orchestrator } from '@integrator/index'
import allToolSchemas from '@schemas/index'

/**
 * Tests the Ollama integration with streaming tool execution capabilities.
 * @description Demonstrates the complete workflow of streaming chat interaction with tool calling support.
 * Creates an examples folder with sample files including Calculator.ts, README.md, and TodoList.ts.
 * Shows real-time content streaming with tool execution feedback.
 * @returns Promise that resolves when test completes
 * @throws {Error} When Ollama service initialization fails or chat processing errors occur
 * @example
 * ```typescript
 * // Run the streaming test
 * testStreamingIntegration().catch(console.error)
 * ```
 */
async function testStreamingIntegration(): Promise<void> {
  let ollama: OllamaService | null = null
  let llmOrchestrator: Orchestrator | null = null
  /**
   * Handles graceful shutdown on process termination signals.
   * @description Aborts active Ollama requests and orchestrator operations.
   */
  const abortHandler: () => void = (): void => {
    if (ollama?.isActive === true) {
      ollama.abort()
    }
    if (llmOrchestrator) {
      llmOrchestrator.abort()
    }
  }
  process.on('SIGINT', abortHandler)
  process.on('SIGTERM', abortHandler)
  process.on('SIGHUP', abortHandler)
  try {
    ollama = new OllamaService({
      host: 'https://ollama.com',
      timeout: 60000 * 5,
      retries: 3,
      headers: {
        Authorization: `Bearer ${process.env['OLLAMA_KEY']}`
      }
    })
    llmOrchestrator = new Orchestrator({
      client: ollama,
      tools: allToolSchemas
    })
    const llmSession: string = llmOrchestrator.createSession()
    const llmRequest: RequestChat = {
      model: 'qwen3-coder:480b',
      messages: [
        {
          role: 'system',
          content: new ContextSys().getSystemPrompt()
        },
        {
          role: 'user',
          content:
            'I need you to create an examples folder and add some sample files inside it. Please follow these steps:\n\n' +
            '1. Create a new directory called "examples"\n' +
            '2. Create a Calculator.ts file inside the examples folder with basic calculator functionality\n' +
            '3. Create a README.md file in the examples folder explaining what the examples are for\n' +
            '4. Create a simple TodoList.ts file in the examples folder with basic todo functionality\n\n' +
            'Make sure all files are properly structured and contain useful example code.'
        }
      ],
      stream: true
    }
    llmOrchestrator.on('error', (error: Error) => {
      console.log('❌ Error:', error.message)
    })
    llmOrchestrator.on('thinking', (data: string) => {
      console.log('🧠 Thinking:', data)
    })
    llmOrchestrator.on('toolRequested', (data: ToolRequestedEvent) => {
      console.log('🔧 Tool Requested:', data.toolName)
      console.log('📋 Tool Arguments:', JSON.stringify(data.arguments, null, 2))
    })
    llmOrchestrator.on('toolResponse', (data: ToolResponseEvent) => {
      console.log('⚡ Tool Response:', data.toolName)
      console.log(JSON.stringify(data, null, 2))
      console.log('---')
    })
    llmOrchestrator.on('streamContent', (data: StreamContentEvent) => {
      if (data.content) {
        process.stdout.write(data.content)
      }
    })
    await llmOrchestrator.chat(llmSession, llmRequest)
    console.log('\n✅ Streaming test completed successfully!')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

/**
 * Executes the streaming integration test.
 * @description Runs the streaming test function and handles any errors that occur during execution.
 * @throws {Error} When test execution fails
 */
testStreamingIntegration().catch(console.error)
