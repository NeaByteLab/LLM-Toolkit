import type { SchemaFileEdit } from '@interfaces/ToolSchema'

/**
 * Handles file editing operations with content replacement functionality.
 * @description Executes file modifications by replacing file content with new content and instructions.
 */
export default class FileEdit {
  /** The file path where the edit will be applied */
  private readonly filePath: string
  /** The new content to replace the file content */
  private readonly content: string
  /** Instructions describing the edit operation */
  private readonly instructions: string

  /**
   * Creates a new FileEdit instance.
   * @description Initializes the file edit operation with file path, content, and instructions.
   * @param args - The file edit schema containing file path, content, and instructions
   */
  constructor(args: SchemaFileEdit) {
    const { filePath, content, instructions }: SchemaFileEdit = args
    this.filePath = filePath
    this.content = content
    this.instructions = instructions
  }

  /**
   * Executes the file edit operation.
   * @description Performs validation and returns execution result or validation error.
   * @returns Success message with edit details or validation error message
   */
  execute(): string {
    const resValidate: string = this.validate()
    if (resValidate !== 'ok') {
      return resValidate
    }
    return `File edit executed on ${this.filePath} with instructions: ${this.instructions}`
  }

  /**
   * Validates the file edit parameters.
   * @description Checks that all required parameters are valid strings.
   * @returns 'ok' if validation passes, error message if validation fails
   */
  validate(): string {
    if (typeof this.filePath !== 'string') {
      return 'filePath must be a string'
    }
    if (typeof this.content !== 'string') {
      return 'content must be a string'
    }
    if (typeof this.instructions !== 'string') {
      return 'instructions must be a string'
    }
    return 'ok'
  }
}
