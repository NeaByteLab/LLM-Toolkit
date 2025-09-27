import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import fs, { chmodSync, unlinkSync } from 'node:fs'
import os from 'node:os'
import fetch from '@neabyte/fetch'

/**
 * Response object containing platform-specific information.
 * @description Defines the structure for platform identification data including architecture ID and file extension.
 */
export interface PlatformResponse {
  /** The platform-specific architecture identifier */
  id: string
  /** The file extension for the platform's archive format */
  extension: string
}

/**
 * Promisified version of Node.js exec function.
 * @description Converts the callback-based exec function to return a Promise for easier async/await usage.
 */
const execAsync: (command: string) => Promise<{ stdout: string; stderr: string }> = promisify(exec)

/**
 * Current file path resolved from import.meta.url.
 * @description Gets the absolute file path of the current module for path resolution.
 */
const filename: string = fileURLToPath(import.meta.url)

/**
 * Directory containing the current script file.
 * @description Resolves the directory path where this module is located.
 */
const scriptDir: string = dirname(filename)

/**
 * Gets the appropriate binary name for the current platform.
 * @description Returns 'rg.exe' for Windows platforms and 'rg' for all other platforms.
 * @returns The platform-specific binary name for ripgrep
 */
export function getBinaryName(): string {
  return os.platform() === 'win32' ? 'rg.exe' : 'rg'
}

/**
 * Checks if a binary file exists at the specified path.
 * @description Safely checks file existence using fs.existsSync with error handling.
 * @param path - The file path to check for existence
 * @returns True if the file exists, false if it doesn't exist or an error occurs
 */
export function isBinaryExists(path: string): boolean {
  try {
    return fs.existsSync(path)
  } catch {
    return false
  }
}

/**
 * Gets the Darwin platform identifier for the specified architecture.
 * @description Maps Node.js architecture strings to ripgrep's Darwin platform identifiers.
 * @param arch - The Node.js architecture string (e.g., 'arm64', 'x64')
 * @returns The Darwin platform identifier for ripgrep downloads
 */
export function getDarwinId(arch: string): string {
  return arch === 'arm64' ? 'aarch64-apple-darwin' : 'x86_64-apple-darwin'
}

/**
 * Gets the Windows platform identifier for the specified architecture.
 * @description Maps Node.js architecture strings to ripgrep's Windows platform identifiers.
 * @param arch - The Node.js architecture string (e.g., 'x64', 'arm64', 'ia32')
 * @returns The Windows platform identifier for ripgrep downloads
 */
export function getWindowsId(arch: string): string {
  if (arch === 'x64') {
    return 'x86_64-pc-windows-msvc'
  }
  if (arch === 'arm64') {
    return 'aarch64-pc-windows-msvc'
  }
  return 'i686-pc-windows-msvc'
}

/**
 * Gets the Linux platform identifier for the specified architecture.
 * @description Maps Node.js architecture strings to ripgrep's Linux platform identifiers with fallback to i686.
 * @param arch - The Node.js architecture string (e.g., 'x64', 'arm', 'arm64', 'ppc64', 'riscv64', 's390x')
 * @returns The Linux platform identifier for ripgrep downloads
 */
export function getLinuxId(arch: string): string {
  const linuxMap: Record<string, string> = {
    x64: 'x86_64-unknown-linux-musl',
    arm: 'armv7-unknown-linux-gnueabihf',
    arm64: 'aarch64-unknown-linux-gnu',
    ppc64: 'powerpc64-unknown-linux-gnu',
    riscv64: 'riscv64gc-unknown-linux-gnu',
    s390x: 's390x-unknown-linux-gnu'
  }
  return linuxMap[arch] ?? 'i686-unknown-linux-gnu'
}

/**
 * Gets platform-specific information for ripgrep downloads.
 * @description Determines the current platform and returns appropriate architecture ID and file extension.
 * @returns Platform response object containing architecture ID and file extension
 * @throws {Error} When the current platform is not supported (not darwin, win32, or linux)
 */
export function getPlatform(): PlatformResponse {
  const arch: string = os.arch()
  const platform: string = os.platform()
  if (platform === 'darwin') {
    return { id: getDarwinId(arch), extension: 'tar.gz' }
  }
  if (platform === 'win32') {
    return { id: getWindowsId(arch), extension: 'zip' }
  }
  if (platform === 'linux') {
    return { id: getLinuxId(arch), extension: 'tar.gz' }
  }
  throw new Error(`Unsupported platform: ${platform}`)
}

/**
 * Resolves the path to the local ripgrep binary.
 * @description Constructs the full path to the ripgrep binary in the local bin directory.
 * @returns The absolute path to the local ripgrep binary
 */
export function resolveRipgrepBin(): string {
  return join(scriptDir, '../../bin', getBinaryName())
}

/**
 * Resolves the path to an existing ripgrep binary.
 * @description Checks if a local ripgrep binary exists and returns its path, otherwise returns null.
 * @returns The path to the existing ripgrep binary or null if not found
 */
export function resolveRipgrepPath(): string | null {
  const localRg: string = resolveRipgrepBin()
  if (isBinaryExists(localRg)) {
    return localRg
  }
  return null
}

/**
 * Platform-specific architecture identifier for ripgrep downloads.
 * @description Extracted from platform detection for use in download URLs.
 */
export const { id, extension }: PlatformResponse = getPlatform()

/**
 * Repository name for ripgrep on GitHub.
 * @description The official repository name used in GitHub URLs.
 */
export const repoName: string = 'ripgrep'

/**
 * Version of ripgrep to download.
 * @description The specific version number for ripgrep releases.
 */
export const repoVer: string = '14.1.1'

/**
 * Complete download URL for ripgrep.
 * @description Constructed URL pointing to the appropriate ripgrep release for the current platform.
 */
export const repoUrl: string = `https://github.com/BurntSushi/${repoName}/releases/download/${repoVer}/${repoName}-${repoVer}-${id}.${extension}`

/**
 * Extracts a tar.gz archive containing ripgrep binary.
 * @description Extracts the tar.gz file, locates the ripgrep binary, moves it to the target directory, and cleans up.
 * @param filePath - The path to the tar.gz archive file
 * @param binDir - The target directory to extract the binary to
 * @throws {Error} When extraction commands fail or file operations encounter errors
 */
export async function extractTarGz(filePath: string, binDir: string): Promise<void> {
  await execAsync(`tar -xzf "${filePath}" -C "${binDir}"`)
  const { stdout }: { stdout: string } = await execAsync(
    `find "${binDir}" -name "rg" -type f | head -1`
  )
  const rgPath: string = stdout.trim()
  if (rgPath) {
    const finalRgPath: string = join(binDir, 'rg')
    await execAsync(`mv "${rgPath}" "${finalRgPath}"`)
    chmodSync(finalRgPath, 0o755)
    const rgDir: string = dirname(rgPath)
    if (rgDir !== binDir) {
      await execAsync(`rm -rf "${rgDir}"`)
    }
  }
}

/**
 * Extracts a zip archive containing ripgrep binary.
 * @description Extracts the zip file, locates the ripgrep binary, moves it to the target directory, and cleans up.
 * @param filePath - The path to the zip archive file
 * @param binDir - The target directory to extract the binary to
 * @throws {Error} When extraction commands fail or file operations encounter errors
 */
export async function extractZip(filePath: string, binDir: string): Promise<void> {
  await execAsync(`unzip -o "${filePath}" -d "${binDir}"`)
  const { stdout }: { stdout: string } = await execAsync(`find "${binDir}" -name "rg.exe" -type f`)
  const rgPath: string = stdout.trim()
  if (rgPath) {
    const finalRgPath: string = join(binDir, 'rg.exe')
    await execAsync(`move "${rgPath}" "${finalRgPath}"`)
    const rgDir: string = dirname(rgPath)
    if (rgDir !== binDir) {
      await execAsync(`rmdir /s /q "${rgDir}"`)
    }
  }
}

/**
 * Extracts the downloaded ripgrep archive.
 * @description Handles extraction of the downloaded ripgrep archive based on file extension and cleans up the archive file.
 * @param binDir - The target directory to extract the binary to
 * @throws {Error} When extraction fails, directory creation fails, or file operations encounter errors
 */
export async function extractRipgrep(binDir: string): Promise<void> {
  const fileName: string = `${repoName}-${repoVer}-${id}.${extension}`
  const filePath: string = join(process.cwd(), fileName)
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true })
  }
  try {
    if (extension === 'tar.gz') {
      await extractTarGz(filePath, binDir)
    } else if (extension === 'zip') {
      await extractZip(filePath, binDir)
    }
    unlinkSync(filePath)
  } catch (error: unknown) {
    throw new Error(
      `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Downloads and sets up ripgrep binary for the current platform.
 * @description Downloads the appropriate ripgrep binary, extracts it, and sets up the executable with progress feedback.
 * @throws {Error} When download fails, extraction fails, or setup encounters errors (exits process on failure)
 */
export async function downloadRipgrep(): Promise<void> {
  try {
    await fetch.get(repoUrl, {
      download: true,
      filename: `ripgrep-${repoVer}-${id}.${extension}`,
      onProgress: (percentage: number) => {
        console.log(`[?] Download ripgrep. ${percentage}% done`)
      },
      timeout: 60000,
      retries: 3
    })
    const binDir: string = join(scriptDir, '../../bin')
    await extractRipgrep(binDir)
    console.log('✅ Ripgrep extracted and setup successfully!')
  } catch (error) {
    console.error('❌ Download failed:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
}
