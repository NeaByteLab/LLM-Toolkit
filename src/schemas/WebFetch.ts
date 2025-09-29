/**
 * Tool schema for web fetching operations.
 * @description Defines the schema for making HTTP requests to fetch web content, APIs, and remote resources.
 */
export default {
  type: 'function',
  function: {
    name: 'WebFetch',
    description:
      'Fetch web pages and convert HTML content to Markdown format. Use this to get external documentation, API references, or research information. Returns clean, readable text content from websites.\n\nWHAT IT DOES:\n- Fetches web pages and converts HTML to Markdown\n- Returns clean, readable text content from websites\n- Perfect for getting external documentation and API references\n- Ideal for research and information gathering\n\nSECURITY CONSIDERATIONS:\n- Only allows requests to public URLs (no localhost/private IPs)\n- Blocks dangerous protocols (file://, ftp://, etc.)\n- Rate limiting to prevent abuse\n- Timeout protection (default: 30 seconds)\n- User-Agent identification for responsible web scraping\n\nThis tool will fetch the content from the specified URL and return it in Markdown format.',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description:
            'The URL to fetch. Must include protocol (http:// or https://). Examples: "https://api.github.com/user", "https://jsonplaceholder.typicode.com/posts/1".'
        }
      },
      required: ['url']
    }
  }
}
