import { platform, arch, release } from 'node:os'

/**
 * Context environment information provider.
 * @description Gathers current time and OS system information for context.
 */
export class ContextEnv {
  /**
   * Gets current context information as a readable string.
   * @description Returns formatted time, OS, and working directory information.
   * @returns Formatted context string
   */
  getContext(): string {
    const timeInfo: string = this.getTimeInfo()
    const osInfo: string = this.getOSInfo()
    const pathInfo: string = this.getPathInfo()
    return `- Time: ${timeInfo}\n- OS: ${osInfo}\n- Path: ${pathInfo}`
  }

  /**
   * Gets formatted time information.
   * @description Returns current date/time with timezone.
   * @returns Formatted time string
   */
  private getTimeInfo(): string {
    const now: Date = new Date()
    const timeString: string = now
      .toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
      .replace(
        /(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{1,2}):(\d{1,2})/,
        '$3-$1-$2 $4:$5:$6'
      )
    const timezoneOffset: string =
      now
        .toLocaleTimeString('en-US', {
          timeZoneName: 'short'
        })
        .split(' ')
        .pop() ?? ''

    return `${timeString} ${timezoneOffset}`
  }

  /**
   * Gets formatted OS information.
   * @description Returns operating system details.
   * @returns Formatted OS string
   */
  private getOSInfo(): string {
    const osName: string = this.getOSName()
    const osVersion: string = release()
    const architecture: string = arch()
    return `${osName} ${osVersion} ${architecture}`
  }

  /**
   * Gets formatted path information.
   * @description Returns current working directory.
   * @returns Formatted path string
   */
  private getPathInfo(): string {
    return process.cwd()
  }

  /**
   * Gets human-readable OS name.
   * @description Converts platform to readable OS name.
   * @returns OS name string
   */
  private getOSName(): string {
    switch (platform()) {
      case 'darwin':
        return 'macOS'
      case 'win32':
        return 'Windows'
      case 'linux':
        return 'Linux'
      case 'aix':
        return 'AIX'
      case 'android':
        return 'Android'
      case 'freebsd':
        return 'FreeBSD'
      case 'haiku':
        return 'Haiku'
      case 'openbsd':
        return 'OpenBSD'
      case 'sunos':
        return 'SunOS'
      case 'cygwin':
        return 'Cygwin'
      case 'netbsd':
        return 'NetBSD'
      default:
        return platform()
    }
  }
}
