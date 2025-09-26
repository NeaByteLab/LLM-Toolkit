/**
 * Tool schema for file rename operations.
 * @description Defines the schema for renaming files by filename only within the same directory.
 */
export default {
  type: 'function',
  function: {
    name: 'FileRename',
    description:
      'Use this tool to rename a file by changing only its filename. This tool renames files within the same directory while preserving the file content, permissions, and directory location.\n\nIMPORTANT: This tool renames files by filename only. The file stays in the same directory with a new name.\n\nFILENAME RENAME OPERATIONS:\n- Renames files to new filenames with different extensions if needed\n- Keeps the file in the same directory\n- Preserves file content, permissions, and timestamps\n- Only changes the filename portion\n\nSECURITY CONSIDERATIONS:\n- Only files within the project directory can be renamed\n- Sensitive files (.env, .key, etc.) are automatically blocked\n- System files and directories are protected\n- Path traversal attacks are prevented\n- Cannot rename to existing filenames (operation will fail)\n\nThis tool will rename the specified file to the new filename if the operation is safe and allowed.',
    parameters: {
      type: 'object',
      properties: {
        oldFilename: {
          type: 'string',
          description:
            'The current filename to rename. Can be just the filename (e.g., "oldname.ts") or relative path (e.g., "src/oldname.ts"). The tool will rename the file to a new filename in the same directory.'
        },
        newFilename: {
          type: 'string',
          description:
            'The new filename to rename to. Should be just the new filename (e.g., "newname.ts") or relative path (e.g., "src/newname.ts"). The file will be renamed within the same directory.'
        }
      },
      required: ['oldFilename', 'newFilename']
    }
  }
}
