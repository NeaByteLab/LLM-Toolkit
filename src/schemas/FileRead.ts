/**
 * Tool schema for file reading operations.
 * @description Defines the schema for reading file contents with optional line range support.
 */
export default {
  type: 'function',
  function: {
    name: 'FileRead',
    description:
      'Use this tool to read the contents of a file. This is useful for examining existing code, configuration files, or any text-based files before making modifications.\n\nPATH RECOMMENDATIONS:\n- RECOMMENDED: Use absolute paths for clarity and precision (e.g., "/full/path/to/file.ts")\n- ACCEPTED: Relative paths are also supported (e.g., "src/index.ts")\n\nLINE RANGE SUPPORT:\n- Read entire file: Omit lineStart and lineEnd parameters\n- Read specific lines: Use lineStart and lineEnd to read a range\n- Read from line to end: Use lineStart only (reads to end of file)\n- Read single line: Use same value for lineStart and lineEnd\n\nThis tool will return the file content as a string, with line numbers if a range is specified.',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description:
            'The path to the file to read. RECOMMENDED: Use absolute paths for clarity (e.g., "/full/path/to/file.ts"). ACCEPTED: Relative paths are also supported (e.g., "examples/Calculator.ts" or "src/index.ts").'
        },
        lineStart: {
          type: 'number',
          description:
            'The starting line number (1-based) to begin reading from. If not specified, reads from the beginning of the file. Must be a positive integer.',
          minimum: 1
        },
        lineEnd: {
          type: 'number',
          description:
            'The ending line number (1-based) to stop reading at. If not specified, reads to the end of the file. Must be greater than or equal to lineStart.',
          minimum: 1
        }
      },
      required: ['filePath']
    }
  }
}
