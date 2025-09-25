/**
 * Tool schema for file editing operations.
 * @description Defines the schema for search and replace operations on existing files.
 */
export default {
  type: 'function',
  function: {
    name: 'FileEdit',
    description:
      'Use this tool to propose a search and replace operation on an existing file.\n\nThe tool will replace ONE occurrence of old_string with new_string in the specified file.\n\nCRITICAL REQUIREMENTS FOR USING THIS TOOL:\n\n1. UNIQUENESS: The old_string MUST uniquely identify the specific instance you want to change. This means:\n   - Include AT LEAST 3-5 lines of context BEFORE the change point\n   - Include AT LEAST 3-5 lines of context AFTER the change point\n   - Include all whitespace, indentation, and surrounding code exactly as it appears in the file\n\n2. SINGLE INSTANCE: This tool can only change ONE instance at a time. If you need to change multiple instances:\n   - Make separate calls to this tool for each instance\n   - Each call must uniquely identify its specific instance using extensive context\n\n3. VERIFICATION: Before using this tool:\n   - If multiple instances exist, gather enough context to uniquely identify each one\n   - Plan separate tool calls for each instance.',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description:
            'The relative path to the file to modify from the project root. Use relative paths like "examples/Calculator.ts" or "src/index.ts". Do not use absolute paths.'
        },
        oldString: {
          type: 'string',
          description:
            'The exact text to find and replace in the file. Must match the file content precisely including all whitespace, indentation, and formatting. This text must appear only once in the file to ensure unique identification.'
        },
        newString: {
          type: 'string',
          description:
            'The new text that will replace the oldString. This should be the modified version of the code/text you want to substitute.'
        }
      },
      required: ['filePath', 'oldString', 'newString']
    }
  }
}
