import { randomBytes } from 'node:crypto'

/**
 * Generates a unique identifier with timestamp and random components.
 * @description Creates an ID by combining a prefix, timestamp, and random bytes.
 * @param prefix - The prefix for the generated ID (must be alphanumeric with underscores, 1-50 characters)
 * @returns An identifier string in format: prefix_timestamp_random
 * @throws {Error} When prefix is invalid or not a string
 */
export function generateId(prefix: string): string {
  if (typeof prefix !== 'string') {
    throw new Error('Prefix must be a string')
  }
  const trimmed: string = prefix.trim()
  if (trimmed.length < 1) {
    throw new Error('Prefix must be a non-empty string')
  }
  if (trimmed.length > 50) {
    throw new Error('Prefix must be 50 characters or less')
  }
  if (!/^\w+$/.test(trimmed)) {
    throw new Error('Prefix must contain only alphanumeric characters and underscores')
  }
  const timestamp: string = Date.now().toString(36)
  const random: string = randomBytes(8).toString('hex')
  return `${trimmed}_${timestamp}_${random}`
}
