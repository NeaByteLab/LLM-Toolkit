import type { Stats } from 'node:fs'
import { readFile, readdir, readlink, stat } from 'node:fs/promises'
import { join, dirname } from 'node:path'
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
      const targetPath: string = await this.resolveSymlink(safePath.path)
      const contents: string[] = await readdir(targetPath)
      if (contents.length === 0) {
        return `Directory ${this.directoryPath} is empty.`
      }
      return await this.formatContents(targetPath, contents)
    } catch (error) {
      return this.handleDirectoryError(error)
    }
  }

  /**
   * Resolves symlinks to their target paths.
   * @description Follows symlinks and returns the target path.
   * @param path - The path to check for symlinks
   * @returns The resolved target path
   */
  private async resolveSymlink(path: string): Promise<string> {
    try {
      const stats: Stats = await stat(path)
      if (stats.isSymbolicLink()) {
        const linkTarget: string = await readlink(path)
        return linkTarget.startsWith('/') ? linkTarget : join(dirname(path), linkTarget)
      }
    } catch {
      // Skip if we can't read the symlink
    }
    return path
  }

  /**
   * Handles directory operation errors with standardized messages.
   * @description Converts various error types to user-friendly messages.
   * @param error - The error that occurred
   * @returns Standardized error message
   */
  private handleDirectoryError(error: unknown): string {
    if (error instanceof Error && 'code' in error) {
      switch (error.code) {
        case 'ENOENT':
          return `Error! Directory not found: ${this.directoryPath}.`
        case 'ENOTDIR':
          return `Error! Path is not a directory: ${this.directoryPath}.`
        case 'EACCES':
          return `Error! Permission denied: ${this.directoryPath}.`
        default:
          return `Error! Reading directory ${this.directoryPath}: ${error.message}.`
      }
    }
    return `Error! Reading directory ${this.directoryPath}: ${error instanceof Error ? error.message : 'Unknown error'}.`
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
      const hasNullBytes: boolean = content.includes('\0')
      const hasBinaryChars: boolean = this.isBinaryContent(content)
      if (hasNullBytes || hasBinaryChars) {
        return 0
      }
      return content.split('\n').length
    } catch {
      return 0
    }
  }

  /**
   * Checks if content contains binary characters.
   * @description Detects binary content by checking for control characters.
   * @param content - The content to check
   * @returns True if content appears to be binary
   */
  private isBinaryContent(content: string): boolean {
    for (let i: number = 0; i < content.length; i++) {
      const charCode: number = content.charCodeAt(i)
      if (
        charCode === 0 ||
        (charCode >= 1 && charCode <= 8) ||
        (charCode >= 14 && charCode <= 31) ||
        (charCode >= 127 && charCode <= 159)
      ) {
        return true
      }
    }
    return false
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
   * @description Checks that directoryPath is a valid non-empty string with reasonable length.
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
