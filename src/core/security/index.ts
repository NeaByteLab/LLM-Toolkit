/* eslint-disable security/detect-non-literal-fs-filename */
import type { Stats } from 'node:fs'
import { stat } from 'node:fs/promises'
import { resolve, normalize, isAbsolute, basename, extname, dirname } from 'node:path'
import {
  blacklistedFiles,
  blacklistedDir,
  blacklistedExt,
  dangerousPatterns
} from '@core/security/Constant'

/**
 * Validates file size for reading operations.
 * @description Checks if file size is within acceptable limits (1MB max).
 * @param filePath - The file path to check
 * @returns Promise that resolves to true if file size is acceptable, false if too large
 */
export async function validateFileSize(filePath: string): Promise<boolean> {
  try {
    const stats: Stats = await stat(filePath)
    if (typeof stats.size !== 'number') {
      return false
    }
    return stats.size <= 1024 * 1024
  } catch {
    return false
  }
}

/**
 * Validates and secures a file/directory path to prevent directory traversal attacks.
 * @description Checks if path is relative or absolute, normalizes it, and ensures it stays within current working directory.
 * Also filters out dangerous files, directories, and patterns using comprehensive blacklists.
 * @param path - The path to validate and secure
 * @returns Safe resolved path or null if path is invalid or potentially dangerous
 */
export function getSafePath(path: string): string | null {
  const cwd: string = process.cwd()
  let resolvedPath: string
  if (/^[A-Za-z]:[\\/]/.exec(path)) {
    return null
  }
  if (isAbsolute(path)) {
    resolvedPath = normalize(path)
    if (!resolvedPath.startsWith(cwd)) {
      return null
    }
  } else {
    const normalizedPath: string = normalize(path)
    resolvedPath = resolve(cwd, normalizedPath)
    if (resolvedPath.includes('..') || resolvedPath.includes('~')) {
      return null
    }
    if (!resolvedPath.startsWith(cwd)) {
      return null
    }
  }
  if (!isPathSafe(resolvedPath)) {
    return null
  }
  return resolvedPath
}

/**
 * Checks if a path is safe by applying comprehensive security filters.
 * @description Applies blacklists for files, directories, extensions, and dangerous patterns.
 * @param path - The resolved path to check
 * @returns True if path is safe, false if dangerous
 */
function isPathSafe(path: string): boolean {
  const fileName: string = basename(path)
  const fileExtension: string = extname(path)
  const directoryName: string = basename(dirname(path))
  if (blacklistedFiles.includes(fileName)) {
    return false
  }
  if (blacklistedDir.includes(directoryName)) {
    return false
  }
  if (blacklistedExt.includes(fileExtension)) {
    return false
  }
  for (const pattern of dangerousPatterns) {
    if (pattern.test(path)) {
      return false
    }
  }
  return true
}
