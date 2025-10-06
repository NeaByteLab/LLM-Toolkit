import type { SecurityPathResult } from '@interfaces/index'
import { rename } from 'node:fs/promises'
import { dirname } from 'node:path'
import { mkdir } from 'node:fs/promises'
import { getSafePath } from '@core/security/index'

/**
 * Directory move operation tool.
 * @description Handles moving directories from one location to another with validation and error handling.
 */
export default class DirectoryMove {
  /** Current path of the directory to move */
  private readonly oldPath: string
  /** New path where the directory should be moved */
  private readonly newPath: string

  /**
   * Creates a new DirectoryMove instance.
   * @description Initializes the directory move operation with source and destination paths.
   * @param args - Object containing oldPath and newPath
   */
  constructor(args: { oldPath: string; newPath: string }) {
    const { oldPath, newPath }: { oldPath: string; newPath: string } = args
    this.oldPath = oldPath
    this.newPath = newPath
  }

  /**
   * Executes the directory move operation.
   * @description Moves the directory from oldPath to newPath with proper validation and error handling.
   * @returns Promise that resolves to success message or error details
   */
  async execute(): Promise<string> {
    const validation: string = this.validate()
    if (validation !== 'ok') {
      return validation
    }
    try {
      const oldPathResult: SecurityPathResult = getSafePath(this.oldPath)
      if (!oldPathResult.success) {
        return `Error! Invalid old path: ${oldPathResult.message}.`
      }
      const newPathResult: SecurityPathResult = getSafePath(this.newPath)
      if (!newPathResult.success) {
        return `Error! Invalid new path: ${newPathResult.message}.`
      }
      const targetParentDir: string = dirname(newPathResult.path)
      try {
        await mkdir(targetParentDir, { recursive: true })
      } catch (error) {
        if (error instanceof Error && 'code' in error && error.code !== 'EEXIST') {
          return `Error! Failed to create target parent directory: ${error.message}.`
        }
      }
      await rename(oldPathResult.path, newPathResult.path)
      return `Success! Directory moved from "${this.oldPath}" to "${this.newPath}".`
    } catch (error) {
      return this.handleMoveError(error)
    }
  }

  /**
   * Handles directory move errors with specific error messages.
   * @description Provides user-friendly error messages for common move operation failures.
   * @param error - The error that occurred during the move operation
   * @returns Formatted error message
   */
  private handleMoveError(error: unknown): string {
    if (error instanceof Error && 'code' in error) {
      switch (error.code) {
        case 'ENOENT':
          return `Error! Source directory not found: ${this.oldPath}.`
        case 'ENOTDIR':
          return `Error! Source path is not a directory: ${this.oldPath}.`
        case 'EACCES':
          return `Error! Permission denied. Check read access to "${this.oldPath}" and write access to "${this.newPath}".`
        case 'EEXIST':
          return `Error! Target directory already exists: ${this.newPath}.`
        case 'EMFILE':
        case 'ENFILE':
          return 'Error! Too many open files. Try again later.'
        case 'ENOSPC':
          return 'Error! No space left on device.'
        case 'EXDEV':
          return 'Error! Cannot move directory across different file systems. Use copy and delete instead.'
        default:
          return `Error! Moving directory from "${this.oldPath}" to "${this.newPath}": ${error.message}.`
      }
    }
    return `Error! Moving directory from "${this.oldPath}" to "${this.newPath}": ${
      error instanceof Error ? error.message : 'Unknown error'
    }.`
  }

  /**
   * Validates the input parameters.
   * @description Checks that both oldPath and newPath are valid non-empty strings.
   * @returns 'ok' if validation passes, error message otherwise
   */
  private validate(): string {
    if (typeof this.oldPath !== 'string') {
      return 'Invalid: `oldPath` must be a string.'
    }
    if (this.oldPath.trim().length === 0) {
      return 'Invalid: `oldPath` cannot be empty.'
    }
    if (typeof this.newPath !== 'string') {
      return 'Invalid: `newPath` must be a string.'
    }
    if (this.newPath.trim().length === 0) {
      return 'Invalid: `newPath` cannot be empty.'
    }
    if (this.oldPath === this.newPath) {
      return 'Invalid: Old path and new path cannot be the same.'
    }
    return 'ok'
  }
}
