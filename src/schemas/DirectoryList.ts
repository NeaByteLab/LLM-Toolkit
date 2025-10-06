/**
 * Tool schema for directory listing operations.
 * @description Defines the schema for listing directory contents.
 */
export default {
  type: 'function',
  function: {
    name: 'DirectoryList',
    description:
      'Use this tool to list the contents of a directory. Lists files and subdirectories in the specified directory. Shows visual indicators: 📁 for directories, 📄 for files. Helps understand project structure before using other tools.',
    parameters: {
      type: 'object',
      properties: {
        directoryPath: {
          type: 'string',
          description:
            'The path to the directory to list. RECOMMENDED: Use absolute paths for clarity (e.g., "/full/path/to/directory"). ACCEPTED: Relative paths are also supported (e.g., "src", "examples", or "src/core").'
        }
      },
      required: ['directoryPath']
    }
  }
}
