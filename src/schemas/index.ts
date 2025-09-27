import type { ToolCall } from '@neabyte/ollama-native'
import DirectoryList from '@schemas/DirectoryList'
import FileCreate from '@schemas/FileCreate'
import FileDelete from '@schemas/FileDelete'
import FileEdit from '@schemas/FileEdit'
import FileRead from '@schemas/FileRead'
import FileRename from '@schemas/FileRename'
import FileSearch from '@schemas/FileSearch'
import GlobSearch from '@schemas/GlobSearch'
import GrepSearch from '@schemas/GrepSearch'
import TerminalCmd from '@schemas/TerminalCmd'
import WebFetch from '@schemas/WebFetch'

/**
 * Collection of available tool schemas.
 * @description Exports all tool definitions as an array of ToolCall objects.
 */
export default [
  DirectoryList as ToolCall,
  FileCreate as ToolCall,
  FileDelete as ToolCall,
  FileEdit as ToolCall,
  FileRead as ToolCall,
  FileRename as ToolCall,
  FileSearch as ToolCall,
  GlobSearch as ToolCall,
  GrepSearch as ToolCall,
  TerminalCmd as ToolCall,
  WebFetch as ToolCall
]
