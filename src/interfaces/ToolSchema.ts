/**
 * Schema for directory listing operations.
 * @description Defines the structure for directory listing tool parameters.
 */
export interface SchemaDirectoryList {
  /** The directory path to list */
  directoryPath: string
}

/**
 * Schema for file creation operations.
 * @description Defines the structure for file creation tool parameters.
 */
export interface SchemaFileCreate {
  /** The file path where the new file will be created */
  filePath: string
  /** The content to write to the new file */
  content: string
  /** Instructions describing the file creation operation */
  instructions: string
}

/**
 * Schema for file deletion operations.
 * @description Defines the structure for file deletion tool parameters.
 */
export interface SchemaFileDelete {
  /** The file path to delete */
  filePath: string
}

/**
 * Schema for file edit operations.
 * @description Defines the structure for file editing tool parameters.
 */
export interface SchemaFileEdit {
  /** The file path where the edit will be applied */
  filePath: string
  /** The text to be replaced in the file */
  oldString: string
  /** The new text to replace the old string */
  newString: string
}

/**
 * Schema for file read operations.
 * @description Defines the structure for file reading tool parameters.
 */
export interface SchemaFileRead {
  /** The file path to read */
  filePath: string
  /** The starting line number (1-based) to begin reading from */
  lineStart?: number | undefined
  /** The ending line number (1-based) to stop reading at */
  lineEnd?: number | undefined
}

/**
 * Schema for fuzzy filename search operations.
 * @description Defines the structure for fuzzy filename search tool parameters.
 */
export interface SchemaFileSearch {
  /** Whether the search should be case-sensitive */
  caseSensitive?: boolean
  /** Whether to include file extensions in the search */
  includeExtensions?: boolean
  /** Maximum depth to search (0-20) */
  maxDepth?: number
  /** Maximum number of results to return (1-100) */
  maxResults?: number
  /** Whether to search only directories (true) or include files (false) */
  onlyDirectories?: boolean
  /** Whether to search only files (true) or include directories (false) */
  onlyFiles?: boolean
  /** The partial filename or pattern to search for */
  searchTerm: string
  /** The working directory to search from */
  workingDir?: string
}

/**
 * Schema for glob pattern file search operations.
 * @description Defines the structure for glob pattern file search tool parameters.
 */
export interface SchemaGlobSearch {
  /** Array of glob patterns to search for */
  patterns: string[]
  /** The working directory to search from */
  workingDir?: string
  /** Whether pattern matching should be case-sensitive */
  caseSensitive?: boolean
  /** Whether to return only files */
  onlyFiles?: boolean
  /** Whether to return only directories */
  onlyDirectories?: boolean
  /** Maximum depth to search (0-20) */
  maxDepth?: number
}

/**
 * Schema for content search operations using Ripgrep.
 * @description Defines the structure for content search tool parameters.
 */
export interface SchemaGrepSearch {
  /** The search pattern to find (string or regex) */
  pattern: string
  /** The working directory to search from */
  workingDir?: string
  /** Array of file types to search in */
  fileTypes?: string[]
  /** Array of file types to exclude from search */
  excludeTypes?: string[]
  /** Whether the search should be case-sensitive */
  caseSensitive?: boolean
  /** Whether to match only whole words */
  wholeWord?: boolean
  /** Whether to treat the pattern as a regular expression */
  regex?: boolean
  /** Number of context lines to show before and after each match (0-10) */
  contextLines?: number
  /** Maximum number of results to return (1-200) */
  maxResults?: number
  /** Maximum depth to search (0-20) */
  maxDepth?: number
  /** Array of patterns to exclude from search */
  excludePatterns?: string[]
}

/**
 * Schema for file rename operations.
 * @description Defines the structure for file rename tool parameters.
 */
export interface SchemaFileRename {
  /** The current filename to rename */
  oldFilename: string
  /** The new filename to rename to */
  newFilename: string
}

/**
 * Schema for terminal command execution operations.
 * @description Defines the structure for terminal command execution tool parameters.
 */
export interface SchemaTerminalCmd {
  /** The terminal command to execute */
  command: string
  /** The working directory for command execution */
  workingDir?: string
  /** Timeout for command execution in milliseconds (30000-300000) */
  timeout?: number
}

/**
 * Schema for web fetching operations.
 * @description Defines the structure for web fetching tool parameters.
 */
export interface SchemaWebFetch {
  /** The URL to fetch */
  url: string
}
