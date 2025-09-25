/**
 * Tool schema for file reading operations.
 * @description Defines the schema for reading file contents.
 */
export default {
  type: 'function',
  function: {
    name: 'FileRead',
    description:
      'Use this tool to read the contents of a file. This is useful for examining existing code, configuration files, or any text-based files before making modifications.\n\nPATH RECOMMENDATIONS:\n- RECOMMENDED: Use absolute paths for clarity and precision (e.g., "/full/path/to/file.ts")\n- ACCEPTED: Relative paths are also supported (e.g., "src/index.ts")\n\nThis tool will return the complete file content as a string.',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description:
            'The path to the file to read. RECOMMENDED: Use absolute paths for clarity (e.g., "/full/path/to/file.ts"). ACCEPTED: Relative paths are also supported (e.g., "examples/Calculator.ts" or "src/index.ts").'
        }
      },
      required: ['filePath']
    }
  }
}
