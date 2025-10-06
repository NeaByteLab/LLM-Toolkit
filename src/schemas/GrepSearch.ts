/**
 * Tool schema for content search operations using Ripgrep.
 * @description Defines the schema for searching file contents using Ripgrep for text search.
 */
export default {
  type: 'function',
  function: {
    name: 'GrepSearch',
    description:
      'Use this tool to search for text content within files using Ripgrep. This tool provides text search with regex support, file filtering, and extended search options.\n\nWHEN TO USE:\n- You need to find specific text content within files\n- You want to search for code patterns, functions, or variables\n- You need regex pattern matching for complex searches\n- You want to search across multiple file types simultaneously\n- You need search performance on large codebases\n\nWHEN NOT TO USE:\n- Use FileSearch if you only know part of a filename\n- Use GlobSearch if you want to find files by pattern\n- Use DirectoryList if you want to explore directory structure\n\nSEARCH EXAMPLES:\n- "function calculateTotal" - Find function definitions\n- "import.*react" - Find React imports using regex\n- "TODO|FIXME" - Find TODO or FIXME comments\n- "console\\.log" - Find console.log statements (escaped regex)\n- "class.*Component" - Find class definitions containing "Component"\n\nRIPGREP FEATURES:\n- Text search using Ripgrep\n- Full regex support with PCRE2 syntax\n- Case handling and Unicode support\n- File type filtering and exclusion patterns\n- Context lines before/after matches\n- Line number and column information.',
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
            'The working directory to search from. If not specified, uses the project root directory. Must be within the project directory.',
          examples: ['src', 'src/components', 'tests', 'docs']
        },
        fileTypes: {
          type: 'array',
          items: {
            type: 'string',
            description: 'File extension or type to search in'
          },
          description:
            'Array of file types to search in. Examples: ["ts", "js", "tsx", "jsx"] for TypeScript/JavaScript files, ["md", "txt"] for documentation files. If not specified, searches all file types.',
          examples: [
            ['ts', 'js'],
            ['md', 'txt'],
            ['json', 'yaml', 'yml']
          ]
        },
        excludeTypes: {
          type: 'array',
          items: {
            type: 'string',
            description: 'File extension or type to exclude from search'
          },
          description:
            'Array of file types to exclude from search. Examples: ["log", "tmp"] to exclude log and temporary files, ["min.js", "bundle.js"] to exclude minified files.',
          examples: [['log', 'tmp'], ['min.js', 'bundle.js'], ['node_modules']]
        },
        caseSensitive: {
          type: 'boolean',
          description:
            'Whether the search should be case-sensitive. Defaults to false for better usability.',
          default: false
        },
        wholeWord: {
          type: 'boolean',
          description:
            'Whether to match only whole words. When true, "test" will not match "testing" or "contest". Defaults to false.',
          default: false
        },
        regex: {
          type: 'boolean',
          description:
            'Whether to treat the pattern as a regular expression. When true, supports extended regex features. Defaults to false for simple string matching.',
          default: false
        },
        contextLines: {
          type: 'number',
          description:
            'Number of context lines to show before and after each match. Defaults to 2. Use 0 for no context.',
          minimum: 0,
          maximum: 10,
          default: 2
        },
        maxResults: {
          type: 'number',
          description:
            'Maximum number of results to return. Defaults to 50. Use smaller numbers for quicker searches on large codebases.',
          minimum: 1,
          maximum: 200,
          default: 50
        },
        maxDepth: {
          type: 'number',
          description:
            'Maximum depth to search. 0 means only the current directory, 1 means one level deep, etc. If not specified, searches all levels.',
          minimum: 0,
          maximum: 20
        },
        excludePatterns: {
          type: 'array',
          items: {
            type: 'string',
            description: 'Pattern to exclude from search'
          },
          description:
            'Array of patterns to exclude from search. Examples: ["node_modules", ".git", "dist"] to exclude common directories, ["*.min.js", "*.bundle.js"] to exclude minified files.',
          examples: [
            ['node_modules', '.git'],
            ['*.min.js', '*.bundle.js'],
            ['dist', 'build']
          ]
        }
      },
      required: ['pattern']
    }
  }
}
