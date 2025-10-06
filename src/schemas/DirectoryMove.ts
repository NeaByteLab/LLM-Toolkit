/**
 * Tool schema for directory move operations.
 * @description Defines the schema for moving directories from one location to another.
 */
export default {
  type: 'function',
  function: {
    name: 'DirectoryMove',
    description:
      'Move directories from one location to another, can rename during move operation. Creates parent directories if needed. Fails if source does not exist, target already exists, or insufficient permissions.',
    parameters: {
      type: 'object',
      properties: {
        oldPath: {
          type: 'string',
          description:
            'The current path of the directory to move. Use absolute paths for clarity, relative paths are also supported.'
        },
        newPath: {
          type: 'string',
          description:
            'The new path where the directory should be moved to. Use absolute paths for clarity, relative paths are also supported.'
        }
      },
      required: ['oldPath', 'newPath']
    }
  }
}
