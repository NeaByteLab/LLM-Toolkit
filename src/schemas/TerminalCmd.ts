/**
 * Tool schema for terminal command execution operations.
 * @description Defines the schema for executing terminal commands with timeout and working directory support.
 */
export default {
  type: 'function',
  function: {
    name: 'TerminalCmd',
    description:
      'Execute terminal commands in a controlled environment. Runs commands with security validation and timeout protection. Fails if command is dangerous, times out, or working directory does not exist.\n\nCRITICAL SECURITY WARNING: Always filter ALL dangerous commands and read actual files before execution! Script execution can bypass command validation - validate script content before running!',
    parameters: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description:
            'The terminal command to execute. Must be a valid command that can run in the project environment. Dangerous commands (rm -rf, sudo, etc.) are automatically blocked. Script execution can bypass validation - always read and validate script content before execution!'
        },
        workingDir: {
          type: 'string',
          description:
            'The working directory for the command execution. If not specified, uses the project root directory. Use absolute paths for clarity, relative paths are also supported.'
        },
        timeout: {
          type: 'number',
          description:
            'Timeout for command execution in milliseconds. Minimum: 30000ms (30s), Maximum: 300000ms (5min), Default: 60000ms (1min).'
        }
      },
      required: ['command']
    }
  }
}
