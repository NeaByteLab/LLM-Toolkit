/**
 * Tool schema for file move operations.
 * @description Defines the schema for moving files from one location to another.
 */
export default {
  type: 'function',
  function: {
    name: 'FileMove',
    description:
      'Use this tool to move a file from one location to another. This tool can move files between directories and rename them during the move operation.\n\nFILE MOVE OPERATIONS:\n- Moves files from one path to another\n- Can move files between different directories\n- Can rename files during the move operation\n- Preserves file content and permissions\n- Creates target directory if it doesn\'t exist',
    parameters: {
      type: 'object',
      properties: {
        oldPath: {
          type: 'string',
          description:
            'The current path of the file to move. Can be a relative or absolute path (e.g., "src/oldfile.ts" or "/path/to/oldfile.ts").'
        },
        newPath: {
          type: 'string',
          description:
            'The new path where the file should be moved to. Can be a relative or absolute path (e.g., "dist/newfile.ts" or "/path/to/newfile.ts").'
        }
      },
      required: ['oldPath', 'newPath']
    }
  }
}
