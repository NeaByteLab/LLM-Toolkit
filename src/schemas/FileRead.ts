/**
 * Tool schema for file reading operations.
 * @description Defines the schema for reading file contents with optional line range support.
 */
export default {
  type: 'function',
  function: {
    name: 'FileRead',
    description:
      'Use this tool to read file contents. Supports reading entire files or specific line ranges. Useful for examining code, config files, or any text-based files before making modifications.',
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
            'The starting line number (1-based) to begin reading from. If not specified, reads from the beginning of the file. Must be a positive integer.'
        },
        lineEnd: {
          type: 'number',
          description:
            'The ending line number (1-based) to stop reading at. If not specified, reads to the end of the file. Must be greater than or equal to lineStart.'
        }
      },
      required: ['filePath']
    }
  }
}
