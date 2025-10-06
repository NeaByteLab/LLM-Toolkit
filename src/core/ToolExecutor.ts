import type {
  SchemaDirectoryCreate,
  SchemaDirectoryList,
  SchemaDirectoryMove,
  SchemaFileCreate,
  SchemaFileDelete,
  SchemaFileEdit,
  SchemaFileMove,
  SchemaFileRead,
  SchemaFileSearch,
  SchemaGlobSearch,
  SchemaGrepSearch,
  SchemaTerminalCmd,
  SchemaWebFetch
} from '@root/interfaces/index'
import DirectoryCreate from '@core/base/DirectoryCreate'
import DirectoryList from '@core/base/DirectoryList'
import DirectoryMove from '@core/base/DirectoryMove'
import FileCreate from '@core/base/FileCreate'
import FileDelete from '@core/base/FileDelete'
import FileEdit from '@core/base/FileEdit'
import FileRead from '@core/base/FileRead'
import FileMove from '@core/base/FileMove'
import FileSearch from '@core/base/FileSearch'
import GlobSearch from '@core/base/GlobSearch'
import GrepSearch from '@core/base/GrepSearch'
import TerminalCmd from '@core/base/TerminalCmd'
import WebFetch from '@core/base/WebFetch'

/**
 * Executes tool operations based on tool name and arguments.
 * @description Handles execution of various tools including file and code editing operations.
 */
export class ToolExecutor {
  /**
   * Executes a tool with the specified name and arguments.
   * @description Routes tool execution to the appropriate tool handler based on tool name.
   * @param toolName - The name of the tool to execute
   * @param args - The arguments to pass to the tool
   * @returns Result string from tool execution or error message for unknown tools
   */
  async execute(toolName: string, args: unknown): Promise<string> {
    switch (toolName) {
      case 'DirectoryCreate':
        return new DirectoryCreate(args as SchemaDirectoryCreate).execute()
      case 'DirectoryList':
        return new DirectoryList(args as SchemaDirectoryList).execute()
      case 'DirectoryMove':
        return new DirectoryMove(args as SchemaDirectoryMove).execute()
      case 'FileCreate':
        return new FileCreate(args as SchemaFileCreate).execute()
      case 'FileDelete':
        return new FileDelete(args as SchemaFileDelete).execute()
      case 'FileEdit':
        return new FileEdit(args as SchemaFileEdit).execute()
      case 'FileRead':
        return new FileRead(args as SchemaFileRead).execute()
      case 'FileMove':
        return new FileMove(args as SchemaFileMove).execute()
      case 'FileSearch':
        return new FileSearch(args as SchemaFileSearch).execute()
      case 'GlobSearch':
        return new GlobSearch(args as SchemaGlobSearch).execute()
      case 'GrepSearch':
        return new GrepSearch(args as SchemaGrepSearch).execute()
      case 'TerminalCmd':
        return new TerminalCmd(args as SchemaTerminalCmd).execute()
      case 'WebFetch':
        return new WebFetch(args as SchemaWebFetch).execute()
      default:
        return `Unknown tool: ${toolName}`
    }
  }
}
