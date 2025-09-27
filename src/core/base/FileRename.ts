import { rename } from 'node:fs/promises'
import { dirname, basename, resolve } from 'node:path'
import type { SchemaFileRename, SecurityPathResult } from '@interfaces/index'
import { getSafePath, validateFileSize } from '@core/security/index'

/**
 * Handles file rename operations with security validation.
 * @description Executes file renaming by filename only within the same directory with security checks.
 */
export default class FileRename {
  /** The current filename to rename */
  private readonly oldFilename: string
  /** The new filename to rename to */
  private readonly newFilename: string

  /**
   * Creates a new FileRename instance.
   * @description Initializes the file rename operation with old and new filename parameters.
   * @param args - The file rename schema containing old and new filename data
   */
  constructor(args: SchemaFileRename) {
    const { oldFilename, newFilename }: SchemaFileRename = args
    this.oldFilename = oldFilename
    this.newFilename = newFilename
  }

  /**
   * Executes the file rename operation.
   * @description Performs validation, security checks, and renames file by filename only within the same directory.
   * @returns Success message or error message if validation/renaming fails
   * @throws {Error} When file system operations fail or validation errors occur
   */
  async execute(): Promise<string> {
    const resValidate: string = this.validate()
    if (resValidate !== 'ok') {
      return resValidate
    }
    try {
      const safeOldPath: SecurityPathResult = getSafePath(this.oldFilename)
      if (!safeOldPath.success) {
        return `Error! Invalid old filename: ${safeOldPath.message}.`
      }
      const oldDir: string = dirname(safeOldPath.path)
      const newBasename: string = basename(this.newFilename)
      const newPath: string = resolve(oldDir, newBasename)
      const safeNewPath: SecurityPathResult = getSafePath(newPath)
      if (!safeNewPath.success) {
        return `Error! Invalid new filename: ${safeNewPath.message}.`
      }
      const oldPathExists: { valid: boolean; exists: boolean } = await validateFileSize(
        safeOldPath.path
      )
      if (oldPathExists.exists === false) {
        return `Error! Source file not found: ${this.oldFilename}.`
      }
      const newPathExists: { valid: boolean; exists: boolean } = await validateFileSize(
        safeNewPath.path
      )
      if (newPathExists.exists === true) {
        return `Error! Destination filename already exists: ${this.newFilename}. Cannot rename to an existing file.`
      }
      await rename(safeOldPath.path, safeNewPath.path)
      return `Successfully renamed "${this.oldFilename}" to "${this.newFilename}".`
    } catch (error) {
      return `Error! Renaming "${this.oldFilename}" to "${this.newFilename}": ${error instanceof Error ? error.message : 'Unknown error'}.`
    }
  }

  /**
   * Validates the filename parameters.
   * @description Checks that both oldFilename and newFilename are valid non-empty strings.
   * @returns 'ok' if validation passes, error message if validation fails
   */
  private validate(): string {
    if (typeof this.oldFilename !== 'string') {
      return '`oldFilename` must be a string.'
    }
    if (this.oldFilename.trim().length === 0) {
      return '`oldFilename` cannot be empty.'
    }
    if (typeof this.newFilename !== 'string') {
      return '`newFilename` must be a string.'
    }
    if (this.newFilename.trim().length === 0) {
      return '`newFilename` cannot be empty.'
    }
    if (this.oldFilename === this.newFilename) {
      return '`oldFilename` and `newFilename` cannot be the same.'
    }
    return 'ok'
  }
}
