/**
 * Tool schema for directory creation operations.
 * @description Defines the schema for creating new directories.
 */
export default {
  type: 'function',
  function: {
    name: 'DirectoryCreate',
    description:
      'Create directories at the specified path, supports recursive creation of nested structures. Fails if directory already exists.',
    parameters: {
      type: 'object',
      properties: {
        directoryPath: {
          type: 'string',
          description:
            'The directory path to create. Use absolute paths for clarity, relative paths are also supported.'
        },
        recursive: {
          type: 'boolean',
          description: 'Whether to create parent directories if they do not exist. Default: false.'
        }
      },
      required: ['directoryPath']
    }
  }
}
