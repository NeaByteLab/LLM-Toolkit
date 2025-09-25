/**
 * Tool schema for file creation operations.
 * @description Defines the schema for creating new files with content.
 */
export default {
  type: 'function',
  function: {
    name: 'FileCreate',
    description:
      'Use this tool to create a new file with specified content. This tool will create a new file at the specified path and write the provided content to it.\n\nIMPORTANT: This tool creates NEW files only. If the file already exists, the operation will fail.\n\nFor creating files:\n- Provide the complete file content from scratch\n- Ensure the file path is valid and does not already exist\n- Use relative paths from the project root\n\nThis tool will create the file and write the content exactly as provided.',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description:
            'The relative path where the new file should be created from the project root. Use relative paths like "examples/NewFile.ts" or "src/components/Component.tsx". Do not use absolute paths.'
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
