import type { SchemaFileEdit, SchemaCodeEdit } from '@root/interfaces/index'
import CodeEdit from '@core/base/CodeEdit'
import FileEdit from '@core/base/FileEdit'

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
  execute(toolName: string, args: unknown): string {
    switch (toolName) {
      case 'FileEdit':
        return new FileEdit(args as SchemaFileEdit).execute()
      case 'CodeEdit':
        return new CodeEdit(args as SchemaCodeEdit).execute()
      default:
        return `Unknown tool: ${toolName}`
    }
  }
}
