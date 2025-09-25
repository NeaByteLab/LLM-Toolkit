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
  let ollama: OllamaService
  process.on('SIGINT', () => {
    if (ollama?.isActive) {
      ollama.abort()
    }
    process.exit(0)
  })
  process.on('SIGTERM', () => {
    if (ollama?.isActive) {
      ollama.abort()
    }
    process.exit(0)
  })
  process.on('SIGHUP', () => {
    if (ollama?.isActive) {
      ollama.abort()
    }
    process.exit(0)
  })
  try {
    ollama = new OllamaService({
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
          role: 'system',
          content:
            'You are a helpful code editor. Complete the requested task efficiently and stop when done. Do not make excessive tool calls.'
        },
        {
          role: 'user',
          content:
            'I need you to edit the Calculator.ts file step by step. The file is located at "examples/Calculator.ts".\n\n' +
            '1. Read the current file to understand its structure\n' +
            '2. Remove all jsdocs on each method'
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
      console.log('📋 Tool Arguments:', JSON.stringify(data.arguments, null, 2))
    })
    llmOrchestrator.on('toolResponse', (data: ToolResponseEvent) => {
      console.log('⚡ Tool Response:', data.toolName)
      console.log(JSON.stringify(data, null, 2))
      console.log('---')
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
