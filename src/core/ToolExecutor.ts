import type {
  SchemaDirectoryList,
  SchemaFileCreate,
  SchemaFileDelete,
  SchemaFileEdit,
  SchemaFileRead,
  SchemaTerminalCmd
} from '@root/interfaces/index'
import DirectoryList from '@core/base/DirectoryList'
import FileCreate from '@core/base/FileCreate'
import FileDelete from '@core/base/FileDelete'
import FileEdit from '@core/base/FileEdit'
import FileRead from '@core/base/FileRead'
import TerminalCmd from '@core/base/TerminalCmd'

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
      case 'DirectoryList':
        return new DirectoryList(args as SchemaDirectoryList).execute()
      case 'FileCreate':
        return new FileCreate(args as SchemaFileCreate).execute()
      case 'FileDelete':
        return new FileDelete(args as SchemaFileDelete).execute()
      case 'FileEdit':
        return new FileEdit(args as SchemaFileEdit).execute()
      case 'FileRead':
        return new FileRead(args as SchemaFileRead).execute()
      case 'TerminalCmd':
        return new TerminalCmd(args as SchemaTerminalCmd).execute()
      default:
        return `Unknown tool: ${toolName}`
    }
  }
}
