/**
 * Tool schema for code editing operations.
 * @description Defines the schema for search and replace operations on existing files.
 */
export default {
  type: 'function',
  function: {
    name: 'CodeEdit',
    description:
      'Use this tool to propose a search and replace operation on an existing file.\n\nThe tool will replace ONE occurrence of old_string with new_string in the specified file.\n\nCRITICAL REQUIREMENTS FOR USING THIS TOOL:\n\n1. UNIQUENESS: The old_string MUST uniquely identify the specific instance you want to change. This means:\n   - Include AT LEAST 3-5 lines of context BEFORE the change point\n   - Include AT LEAST 3-5 lines of context AFTER the change point\n   - Include all whitespace, indentation, and surrounding code exactly as it appears in the file\n\n2. SINGLE INSTANCE: This tool can only change ONE instance at a time. If you need to change multiple instances:\n   - Make separate calls to this tool for each instance\n   - Each call must uniquely identify its specific instance using extensive context\n\n3. VERIFICATION: Before using this tool:\n   - If multiple instances exist, gather enough context to uniquely identify each one\n   - Plan separate tool calls for each instance\n',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description:
            'The path to the file you want to search and replace in. You can use either a relative path in the workspace or an absolute path. If an absolute path is provided, it will be preserved as is.'
        },
        oldString: {
          type: 'string',
          description:
            'The text to replace (must be unique within the file, and must match the file contents exactly, including all whitespace and indentation)'
        },
        newString: {
          type: 'string',
          description:
            'The edited text to replace the old_string (must be different from the old_string)'
        }
      },
      required: ['filePath', 'oldString', 'newString']
    }
  }
}
