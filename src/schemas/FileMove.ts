/**
 * Tool schema for file move operations.
 * @description Defines the schema for moving files from one location to another.
 */
export default {
  type: 'function',
  function: {
    name: 'FileMove',
    description:
      'Move files from one location to another, can rename during move operation. Creates target directory if it does not exist. Fails if source does not exist, target already exists, or insufficient permissions.',
    parameters: {
      type: 'object',
      properties: {
        oldPath: {
          type: 'string',
          description:
            'The current path of the file to move. Use absolute paths for clarity, relative paths are also supported.'
        },
        newPath: {
          type: 'string',
          description:
            'The new path where the file should be moved to. Use absolute paths for clarity, relative paths are also supported.'
        }
      },
      required: ['oldPath', 'newPath']
    }
  }
}
