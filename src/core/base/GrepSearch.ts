import type { SchemaGrepSearch, SecurityPathResult } from '@interfaces/index'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { relative } from 'node:path'
import { getSafePath } from '@core/security/index'
import { resolveRipgrepPath } from '@utils/Ripgrep'

/**
 * Grep search result with file and line information.
 * @description Represents a content match with file path, line number, and content.
 */
interface GrepResult {
  /** The file path where the match was found */
  filePath: string
  /** The line number where the match was found */
  lineNumber: number
  /** The content of the matching line */
  content: string
}

/**
 * Promisified exec function for executing commands asynchronously.
 * @description Converts the exec function to a promise-based API for easier use.
 * @param command - The command to execute
 * @param options - The options for the command execution
 * @returns Promise resolving to the command output
 */
const execAsync: (
  command: string,
  options: { cwd?: string }
) => Promise<{ stdout: string; stderr: string }> = promisify(exec)

/**
 * Handles content search operations using Ripgrep with security validation.
 * @description Searches for text content within files using Ripgrep for text search.
 */
export default class GrepSearch {
  /** The search pattern to find */
  private readonly pattern: string
  /** The working directory to search from */
  private readonly workingDir: string | undefined
  /** Array of file types to search in */
  private readonly fileTypes: string[] | undefined
  /** Array of file types to exclude from search */
  private readonly excludeTypes: string[] | undefined
  /** Whether the search should be case-sensitive */
  private readonly caseSensitive: boolean
  /** Whether to match only whole words */
  private readonly wholeWord: boolean
  /** Whether to treat the pattern as a regular expression */
  private readonly regex: boolean
  /** Number of context lines to show before and after each match */
  private readonly contextLines: number
  /** Maximum number of results to return */
  private readonly maxResults: number
  /** Maximum depth to search */
  private readonly maxDepth: number | undefined
  /** Array of patterns to exclude from search */
  private readonly excludePatterns: string[] | undefined

  /**
   * Creates a new GrepSearch instance.
   * @description Initializes the content search with pattern and options.
   * @param args - The grep search schema containing search parameters
   */
  constructor(args: SchemaGrepSearch) {
    const {
      pattern,
      workingDir,
      fileTypes,
      excludeTypes,
      caseSensitive = false,
      wholeWord = false,
      regex = false,
      contextLines = 2,
      maxResults = 50,
      maxDepth,
      excludePatterns
    }: SchemaGrepSearch = args
    this.pattern = pattern
    this.workingDir = workingDir
    this.fileTypes = fileTypes
    this.excludeTypes = excludeTypes
    this.caseSensitive = caseSensitive
    this.wholeWord = wholeWord
    this.regex = regex
    this.contextLines = contextLines
    this.maxResults = maxResults
    this.maxDepth = maxDepth
    this.excludePatterns = excludePatterns
  }

  /**
   * Executes the content search operation.
   * @description Performs validation, security checks, and executes the content search using Ripgrep.
   * @returns Search results with matching content or error message
   * @throws {Error} When search operations fail or validation errors occur
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
          return `Error! Invalid working directory: ${validatedWorkingDir.message}.`
        }
        safeWorkingDir = validatedWorkingDir.path
      }
      const ripgrepPath: string | null = resolveRipgrepPath()
      if (ripgrepPath === null) {
        return 'Error! Ripgrep binary not found. Please ensure Ripgrep is properly installed.'
      }
      const startTime: number = Date.now()
      const results: GrepResult[] = await this.performSearch(ripgrepPath, safeWorkingDir)
      const executionTime: number = Date.now() - startTime
      if (results.length === 0) {
        return `No matches found for pattern "${this.pattern}" in ${executionTime}ms.`
      }
      return this.formatResults(results, executionTime)
    } catch (error: unknown) {
      return `Error! Grep search failed: ${error instanceof Error ? error.message : 'Unknown error'}.`
    }
  }

  /**
   * Validates the search parameters and configuration.
   * @description Validates all search parameters and options.
   * @returns 'ok' if validation passes, error message if validation fails
   */
  private validate(): string {
    const patternValidation: string = this.validatePattern()
    if (patternValidation !== 'ok') {
      return patternValidation
    }
    const workingDirValidation: string = this.validateWorkingDir()
    if (workingDirValidation !== 'ok') {
      return workingDirValidation
    }
    const maxResultsValidation: string = this.validateMaxResults()
    if (maxResultsValidation !== 'ok') {
      return maxResultsValidation
    }
    const maxDepthValidation: string = this.validateMaxDepth()
    if (maxDepthValidation !== 'ok') {
      return maxDepthValidation
    }
    const contextLinesValidation: string = this.validateContextLines()
    if (contextLinesValidation !== 'ok') {
      return contextLinesValidation
    }
    return 'ok'
  }

  /**
   * Validates the search pattern.
   * @description Ensures the search pattern is valid and not empty.
   * @returns 'ok' if pattern is valid, error message if invalid
   */
  private validatePattern(): string {
    if (!this.pattern || this.pattern.trim().length === 0) {
      return 'Error! Search pattern cannot be empty.'
    }
    if (this.pattern.length > 1000) {
      return 'Error! Search pattern is too long (maximum 1000 characters).'
    }
    return 'ok'
  }

  /**
   * Validates the working directory parameter.
   * @description Ensures the working directory is valid if provided.
   * @returns 'ok' if working directory is valid, error message if invalid
   */
  private validateWorkingDir(): string {
    if (this.workingDir !== undefined && this.workingDir.trim().length === 0) {
      return 'Error! Working directory cannot be empty.'
    }
    return 'ok'
  }

  /**
   * Validates the maximum results parameter.
   * @description Ensures maxResults is within acceptable range.
   * @returns 'ok' if maxResults is valid, error message if invalid
   */
  private validateMaxResults(): string {
    if (this.maxResults < 1) {
      return 'Error! Maximum results must be at least 1.'
    }
    if (this.maxResults > 200) {
      return 'Error! Maximum results cannot exceed 200.'
    }
    return 'ok'
  }

  /**
   * Validates the maximum depth parameter.
   * @description Ensures maxDepth is within acceptable range if provided.
   * @returns 'ok' if maxDepth is valid, error message if invalid
   */
  private validateMaxDepth(): string {
    if (this.maxDepth !== undefined) {
      if (this.maxDepth < 0) {
        return 'Error! Maximum depth cannot be negative.'
      }
      if (this.maxDepth > 20) {
        return 'Error! Maximum depth cannot exceed 20.'
      }
    }
    return 'ok'
  }

  /**
   * Validates the context lines parameter.
   * @description Ensures contextLines is within acceptable range.
   * @returns 'ok' if contextLines is valid, error message if invalid
   */
  private validateContextLines(): string {
    if (this.contextLines < 0) {
      return 'Error! Context lines cannot be negative.'
    }
    if (this.contextLines > 10) {
      return 'Error! Context lines cannot exceed 10.'
    }
    return 'ok'
  }

  /**
   * Performs the actual content search using Ripgrep.
   * @description Executes the Ripgrep command and parses the results.
   * @param ripgrepPath - Path to the Ripgrep binary
   * @param searchDir - The validated search directory
   * @returns Array of search results
   */
  private async performSearch(ripgrepPath: string, searchDir: string): Promise<GrepResult[]> {
    const command: string = this.buildRipgrepCommand(ripgrepPath, searchDir)
    const results: GrepResult[] = await this.executeSearch(command, searchDir)
    return results.slice(0, this.maxResults)
  }

  /**
   * Builds the Ripgrep command with all options.
   * @description Constructs the Ripgrep command with pattern, options, and file filters.
   * @param ripgrepPath - Path to the Ripgrep binary
   * @param searchDir - Directory to search in
   * @returns The Ripgrep command string
   */
  private buildRipgrepCommand(ripgrepPath: string, searchDir: string): string {
    const args: string[] = []
    if (this.regex) {
      args.push('--regexp', this.pattern)
    } else {
      args.push('--fixed-strings', this.pattern)
    }
    if (!this.caseSensitive) {
      args.push('--ignore-case')
    }
    if (this.wholeWord) {
      args.push('--word-regexp')
    }
    if (this.contextLines > 0) {
      args.push('--context', this.contextLines.toString())
    }
    args.push('--max-count', this.maxResults.toString())
    if (this.fileTypes && this.fileTypes.length > 0) {
      this.fileTypes.forEach((type: string) => {
        args.push('--type', type)
      })
    }
    if (this.excludeTypes && this.excludeTypes.length > 0) {
      this.excludeTypes.forEach((type: string) => {
        args.push('--type-not', type)
      })
    }
    if (this.excludePatterns && this.excludePatterns.length > 0) {
      this.excludePatterns.forEach((pattern: string) => {
        args.push('--glob', `!${pattern}`)
      })
    }
    if (this.maxDepth !== undefined) {
      args.push('--max-depth', this.maxDepth.toString())
    }
    args.push('--with-filename', '--line-number', '--no-heading')
    args.push(searchDir)
    return `${ripgrepPath} ${args.join(' ')}`
  }

  /**
   * Executes the Ripgrep search command.
   * @description Runs the Ripgrep command and parses the results.
   * @param command - The Ripgrep command
   * @param searchDir - The search directory for relative paths
   * @returns Array of parsed search results
   * @throws {Error} When command execution fails
   */
  private async executeSearch(command: string, searchDir: string): Promise<GrepResult[]> {
    try {
      const { stdout, stderr }: { stdout: string; stderr: string } = await execAsync(command, {
        cwd: searchDir
      })
      if (stderr.length > 0 && !stderr.includes('No such file or directory')) {
        throw new Error(`Ripgrep error: ${stderr}`)
      }
      if (stdout.trim().length === 0) {
        return []
      }
      return this.parseRipgrepOutput(stdout, searchDir)
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('Command failed')) {
        return []
      }
      throw error
    }
  }

  /**
   * Parses Ripgrep output into structured results.
   * @description Converts Ripgrep's file:line:content format into GrepResult objects.
   * @param output - Raw Ripgrep output
   * @param searchDir - The search directory for relative paths
   * @returns Array of parsed search results
   */
  private parseRipgrepOutput(output: string, searchDir: string): GrepResult[] {
    const lines: string[] = output.trim().split('\n')
    const results: GrepResult[] = []
    const regex: RegExp = /^([^:]+):(\d+):(.*)$/
    for (const line of lines) {
      const match: RegExpMatchArray | null = regex.exec(line)
      if (match === null) {
        continue
      }
      const [, filePath, lineNumberStr, content]: string[] = match
      if (filePath === undefined || lineNumberStr === undefined || content === undefined) {
        continue
      }
      const lineNumber: number = parseInt(lineNumberStr, 10)
      const relativePath: string = relative(searchDir, filePath)
      results.push({
        filePath: relativePath,
        lineNumber,
        content
      })
    }
    return results
  }

  /**
   * Formats search results into a readable string.
   * @description Converts GrepResult objects into a formatted output string.
   * @param results - Array of search results
   * @param executionTime - Execution time in milliseconds
   * @returns Formatted search results string
   */
  private formatResults(results: GrepResult[], executionTime: number): string {
    if (results.length === 0) {
      return `No matches found for pattern "${this.pattern}" in ${executionTime}ms.`
    }
    let output: string = `Found ${results.length} match${results.length === 1 ? '' : 'es'} for pattern "${this.pattern}" in ${executionTime}ms:\n\n`
    const resultsByFile: Map<string, GrepResult[]> = new Map()
    for (const result of results) {
      if (!resultsByFile.has(result.filePath)) {
        resultsByFile.set(result.filePath, [])
      }
      resultsByFile.get(result.filePath)?.push(result)
    }
    for (const [filePath, fileResults] of resultsByFile) {
      output += `${filePath}:\n`
      for (const result of fileResults) {
        output += `  ${result.lineNumber}: ${result.content}\n`
      }
      output += '\n'
    }
    return output.trim()
  }
}
