/**
 * Tool schema for glob pattern file search operations.
 * @description Defines the schema for searching files using glob patterns with fast-glob.
 */
export default {
  type: 'function',
  function: {
    name: 'GlobSearch',
    description:
      'Search for files using glob patterns. Uses fast-glob for file matching with support for complex patterns, exclusions, and various options. Fails if working directory does not exist or insufficient permissions.',
    parameters: {
      type: 'object',
      properties: {
        patterns: {
          type: 'array',
          items: {
            type: 'string',
            description: 'A glob pattern string'
          },
          description:
            'Array of glob patterns to search for. Can include multiple patterns for complex searches. Use `!` prefix to exclude files.'
        },
        workingDir: {
          type: 'string',
          description:
            'The working directory to search from. If not specified, uses the project root directory. Use absolute paths for clarity, relative paths are also supported.'
        },
        caseSensitive: {
          type: 'boolean',
          description:
            'Whether the pattern matching should be case-sensitive. Defaults to false for cross-platform compatibility.'
        },
        onlyFiles: {
          type: 'boolean',
          description:
            'Whether to return only files (true) or include directories (false). Defaults to true.'
        },
        onlyDirectories: {
          type: 'boolean',
          description:
            'Whether to return only directories (true) or include files (false). Defaults to false.'
        },
        maxDepth: {
          type: 'number',
          description:
            'Maximum depth to search. 0 means only the current directory, 1 means one level deep, etc. If not specified, searches all levels.'
        }
      },
      required: ['patterns']
    }
  }
}
