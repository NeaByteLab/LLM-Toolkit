import { readdir, stat } from 'node:fs/promises'
import { join, extname, relative } from 'node:path'
import type { SchemaFileSearch, SecurityPathResult } from '@interfaces/index'
import { getSafePath, isPathSafe } from '@core/security/index'

/**
 * Search result with relevance score for fuzzy matching.
 * @description Represents a file/directory match with its relevance score.
 */
interface SearchResult {
  /** The relative path of the matched file/directory */
  path: string
  /** The filename without path */
  name: string
  /** The file extension */
  extension: string
  /** Relevance score (higher is more relevant) */
  score: number
  /** Whether this is a directory */
  isDirectory: boolean
}

/**
 * Handles fuzzy filename search operations with security validation.
 * @description Searches for files using fuzzy filename matching with comprehensive security checks.
 */
export default class FileSearch {
  /** The search term to match against filenames */
  private readonly searchTerm: string
  /** The working directory to search from */
  private readonly workingDir: string | undefined
  /** Whether the search should be case-sensitive */
  private readonly caseSensitive: boolean
  /** Whether to return only files */
  private readonly onlyFiles: boolean
  /** Whether to return only directories */
  private readonly onlyDirectories: boolean
  /** Maximum depth to search */
  private readonly maxDepth: number | undefined
  /** Maximum number of results to return */
  private readonly maxResults: number
  /** Whether to include file extensions in the search */
  private readonly includeExtensions: boolean

  /**
   * Creates a new FileSearch instance.
   * @description Initializes the fuzzy file search with search term and options.
   * @param args - The file search schema containing search parameters
   */
  constructor(args: SchemaFileSearch) {
    const {
      searchTerm,
      workingDir,
      caseSensitive,
      onlyFiles,
      onlyDirectories,
      maxDepth,
      maxResults,
      includeExtensions
    }: SchemaFileSearch = args
    this.searchTerm = searchTerm
    this.workingDir = workingDir
    this.caseSensitive = caseSensitive ?? false
    this.onlyFiles = onlyFiles ?? true
    this.onlyDirectories = onlyDirectories ?? false
    this.maxDepth = maxDepth
    this.maxResults = maxResults ?? 10
    this.includeExtensions = includeExtensions ?? true
  }

  /**
   * Executes the fuzzy file search operation.
   * @description Performs validation, security checks, and executes the fuzzy search.
   * @returns Search results with matching file paths or error message
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
      const startTime: number = Date.now()
      const results: SearchResult[] = await this.performSearch(safeWorkingDir)
      const executionTime: number = Date.now() - startTime
      if (results.length === 0) {
        return `No files found matching "${this.searchTerm}" in ${executionTime}ms.`
      }
      const sortedResults: SearchResult[] = [...results]
        .sort((a: SearchResult, b: SearchResult) => b.score - a.score)
        .slice(0, this.maxResults)
      const resultPaths: string[] = sortedResults.map((result: SearchResult) => result.path)
      return `Found ${results.length} files matching "${this.searchTerm}" in ${executionTime}ms (showing top ${sortedResults.length}):\n\n${resultPaths.join('\n')}`
    } catch (error) {
      return `Error! File search failed: ${error instanceof Error ? error.message : 'Unknown error'}.`
    }
  }

  /**
   * Performs the actual fuzzy search using recursive directory traversal.
   * @description Recursively searches directories and applies fuzzy matching to filenames.
   * @param workingDir - The validated working directory
   * @param currentDepth - Current search depth
   * @returns Array of matching search results
   */
  private async performSearch(
    workingDir: string,
    currentDepth: number = 0
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = []
    try {
      const entries: string[] = await readdir(workingDir)
      for (const entry of entries) {
        const fullPath: string = join(workingDir, entry)
        const relativePath: string = relative(process.cwd(), fullPath)
        try {
          const stats: import('node:fs').Stats = await stat(fullPath)
          const isDirectory: boolean = stats.isDirectory()
          if (!isPathSafe(fullPath)) {
            continue
          }
          if (this.shouldIncludeEntry(entry, isDirectory)) {
            const score: number = this.calculateRelevanceScore(entry, isDirectory)
            if (score > 0) {
              results.push({
                path: relativePath,
                name: entry,
                extension: extname(entry),
                score,
                isDirectory
              })
            }
          }
          if (isDirectory && this.shouldContinueSearching(currentDepth)) {
            const subResults: SearchResult[] = await this.performSearch(fullPath, currentDepth + 1)
            results.push(...subResults)
          }
        } catch {
          continue
        }
      }
    } catch {
      // Skip directories that can't be accessed
    }
    return results
  }

  /**
   * Determines if an entry should be included based on search criteria.
   * @description Checks if the entry matches the file/directory requirements.
   * @param entry - The directory entry name
   * @param isDirectory - Whether the entry is a directory
   * @returns True if the entry should be included
   */
  private shouldIncludeEntry(_entry: string, isDirectory: boolean): boolean {
    if (this.onlyFiles && isDirectory) {
      return false
    }
    if (this.onlyDirectories && !isDirectory) {
      return false
    }
    return true
  }

  /**
   * Determines if the search should continue to deeper levels.
   * @description Checks if the current depth is within the maximum depth limit.
   * @param currentDepth - The current search depth
   * @returns True if the search should continue
   */
  private shouldContinueSearching(currentDepth: number): boolean {
    return this.maxDepth === undefined || currentDepth < this.maxDepth
  }

  /**
   * Calculates the relevance score for a filename match.
   * @description Applies fuzzy matching algorithm to determine how well a filename matches the search term.
   * @param filename - The filename to score
   * @param isDirectory - Whether this is a directory
   * @returns Relevance score (0 = no match, higher = better match)
   */
  private calculateRelevanceScore(filename: string, isDirectory: boolean): number {
    const searchTerm: string = this.caseSensitive ? this.searchTerm : this.searchTerm.toLowerCase()
    const filenameToSearch: string = this.caseSensitive ? filename : filename.toLowerCase()
    if (filenameToSearch === searchTerm) {
      return 1000
    }
    let score: number = this.calculateBaseScore(filenameToSearch, searchTerm)
    if (score === 0) {
      const extensionScore: number = this.calculateExtensionScore(filename, searchTerm)
      if (extensionScore === 0) {
        return 0
      }
      score = extensionScore
    } else {
      score += this.calculateExtensionScore(filename, searchTerm)
    }
    score += this.calculateTypeBonus(isDirectory)
    score += this.calculateLengthPenalty(filename)
    score += this.calculateWordBoundaryBonus(filename, searchTerm)
    return score
  }

  /**
   * Calculates the base score for filename matching.
   * @description Applies basic string matching algorithms to determine filename relevance.
   * @param filenameToSearch - The normalized filename to search
   * @param searchTerm - The normalized search term
   * @returns Base relevance score
   */
  private calculateBaseScore(filenameToSearch: string, searchTerm: string): number {
    let score: number = 0
    if (filenameToSearch.startsWith(searchTerm)) {
      score += 500
    }
    if (filenameToSearch.endsWith(searchTerm)) {
      score += 400
    }
    if (filenameToSearch.includes(searchTerm)) {
      score += 300
    }
    return score
  }

  /**
   * Calculates extension-specific scoring.
   * @description Evaluates file extension matches for enhanced relevance scoring.
   * @param filename - The original filename
   * @param searchTerm - The search term
   * @returns Extension relevance score
   */
  private calculateExtensionScore(filename: string, searchTerm: string): number {
    if (!searchTerm.includes('.')) {
      return 0
    }
    const extension: string = extname(filename)
    const extensionToSearch: string = this.caseSensitive ? extension : extension.toLowerCase()
    if (extensionToSearch === searchTerm) {
      return 600
    }
    if (extensionToSearch.includes(searchTerm)) {
      return 200
    }
    return 0
  }

  /**
   * Calculates type-specific bonus.
   * @description Applies bonus points based on file/directory type preferences.
   * @param isDirectory - Whether this is a directory
   * @returns Type bonus score
   */
  private calculateTypeBonus(isDirectory: boolean): number {
    if (this.onlyFiles && !isDirectory) {
      return 50
    }
    if (this.onlyDirectories && isDirectory) {
      return 50
    }
    return 0
  }

  /**
   * Calculates length penalty.
   * @description Applies penalty for excessively long filenames.
   * @param filename - The filename
   * @returns Length penalty score
   */
  private calculateLengthPenalty(filename: string): number {
    return filename.length > 50 ? -10 : 0
  }

  /**
   * Calculates word boundary bonus.
   * @description Applies bonus points for matches that occur at word boundaries.
   * @param filename - The filename
   * @param searchTerm - The search term
   * @returns Word boundary bonus score
   */
  private calculateWordBoundaryBonus(filename: string, searchTerm: string): number {
    const filenameToSearch: string = this.caseSensitive ? filename : filename.toLowerCase()
    const searchTermToSearch: string = this.caseSensitive ? searchTerm : searchTerm.toLowerCase()
    const wordBoundaryPattern: string = ` ${searchTermToSearch} `
    const startPattern: string = `${searchTermToSearch} `
    const endPattern: string = ` ${searchTermToSearch}`
    if (
      filenameToSearch.includes(wordBoundaryPattern) ||
      filenameToSearch.startsWith(startPattern) ||
      filenameToSearch.endsWith(endPattern)
    ) {
      return 100
    }
    return 0
  }

  /**
   * Validates the file search parameters.
   * @description Checks that all parameters are valid.
   * @returns 'ok' if validation passes, error message if validation fails
   */
  private validate(): string {
    const searchTermValidation: string = this.validateSearchTerm()
    if (searchTermValidation !== 'ok') {
      return searchTermValidation
    }
    const workingDirValidation: string = this.validateWorkingDir()
    if (workingDirValidation !== 'ok') {
      return workingDirValidation
    }
    const booleanValidation: string = this.validateBooleanOptions()
    if (booleanValidation !== 'ok') {
      return booleanValidation
    }
    const maxDepthValidation: string = this.validateMaxDepth()
    if (maxDepthValidation !== 'ok') {
      return maxDepthValidation
    }
    const maxResultsValidation: string = this.validateMaxResults()
    if (maxResultsValidation !== 'ok') {
      return maxResultsValidation
    }
    const conflictValidation: string = this.validateOptionConflicts()
    if (conflictValidation !== 'ok') {
      return conflictValidation
    }
    return 'ok'
  }

  /**
   * Validates the search term parameter.
   * @description Checks that searchTerm is a valid non-empty string within length limits.
   * @returns 'ok' if validation passes, error message if validation fails
   */
  private validateSearchTerm(): string {
    if (typeof this.searchTerm !== 'string') {
      return '`searchTerm` must be a string.'
    }
    if (this.searchTerm.trim().length === 0) {
      return '`searchTerm` cannot be empty.'
    }
    if (this.searchTerm.length > 100) {
      return '`searchTerm` cannot be longer than 100 characters.'
    }
    return 'ok'
  }

  /**
   * Validates the working directory parameter.
   * @description Checks that workingDir is a valid string when provided.
   * @returns 'ok' if validation passes, error message if validation fails
   */
  private validateWorkingDir(): string {
    if (this.workingDir !== undefined && typeof this.workingDir !== 'string') {
      return '`workingDir` must be a string.'
    }
    if (this.workingDir !== undefined && this.workingDir.trim().length === 0) {
      return '`workingDir` cannot be empty.'
    }
    return 'ok'
  }

  /**
   * Validates boolean options.
   * @description Checks that all boolean parameters are valid boolean values.
   * @returns 'ok' if validation passes, error message if validation fails
   */
  private validateBooleanOptions(): string {
    if (typeof this.caseSensitive !== 'boolean') {
      return '`caseSensitive` must be a boolean.'
    }
    if (typeof this.onlyFiles !== 'boolean') {
      return '`onlyFiles` must be a boolean.'
    }
    if (typeof this.onlyDirectories !== 'boolean') {
      return '`onlyDirectories` must be a boolean.'
    }
    if (typeof this.includeExtensions !== 'boolean') {
      return '`includeExtensions` must be a boolean.'
    }
    return 'ok'
  }

  /**
   * Validates the max depth parameter.
   * @description Checks that maxDepth is a valid number within the allowed range.
   * @returns 'ok' if validation passes, error message if validation fails
   */
  private validateMaxDepth(): string {
    if (this.maxDepth !== undefined && typeof this.maxDepth !== 'number') {
      return '`maxDepth` must be a number.'
    }
    if (this.maxDepth !== undefined && (this.maxDepth < 0 || this.maxDepth > 20)) {
      return '`maxDepth` must be between 0 and 20.'
    }
    return 'ok'
  }

  /**
   * Validates the max results parameter.
   * @description Checks that maxResults is a valid number within the allowed range.
   * @returns 'ok' if validation passes, error message if validation fails
   */
  private validateMaxResults(): string {
    if (typeof this.maxResults !== 'number') {
      return '`maxResults` must be a number.'
    }
    if (this.maxResults < 1 || this.maxResults > 20) {
      return '`maxResults` must be between 1 and 20.'
    }
    return 'ok'
  }

  /**
   * Validates option conflicts.
   * @description Checks for conflicting boolean options that cannot be true simultaneously.
   * @returns 'ok' if validation passes, error message if validation fails
   */
  private validateOptionConflicts(): string {
    if (this.onlyFiles && this.onlyDirectories) {
      return 'Cannot set both `onlyFiles` and `onlyDirectories` to true.'
    }
    return 'ok'
  }
}
