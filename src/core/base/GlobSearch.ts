import fastGlob from 'fast-glob'
import type { SchemaGlobSearch, SecurityPathResult } from '@interfaces/index'
import { getSafePath } from '@core/security/index'

/**
 * Handles glob pattern file search operations with security validation.
 * @description Searches for files using glob patterns with comprehensive security checks and fast-glob integration.
 */
export default class GlobSearch {
  /** Array of glob patterns to search for */
  private readonly patterns: string[]
  /** The working directory to search from */
  private readonly workingDir: string | undefined
  /** Whether pattern matching should be case-sensitive */
  private readonly caseSensitive: boolean
  /** Whether to return only files */
  private readonly onlyFiles: boolean
  /** Whether to return only directories */
  private readonly onlyDirectories: boolean
  /** Maximum depth to search */
  private readonly maxDepth: number | undefined

  /**
   * Creates a new GlobSearch instance.
   * @description Initializes the glob search with patterns, working directory, and search options.
   * @param args - The glob search schema containing search parameters
   */
  constructor(args: SchemaGlobSearch) {
    const {
      patterns,
      workingDir,
      caseSensitive,
      onlyFiles,
      onlyDirectories,
      maxDepth
    }: SchemaGlobSearch = args
    this.patterns = patterns
    this.workingDir = workingDir
    this.caseSensitive = caseSensitive ?? false
    this.onlyFiles = onlyFiles ?? true
    this.onlyDirectories = onlyDirectories ?? false
    this.maxDepth = maxDepth
  }

  /**
   * Executes the glob search operation.
   * @description Performs validation, security checks, and executes the glob search with fast-glob.
   * @returns Search results with matching file paths or error message
   */
  async execute(): Promise<string> {
    const resValidate: string = this.validate()
    if (resValidate !== 'ok') {
      return resValidate
    }
    try {
      let safeWorkingDir: string = process.cwd()
      if (this.workingDir !== undefined) {
        const validatedWorkingDir: SecurityPathResult = getSafePath(this.workingDir)
        if (!validatedWorkingDir.success) {
          return `Error! Invalid working directory: ${validatedWorkingDir.message}`
        }
        safeWorkingDir = validatedWorkingDir.path
      }
      const startTime: number = Date.now()
      const results: string[] = await this.performSearch(safeWorkingDir)
      const executionTime: number = Date.now() - startTime
      if (results.length === 0) {
        return `No files found matching the patterns in ${executionTime}ms.`
      }
      return `Found ${results.length} files in ${executionTime}ms:\n\n${results.join('\n')}`
    } catch (error) {
      return `Error! Glob search failed: ${error instanceof Error ? error.message : 'Unknown error'}.`
    }
  }

  /**
   * Performs the actual glob search using fast-glob.
   * @description Executes the search with validated patterns and options.
   * @param workingDir - The validated working directory
   * @returns Array of matching file paths
   */
  private async performSearch(workingDir: string): Promise<string[]> {
    const options: fastGlob.Options = {
      cwd: workingDir,
      caseSensitiveMatch: this.caseSensitive,
      onlyFiles: this.onlyFiles,
      onlyDirectories: this.onlyDirectories
    }
    if (this.maxDepth !== undefined) {
      options.deep = this.maxDepth
    }
    const results: string[] = await fastGlob(this.patterns, options)
    return results.sort((a: string, b: string) => a.localeCompare(b))
  }

  /**
   * Validates the glob search parameters.
   * @description Checks that all parameters are valid.
   * @returns 'ok' if validation passes, error message if validation fails
   */
  private validate(): string {
    if (!Array.isArray(this.patterns)) {
      return '`patterns` must be an array.'
    }
    if (this.patterns.length === 0) {
      return '`patterns` cannot be empty.'
    }
    for (const pattern of this.patterns) {
      if (typeof pattern !== 'string') {
        return 'All patterns must be strings.'
      }
      if (pattern.trim().length === 0) {
        return 'Patterns cannot be empty.'
      }
    }
    if (this.workingDir !== undefined && typeof this.workingDir !== 'string') {
      return '`workingDir` must be a string.'
    }
    if (this.workingDir !== undefined && this.workingDir.trim().length === 0) {
      return '`workingDir` cannot be empty.'
    }
    if (typeof this.caseSensitive !== 'boolean') {
      return '`caseSensitive` must be a boolean.'
    }
    if (typeof this.onlyFiles !== 'boolean') {
      return '`onlyFiles` must be a boolean.'
    }
    if (typeof this.onlyDirectories !== 'boolean') {
      return '`onlyDirectories` must be a boolean.'
    }
    if (this.maxDepth !== undefined && typeof this.maxDepth !== 'number') {
      return '`maxDepth` must be a number.'
    }
    if (this.maxDepth !== undefined && (this.maxDepth < 0 || this.maxDepth > 20)) {
      return '`maxDepth` must be between 0 and 20.'
    }
    if (this.onlyFiles && this.onlyDirectories) {
      return 'Cannot set both `onlyFiles` and `onlyDirectories` to true.'
    }
    return 'ok'
  }
}
