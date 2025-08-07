/// <reference types="@cloudflare/workers-types" />

import { validateOrigin } from './lib/security'
import { checkRateLimit } from './lib/rate-limit'
import { searchMewowAPI } from './lib/mewow-client'

export interface Env {
  MEWOW_API_KEY: string
  RATE_LIMIT_KV: KVNamespace
  ALLOWED_ORIGINS: string
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const startTime = Date.now()

    // CORS preflight handling
    if (request.method === 'OPTIONS') {
      const origin = request.headers.get('origin')
      
      // Only allow preflight for valid origins
      if (!validateOrigin(origin, env.ALLOWED_ORIGINS)) {
        return new Response(null, { status: 403 })
      }
      
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin || '',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400', // 24 hours
        }
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
          'Allow': 'POST, OPTIONS'
        }
      })
    }

    // Extract critical info upfront
    const origin = request.headers.get('origin')
    const ip = request.headers.get('cf-connecting-ip') || 
               request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') ||
               'unknown'

    try {
      // 1. Origin validation (0.1ms - synchronous)
      if (!validateOrigin(origin, env.ALLOWED_ORIGINS)) {
        console.log(`Blocked request from unauthorized origin: ${origin}`)
        return new Response(JSON.stringify({ 
          error: 'Unauthorized origin',
          message: 'This domain is not allowed to access the search API'
        }), {
          status: 403,
          headers: { 
            'Content-Type': 'application/json'
            // No CORS headers for unauthorized origins
          }
        })
      }

      // 2. Parse request body early (1-2ms)
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
            'Access-Control-Allow-Origin': origin || ''
          }
        })
      }

      const { query, options = {} } = body

      // 3. Quick query validation (0.1ms)
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return new Response(JSON.stringify({ 
          error: 'Invalid query',
          message: 'Query parameter is required and must be a non-empty string'
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin || ''
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
            'Access-Control-Allow-Origin': origin || ''
          }
        })
      }

      // 4. Parallel execution: Rate limiting + API call
      const [rateLimitResult, results] = await Promise.all([
        checkRateLimit(ip, env.RATE_LIMIT_KV),
        searchMewowAPI(query.trim(), options, env.MEWOW_API_KEY)
      ])

      // 5. Check rate limit result (after API call to maximize parallelism)
      if (!rateLimitResult.success) {
        console.log(`Rate limit exceeded for IP: ${ip}`)
        return new Response(JSON.stringify({
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again in ${rateLimitResult.retryAfter} seconds`,
          retryAfter: rateLimitResult.retryAfter
        }), {
          status: 429,
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': rateLimitResult.retryAfter.toString(),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            'Access-Control-Allow-Origin': origin || ''
          }
        })
      }

      const processingTime = Date.now() - startTime

      console.log(`Search completed: "${query.slice(0, 50)}${query.length > 50 ? '...' : ''}" from IP: ${ip} in ${processingTime}ms`)

      // 6. Return results with minimal overhead
      return new Response(JSON.stringify({
        ...results,
        meta: {
          processingTime: `${processingTime}ms`,
          rateLimit: {
            remaining: rateLimitResult.remaining,
            reset: rateLimitResult.reset,
            limit: 10
          }
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin || '',
          'Access-Control-Allow-Credentials': 'true',
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          'X-Processing-Time': `${processingTime}ms`,
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        }
      })

    } catch (error: any) {
      const processingTime = Date.now() - startTime
      console.error(`Worker error after ${processingTime}ms:`, error)
      
      // Determine if it's a client error or server error
      const isClientError = error.message?.includes('Invalid') || 
                           error.message?.includes('Bad Request') ||
                           error.status === 400
      
      const statusCode = isClientError ? 400 : 500
      const errorMessage = isClientError ? error.message : 'Search service temporarily unavailable'
      
      return new Response(JSON.stringify({
        error: 'Search failed',
        message: errorMessage
      }), {
        status: statusCode,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin || ''
        }
      })
    }
  }
} 
 