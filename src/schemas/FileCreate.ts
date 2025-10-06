/**
 * Tool schema for file creation operations.
 * @description Defines the schema for creating new files with content.
 */
export default {
  type: 'function',
  function: {
    name: 'FileCreate',
    description:
      'Create files with specified content. Writes new content to a new file at the specified path. Fails if file already exists.',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description:
            'The file path to create. Use absolute paths for clarity, relative paths are also supported.'
        },
        content: {
          type: 'string',
          description:
            'The complete content to write to the new file. This should include all the code, text, or data that should be in the file.'
        },
        instructions: {
          type: 'string',
          description:
            'A single sentence instruction describing what you are creating. This is used to assist the less intelligent model in understanding the purpose of the file creation. Please use the first person to describe what you are creating.'
        }
      },
      required: ['filePath', 'content', 'instructions']
    }
  }
}
