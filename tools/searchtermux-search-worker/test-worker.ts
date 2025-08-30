/**
 * Test version of the worker with CORS and rate limiting disabled
 * DO NOT USE IN PRODUCTION - FOR TESTING ONLY
 */

import { searchRedditAPI } from './src/lib/reddit-client'
import { createCache, generateCacheKey } from './src/lib/cache-optimizer'

export interface Env {
  REDDIT_CLIENT_ID: string
  REDDIT_CLIENT_SECRET: string
  UPSTASH_REDIS_REST_URL: string
  UPSTASH_REDIS_REST_TOKEN: string
  RATE_LIMIT_KV: KVNamespace
  ALLOWED_ORIGINS: string
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const startTime = Date.now()

    // TESTING: Allow all CORS requests
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

    // Allow both GET and POST for testing
    if (request.method !== 'POST' && request.method !== 'GET') {
      return new Response(JSON.stringify({ 
        error: 'Method not allowed', 
        message: 'Only GET and POST requests are accepted for testing' 
      }), { 
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    }

    try {
      let query: string
      let options: any = {}

      // Parse request based on method
      if (request.method === 'GET') {
        const url = new URL(request.url)
        query = url.searchParams.get('q') || ''
        const limit = url.searchParams.get('limit')
        if (limit) options.limit = parseInt(limit)
      } else {
        // POST request
        try {
          const body = await request.json()
          query = body.query || ''
          options = body.options || {}
        } catch {
          return new Response(JSON.stringify({ 
            error: 'Invalid JSON',
            message: 'Request body must be valid JSON for POST requests'
          }), {
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          })
        }
      }

      // Validate query
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return new Response(JSON.stringify({ 
          error: 'Invalid query',
          message: 'Query parameter is required and must be a non-empty string',
          usage: {
            GET: '/?q=your+search+query&limit=10',
            POST: '{"query": "your search query", "options": {"limit": 10}}'
          }
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

      // Initialize cache and check for cached results
      const cache = createCache(env)
      const cacheKey = generateCacheKey(query.trim(), options)
      
      console.log(`🔍 Testing cache for query: "${query}" with key: ${cacheKey}`)
      
      // Try cache first
      const cachedResult = await cache.get(cacheKey)
      
      if (cachedResult) {
        // Cache hit - return immediately (NO RATE LIMITING FOR TESTING)
        const processingTime = Date.now() - startTime
        console.log(`✅ Cache HIT for query: "${query.slice(0, 50)}..." in ${processingTime}ms`)
        
        return new Response(JSON.stringify({
          ...cachedResult,
          meta: {
            processingTime: `${processingTime}ms`,
            cached: true,
            cacheKey: cacheKey,
            testMode: true
          }
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Processing-Time': `${processingTime}ms`,
            'X-Cache-Status': 'HIT',
            'X-Cache-Key': cacheKey,
            'X-Test-Mode': 'true',
            'Cache-Control': 'public, max-age=300',
            ...corsHeaders
          }
        })
      }

      // Cache miss - fetch from Reddit API (NO RATE LIMITING FOR TESTING)
      console.log(`❌ Cache MISS for query: "${query}" - fetching from Reddit API`)
      
      const results = await searchRedditAPI(query.trim(), options, {
        clientId: env.REDDIT_CLIENT_ID,
        clientSecret: env.REDDIT_CLIENT_SECRET
      })

      // Store result in cache (background operation)
      cache.set(cacheKey, results).catch(error => 
        console.error('Background cache set failed:', error)
      )

      const processingTime = Date.now() - startTime
      console.log(`✅ Reddit API response for query: "${query.slice(0, 50)}..." in ${processingTime}ms`)

      return new Response(JSON.stringify({
        ...results,
        meta: {
          processingTime: `${processingTime}ms`,
          cached: false,
          cacheKey: cacheKey,
          testMode: true
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Processing-Time': `${processingTime}ms`,
          'X-Cache-Status': 'MISS',
          'X-Cache-Key': cacheKey,
          'X-Test-Mode': 'true',
          'Cache-Control': 'public, max-age=300',
          ...corsHeaders
        }
      })

    } catch (error) {
      console.error('Request processing error:', error)
      const processingTime = Date.now() - startTime
      
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: 'Search request failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          processingTime: `${processingTime}ms`,
          testMode: true
        }
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Processing-Time': `${processingTime}ms`,
          'X-Test-Mode': 'true',
          ...corsHeaders
        }
      })
    }
  }
}
















