import { mkdir, existsSync } from 'node:fs'
import { promisify } from 'node:util'
import type { SchemaDirectoryCreate, SecurityPathResult } from '@interfaces/index'
import { getSafePath } from '@core/security/index'

/**
 * Promisified mkdir function for creating directories asynchronously.
 * @description Converts the mkdir function to a promise-based API for easier use.
 * @param path - The directory path to create
 * @param options - The options for directory creation
 * @returns Promise resolving when directory is created
 */
const mkdirAsync: (path: string, options?: { recursive?: boolean }) => Promise<void> = promisify(
  mkdir
) as (path: string, options?: { recursive?: boolean }) => Promise<void>

/**
 * Handles directory creation operations with security validation.
 * @description Executes directory creation with security checks and recursive directory support.
 */
export default class DirectoryCreate {
  /** The directory path to create */
  private readonly directoryPath: string
  /** Whether to create parent directories if they don't exist */
  private readonly recursive: boolean

  /**
   * Creates a new DirectoryCreate instance.
   * @description Initializes the directory creation operation with directory path and recursive options.
   * @param args - The directory creation schema containing directory path and recursive options
   */
  constructor(args: SchemaDirectoryCreate) {
    const { directoryPath, recursive }: SchemaDirectoryCreate = args
    this.directoryPath = directoryPath
    this.recursive = recursive ?? false
  }

  /**
   * Executes the directory creation operation.
   * @description Performs validation, security checks, and creates the directory.
   * @returns Success message or error message if validation/creation fails
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
      if (existsSync(safePath.path)) {
        return `Error! Directory already exists: ${this.directoryPath}.`
      }
      await mkdirAsync(safePath.path, { recursive: this.recursive })
      const recursiveText: string = this.recursive ? ' (with parent directories)' : ''
      return `Directory created successfully at ${this.directoryPath}${recursiveText}.`
    } catch (error) {
      return `Error! Creating directory ${this.directoryPath}: ${error instanceof Error ? error.message : 'Unknown error'}.`
    }
  }

  /**
   * Validates the directory creation parameters.
   * @description Checks that all required parameters are valid.
   * @returns 'ok' if validation passes, error message if validation fails
   */
  private validate(): string {
    if (typeof this.directoryPath !== 'string') {
      return 'Invalid: `directoryPath` must be a string.'
    }
    if (this.directoryPath.trim().length === 0) {
      return 'Invalid: `directoryPath` cannot be empty.'
    }
    if (typeof this.recursive !== 'boolean') {
      return 'Invalid: `recursive` must be a boolean.'
    }
    return 'ok'
  }
}
