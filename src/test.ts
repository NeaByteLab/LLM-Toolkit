import 'dotenv/config'
import { OllamaService, type ChatMessage, type RequestChat } from '@neabyte/ollama-native'
import type { ToolRequestedEvent, ToolResponseEvent } from '@interfaces/index'
import { Orchestrator } from '@integrator/index'
import allToolSchemas from '@schemas/index'

/**
 * Tests the Ollama integration with tool execution capabilities.
 * @description Demonstrates the complete workflow of chat interaction with tool calling support.
 * @returns void
 */
async function testOllamaIntegration(): Promise<void> {
  try {
    const ollama: OllamaService = new OllamaService({
      host: 'https://ollama.com',
      timeout: 60000 * 5,
      retries: 3,
      headers: {
        Authorization: `Bearer ${process.env['OLLAMA_KEY']}`
      }
    })
    const llmOrchestrator: Orchestrator = new Orchestrator({
      client: ollama,
      tools: allToolSchemas
    })
    const llmSession: string = llmOrchestrator.createSession()
    const llmRequest: RequestChat = {
      model: 'qwen3-coder:480b',
      messages: [
        {
          role: 'user',
          content:
            'Create a Python project with multiple files:\n1) A factorial function\n2) A fibonacci function\n3) A main.py that imports and tests both functions\n4) A README.md explaining how to use the project'
        }
      ],
      stream: false
    }
    llmOrchestrator.on('error', (error: Error) => {
      console.log('❌ Error:', error.message)
    })
    llmOrchestrator.on('message', (data: ChatMessage) => {
      console.log('💬 Message:', data.content ?? 'Tool call')
    })
    llmOrchestrator.on('thinking', (data: string) => {
      console.log('🧠 Thinking:', data)
    })
    llmOrchestrator.on('toolRequested', (data: ToolRequestedEvent) => {
      console.log('🔧 Tool Requested:', data.toolName)
    })
    llmOrchestrator.on('toolResponse', (data: ToolResponseEvent) => {
      console.log('⚡ Tool Response:', data.toolName)
    })
    await llmOrchestrator.chat(llmSession, llmRequest)
    console.log('✅ Test completed successfully!')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

/**
 * Tests the Ollama integration with tool execution capabilities.
 * @description Demonstrates the complete workflow of chat interaction with tool calling support.
 * @returns void
 */
testOllamaIntegration().catch(console.error)
