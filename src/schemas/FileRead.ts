/**
 * Tool schema for file reading operations.
 * @description Defines the schema for reading file contents with optional line range support.
 */
export default {
  type: 'function',
  function: {
    name: 'FileRead',
    description:
      'Read file contents. Supports reading entire files or specific line ranges. Fails if file does not exist or insufficient permissions.',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description:
            'The file path to read. Use absolute paths for clarity, relative paths are also supported.'
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
