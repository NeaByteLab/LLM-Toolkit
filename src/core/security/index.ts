import { resolve, normalize, isAbsolute } from 'node:path'

/**
 * Validates and secures a file/directory path to prevent directory traversal attacks.
 * @description Checks if path is relative, normalizes it, and ensures it stays within current working directory.
 * @param path - The path to validate and secure
 * @returns Safe resolved path or null if path is invalid or potentially dangerous
 */
export function getSafePath(path: string): string | null {
  if (isAbsolute(path)) {
    return null
  }
  const normalizedPath: string = normalize(path)
  const resolvedPath: string = resolve(process.cwd(), normalizedPath)
  if (resolvedPath.includes('..') || resolvedPath.includes('~')) {
    return null
  }
  const cwd: string = process.cwd()
  if (!resolvedPath.startsWith(cwd)) {
    return null
  }
  return resolvedPath
}
