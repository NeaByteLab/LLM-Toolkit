/**
 * Tool schema for fuzzy filename search operations.
 * @description Defines the schema for searching files using fuzzy filename matching.
 */
export default {
  type: 'function',
  function: {
    name: 'FileSearch',
    description:
      'Use this tool to search for files using fuzzy filename matching. Finds files by partial name, extension, or pattern with relevance scoring when you know part of a filename but not the exact path.',
    parameters: {
      type: 'object',
      properties: {
        caseSensitive: {
          type: 'boolean',
          description:
            'Whether the search should be case-sensitive. Defaults to false for better fuzzy matching.'
        },
        includeExtensions: {
          type: 'boolean',
          description:
            'Whether to include file extensions in the search. When true, ".ts" will match "file.ts". Defaults to true.'
        },
        maxDepth: {
          type: 'number',
          description:
            'Maximum depth to search. 0 means only the current directory, 1 means one level deep, etc. If not specified, searches all levels.'
        },
        maxResults: {
          type: 'number',
          description:
            'Maximum number of results to return. Defaults to 10. Use smaller numbers for quicker searches.'
        },
        onlyDirectories: {
          type: 'boolean',
          description:
            'Whether to return only directories (true) or include files (false). Defaults to false.'
        },
        onlyFiles: {
          type: 'boolean',
          description:
            'Whether to return only files (true) or include directories (false). Defaults to false.'
        },
        searchTerm: {
          type: 'string',
          description:
            'The partial filename or pattern to search for. Can be a partial name, extension, or any part of the filename. Examples: "config", ".env", "test", "component".'
        },
        workingDir: {
          type: 'string',
          description:
            'The working directory to search from. If not specified, uses the project root directory. Must be within the project directory.'
        }
      },
      required: ['searchTerm']
    }
  }
}
