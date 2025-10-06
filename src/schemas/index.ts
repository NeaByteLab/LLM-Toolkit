import type { ToolCall } from '@neabyte/ollama-native'
import DirectoryCreate from '@schemas/DirectoryCreate'
import DirectoryList from '@schemas/DirectoryList'
import DirectoryMove from '@schemas/DirectoryMove'
import FileCreate from '@schemas/FileCreate'
import FileDelete from '@schemas/FileDelete'
import FileEdit from '@schemas/FileEdit'
import FileMove from '@schemas/FileMove'
import FileRead from '@schemas/FileRead'
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
  DirectoryCreate as ToolCall,
  DirectoryList as ToolCall,
  DirectoryMove as ToolCall,
  FileCreate as ToolCall,
  FileDelete as ToolCall,
  FileEdit as ToolCall,
  FileMove as ToolCall,
  FileRead as ToolCall,
  FileSearch as ToolCall,
  GlobSearch as ToolCall,
  GrepSearch as ToolCall,
  TerminalCmd as ToolCall,
  WebFetch as ToolCall
]
