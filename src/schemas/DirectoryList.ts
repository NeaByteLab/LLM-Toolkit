/**
 * Tool schema for directory listing operations.
 * @description Defines the schema for listing directory contents.
 */
export default {
  type: 'function',
  function: {
    name: 'DirectoryList',
    description:
      'List directory contents with file type indicators. Shows files and subdirectories with size, line count, and item counts. Fails if directory does not exist or insufficient permissions.',
    parameters: {
      type: 'object',
      properties: {
        directoryPath: {
          type: 'string',
          description:
            'The directory path to list. Use absolute paths for clarity, relative paths are also supported.'
        }
      },
      required: ['directoryPath']
    }
  }
}
