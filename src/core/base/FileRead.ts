/* eslint-disable security/detect-non-literal-fs-filename */
import { readFile } from 'node:fs/promises'
import type { SchemaFileRead } from '@interfaces/ToolSchema'
import { getSafePath } from '@core/security/index'

/**
 * Handles file reading operations with security validation.
 * @description Executes file reading with path validation and security checks to prevent directory traversal attacks.
 */
export default class FileRead {
  /** The file path to read */
  private readonly filePath: string

  /**
   * Creates a new FileRead instance.
   * @description Initializes the file read operation with file path parameter.
   * @param args - The file read schema containing file path data
   */
  constructor(args: SchemaFileRead) {
    const { filePath }: SchemaFileRead = args
    this.filePath = filePath
  }

  /**
   * Executes the file read operation.
   * @description Performs validation, security checks, and reads file content or returns error message.
   * @returns File content as string or error message if validation/reading fails
   */
  async execute(): Promise<string> {
    const resValidate: string = this.validate()
    if (resValidate !== 'ok') {
      return resValidate
    }
    try {
      const safePath: string | null = getSafePath(this.filePath)
      if (safePath === null) {
        return `Error! Invalid file path: ${this.filePath}.`
      }
      const content: string = await readFile(safePath, 'utf8')
      if (content.length === 0) {
        return `Error! File is empty: ${this.filePath}.`
      }
      return content
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return `Error! File not found: ${this.filePath}.`
      }
      return `Error! Reading file ${this.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}.`
    }
  }

  /**
   * Validates the file path parameter.
   * @description Checks that filePath is a valid non-empty string.
   * @returns 'ok' if validation passes, error message if validation fails
   */
  private validate(): string {
    if (typeof this.filePath !== 'string') {
      return '`filePath` must be a string.'
    }
    if (this.filePath.trim().length === 0) {
      return '`filePath` cannot be empty.'
    }
    return 'ok'
  }
}
