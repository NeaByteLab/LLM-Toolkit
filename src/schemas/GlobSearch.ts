/**
 * Tool schema for glob pattern file search operations.
 * @description Defines the schema for searching files using glob patterns with fast-glob.
 */
export default {
  type: 'function',
  function: {
    name: 'GlobSearch',
    description:
      'Use this tool to search for files using glob patterns. This tool uses fast-glob for file matching with support for complex patterns, exclusions, and various options.\n\nGLOB PATTERNS:\n- `**` - Matches any number of directories\n- `*` - Matches any characters except path separators\n- `?` - Matches a single character\n- `!` - Excludes files matching the pattern\n- `{a,b}` - Matches a or b\n- `[abc]` - Matches any character in brackets\n\nCOMMON PATTERNS:\n- `src/**/*.ts` - All TypeScript files in src directory\n- `**/*.{js,ts}` - All JavaScript and TypeScript files\n- `!**/*.test.*` - Exclude all test files\n- `!node_modules/**` - Exclude node_modules directory\n\nSECURITY CONSIDERATIONS:\n- Only searches within the project directory\n- Dangerous patterns are automatically blocked\n- Path traversal attempts are prevented\n- System directories are restricted\n\nThis tool will return an array of matching file paths relative to the working directory.',
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
            'The working directory to search from. If not specified, uses the project root directory. Must be within the project directory.',
          examples: ['src', 'src/components', 'tests']
        },
        caseSensitive: {
          type: 'boolean',
          description:
            'Whether the pattern matching should be case-sensitive. Defaults to false for cross-platform compatibility.',
          default: false
        },
        onlyFiles: {
          type: 'boolean',
          description:
            'Whether to return only files (true) or include directories (false). Defaults to true.',
          default: true
        },
        onlyDirectories: {
          type: 'boolean',
          description:
            'Whether to return only directories (true) or include files (false). Defaults to false.',
          default: false
        },
        maxDepth: {
          type: 'number',
          description:
            'Maximum depth to search. 0 means only the current directory, 1 means one level deep, etc. If not specified, searches all levels.',
          minimum: 0,
          maximum: 20
        }
      },
      required: ['patterns']
    }
  }
}
