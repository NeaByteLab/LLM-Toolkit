/**
 * Tool schema for terminal command execution operations.
 * @description Defines the schema for executing terminal commands with timeout and working directory support.
 */
export default {
  type: 'function',
  function: {
    name: 'TerminalCmd',
    description:
      'Use this tool to execute terminal commands in a controlled environment. This tool runs commands with security validation and timeout protection.\n\nIMPORTANT: This tool executes commands with restricted permissions and security checks.\n\nTIMEOUT LIMITS:\n- Minimum timeout: 30 seconds (30000ms)\n- Maximum timeout: 5 minutes (300000ms)\n- Default timeout: 60 seconds (60000ms).',
    parameters: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description:
            'The terminal command to execute. Must be a valid command that can run in the project environment. Dangerous commands (rm -rf, sudo, etc.) are automatically blocked.'
        },
        workingDir: {
          type: 'string',
          description:
            'The working directory for the command execution. If not specified, uses the project root directory. Must be within the project directory.'
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
