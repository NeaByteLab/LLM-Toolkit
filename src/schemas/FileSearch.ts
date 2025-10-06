/**
 * Tool schema for fuzzy filename search operations.
 * @description Defines the schema for searching files using fuzzy filename matching.
 */
export default {
  type: 'function',
  function: {
    name: 'FileSearch',
    description:
      'Use this tool to search for files using fuzzy filename matching. This tool finds files by partial name, extension, or pattern matching when you know PART of a filename but not the exact path.\n\nWHEN TO USE:\n- You know part of a filename but not the exact path\n- You want to find files by partial name or extension\n- You need fuzzy matching for typos or variations\n- You want to search for files without knowing the exact directory structure\n\nWHEN NOT TO USE:\n- Use GlobSearch instead if you know the exact pattern\n- Use DirectoryList if you want to explore a specific directory\n- Use FileRead if you already know the exact file path\n\nSEARCH EXAMPLES:\n- "config" - finds config.json, config.ts, my-config.js, etc.\n- ".env" - finds .env, .env.local, .env.production, etc.\n- "test" - finds test.ts, user.test.js, integration-tests/, etc.\n- "component" - finds Component.tsx, user-component.vue, etc.\n\nFUZZY MATCHING:\n- Supports partial matches and typos\n- Case-insensitive by default (configurable)\n- Matches anywhere in the filename\n- Includes file extensions in search.',
    parameters: {
      type: 'object',
      properties: {
        caseSensitive: {
          type: 'boolean',
          description:
            'Whether the search should be case-sensitive. Defaults to false for better fuzzy matching.',
          default: false
        },
        includeExtensions: {
          type: 'boolean',
          description:
            'Whether to include file extensions in the search. When true, ".ts" will match "file.ts". Defaults to true.',
          default: true
        },
        maxDepth: {
          type: 'number',
          description:
            'Maximum depth to search. 0 means only the current directory, 1 means one level deep, etc. If not specified, searches all levels.',
          minimum: 0,
          maximum: 20
        },
        maxResults: {
          type: 'number',
          description:
            'Maximum number of results to return. Defaults to 10. Use smaller numbers for quicker searches.',
          minimum: 1,
          maximum: 20,
          default: 10
        },
        onlyDirectories: {
          type: 'boolean',
          description:
            'Whether to return only directories (true) or include files (false). Defaults to false.',
          default: false
        },
        onlyFiles: {
          type: 'boolean',
          description:
            'Whether to return only files (true) or include directories (false). Defaults to false.',
          default: false
        },
        searchTerm: {
          type: 'string',
          description:
            'The partial filename or pattern to search for. Can be a partial name, extension, or any part of the filename. Examples: "config", ".env", "test", "component".'
        },
        workingDir: {
          type: 'string',
          description:
            'The working directory to search from. If not specified, uses the project root directory. Must be within the project directory.',
          examples: ['src', 'src/components', 'tests']
        }
      },
      required: ['searchTerm']
    }
  }
}
