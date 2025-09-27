import { createWriteStream, type WriteStream, existsSync } from 'node:fs'
import type { SchemaFileCreate, SecurityPathResult } from '@interfaces/index'
import { getSafePath } from '@core/security/index'

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
      if (existsSync(safePath.path)) {
        return `Error! File already exists: ${this.filePath}. Use FileEdit tool to modify existing files.`
      }
      if (this.content.length === 0) {
        return `Error! No content to write to file: ${this.filePath}.`
      }
      return await new Promise<string>(
        (resolve: (value: string) => void, reject: (reason?: Error) => void) => {
          const writeStream: WriteStream = createWriteStream(safePath.path, { flags: 'w' })
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
