/**
 * Schema for code edit operations.
 * @description Defines the structure for code editing tool parameters.
 */
export interface SchemaCodeEdit {
  /** The file path where the edit will be applied */
  filePath: string
  /** The text to be replaced in the file */
  oldString: string
  /** The new text to replace the old string */
  newString: string
}

/**
 * Schema for file edit operations.
 * @description Defines the structure for file editing tool parameters.
 */
export interface SchemaFileEdit {
  /** The file path where the edit will be applied */
  filePath: string
  /** The new content to replace the file content */
  content: string
  /** Instructions describing the edit operation */
  instructions: string
}
