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
