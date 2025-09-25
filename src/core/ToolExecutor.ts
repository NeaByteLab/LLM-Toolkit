import type { SchemaFileEdit, SchemaFileRead, SchemaFileCreate } from '@root/interfaces/index'
import FileEdit from '@core/base/FileEdit'
import FileRead from '@core/base/FileRead'
import FileCreate from '@core/base/FileCreate'

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
      case 'FileEdit':
        return new FileEdit(args as SchemaFileEdit).execute()
      case 'FileRead':
        return new FileRead(args as SchemaFileRead).execute()
      case 'FileCreate':
        return new FileCreate(args as SchemaFileCreate).execute()
      default:
        return `Unknown tool: ${toolName}`
    }
  }
}
