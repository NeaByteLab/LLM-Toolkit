import type { SchemaCodeEdit } from '@interfaces/ToolSchema'

/**
 * Handles code editing operations with search and replace functionality.
 * @description Executes code modifications by replacing specific text in files.
 */
export default class CodeEdit {
  /** The file path where the edit will be applied */
  private readonly filePath: string
  /** The text to be replaced in the file */
  private readonly oldString: string
  /** The new text to replace the old string */
  private readonly newString: string

  /**
   * Creates a new CodeEdit instance.
   * @description Initializes the code edit operation with file path and text replacement parameters.
   * @param args - The code edit schema containing file path and text replacement data
   */
  constructor(args: SchemaCodeEdit) {
    const { filePath, oldString, newString }: SchemaCodeEdit = args
    this.filePath = filePath
    this.oldString = oldString
    this.newString = newString
  }

  /**
   * Executes the code edit operation.
   * @description Performs validation and returns execution result or validation error.
   * @returns Success message with edit details or validation error message
   */
  execute(): string {
    const resValidate: string = this.validate()
    if (resValidate !== 'ok') {
      return resValidate
    }
    return `Code edit executed on ${this.filePath} with ${this.oldString} to ${this.newString}`
  }

  /**
   * Validates the code edit parameters.
   * @description Checks that all required parameters are valid strings.
   * @returns 'ok' if validation passes, error message if validation fails
   */
  validate(): string {
    if (typeof this.filePath !== 'string') {
      return 'filePath must be a string'
    }
    if (typeof this.oldString !== 'string') {
      return 'oldString must be a string'
    }
    if (typeof this.newString !== 'string') {
      return 'newString must be a string'
    }
    return 'ok'
  }
}
