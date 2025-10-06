/**
 * Tool schema for directory creation operations.
 * @description Defines the schema for creating new directories.
 */
export default {
  type: 'function',
  function: {
    name: 'DirectoryCreate',
    description:
      'Use this tool to create directories at the specified path. Creates single directories or nested structures with recursive mode. Will fail if directory already exists.',
    parameters: {
      type: 'object',
      properties: {
        directoryPath: {
          type: 'string',
          description:
            'The path where the new directory should be created. RECOMMENDED: Use absolute paths for clarity (e.g., "/full/path/to/newdir"). ACCEPTED: Relative paths are also supported (e.g., "src/components" or "examples/new-feature").'
        },
        recursive: {
          type: 'boolean',
          description:
            'Whether to create parent directories if they don\'t exist. Set to true to create nested directory structures (e.g., "src/components/Button" will create both "src/components" and "src/components/Button" if they don\'t exist). Default: false.'
        }
      },
      required: ['directoryPath']
    }
  }
}
