import type { Stats } from 'node:fs'
import { stat } from 'node:fs/promises'
import { resolve, normalize, isAbsolute, basename, extname, dirname } from 'node:path'
import {
  blacklistedFiles,
  blacklistedDir,
  blacklistedExt,
  dangerousPatterns
} from '@core/security/Constant'
import type { SecurityFileSize, SecurityPathResult } from '@interfaces/index'

/**
 * Validates and secures a file/directory path to prevent directory traversal attacks.
 * @description Checks path validity and applies security filters.
 * @param path - The path to validate and secure
 * @returns Object with success status and optional message
 */
export function getSafePath(path: string): SecurityPathResult {
  const cwd: string = process.cwd()
  let resolvedPath: string
  if (/^[A-Za-z]:[\\/]/.exec(path)) {
    return { success: false, message: 'Windows drive paths are not allowed' }
  }
  if (isAbsolute(path)) {
    resolvedPath = normalize(path)
    if (!resolvedPath.startsWith(cwd)) {
      return { success: false, message: 'Absolute path outside project directory' }
    }
  } else {
    const normalizedPath: string = normalize(path)
    resolvedPath = resolve(cwd, normalizedPath)
    if (resolvedPath.includes('..') || resolvedPath.includes('~')) {
      return { success: false, message: 'Path contains traversal patterns' }
    }
    if (!resolvedPath.startsWith(cwd)) {
      return { success: false, message: 'Path resolved outside project directory' }
    }
  }
  if (!isPathSafe(resolvedPath)) {
    return { success: false, message: 'Path contains dangerous files or patterns' }
  }
  if (resolvedPath.length > 500) {
    return { success: false, message: 'Path is too long (maximum 500 characters)' }
  }
  return { success: true, path: resolvedPath }
}

/**
 * Checks if a path is safe by applying extensive security filters.
 * @description Applies blacklists for files, directories, extensions, and dangerous patterns.
 * @param path - The resolved path to check
 * @returns True if path is safe, false if dangerous
 */
export function isPathSafe(path: string): boolean {
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

/**
 * Validates file size for reading operations.
 * @description Checks if file size is within acceptable limits (200KB max).
 * @param filePath - The file path to check
 * @returns Promise that resolves to true if file size is acceptable, false if too large
 */
export async function validateFileSize(filePath: string): Promise<SecurityFileSize> {
  try {
    const stats: Stats = await stat(filePath)
    if (typeof stats.size !== 'number') {
      return { valid: false, exists: true }
    }
    return { valid: stats.size <= 200 * 1024, exists: true }
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return { valid: false, exists: false }
    }
    return { valid: false, exists: true }
  }
}
