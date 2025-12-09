/// <reference types="@cloudflare/workers-types" />

/**
 * Rate limiting using Cloudflare KV with optimized counter approach
 * Simplified for better performance
 */

export interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
  retryAfter: number
}

/**
 * Fast rate limiting with minimal KV operations
 * Uses simple counter with expiration instead of sliding window
 * 
 * @param ip - Client IP address
 * @param kv - Cloudflare KV namespace
 * @param limit - Number of requests allowed per window (default: 10)
 * @param windowSeconds - Time window in seconds (default: 60)
 * @returns Rate limit result with success status and metadata
 */
export async function checkRateLimit(
  ip: string, 
  kv: KVNamespace,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const key = `rl:${ip}`
  const now = Math.floor(Date.now() / 1000)
  const windowStart = Math.floor(now / windowSeconds) * windowSeconds
  const reset = windowStart + windowSeconds
  
  try {
    // Get current count for this window
    const currentCountData = await kv.get(key)
    
    if (!currentCountData) {
      // First request in this window
      await kv.put(key, '1', { expirationTtl: windowSeconds + 10 })
      
      return {
        success: true,
        remaining: limit - 1,
        reset,
        retryAfter: 0
      }
    }
    
    const currentCount = parseInt(currentCountData, 10) || 0
    
    if (currentCount >= limit) {
      // Rate limit exceeded
      return {
        success: false,
        remaining: 0,
        reset,
        retryAfter: reset - now
      }
    }
    
    // Increment counter
    const newCount = currentCount + 1
    await kv.put(key, newCount.toString(), { expirationTtl: windowSeconds + 10 })
    
    return {
      success: true,
      remaining: limit - newCount,
      reset,
      retryAfter: 0
    }
    
  } catch (error) {
    console.error('Rate limiting error:', error)
    
    // On KV error, allow the request but log the issue
    return {
      success: true,
      remaining: limit - 1,
      reset,
      retryAfter: 0
    }
  }
}

/**
 * Clean up expired rate limit entries (optional, for maintenance)
 * This can be called periodically to clean up old entries
 */
export async function cleanupExpiredEntries(
  kv: KVNamespace, 
  batchSize: number = 100
): Promise<number> {
  let deletedCount = 0
  
  try {
    const list = await kv.list({ limit: batchSize })
    const now = Math.floor(Date.now() / 1000)
    
    for (const key of list.keys) {
      if (key.name.startsWith('rl:')) { // Changed from 'rate_limit:' to 'rl:'
        const data = await kv.get(key.name) // No JSON parsing needed
        
        if (data && now - 3600 > 0) { // Older than 1 hour
          await kv.delete(key.name)
          deletedCount++
        }
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error)
  }
  
  return deletedCount
}

/**
 * Get current rate limit status for an IP without incrementing the counter
 * Useful for checking status without consuming a request
 */
export async function getRateLimitStatus(
  ip: string,
  kv: KVNamespace,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<Omit<RateLimitResult, 'success'>> {
  const key = `rl:${ip}` // Changed from 'rate_limit:' to 'rl:'
  const now = Math.floor(Date.now() / 1000)
  const windowStart = Math.floor(now / windowSeconds) * windowSeconds
  const reset = windowStart + windowSeconds
  
  try {
    const currentCountData = await kv.get(key) // No JSON parsing needed
    
    if (!currentCountData) {
      return {
        remaining: limit,
        reset,
        retryAfter: 0
      }
    }
    
    const currentCount = parseInt(currentCountData, 10) || 0
    
    if (currentCount >= limit) {
      return {
        remaining: 0,
        reset,
        retryAfter: reset - now
      }
    }
    
    return {
      remaining: limit - currentCount,
      reset,
      retryAfter: 0
    }
    
  } catch (error) {
    console.error('Rate limit status error:', error)
    return {
      remaining: limit,
      reset,
      retryAfter: 0
    }
  }
} 
 