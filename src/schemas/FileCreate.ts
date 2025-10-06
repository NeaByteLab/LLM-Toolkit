/**
 * Tool schema for file creation operations.
 * @description Defines the schema for creating new files with content.
 */
export default {
  type: 'function',
  function: {
    name: 'FileCreate',
    description:
      'Use this tool to create a file with specified content. Creates a new file at the specified path and writes the provided content to it.\n\nIMPORTANT: Creates NEW files only. Fails if file already exists.',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description:
            'The path where the new file should be created. RECOMMENDED: Use absolute paths for clarity (e.g., "/full/path/to/newfile.ts"). ACCEPTED: Relative paths are also supported (e.g., "examples/NewFile.ts" or "src/components/Component.tsx").'
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
