/**
 * Tool schema for file deletion operations.
 * @description Defines the schema for deleting files from the filesystem.
 */
export default {
  type: 'function',
  function: {
    name: 'FileDelete',
    description:
      'Delete files from the filesystem. Permanently removes files and cannot be undone. Fails if file does not exist or insufficient permissions.',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description:
            'The file path to delete. Use absolute paths for clarity, relative paths are also supported.'
        }
      },
      required: ['filePath']
    }
  }
}
