/**
 * Interface for file size validation result.
 * @description Represents the result of file size and existence validation.
 */
export interface SecurityFileSize {
  /** Whether the file path is valid */
  valid: boolean
  /** Whether the file exists at the specified path */
  exists: boolean
}
