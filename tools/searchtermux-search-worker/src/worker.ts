/// <reference types="@cloudflare/workers-types" />

import { searchRedditAPI } from './lib/reddit-client'
import { Redis } from '@upstash/redis'

export interface Env {
  // Reddit API credentials
  REDDIT_CLIENT_ID: string
  REDDIT_CLIENT_SECRET: string
  
  // Redis cache credentials
  UPSTASH_REDIS_REST_URL: string
  UPSTASH_REDIS_REST_TOKEN: string
  
  // Security
  ALLOWED_ORIGINS: string
  RATE_LIMIT_KV: KVNamespace
  ENVIRONMENT?: string
}

interface SearchResult {
  title: string
  description: string
  url: string
  score: number
  subreddit: string
  author: string
  created: string
}

interface SearchResponse {
  results: SearchResult[]
  total: number
  cache_status: 'HIT' | 'MISS' | 'ERROR'
  timestamp: string
  query_normalized: string
  cache_metadata?: {
    hit_count?: number
    last_accessed?: string
    ttl_used?: number
    query_similarity?: number
  }
}

interface CacheOptions {
  limit: number
  sort?: string
  timeframe?: string
  subreddits?: string[]
}

// AGGRESSIVE CACHE SYSTEM FOR 90%+ HIT RATE (Based on cache-optimizer.ts)
class AdvancedCacheManager {
  private redis: any;
  private stats = { hits: 0, misses: 0, totalRequests: 0, hitRate: 0 };
  
  constructor(redis: any) {
    this.redis = redis;
  }

  // AGGRESSIVE query normalization for 90%+ hit rates (from cache-optimizer.ts)
  normalizeQuery(query: string): string {
    const STOP_WORDS = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'of', 'with', 'by', 'from',
      'to', 'how', 'what', 'why', 'when', 'where', 'who', 'which', 'that', 'this'
      // More aggressive stop word removal for better grouping
    ]);

    return query
      .toLowerCase() // Convert to lowercase
      .trim() // Remove leading/trailing spaces
      .replace(/[^\w\s]/g, ' ') // Remove ALL punctuation (KEY FIX!)
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .split(' ') // Split into words
      .filter(word => word.length > 0) // Remove empty strings
      .filter(word => !STOP_WORDS.has(word)) // Remove stop words
      .filter(word => word.length > 1) // Remove single characters
      .sort() // Sort alphabetically for consistent ordering (KEY FOR HIGH HIT RATE!)
      .join(' '); // Join back into string
  }

  // Stable options hash (from cache-optimizer.ts) - fixes cache miss bugs
  hashOptions(options: CacheOptions): string {
    if (!options || Object.keys(options).length === 0) return 'default';
    
    // Sort keys for consistent hashing (fixes JSON.stringify order issue)
    const sortedKeys = Object.keys(options).sort();
    const stableString = sortedKeys.map(key => `${key}:${options[key as keyof CacheOptions]}`).join('|');
    return this.hashCode(stableString);
  }

  // Simple hash function for cache keys (from cache-optimizer.ts)
  private hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Generate cache key with normalization (from cache-optimizer.ts)
  generateCacheKey(query: string, options: CacheOptions): string {
    const normalizedQuery = this.normalizeQuery(query);
    const optionsHash = this.hashOptions(options);
    return `search:${normalizedQuery}:${optionsHash}`;
  }

  // Smart TTL based on result count (from cache-optimizer.ts)
  calculateSmartTTL(query: string, resultCount: number): number {
    const defaultTTL = 3600; // 1 hour default
    const popularQueryTTL = 21600; // 6 hours for popular queries
    
    // Longer TTL for queries that return many results (likely popular)
    if (resultCount > 5) {
      return popularQueryTTL;
    }

    // Shorter TTL for queries with few results (likely specific/timely)
    if (resultCount <= 2) {
      return Math.floor(defaultTTL * 0.5); // 30 minutes
    }

    return defaultTTL; // 1 hour for medium results
  }

  // ULTRA-OPTIMIZED: Minimal cache GET for <100ms performance
  async get(cacheKey: string): Promise<SearchResponse | null> {
    try {
      // Single Redis operation, no analytics, no metadata updates
      const cached = await this.redis.get(cacheKey);
      
      if (cached === null) {
        return null;
      }

      // Direct return without additional processing
      return cached as SearchResponse;
    } catch (error) {
      return null;
    }
  }

  // OPTIMIZED: Fast hit rate calculation
  private updateHitRate(): void {
    this.stats.hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests) * 100 
      : 0;
    // Removed logging for performance
  }

  // ULTRA-OPTIMIZED: Minimal cache SET for maximum speed
  async set(cacheKey: string, data: SearchResponse, query: string, resultCount: number): Promise<void> {
    try {
      const smartTTL = this.calculateSmartTTL(query, resultCount);
      
      // ULTRA-MINIMAL: Store only essential data
      const minimalData = {
        results: data.results,
        total: data.total,
        cache_status: data.cache_status,
        timestamp: data.timestamp,
        query_normalized: data.query_normalized
      };
      
      // Single Redis operation, no verification, no analytics
      await this.redis.setex(cacheKey, smartTTL, JSON.stringify(minimalData));
      
    } catch (error) {
      // Silent fail to not impact performance
    }
  }

  // Removed unused methods for performance

  // Get cache statistics (from cache-optimizer.ts)
  getStats(): any {
    return { ...this.stats };
  }

  // Simplified analytics for performance
  getSimpleStats(): any {
    return {
      hitRate: this.stats.hitRate.toFixed(1),
      hits: this.stats.hits,
      misses: this.stats.misses,
      total: this.stats.totalRequests
    };
  }
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const startTime = Date.now()

    // CORS headers for all responses (TESTING: Allow all origins)
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      })
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ 
        error: 'Method not allowed', 
        message: 'Only POST requests are accepted' 
      }), { 
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    }

    try {
      // Parse request body
      let body: any
      try {
        body = await request.json()
      } catch {
        return new Response(JSON.stringify({ 
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON'
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        })
      }

      const { query, options = {} } = body

      // Validate query
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return new Response(JSON.stringify({ 
          error: 'Invalid query',
          message: 'Query parameter is required and must be a non-empty string'
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        })
      }

      if (query.length > 500) {
        return new Response(JSON.stringify({ 
          error: 'Query too long',
          message: 'Query must be 500 characters or less'
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        })
      }

      // Extract and normalize options
      const cacheOptions: CacheOptions = {
        limit: Math.min(options.limit || 10, 25),
        sort: options.sort || 'relevance',
        timeframe: options.timeframe || 'all',
        subreddits: options.subreddits || []
      }
      
      // OPTIMIZED: Fast cache initialization
      const redis = new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      })

      const advancedCache = new AdvancedCacheManager(redis)
      const cacheKey = advancedCache.generateCacheKey(query.trim(), cacheOptions)
      
      let cacheStatus: 'HIT' | 'MISS' | 'ERROR' = 'MISS'
      let cachedData: SearchResponse | null = null
      let results: SearchResult[] = []

              // OPTIMIZED: Fast cache lookup
        try {
          cachedData = await advancedCache.get(cacheKey)
          
          if (cachedData) {
            cacheStatus = 'HIT'
            results = cachedData.results
          }
        } catch (error) {
          cacheStatus = 'ERROR'
        }

            // OPTIMIZED: Fast API fetch on cache miss
      if (!cachedData) {
        try {
          const searchResponse = await searchRedditAPI(query.trim(), cacheOptions, {
            clientId: env.REDDIT_CLIENT_ID,
            clientSecret: env.REDDIT_CLIENT_SECRET
          })
          
          // Map Reddit API results to our SearchResult format
          results = searchResponse.results.map(result => ({
            title: result.title,
            description: result.description || result.snippet || '',
            url: result.url,
            score: 0, // Reddit API doesn't provide score in our format
            subreddit: result.source || 'unknown',
            author: 'unknown', // Reddit API doesn't provide author in our format
            created: result.timestamp || new Date().toISOString()
          }))

          // Minimal response data for cache
          const responseData: SearchResponse = {
            results,
            total: results.length,
            cache_status: cacheStatus,
            timestamp: new Date().toISOString(),
            query_normalized: cacheKey
          }

          // FIXED: Cache storage must be blocking to ensure data is saved
          try {
            await advancedCache.set(cacheKey, responseData, query.trim(), results.length);
          } catch (cacheError) {
            console.error('Cache storage failed:', cacheError);
            // Continue with response even if cache fails
          }
        } catch (error) {
          return new Response(JSON.stringify({
            error: 'Search failed',
            message: 'Search service temporarily unavailable',
            cache_status: cacheStatus
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          })
        }
      }

      const processingTime = Date.now() - startTime

      // ULTRA-OPTIMIZED: Minimal response for maximum speed
      const response = {
        results,
        query: query.trim(),
        totalResults: results.length,
          processingTime: `${processingTime}ms`,
        cached: cacheStatus === 'HIT'
      }

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Processing-Time': `${processingTime}ms`,
          'X-Cache-Status': cacheStatus,
          'X-Cache-System': 'ultra_optimized_v3',
          'Cache-Control': 'public, max-age=300',
          ...corsHeaders
        }
      })

    } catch (error) {
      console.error('❌ Worker error:', error)
      const processingTime = Date.now() - startTime
      
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: 'Request processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          processingTime: `${processingTime}ms`
        }
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'X-Processing-Time': `${processingTime}ms`,
          ...corsHeaders
        }
      })
    }
  }
} 