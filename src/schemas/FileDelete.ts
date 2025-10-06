/**
 * Tool schema for file deletion operations.
 * @description Defines the schema for deleting files from the filesystem.
 */
export default {
  type: 'function',
  function: {
    name: 'FileDelete',
    description:
      'Use this tool to delete a file from the filesystem. This operation permanently removes the file and cannot be undone.\n\nIMPORTANT: This tool deletes files permanently. Use with extreme caution as deleted files cannot be recovered.',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description:
            'The path to the file to delete. RECOMMENDED: Use absolute paths for clarity (e.g., "/full/path/to/file.ts"). ACCEPTED: Relative paths are also supported (e.g., "src/file.ts" or "examples/test.txt").'
        }
      },
      required: ['filePath']
    }
  }
}
