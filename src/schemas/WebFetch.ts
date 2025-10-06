/**
 * Tool schema for web fetching operations.
 * @description Defines the schema for making HTTP requests to fetch web content, APIs, and remote resources.
 */
export default {
  type: 'function',
  function: {
    name: 'WebFetch',
    description:
      'Fetch web pages and convert HTML content to Markdown format. Returns clean, readable text content from websites. Fails if URL is invalid, network error, or response is empty.',
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
