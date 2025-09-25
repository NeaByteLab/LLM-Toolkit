/* eslint-disable security/detect-non-literal-fs-filename */
import { createWriteStream, type WriteStream, existsSync } from 'node:fs'
import { resolve, normalize, isAbsolute } from 'node:path'
import type { SchemaFileCreate } from '@interfaces/ToolSchema'

/**
 * Handles file creation operations with content writing functionality.
 * @description Executes file creation by writing new content to a new file at the specified path.
 */
export default class FileCreate {
  /** The file path where the new file will be created */
  private readonly filePath: string
  /** The content to write to the new file */
  private readonly content: string
  /** Instructions describing the file creation operation */
  private readonly instructions: string

  /**
   * Creates a new FileCreate instance.
   * @description Initializes the file creation operation with file path, content, and instructions.
   * @param args - The file creation schema containing file path, content, and instructions
   */
  constructor(args: SchemaFileCreate) {
    const { filePath, content, instructions }: SchemaFileCreate = args
    this.filePath = filePath
    this.content = content
    this.instructions = instructions
  }

  /**
   * Executes the file creation operation.
   * @description Performs validation and executes the actual file creation operation.
   * @returns Success message with creation details or validation error message
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
      if (existsSync(safePath)) {
        return `Error! File already exists: ${this.filePath}. Use FileEdit tool to modify existing files.`
      }
      if (this.content.length === 0) {
        return `Error! No content to write to file: ${this.filePath}.`
      }
      return await new Promise<string>(
        (resolve: (value: string) => void, reject: (reason?: Error) => void) => {
          const writeStream: WriteStream = createWriteStream(safePath, { flags: 'w' })
          writeStream.write(this.content, 'utf8')
          writeStream.end()
          writeStream.on('finish', () => {
            resolve(`File created successfully at ${this.filePath}.`)
          })
          writeStream.on('error', (error: Error) => {
            reject(error)
          })
        }
      )
    } catch (error) {
      return `Error! Creating file ${this.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}.`
    }
  }

  /**
   * Gets a safe file path for creation operations.
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
   * Validates the file creation parameters.
   * @description Checks that all required parameters are valid strings.
   * @returns 'ok' if validation passes, error message if validation fails
   */
  private validate(): string {
    if (typeof this.filePath !== 'string') {
      return '`filePath` must be a string.'
    }
    if (typeof this.content !== 'string') {
      return '`content` must be a string.'
    }
    if (typeof this.instructions !== 'string') {
      return '`instructions` must be a string.'
    }
    if (this.filePath.trim().length === 0) {
      return '`filePath` cannot be empty.'
    }
    if (this.content.trim().length === 0) {
      return '`content` cannot be empty.'
    }
    if (this.instructions.trim().length === 0) {
      return '`instructions` cannot be empty.'
    }
    return 'ok'
  }
}
