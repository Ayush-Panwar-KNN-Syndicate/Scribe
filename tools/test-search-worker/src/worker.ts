/**
 * Test Search Worker - Simplified version for cache testing
 * No CORS restrictions, no rate limiting - purely for development testing
 */

import { Redis } from '@upstash/redis/cloudflare';

interface Env {
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  REDDIT_CLIENT_ID: string;
  REDDIT_CLIENT_SECRET: string;
  ENVIRONMENT?: string;
  DEBUG?: string;
}

interface SearchResult {
  title: string;
  description: string;
  url: string;
  score: number;
  subreddit: string;
  author: string;
  created: string;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  cache_status: 'HIT' | 'MISS' | 'ERROR';
  debug?: any;
  timestamp: string;
  query_normalized: string;
}

// Simple cache key generation
function generateCacheKey(query: string): string {
  const normalized = query.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_');
  return `test_search:${normalized}`;
}

// Mock Reddit API call for testing
async function mockRedditSearch(query: string, limit: number = 10): Promise<SearchResult[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
  
  const mockResults: SearchResult[] = [];
  for (let i = 0; i < Math.min(limit, 15); i++) {
    mockResults.push({
      title: `Test Result ${i + 1} for "${query}"`,
      description: `This is a mock search result for testing cache functionality with query: ${query}. Result number ${i + 1}.`,
      url: `https://reddit.com/r/test/comments/mock${i}/${query.replace(/\s/g, '_')}_result_${i + 1}`,
      score: Math.floor(Math.random() * 100) + 1,
      subreddit: ['test', 'programming', 'webdev', 'javascript', 'technology'][i % 5],
      author: `test_user_${i + 1}`,
      created: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString()
    });
  }
  
  return mockResults;
}

// Actual Reddit API call (simplified)
async function searchRedditAPI(query: string, clientId: string, clientSecret: string, limit: number = 10): Promise<SearchResult[]> {
  try {
    // Get Reddit access token
    const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'TestSearchWorker/1.0'
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token request failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json() as any;
    const accessToken = tokenData.access_token;

    // Search Reddit
    const searchUrl = `https://oauth.reddit.com/search?q=${encodeURIComponent(query)}&limit=${limit}&sort=relevance`;
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'TestSearchWorker/1.0'
      }
    });

    if (!searchResponse.ok) {
      throw new Error(`Search request failed: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json() as any;
    const results: SearchResult[] = [];

    for (const post of searchData.data.children) {
      const data = post.data;
      results.push({
        title: data.title,
        description: data.selftext ? data.selftext.substring(0, 200) + '...' : 'No description available',
        url: `https://reddit.com${data.permalink}`,
        score: data.score,
        subreddit: data.subreddit,
        author: data.author,
        created: new Date(data.created_utc * 1000).toISOString()
      });
    }

    return results;
  } catch (error) {
    console.error('Reddit API error:', error);
    // Fallback to mock data for testing
    return mockRedditSearch(query, limit);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const isDebug = env.DEBUG === 'true';
    
    // Handle different endpoints
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        environment: env.ENVIRONMENT || 'test',
        timestamp: new Date().toISOString(),
        endpoints: [
          'GET /?q=query - Search with caching',
          'GET /cache-test?q=query - Test cache functionality',
          'GET /cache-status - View cache statistics',
          'POST /cache-clear - Clear all cache',
          'GET /health - This endpoint'
        ]
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/cache-status') {
      const redis = new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      });

      try {
        const keys = await redis.keys('test_search:*');
        const cacheInfo = {
          total_keys: keys.length,
          keys: keys,
          redis_connected: true,
          timestamp: new Date().toISOString()
        };

        return new Response(JSON.stringify(cacheInfo), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          error: 'Redis connection failed',
          details: isDebug ? (error as Error).message : 'Connection error',
          redis_connected: false,
          timestamp: new Date().toISOString()
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (url.pathname === '/cache-clear' && request.method === 'POST') {
      const redis = new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      });

      try {
        const keys = await redis.keys('test_search:*');
        if (keys.length > 0) {
          await redis.del(...keys);
        }
        
        return new Response(JSON.stringify({
          message: 'Cache cleared successfully',
          keys_deleted: keys.length,
          timestamp: new Date().toISOString()
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          error: 'Cache clear failed',
          details: isDebug ? (error as Error).message : 'Clear error',
          timestamp: new Date().toISOString()
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Handle search requests (both / and /cache-test)
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    const query = url.searchParams.get('q');
    const limitParam = url.searchParams.get('limit');
    const forceRefresh = url.searchParams.get('refresh') === 'true';
    const useMock = url.searchParams.get('mock') === 'true';
    
    if (!query) {
      return new Response(JSON.stringify({
        error: 'Missing query parameter',
        usage: 'GET /?q=your+search+query&limit=10&refresh=false&mock=false',
        endpoints: [
          '/?q=query - Normal search with caching',
          '/cache-test?q=query - Detailed cache testing',
          '/cache-status - View cache info',
          '/cache-clear - Clear cache (POST)',
          '/health - Health check'
        ]
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const limit = Math.min(parseInt(limitParam || '10'), 25);
    const cacheKey = generateCacheKey(query);
    let cacheStatus: 'HIT' | 'MISS' | 'ERROR' = 'MISS';
    let debugInfo: any = {};

    // Initialize Redis
    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });

    let cachedData = null;
    let results: SearchResult[] = [];

    // Try to get from cache first (unless force refresh)
    if (!forceRefresh) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          cachedData = cached as SearchResponse;
          cacheStatus = 'HIT';
          results = cachedData.results;
          
          if (isDebug) {
            debugInfo.cache_hit = true;
            debugInfo.cached_at = cachedData.timestamp;
            debugInfo.cache_key = cacheKey;
          }
        }
      } catch (error) {
        cacheStatus = 'ERROR';
        if (isDebug) {
          debugInfo.cache_error = (error as Error).message;
        }
      }
    }

    // If no cache hit, fetch from API
    if (!cachedData) {
      try {
        if (useMock || !env.REDDIT_CLIENT_ID || !env.REDDIT_CLIENT_SECRET) {
          results = await mockRedditSearch(query, limit);
          if (isDebug) {
            debugInfo.data_source = 'mock';
          }
        } else {
          results = await searchRedditAPI(query, env.REDDIT_CLIENT_ID, env.REDDIT_CLIENT_SECRET, limit);
          if (isDebug) {
            debugInfo.data_source = 'reddit_api';
          }
        }

        // Store in cache with 5 minute TTL for testing
        const responseData: SearchResponse = {
          results,
          total: results.length,
          cache_status: cacheStatus,
          timestamp: new Date().toISOString(),
          query_normalized: cacheKey
        };

        try {
          await redis.setex(cacheKey, 300, JSON.stringify(responseData)); // 5 minutes TTL
          if (isDebug) {
            debugInfo.cached_for_seconds = 300;
            debugInfo.cache_key = cacheKey;
          }
        } catch (cacheError) {
          if (isDebug) {
            debugInfo.cache_store_error = (cacheError as Error).message;
          }
        }
      } catch (error) {
        return new Response(JSON.stringify({
          error: 'Search failed',
          details: isDebug ? (error as Error).message : 'Search error',
          cache_status: cacheStatus,
          timestamp: new Date().toISOString()
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Prepare response
    const response: SearchResponse = {
      results,
      total: results.length,
      cache_status: cacheStatus,
      timestamp: new Date().toISOString(),
      query_normalized: cacheKey
    };

    if (isDebug || url.pathname === '/cache-test') {
      response.debug = {
        ...debugInfo,
        query_original: query,
        limit_requested: limit,
        force_refresh: forceRefresh,
        use_mock: useMock,
        environment: env.ENVIRONMENT,
        redis_url: env.UPSTASH_REDIS_REST_URL ? 'configured' : 'missing',
        reddit_credentials: env.REDDIT_CLIENT_ID ? 'configured' : 'missing'
      };
    }

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache-Status': cacheStatus,
        'X-Environment': env.ENVIRONMENT || 'test',
        'X-Debug-Mode': isDebug ? 'true' : 'false'
      }
    });
  }
};





