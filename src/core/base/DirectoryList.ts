import type { Stats } from 'node:fs'
import { readFile, readdir, stat } from 'node:fs/promises'
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
   * Formats directory contents with file/directory indicators and file information.
   * @description Adds visual indicators, file size/line count, and directory item counts.
   * @param safePath - The validated safe path
   * @param contents - Array of directory contents
   * @returns Formatted string with file/directory indicators and file info
   */
  private async formatContents(safePath: string, contents: string[]): Promise<string> {
    const itemsWithTypes: string[] = []
    for (const item of contents) {
      try {
        const itemPath: string = `${safePath}/${item}`
        const stats: Stats = await stat(itemPath)
        if (stats.isDirectory()) {
          const itemCount: number = await this.getDirectoryItemCount(itemPath)
          itemsWithTypes.push(`📁 ${item}/ (${itemCount} items)`)
        } else if (stats.isFile()) {
          const fileInfo: string = await this.getFileInfo(itemPath, stats)
          itemsWithTypes.push(`📄 ${item}${fileInfo}`)
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
   * Gets file information including size and line count.
   * @description Calculates file size and line count for text files.
   * @param filePath - The path to the file
   * @param stats - File statistics
   * @returns Formatted file information string
   */
  private async getFileInfo(filePath: string, stats: Stats): Promise<string> {
    const size: string = this.formatFileSize(stats.size)
    const lineCount: number = await this.getLineCount(filePath)
    return ` (${size}, ${lineCount} lines)`
  }

  /**
   * Formats file size in human-readable format.
   * @description Converts bytes to appropriate units (B, KB, MB, GB).
   * @param bytes - File size in bytes
   * @returns Formatted size string
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) {
      return '0B'
    }
    const units: string[] = ['B', 'KB', 'MB', 'GB']
    const k: number = 1024
    const i: number = Math.floor(Math.log(bytes) / Math.log(k))
    const size: number = bytes / Math.pow(k, i)
    return `${Math.round(size)}${units[i]}`
  }

  /**
   * Gets line count for a text file.
   * @description Counts lines in text files, returns 0 for binary files.
   * @param filePath - The path to the file
   * @returns Number of lines in the file
   */
  private async getLineCount(filePath: string): Promise<number> {
    try {
      const content: string = await readFile(filePath, 'utf8')
      return content.split('\n').length
    } catch {
      return 0
    }
  }

  /**
   * Gets the total number of items in a directory.
   * @description Counts files and subdirectories in the specified directory.
   * @param dirPath - The path to the directory
   * @returns Number of items in the directory
   */
  private async getDirectoryItemCount(dirPath: string): Promise<number> {
    try {
      const contents: string[] = await readdir(dirPath)
      return contents.length
    } catch {
      return 0
    }
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
