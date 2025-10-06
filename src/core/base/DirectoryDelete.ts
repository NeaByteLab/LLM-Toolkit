import type { SchemaDirectoryDelete, SecurityPathResult } from '@interfaces/index'
import { existsSync, type Stats } from 'node:fs'
import { rm, rmdir, stat } from 'node:fs/promises'
import { getSafePath } from '@core/security/index'

/**
 * Handles directory deletion operations with security validation.
 * @description Executes directory deletion with security checks.
 */
export default class DirectoryDelete {
  /** The directory path to delete */
  private readonly directoryPath: string
  /** Whether to delete the directory and all its contents recursively */
  private readonly recursive: boolean

  /**
   * Creates a new DirectoryDelete instance.
   * @description Initializes the directory deletion operation with directory path and recursive options.
   * @param args - The directory deletion schema containing directory path and recursive options
   */
  constructor(args: SchemaDirectoryDelete) {
    const { directoryPath, recursive }: SchemaDirectoryDelete = args
    this.directoryPath = directoryPath
    this.recursive = recursive ?? false
  }

  /**
   * Executes the directory deletion operation.
   * @description Performs validation, security checks, and deletes the directory or returns error message.
   * @returns Success message or error message if validation/deletion fails
   * @throws {Error} When file system operations fail or validation errors occur
   */
  async execute(): Promise<string> {
    const resValidate: string = this.validate()
    if (resValidate !== 'ok') {
      return resValidate
    }
    try {
      const validationResult: string = await this.validateDirectory()
      if (validationResult !== 'ok') {
        return validationResult
      }
      const safePath: SecurityPathResult = getSafePath(this.directoryPath)
      if (!safePath.success) {
        return `Error! Invalid directory path: ${safePath.message}.`
      }
      if (this.recursive) {
        await rm(safePath.path, { recursive: true })
        return `Directory deleted successfully: ${this.directoryPath} (recursively).`
      } else {
        await rmdir(safePath.path)
        return `Directory deleted successfully: ${this.directoryPath}.`
      }
    } catch (error) {
      return this.handleDeletionError(error)
    }
  }

  /**
   * Validates that the directory exists and is actually a directory.
   * @description Checks directory existence and type before deletion.
   * @returns 'ok' if validation passes, error message if validation fails
   */
  private async validateDirectory(): Promise<string> {
    const safePath: SecurityPathResult = getSafePath(this.directoryPath)
    if (!safePath.success) {
      return `Error! Invalid directory path: ${safePath.message}.`
    }
    if (!existsSync(safePath.path)) {
      return `Error! Directory not found: ${this.directoryPath}.`
    }
    const stats: Stats = await stat(safePath.path)
    if (!stats.isDirectory()) {
      return `Error! Path is a file, not a directory: ${this.directoryPath}.`
    }
    return 'ok'
  }

  /**
   * Handles deletion errors with specific error messages.
   * @description Processes different types of filesystem errors and returns appropriate messages.
   * @param error - The error that occurred during deletion
   * @returns Error message string
   */
  private handleDeletionError(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes('EISDIR') || error.message.includes('is a directory')) {
        return `Error! Directory is not empty: ${this.directoryPath}. Use recursive: true to delete non-empty directories.`
      }
      if ('code' in error) {
        const errorCode: string = String(error.code)
        switch (errorCode) {
          case 'ENOENT':
            return `Error! Directory not found: ${this.directoryPath}.`
          case 'ENOTDIR':
            return `Error! Path is not a directory: ${this.directoryPath}.`
          case 'EACCES':
            return `Error! Permission denied: ${this.directoryPath}.`
          case 'ENOTEMPTY':
            return `Error! Directory is not empty: ${this.directoryPath}. Use recursive: true to delete non-empty directories.`
          default:
            return `Error! Deleting directory ${this.directoryPath}: ${error.message}.`
        }
      }
    }
    return `Error! Deleting directory ${this.directoryPath}: ${error instanceof Error ? error.message : 'Unknown error'}.`
  }

  /**
   * Validates the directory deletion parameters.
   * @description Checks that directoryPath is a valid non-empty string and recursive is a boolean.
   * @returns 'ok' if validation passes, error message if validation fails
   */
  private validate(): string {
    if (typeof this.directoryPath !== 'string') {
      return 'Invalid: `directoryPath` must be a string.'
    }
    if (this.directoryPath.trim().length === 0) {
      return 'Invalid: `directoryPath` cannot be empty.'
    }
    if (typeof this.recursive !== 'boolean') {
      return 'Invalid: `recursive` must be a boolean.'
    }
    return 'ok'
  }
}
