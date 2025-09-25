/**
 * Tool schema for directory listing operations.
 * @description Defines the schema for listing directory contents.
 */
export default {
  type: 'function',
  function: {
    name: 'DirectoryList',
    description:
      'Use this tool to list the contents of a directory. This is useful for exploring the file structure and understanding the codebase organization before diving deeper into specific files.\n\nPATH RECOMMENDATIONS:\n- RECOMMENDED: Use absolute paths for clarity and precision (e.g., "/full/path/to/directory")\n- ACCEPTED: Relative paths are also supported (e.g., "src" or "examples")\n\nFor directory exploration:\n- Lists files and subdirectories in the specified directory\n- Shows visual indicators: 📁 for directories, 📄 for files\n- Helps understand project structure before using other tools\n\nThis tool will return a formatted list of files and directories in the specified path.',
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
