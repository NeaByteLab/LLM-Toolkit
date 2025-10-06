/**
 * Tool schema for content search operations using Ripgrep.
 * @description Defines the schema for searching file contents using Ripgrep for text search.
 */
export default {
  type: 'function',
  function: {
    name: 'GrepSearch',
    description:
      'Search for text content within files using Ripgrep. Provides fast text search with regex support, file filtering, and context lines. Fails if working directory does not exist or insufficient permissions.',
    parameters: {
      type: 'object',
      properties: {
        pattern: {
          type: 'string',
          description:
            'The search pattern to find. Can be a simple string or regex pattern. Use double backslashes for regex escapes (e.g., "console\\.log" for "console.log"). Examples: "function calculateTotal", "import.*react", "TODO|FIXME".'
        },
        workingDir: {
          type: 'string',
          description:
            'The working directory to search from. If not specified, uses the project root directory. Use absolute paths for clarity, relative paths are also supported.'
        },
        fileTypes: {
          type: 'array',
          items: {
            type: 'string',
            description: 'File extension or type to search in'
          },
          description:
            'Array of file types to search in. Examples: ["ts", "js", "tsx", "jsx"] for TypeScript/JavaScript files, ["md", "txt"] for documentation files. If not specified, searches all file types.'
        },
        excludeTypes: {
          type: 'array',
          items: {
            type: 'string',
            description: 'File extension or type to exclude from search'
          },
          description:
            'Array of file types to exclude from search. Examples: ["log", "tmp"] to exclude log and temporary files, ["min.js", "bundle.js"] to exclude minified files.'
        },
        caseSensitive: {
          type: 'boolean',
          description:
            'Whether the search should be case-sensitive. Defaults to false for better usability.'
        },
        wholeWord: {
          type: 'boolean',
          description:
            'Whether to match only whole words. When true, "test" will not match "testing" or "contest". Defaults to false.'
        },
        regex: {
          type: 'boolean',
          description:
            'Whether to treat the pattern as a regular expression. When true, supports extended regex features. Defaults to false for simple string matching.'
        },
        contextLines: {
          type: 'number',
          description:
            'Number of context lines to show before and after each match. Defaults to 2. Use 0 for no context.'
        },
        maxResults: {
          type: 'number',
          description:
            'Maximum number of results to return. Defaults to 50. Use smaller numbers for quicker searches on large codebases.'
        },
        maxDepth: {
          type: 'number',
          description:
            'Maximum depth to search. 0 means only the current directory, 1 means one level deep, etc. If not specified, searches all levels.'
        },
        excludePatterns: {
          type: 'array',
          items: {
            type: 'string',
            description: 'Pattern to exclude from search'
          },
          description:
            'Array of patterns to exclude from search. Examples: ["node_modules", ".git", "dist"] to exclude common directories, ["*.min.js", "*.bundle.js"] to exclude minified files.'
        }
      },
      required: ['pattern']
    }
  }
}
