import type { ToolCall } from '@neabyte/ollama-native'
import CodeEdit from '@schemas/CodeEdit'
import FileEdit from '@schemas/FileEdit'

/**
 * Collection of available tool schemas.
 * @description Exports all tool definitions as an array of ToolCall objects.
 */
export default [FileEdit as ToolCall, CodeEdit as ToolCall]
