import fetch, { FetchError } from '@neabyte/fetch'
import type { FetchOptions, FetchResponse } from '@neabyte/fetch'
import type { SchemaWebFetch } from '@interfaces/index'

/**
 * Handles web fetching operations with HTML to Markdown conversion.
 * @description Executes web requests to fetch content from URLs and converts HTML to Markdown format.
 */
export default class WebFetch {
  /** The URL to fetch content from */
  private readonly url: string

  /**
   * Creates a new WebFetch instance.
   * @description Initializes the web fetch operation with URL parameter.
   * @param args - The web fetch schema containing URL data
   */
  constructor(args: SchemaWebFetch) {
    const { url }: SchemaWebFetch = args
    this.url = url
  }

  /**
   * Executes the web fetch operation.
   * @description Performs validation, security checks, and fetches web content or returns error message.
   * @returns Web content as Markdown string or error message if validation/fetching fails
   */
  async execute(): Promise<string> {
    const resValidate: string = this.validate()
    if (resValidate !== 'ok') {
      return resValidate
    }
    try {
      const options: FetchOptions = {
        timeout: 15000,
        retries: 1,
        headers: {
          'User-Agent': 'LLM-Toolkit/1.0'
        },
        responseType: 'text'
      }
      const content: FetchResponse<string> = await fetch.get<string>(this.url, options)
      if (typeof content !== 'string') {
        return `Error! Invalid response format from URL: ${this.url}`
      }
      if (content.length === 0) {
        return `Error! Empty response from URL: ${this.url}`
      }
      const maxContentLength: number = 1024 * 1024
      if (content.length > maxContentLength) {
        return `Error! Content too large: ${this.url}. Maximum allowed size is 1MB, received ${Math.round(content.length / 1024)}KB.`
      }
      return this.htmlToMarkdown(content)
    } catch (error) {
      if (error instanceof FetchError) {
        const status: number | string = error.status ?? 'Network Error'
        return `Error! HTTP ${status} for URL ${this.url}`
      }
      if (error instanceof Error && error.name === 'AbortError') {
        return `Error! Request timeout for URL: ${this.url}`
      }
      return `Error! Fetching URL ${this.url}: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }

  /**
   * Converts HTML content to Markdown format.
   * @description Simple HTML to Markdown conversion for basic content formatting.
   * @param html - The HTML content to convert
   * @returns Markdown formatted content
   */
  private htmlToMarkdown(html: string): string {
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<ul[^>]*>(.*?)<\/ul>/gi, '$1\n')
      .replace(/<ol[^>]*>(.*?)<\/ol>/gi, '$1\n')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, '```\n$1\n```\n')
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n')
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .replace(/<!--[\s\S]*?-->/gi, '')
      .replace(/<\/?[a-zA-Z][^>]*>/g, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .split('\n')
      .map((line: string) => line.trimEnd())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  /**
   * Validates the URL parameter.
   * @description Checks that URL is a valid non-empty string and follows security requirements.
   * @returns 'ok' if validation passes, error message if validation fails
   */
  private validate(): string {
    if (typeof this.url !== 'string') {
      return '`url` must be a string.'
    }
    if (this.url.trim().length === 0) {
      return '`url` cannot be empty.'
    }
    try {
      const urlObj: URL = new URL(this.url)
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return '`url` must use http:// or https:// protocol only.'
      }
      if (
        urlObj.hostname === 'localhost' ||
        urlObj.hostname === '127.0.0.1' ||
        urlObj.hostname.startsWith('192.168.') ||
        urlObj.hostname.startsWith('10.') ||
        urlObj.hostname.startsWith('172.')
      ) {
        return '`url` cannot point to localhost or private IP addresses.'
      }
      return 'ok'
    } catch {
      return '`url` must be a valid URL format (e.g., https://example.com).'
    }
  }
}
