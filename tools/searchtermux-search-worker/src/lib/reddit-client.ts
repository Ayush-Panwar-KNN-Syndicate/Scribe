/**
 * Reddit Search API Client
 * Handles communication with Reddit API for search functionality
 * Maintains compatibility with existing SearchTermux interface
 */

// Re-export interfaces for compatibility
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

interface RedditPost {
  title: string
  selftext: string
  url: string
  permalink: string
  subreddit: string
  author: string
  created_utc: number
  score: number
  num_comments: number
  id: string
}

interface RedditSearchResponse {
  data: {
    children: Array<{
      data: RedditPost
    }>
    after?: string
    before?: string
  }
}

interface RedditClientConfig {
  clientId: string
  clientSecret: string
  userAgent: string
}

/**
 * ULTRA-OPTIMIZED: Fast Reddit API client with global token caching
 */
class RedditAPIClient {
  private config: RedditClientConfig
  private accessToken: string | null = null
  private tokenExpiry: number = 0
  
  // CRITICAL: Global token cache shared across all instances
  private static globalToken: string | null = null
  private static globalTokenExpiry: number = 0

  constructor(config: RedditClientConfig) {
    this.config = config
  }

  /**
   * Get OAuth2 access token for Reddit API with Cloudflare Cache API
   */
  private async getAccessToken(): Promise<string> {
    // ULTRA-OPTIMIZED: Check global token cache first
    if (RedditAPIClient.globalToken && Date.now() < RedditAPIClient.globalTokenExpiry - 60000) {
      return RedditAPIClient.globalToken
    }
    
    // Fallback to instance token
    if (this.accessToken && Date.now() < this.tokenExpiry - 60000) {
      return this.accessToken
    }

    // Try Cloudflare Cache API for OAuth token
    const cacheKey = `https://cache.reddit-oauth/${this.config.clientId}`
    const cacheRequest = new Request(cacheKey)
    const cache = await caches.open('reddit-api')
    
    let cachedTokenResponse = await cache.match(cacheRequest)
    if (cachedTokenResponse) {
      const tokenData = await cachedTokenResponse.json() as { access_token: string; expires_at: number }
      
      // Check if token is still valid (with 1-minute buffer)
      if (Date.now() < tokenData.expires_at - 60000) {
        console.log('🎯 Cloudflare Cache API HIT for OAuth token')
        
        // Update global cache
        RedditAPIClient.globalToken = tokenData.access_token
        RedditAPIClient.globalTokenExpiry = tokenData.expires_at
        this.accessToken = tokenData.access_token
        this.tokenExpiry = tokenData.expires_at
        
        return tokenData.access_token
      }
    }

    const auth = btoa(`${this.config.clientId}:${this.config.clientSecret}`)
    
    // ULTRA-OPTIMIZED: Aggressive OAuth timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': this.config.userAgent
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials'
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Reddit OAuth failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json() as { access_token: string; expires_in: number }
    const expiresAt = Date.now() + (data.expires_in * 1000)
    
    // CRITICAL: Store in global cache for all instances
    RedditAPIClient.globalToken = data.access_token
    RedditAPIClient.globalTokenExpiry = expiresAt
    
    // Also store locally as fallback
    this.accessToken = data.access_token
    this.tokenExpiry = expiresAt
    
    // Store in Cloudflare Cache API for 55 minutes
    const cacheTokenData = {
      access_token: data.access_token,
      expires_at: expiresAt
    }
    
    const cacheResponse = new Response(JSON.stringify(cacheTokenData), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3300' // 55 minutes
      }
    })
    
    await cache.put(cacheRequest, cacheResponse)
    console.log('💾 Stored OAuth token in Cloudflare Cache API')
    
    return this.accessToken
  }

  /**
   * Search Reddit posts with Cloudflare Cache API
   */
  async search(query: string, options: { limit?: number; sort?: string } = {}): Promise<RedditPost[]> {
    const token = await this.getAccessToken()
    const limit = Math.min(options.limit || 10, 25) // OPTIMIZED: Reduced for speed
    
    // Build search URL with parameters
    const searchParams = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      sort: options.sort || 'relevance',
      type: 'link',
      restrict_sr: 'false'
    })

    const searchUrl = `https://oauth.reddit.com/search?${searchParams}`
    
    // Create cache key for Cloudflare Cache API
    const cacheKey = `https://cache.reddit-search/${encodeURIComponent(query)}/${limit}/${options.sort || 'relevance'}`
    const cacheRequest = new Request(cacheKey)
    
    // Try to get from Cloudflare Cache API first
    const cache = await caches.open('reddit-api')
    let cachedResponse = await cache.match(cacheRequest)
    
    if (cachedResponse) {
      console.log('🎯 Cloudflare Cache API HIT for Reddit search')
      const data = await cachedResponse.json() as RedditSearchResponse
      return data.data.children.map(child => child.data)
    }

    // ULTRA-OPTIMIZED: Aggressive timeout for faster failures
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    try {
      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': this.config.userAgent
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Reddit API rate limit exceeded')
        }
        throw new Error(`Reddit API error: ${response.status}`)
      }

      const data = await response.json() as RedditSearchResponse
      
      // Store in Cloudflare Cache API for 5 minutes
      const cacheResponse = new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // 5 minutes
        }
      })
      
      // Store in cache (non-blocking)
      await cache.put(cacheRequest, cacheResponse.clone())
      console.log('💾 Stored Reddit search in Cloudflare Cache API')
      
      return data.data.children.map(child => child.data)
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Search using Reddit API with the same interface as Mewow
 * 
 * @param query - Search query string
 * @param options - Search configuration options
 * @param credentials - Reddit API credentials
 * @returns Promise resolving to search results
 */
export async function searchRedditAPI(
  query: string,
  options: SearchOptions = {},
  credentials: { clientId: string; clientSecret: string }
): Promise<SearchResponse> {
  const startTime = Date.now()

  try {
    const client = new RedditAPIClient({
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
      userAgent: 'SearchTermux-Search-Worker/1.0 (by /u/searchtermux)'
    })

    const posts = await client.search(query, {
      limit: options.limit || 10,
      sort: 'relevance'
    })

    const processingTime = Date.now() - startTime

    // Transform Reddit posts to SearchResult format
    const results: SearchResult[] = posts.map(post => ({
      title: post.title,
      url: post.url.startsWith('http') ? post.url : `https://reddit.com${post.permalink}`,
      snippet: post.selftext ? post.selftext.slice(0, 200) + '...' : '',
      description: post.selftext || `Posted in r/${post.subreddit} by u/${post.author}`,
      source: `reddit.com/r/${post.subreddit}`,
      timestamp: new Date(post.created_utc * 1000).toISOString()
    }))

    // Extract unique subreddit sources
    const sources = Array.from(new Set(posts.map(post => `reddit.com/r/${post.subreddit}`)))

    return {
      results,
      query,
      totalResults: results.length,
      processingTime: `${processingTime}ms`,
      sources
    }

  } catch (error: any) {
    console.error('Reddit API error:', error)
    
    // Handle different types of errors
    if (error.message.includes('rate limit')) {
      throw new Error('Search rate limit exceeded - please try again later')
    } else if (error.message.includes('OAuth')) {
      throw new Error('Search service authentication error - please contact support')
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to search service - please check your internet connection')
    } else {
      // Re-throw with a generic message for security
      throw new Error('Search service temporarily unavailable - please try again later')
    }
  }
}

/**
 * Validate search query before sending to API
 * (Reused from mewow-client for consistency)
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
 * Rate limit check for API calls
 */
export function shouldThrottleAPI(lastCallTime: number, minInterval: number = 600): boolean {
  // Reddit free tier: 100 req/min = 600ms minimum interval
  return Date.now() - lastCallTime < minInterval
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
