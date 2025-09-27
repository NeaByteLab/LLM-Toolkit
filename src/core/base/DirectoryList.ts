import type { Stats } from 'node:fs'
import { readdir, stat } from 'node:fs/promises'
import type { SchemaDirectoryList, SecurityPathResult } from '@interfaces/index'
import { getSafePath } from '@core/security/index'

/**
 * Handles directory listing operations with security validation.
 * @description Executes directory listing with path validation and security checks to prevent directory traversal attacks.
 */
export default class DirectoryList {
  /** The directory path to list */
  private readonly directoryPath: string

  /**
   * Creates a new DirectoryList instance.
   * @description Initializes the directory listing operation with directory path parameter.
   * @param args - The directory listing schema containing directory path data
   */
  constructor(args: SchemaDirectoryList) {
    const { directoryPath }: SchemaDirectoryList = args
    this.directoryPath = directoryPath
  }

  /**
   * Executes the directory listing operation.
   * @description Performs validation, security checks, and lists directory contents or returns error message.
   * @returns Directory contents as string or error message if validation/listing fails
   * @throws {Error} When file system operations fail or validation errors occur
   */
  async execute(): Promise<string> {
    const resValidate: string = this.validate()
    if (resValidate !== 'ok') {
      return resValidate
    }
    try {
      const safePath: SecurityPathResult = getSafePath(this.directoryPath)
      if (!safePath.success) {
        return `Error! Invalid directory path: ${safePath.message}.`
      }
      const contents: string[] = await readdir(safePath.path)
      if (contents.length === 0) {
        return `Directory ${this.directoryPath} is empty.`
      }
      return await this.formatContents(safePath.path, contents)
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return `Error! Directory not found: ${this.directoryPath}.`
      }
      if (error instanceof Error && 'code' in error && error.code === 'ENOTDIR') {
        return `Error! Path is not a directory: ${this.directoryPath}.`
      }
      return `Error! Reading directory ${this.directoryPath}: ${error instanceof Error ? error.message : 'Unknown error'}.`
    }
  }

  /**
   * Formats directory contents with file/directory indicators.
   * @description Adds visual indicators to distinguish between files and directories.
   * @param safePath - The validated safe path
   * @param contents - Array of directory contents
   * @returns Formatted string with file/directory indicators
   */
  private async formatContents(safePath: string, contents: string[]): Promise<string> {
    const itemsWithTypes: string[] = []
    for (const item of contents) {
      try {
        const itemPath: string = `${safePath}/${item}`
        const stats: Stats = await stat(itemPath)
        if (stats.isDirectory()) {
          itemsWithTypes.push(`📁 ${item}/`)
        } else if (stats.isFile()) {
          itemsWithTypes.push(`📄 ${item}`)
        } else {
          itemsWithTypes.push(`❓ ${item}`)
        }
      } catch {
        itemsWithTypes.push(`❓ ${item}`)
      }
    }
    return itemsWithTypes.join('\n')
  }

  /**
   * Validates the directory path parameter.
   * @description Checks that directoryPath is a valid non-empty string.
   * @returns 'ok' if validation passes, error message if validation fails
   */
  private validate(): string {
    if (typeof this.directoryPath !== 'string') {
      return '`directoryPath` must be a string.'
    }
    if (this.directoryPath.trim().length === 0) {
      return '`directoryPath` cannot be empty.'
    }
    return 'ok'
  }
}
