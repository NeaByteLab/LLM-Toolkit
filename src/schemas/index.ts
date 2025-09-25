import type { ToolCall } from '@neabyte/ollama-native'
import DirectoryList from '@schemas/DirectoryList'
import FileCreate from '@schemas/FileCreate'
import FileEdit from '@schemas/FileEdit'
import FileRead from '@schemas/FileRead'

/**
 * Collection of available tool schemas.
 * @description Exports all tool definitions as an array of ToolCall objects.
 */
export default [
  DirectoryList as ToolCall,
  FileCreate as ToolCall,
  FileEdit as ToolCall,
  FileRead as ToolCall
]
