/**
 * Tool schema for directory listing operations.
 * @description Defines the schema for listing directory contents.
 */
export default {
  type: 'function',
  function: {
    name: 'DirectoryList',
    description:
      'Use this tool to list the contents of a directory. This is useful for exploring the file structure and understanding the codebase organization before diving deeper into specific files.\n\nIMPORTANT: This tool lists directory contents only. Use relative paths from the project root.\n\nFor directory exploration:\n- Use relative paths like "src" or "examples"\n- Lists files and subdirectories in the specified directory\n- Helps understand project structure before using other tools\n\nThis tool will return a list of files and directories in the specified path.',
    parameters: {
      type: 'object',
      properties: {
        directoryPath: {
          type: 'string',
          description:
            'The relative path to the directory to list from the project root. Use relative paths like "src", "examples", or "src/core". Do not use absolute paths.'
        }
      },
      required: ['directoryPath']
    }
  }
}
