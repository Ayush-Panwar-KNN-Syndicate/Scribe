/**
 * Mewow Search API Client
 * Handles communication with the external Mewow search service
 */

export interface SearchOptions {
  engines?: string[]
  limit?: number
  includeImages?: boolean
  includeVideos?: boolean
  summarize?: boolean
  crawl?: boolean
  advancedQuery?: boolean
}

export interface SearchResult {
  title: string
  url: string
  snippet?: string
  description?: string
  source?: string
  timestamp?: string
}

export interface SearchResponse {
  results: SearchResult[]
  query: string
  totalResults?: number
  processingTime?: string
  sources?: string[]
}

interface MewowApiResponse {
  images?: any
  videos?: any
  results?: Array<{
    title: string
    url: string
    content: string
  }>
  advanced_result?: any
  number_of_results?: number
  query?: string
  [key: string]: any
}

/**
 * Search using the Mewow API
 * 
 * @param query - Search query string
 * @param options - Search configuration options
 * @param apiKey - Mewow API key
 * @returns Promise resolving to search results
 */
export async function searchMewowAPI(
  query: string,
  options: SearchOptions = {},
  apiKey: string
): Promise<SearchResponse> {
  // Prepare request body matching the Mewow API format
  const requestBody = {
    advancedQuery: options.advancedQuery || false,
    crawl: options.crawl || false,
    engines: options.engines || ['google', 'duckduckgo'],
    includeImages: options.includeImages || false,
    includeVideos: options.includeVideos || false,
    limit: Math.min(options.limit || 10, 20), // Cap at 20 to prevent abuse
    query: query,
    summarize: options.summarize || false
  }

  const startTime = Date.now()

  try {
    const response = await fetch('https://platform.mewow.dev/api/v1/tools/searchWeb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': apiKey,
        'User-Agent': 'SearchTermux-Search-Worker/1.0'
      },
      body: JSON.stringify(requestBody),
      // Cloudflare Workers have built-in timeout handling
      // Set a reasonable timeout for the external API
      signal: AbortSignal.timeout(15000) // 15 second timeout
    })

    const processingTime = Date.now() - startTime

    if (!response.ok) {
      // Handle different error status codes
      if (response.status === 401) {
        throw new Error('Invalid API key - check your Mewow API configuration')
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded on Mewow API - please try again later')
      } else if (response.status >= 500) {
        throw new Error('Mewow API server error - service temporarily unavailable')
      } else {
        throw new Error(`Mewow API error: ${response.status} ${response.statusText}`)
      }
    }

    const data = await response.json() as MewowApiResponse
    
    // Validate response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from Mewow API')
    }

    // Transform the response to our standard format with minimal processing
    const results: SearchResult[] = Array.isArray(data.results) 
      ? data.results.map((result) => ({
          title: result.title || 'Untitled',
          url: result.url || '',
          snippet: result.content || '',
          description: result.content || '',
          source: extractDomain(result.url || ''),
          timestamp: new Date().toISOString()
        }))
      : []

    // Extract unique sources efficiently
    const sources = results.length > 0 
      ? Array.from(new Set(results.map(r => r.source).filter((source): source is string => Boolean(source))))
      : []

    return {
      results,
      query: data.query || query,
      totalResults: data.number_of_results || results.length,
      processingTime: `${processingTime}ms`,
      sources
    }

  } catch (error: any) {
    console.error('Mewow API error:', error)
    
    // Handle different types of errors
    if (error.name === 'AbortError') {
      throw new Error('Search request timed out - please try again')
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to search service - please check your internet connection')
    } else if (error.message.includes('API key')) {
      throw new Error('Search service configuration error - please contact support')
    } else {
      // Re-throw with a generic message for security
      throw new Error('Search service temporarily unavailable - please try again later')
    }
  }
}

/**
 * Extract domain from URL for source attribution
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return 'Unknown'
  }
}

/**
 * Validate search query before sending to API
 */
export function validateSearchQuery(query: string): { valid: boolean; error?: string } {
  if (!query || typeof query !== 'string') {
    return { valid: false, error: 'Query must be a non-empty string' }
  }

  const trimmed = query.trim()
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Query cannot be empty' }
  }

  if (trimmed.length > 500) {
    return { valid: false, error: 'Query must be 500 characters or less' }
  }

  if (trimmed.length < 2) {
    return { valid: false, error: 'Query must be at least 2 characters long' }
  }

  // Check for potentially harmful content
  const harmfulPatterns = [
    /<script/i,
    /javascript:/i,
    /data:text\/html/i,
    /vbscript:/i
  ]

  if (harmfulPatterns.some(pattern => pattern.test(trimmed))) {
    return { valid: false, error: 'Query contains invalid characters' }
  }

  return { valid: true }
}

/**
 * Rate limit check for API calls (additional layer beyond worker rate limiting)
 */
export function shouldThrottleAPI(lastCallTime: number, minInterval: number = 100): boolean {
  return Date.now() - lastCallTime < minInterval
} 
 