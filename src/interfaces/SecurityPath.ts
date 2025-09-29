/**
 * Interface for successful path validation result.
 * @description Represents a validated and secured path.
 */
export interface SecurityPathSuccess {
  /** Indicates the path validation was successful */
  success: true
  /** The validated path */
  path: string
}

/**
 * Interface for failed path validation result.
 * @description Represents a path validation failure with specific error message.
 */
export interface SecurityPathError {
  /** Indicates the path validation failed */
  success: false
  /** Specific error message explaining why the path was rejected */
  message: string
}

/**
 * Union type for path validation results.
 * @description Represents the possible outcomes of path validation.
 */
export type SecurityPathResult = SecurityPathSuccess | SecurityPathError
