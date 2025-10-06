/**
 * Tool schema for file editing operations.
 * @description Defines the schema for search and replace operations on existing files.
 */
export default {
  type: 'function',
  function: {
    name: 'FileEdit',
    description:
      'Edit existing files using search and replace operations. Replaces one occurrence of old_string with new_string. Requires exact text matching including whitespace and indentation. Fails if file does not exist or text not found.',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description:
            'The file path to modify. Use absolute paths for clarity, relative paths are also supported.'
        },
        oldString: {
          type: 'string',
          description:
            'The exact text to find and replace in the file. Must match the file content precisely including all whitespace, indentation, and formatting. Include 3-5 lines of context before and after the change point to ensure unique identification. This text must appear only once in the file.'
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
