import type { ToolCall } from '@neabyte/ollama-native'
import FileEdit from '@schemas/FileEdit'
import FileRead from '@schemas/FileRead'
import FileCreate from '@schemas/FileCreate'

/**
 * Collection of available tool schemas.
 * @description Exports all tool definitions as an array of ToolCall objects.
 */
export default [FileEdit as ToolCall, FileRead as ToolCall, FileCreate as ToolCall]
