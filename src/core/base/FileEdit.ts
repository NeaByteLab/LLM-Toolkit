/* eslint-disable security/detect-non-literal-fs-filename */
import { readFile } from 'node:fs/promises'
import { existsSync, createWriteStream, type WriteStream } from 'node:fs'
import { resolve, normalize, isAbsolute } from 'node:path'
import type { SchemaFileEdit } from '@interfaces/ToolSchema'

/**
 * Handles file editing operations with search and replace functionality.
 * @description Executes file modifications by replacing specific text in files with versioning support.
 */
export default class FileEdit {
  /** The file path where the edit will be applied */
  private readonly filePath: string
  /** The text to be replaced in the file */
  private readonly oldString: string
  /** The new text to replace the old string */
  private readonly newString: string

  /**
   * Creates a new FileEdit instance.
   * @description Initializes the file edit operation with file path and text replacement parameters.
   * @param args - The file edit schema containing file path and text replacement data
   */
  constructor(args: SchemaFileEdit) {
    const { filePath, oldString, newString }: SchemaFileEdit = args
    this.filePath = filePath
    this.oldString = oldString
    this.newString = newString
  }

  /**
   * Executes the file edit operation.
   * @description Performs validation and executes the actual search and replace operation.
   * @returns Success message with edit details or validation error message
   */
  async execute(): Promise<string> {
    const resValidate: string = this.validate()
    if (resValidate !== 'ok') {
      return resValidate
    }
    try {
      const safePath: string | null = this.getSafePath()
      if (safePath === null) {
        return `Error! Invalid file path: ${this.filePath}.`
      }
      if (!existsSync(safePath)) {
        return `Error! File not found: ${this.filePath}.`
      }
      const fileContent: string = await readFile(safePath, 'utf8')
      if (fileContent.length === 0) {
        return `Error! File is empty: ${this.filePath}.`
      }
      const result: { success: boolean; message: string; newContent?: string } =
        this.performSearchReplace(fileContent)
      if (!result.success) {
        return result.message
      }
      return await new Promise<string>(
        (resolve: (value: string) => void, reject: (reason?: Error) => void) => {
          const writeStream: WriteStream = createWriteStream(safePath, { flags: 'w' })
          writeStream.write(result.newContent ?? '', 'utf8')
          writeStream.end()
          writeStream.on('finish', () => {
            resolve(`File edit executed successfully on ${this.filePath}.`)
          })
          writeStream.on('error', (error: Error) => {
            reject(error)
          })
        }
      )
    } catch (error) {
      return `Error! Editing file ${this.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}.`
    }
  }

  /**
   * Gets a safe file path for editing operations.
   * @description Validates and normalizes the file path for security.
   * @returns Safe file path or null if invalid
   */
  private getSafePath(): string | null {
    if (isAbsolute(this.filePath)) {
      return null
    }
    const normalizedPath: string = normalize(this.filePath)
    const resolvedPath: string = resolve(process.cwd(), normalizedPath)
    if (resolvedPath.includes('..') || resolvedPath.includes('~')) {
      return null
    }
    const cwd: string = process.cwd()
    if (!resolvedPath.startsWith(cwd)) {
      return null
    }
    return resolvedPath
  }

  /**
   * Performs the search and replace operation on file content.
   * @description Searches for the old string and replaces it with the new string.
   * @param fileContent - The current file content
   * @returns Result object with success status and message
   */
  private performSearchReplace(fileContent: string): {
    success: boolean
    message: string
    newContent?: string
  } {
    if (!fileContent.includes(this.oldString)) {
      return {
        success: false,
        message:
          'Error! The specified text was not found in the file. Please check the oldString parameter and ensure it matches the file content exactly.'
      }
    }
    const parts: string[] = fileContent.split(this.oldString)
    const occurrences: number = parts.length - 1
    if (occurrences > 1) {
      return {
        success: false,
        message: `Error! The oldString appears ${occurrences} times in the file. Please provide more context to make it unique.`
      }
    }
    const newContent: string = fileContent.replace(this.oldString, this.newString)
    return {
      success: true,
      message: 'Search and replace completed successfully.',
      newContent
    }
  }

  /**
   * Validates the file edit parameters.
   * @description Checks that all required parameters are valid strings.
   * @returns 'ok' if validation passes, error message if validation fails
   */
  private validate(): string {
    if (typeof this.filePath !== 'string') {
      return '`filePath` must be a string.'
    }
    if (typeof this.oldString !== 'string') {
      return '`oldString` must be a string.'
    }
    if (typeof this.newString !== 'string') {
      return '`newString` must be a string.'
    }
    if (this.filePath.trim().length === 0) {
      return '`filePath` cannot be empty.'
    }
    if (this.oldString.trim().length === 0) {
      return '`oldString` cannot be empty.'
    }
    if (this.newString.trim().length === 0) {
      return '`newString` cannot be empty.'
    }
    if (this.oldString === this.newString) {
      return '`oldString` and `newString` must be different.'
    }
    return 'ok'
  }
}
