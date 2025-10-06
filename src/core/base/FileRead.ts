import { readFile } from 'node:fs/promises'
import type { SchemaFileRead, SecurityFileSize, SecurityPathResult } from '@interfaces/index'
import { getSafePath, validateFileSize } from '@core/security/index'

/**
 * Handles file reading operations with security validation and line range support.
 * @description Executes file reading with validation and optional line filtering.
 */
export default class FileRead {
  /** The file path to read */
  private readonly filePath: string
  /** The starting line number (1-based) */
  private readonly lineStart?: number | undefined
  /** The ending line number (1-based) */
  private readonly lineEnd?: number | undefined

  /**
   * Creates a new FileRead instance.
   * @description Initializes the file read operation with file path and optional line range parameters.
   * @param args - The file read schema containing file path and optional line range data
   */
  constructor(args: SchemaFileRead) {
    const { filePath, lineStart, lineEnd }: SchemaFileRead = args
    this.filePath = filePath
    this.lineStart = lineStart
    this.lineEnd = lineEnd
  }

  /**
   * Executes the file read operation.
   * @description Performs validation and reads file content with optional line filtering.
   * @returns File content as string or error message if validation/reading fails
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
      const sizeValidation: SecurityFileSize = await validateFileSize(safePath.path)
      if (sizeValidation.exists === false) {
        return `Error! File not found: ${this.filePath}.`
      }
      if (sizeValidation.valid === false) {
        return `Error! File too large: ${this.filePath}. Maximum file size is 200KB.`
      }
      const content: string = await readFile(safePath.path, 'utf8')
      if (content.length === 0) {
        return `Error! File is empty: ${this.filePath}.`
      }
      if (content.length > 10000) {
        const lines: string[] = content.split('\n')
        if (lines.length === 1) {
          return `Error! File has ${content.length} characters in a single line (likely minified). System only supports reading files up to 10,000 characters at once.`
        }
        return `Error! File has ${content.length} characters. System only supports reading files up to 10,000 characters at once.`
      }
      return this.filterContentByLines(content)
    } catch (error) {
      return `Error! Reading file ${this.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}.`
    }
  }

  /**
   * Filters file content by line range.
   * @description Extracts specific lines from file content based on line parameters.
   * @param content - The full file content
   * @returns Filtered content with line numbers or full content if no range specified
   */
  private filterContentByLines(content: string): string {
    const lines: string[] = content.split('\n')
    const totalLines: number = lines.length
    if (this.lineStart === undefined && this.lineEnd === undefined) {
      if (totalLines > 1000) {
        return `Error! File has ${totalLines} lines. Please use \`lineStart\` and \`lineEnd\` parameters to read specific line ranges (max 1000 lines at once).`
      }
      return content
    }
    if (this.lineStart !== undefined && this.lineStart < 1) {
      return `Error! \`lineStart\` must be 1 or greater, got ${this.lineStart}.`
    }
    if (this.lineEnd !== undefined && this.lineEnd < 1) {
      return `Error! \`lineEnd\` must be 1 or greater, got ${this.lineEnd}.`
    }
    if (
      this.lineStart !== undefined &&
      this.lineEnd !== undefined &&
      this.lineStart > this.lineEnd
    ) {
      return `Error! \`lineStart\` (${this.lineStart}) cannot be greater than \`lineEnd\` (${this.lineEnd}).`
    }
    const startLine: number = this.lineStart ?? 1
    const endLine: number = this.lineEnd ?? totalLines
    if (startLine > totalLines) {
      return `Error! \`lineStart\` (${startLine}) exceeds file length (${totalLines} lines).`
    }
    if (this.lineEnd !== undefined && this.lineEnd > totalLines) {
      return `Error! \`lineEnd\` (${this.lineEnd}) exceeds file length (${totalLines} lines).`
    }
    const requestedLines: number = endLine - startLine + 1
    if (requestedLines > 1000) {
      return `Error! Requested range has ${requestedLines} lines. Please limit to 1000 lines or less per request.`
    }
    const startIndex: number = startLine - 1
    const endIndex: number = Math.min(endLine, totalLines)
    const selectedLines: string[] = lines.slice(startIndex, endIndex)
    if (this.lineStart !== undefined || this.lineEnd !== undefined) {
      return selectedLines
        .map((line: string, index: number) => {
          const lineNumber: number = startLine + index
          return `${lineNumber.toString().padStart(4, ' ')} | ${line}`
        })
        .join('\n')
    }
    return selectedLines.join('\n')
  }

  /**
   * Validates the file path and line range parameters.
   * @description Checks that filePath is valid and line range parameters are within bounds.
   * @returns 'ok' if validation passes, error message if validation fails
   */
  private validate(): string {
    if (typeof this.filePath !== 'string') {
      return 'Invalid: `filePath` must be a string.'
    }
    if (this.filePath.trim().length === 0) {
      return 'Invalid: `filePath` cannot be empty.'
    }
    if (this.lineStart !== undefined && (!Number.isInteger(this.lineStart) || this.lineStart < 1)) {
      return 'Invalid: `lineStart` must be a positive integer.'
    }
    if (this.lineEnd !== undefined && (!Number.isInteger(this.lineEnd) || this.lineEnd < 1)) {
      return 'Invalid: `lineEnd` must be a positive integer.'
    }
    if (
      this.lineStart !== undefined &&
      this.lineEnd !== undefined &&
      this.lineStart > this.lineEnd
    ) {
      return 'Invalid: `lineStart` cannot be greater than `lineEnd`.'
    }
    return 'ok'
  }
}
