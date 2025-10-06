/**
 * Tool schema for directory deletion operations.
 * @description Defines the schema for deleting directories from the filesystem.
 */
export default {
  type: 'function',
  function: {
    name: 'DirectoryDelete',
    description:
      'Delete directories from the filesystem. Permanently removes directories and all their contents. Supports recursive deletion of non-empty directories. Fails if directory does not exist or insufficient permissions.',
    parameters: {
      type: 'object',
      properties: {
        directoryPath: {
          type: 'string',
          description:
            'The directory path to delete. Use absolute paths for clarity, relative paths are also supported.'
        },
        recursive: {
          type: 'boolean',
          description:
            'Whether to delete the directory and all its contents recursively. Required for non-empty directories. Default: false.'
        }
      },
      required: ['directoryPath']
    }
  }
}
