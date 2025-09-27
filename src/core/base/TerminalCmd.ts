import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import type { SchemaTerminalCmd, SecurityPathResult } from '@interfaces/index'
import { getSafePath } from '@core/security/index'

/**
 * Promisified exec function for executing commands asynchronously.
 * @description Converts the exec function to a promise-based API for easier use.
 * @param command - The command to execute
 * @param options - The options for the command execution
 * @returns Promise resolving to the command output
 */
const execAsync: (
  command: string,
  options: { cwd?: string }
) => Promise<{ stdout: string; stderr: string }> = promisify(exec)

/**
 * Handles terminal command execution with security validation and timeout protection.
 * @description Executes terminal commands with comprehensive security checks and timeout handling.
 */
export default class TerminalCmd {
  /** The command to execute */
  private readonly command: string
  /** The working directory for command execution */
  private readonly workingDir?: string
  /** Timeout for command execution in milliseconds */
  private readonly timeout: number

  /**
   * Creates a new TerminalCmd instance.
   * @description Initializes the terminal command execution with command, working directory, and timeout parameters.
   * @param args - The terminal command schema containing command execution data
   */
  constructor(args: SchemaTerminalCmd) {
    const { command, workingDir, timeout }: SchemaTerminalCmd = args
    this.command = command
    this.workingDir = workingDir ?? process.cwd()
    this.timeout = timeout ?? 60000
  }

  /**
   * Executes the terminal command.
   * @description Performs validation, security checks, and executes the command with timeout protection.
   * @returns Command output, exit code, and execution details or error message
   * @throws {Error} When command execution fails or times out
   */
  async execute(): Promise<string> {
    const resValidate: string = this.validate()
    if (resValidate !== 'ok') {
      return resValidate
    }
    try {
      if (this.workingDir !== undefined) {
        const validatedWorkingDir: SecurityPathResult = getSafePath(this.workingDir)
        if (!validatedWorkingDir.success) {
          return `Error! Invalid working directory: ${validatedWorkingDir.message}.`
        }
      }
      const startTime: number = Date.now()
      const result: string = await this.runCommand(this.workingDir ?? process.cwd())
      const executionTime: number = Date.now() - startTime
      return `Command executed successfully in ${executionTime}ms:\n\n${result}`
    } catch (error) {
      return `Error! Command execution failed: ${error instanceof Error ? error.message : 'Unknown error'}.`
    }
  }

  /**
   * Runs the terminal command with timeout protection.
   * @description Executes the command using child_process.exec with timeout handling.
   * @param workingDir - The validated working directory
   * @returns Command output and exit code
   */
  private async runCommand(workingDir: string): Promise<string> {
    try {
      const { stdout, stderr }: { stdout: string; stderr: string } = await Promise.race([
        execAsync(this.command, { cwd: workingDir }),
        new Promise<never>((_: unknown, reject: (reason?: unknown) => void) => {
          setTimeout(() => {
            reject(new Error(`Command timed out after ${this.timeout}ms`))
          }, this.timeout)
        })
      ])
      const output: string = stdout + (stderr ? `\nSTDERR:\n${stderr}` : '')
      return `Exit code: 0\nOutput:\n${output}`
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        throw error
      }
      const execError: { stdout?: string; stderr?: string; code?: number } = error as {
        stdout?: string
        stderr?: string
        code?: number
      }
      const output: string =
        (execError.stdout ?? '') +
        (execError.stderr != null ? `\nSTDERR:\n${execError.stderr}` : '')
      return `Exit code: ${execError.code ?? 1}\nOutput:\n${output}`
    }
  }

  /**
   * Validates the terminal command parameters.
   * @description Checks that command, workingDir, and timeout parameters are valid.
   * @returns 'ok' if validation passes, error message if validation fails
   */
  private validate(): string {
    if (typeof this.command !== 'string') {
      return '`command` must be a string.'
    }
    if (this.command.trim().length === 0) {
      return '`command` cannot be empty.'
    }
    if (this.workingDir !== undefined && typeof this.workingDir !== 'string') {
      return '`workingDir` must be a string.'
    }
    if (this.workingDir !== undefined && this.workingDir.trim().length === 0) {
      return '`workingDir` cannot be empty.'
    }
    if (typeof this.timeout !== 'number') {
      return '`timeout` must be a number.'
    }
    if (this.timeout < 30000) {
      return '`timeout` must be at least 30000ms (30 seconds).'
    }
    if (this.timeout > 300000) {
      return '`timeout` must be at most 300000ms (5 minutes).'
    }
    return 'ok'
  }
}
