/**
 * Tool schema for file reading operations.
 * @description Defines the schema for reading file contents.
 */
export default {
  type: 'function',
  function: {
    name: 'FileRead',
    description:
      'Use this tool to read the contents of a file. This is useful for examining existing code, configuration files, or any text-based files before making modifications.',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description:
            'The relative path to the file to read from the project root. Use relative paths like "examples/Calculator.ts" or "src/index.ts". Do not use absolute paths.'
        }
      },
      required: ['filePath']
    }
  }
}
