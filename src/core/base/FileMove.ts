import type { SchemaFileMove, SecurityFileSize, SecurityPathResult } from '@interfaces/index'
import { dirname } from 'node:path'
import { rename, mkdir } from 'node:fs/promises'
import { getSafePath, validateFileSize } from '@core/security/index'

/**
 * Handles file move operations with security validation.
 * @description Executes file moving from one location to another with security checks and directory creation.
 */
export default class FileMove {
  /** The current path of the file to move */
  private readonly oldPath: string
  /** The new path where the file should be moved to */
  private readonly newPath: string

  /**
   * Creates a new FileMove instance.
   * @description Initializes the file move operation with old and new path parameters.
   * @param args - The file move schema containing old and new path data
   */
  constructor(args: SchemaFileMove) {
    const { oldPath, newPath }: SchemaFileMove = args
    this.oldPath = oldPath
    this.newPath = newPath
  }

  /**
   * Executes the file move operation.
   * @description Performs validation, security checks, creates target directory if needed, and moves file.
   * @returns Success message or error message if validation/moving fails
   * @throws {Error} When file system operations fail or validation errors occur
   */
  async execute(): Promise<string> {
    const resValidate: string = this.validate()
    if (resValidate !== 'ok') {
      return resValidate
    }
    try {
      const safeOldPath: SecurityPathResult = getSafePath(this.oldPath)
      if (!safeOldPath.success) {
        return `Error! Invalid old path: ${safeOldPath.message}.`
      }
      const safeNewPath: SecurityPathResult = getSafePath(this.newPath)
      if (!safeNewPath.success) {
        return `Error! Invalid new path: ${safeNewPath.message}.`
      }
      const oldPathExists: SecurityFileSize = await validateFileSize(safeOldPath.path)
      if (oldPathExists.exists === false) {
        return `Error! Source file not found: ${this.oldPath}.`
      }
      const newPathExists: SecurityFileSize = await validateFileSize(safeNewPath.path)
      if (newPathExists.exists === true) {
        return `Error! Destination file already exists: ${this.newPath}. Cannot move to an existing file.`
      }
      const targetDir: string = dirname(safeNewPath.path)
      try {
        await mkdir(targetDir, { recursive: true })
      } catch (error) {
        if (error instanceof Error && !error.message.includes('EEXIST')) {
          return `Error! Failed to create target directory: ${error.message}.`
        }
      }
      await rename(safeOldPath.path, safeNewPath.path)
      return `Successfully moved "${this.oldPath}" to "${this.newPath}".`
    } catch (error) {
      return `Error! Moving "${this.oldPath}" to "${this.newPath}": ${error instanceof Error ? error.message : 'Unknown error'}.`
    }
  }

  /**
   * Validates the path parameters.
   * @description Checks that both oldPath and newPath are valid non-empty strings.
   * @returns 'ok' if validation passes, error message if validation fails
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
      return 'Invalid: `oldPath` and `newPath` cannot be the same.'
    }
    return 'ok'
  }
}
