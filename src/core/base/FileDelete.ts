import type { SchemaFileDelete, SecurityPathResult } from '@interfaces/index'
import { unlink } from 'node:fs/promises'
import { getSafePath } from '@core/security/index'

/**
 * Handles file deletion operations with security validation.
 * @description Executes file deletion with path validation and security checks to prevent unauthorized file removal.
 */
export default class FileDelete {
  /** The file path to delete */
  private readonly filePath: string

  /**
   * Creates a new FileDelete instance.
   * @description Initializes the file deletion operation with file path parameter.
   * @param args - The file deletion schema containing file path data
   */
  constructor(args: SchemaFileDelete) {
    const { filePath }: SchemaFileDelete = args
    this.filePath = filePath
  }

  /**
   * Executes the file deletion operation.
   * @description Performs validation, security checks, and deletes the file or returns error message.
   * @returns Success message or error message if validation/deletion fails
   * @throws {Error} When file system operations fail or validation errors occur
   */
  async execute(): Promise<string> {
    const resValidate: string = this.validate()
    if (resValidate !== 'ok') {
      return resValidate
    }
    try {
      const safePath: SecurityPathResult = getSafePath(this.filePath)
      if (!safePath.success) {
        return `Error! Invalid file path: ${safePath.message}.`
      }
      await unlink(safePath.path)
      return `File deleted successfully: ${this.filePath}.`
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return `Error! File not found: ${this.filePath}.`
      }
      if (error instanceof Error && 'code' in error && error.code === 'EISDIR') {
        return `Error! Path is a directory, not a file: ${this.filePath}.`
      }
      if (error instanceof Error && 'code' in error && error.code === 'EACCES') {
        return `Error! Permission denied: ${this.filePath}.`
      }
      return `Error! Deleting file ${this.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}.`
    }
  }

  /**
   * Validates the file path parameter.
   * @description Checks that filePath is a valid non-empty string.
   * @returns 'ok' if validation passes, error message if validation fails
   */
  private validate(): string {
    if (typeof this.filePath !== 'string') {
      return 'Invalid: `filePath` must be a string.'
    }
    if (this.filePath.trim().length === 0) {
      return 'Invalid: `filePath` cannot be empty.'
    }
    return 'ok'
  }
}
