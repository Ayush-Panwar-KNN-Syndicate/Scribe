/**
 * Cache Optimization Module
 * Implements smart caching strategies for maximum cache hit rate
 */

import { Redis } from '@upstash/redis'

export interface CacheConfig {
  redisUrl: string
  redisToken: string
  defaultTTL: number // in seconds
  popularQueryTTL: number // in seconds
  compressionEnabled: boolean
}

export interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  totalRequests: number
}

/**
 * Smart query normalization for better cache hit rates
 */
export function normalizeQuery(query: string): string {
  return query
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing spaces
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .split(' ') // Split into words
    .filter(word => word.length > 0) // Remove empty strings
    .filter(word => !STOP_WORDS.has(word)) // Remove stop words
    .sort() // Sort alphabetically for consistent ordering
    .join(' ') // Join back into string
}

/**
 * Stop words to remove for better cache hit rates
 */
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'between', 'among', 'within', 'without', 'under', 'over',
  'how', 'what', 'where', 'when', 'why', 'which', 'who', 'whom', 'whose',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might'
])

/**
 * Generate cache key with normalization
 */
export function generateCacheKey(query: string, options?: any): string {
  const normalizedQuery = normalizeQuery(query)
  const optionsHash = options ? JSON.stringify(options) : ''
  return `search:${normalizedQuery}:${hashCode(optionsHash)}`
}

/**
 * Simple hash function for cache keys
 */
function hashCode(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Cache manager with smart TTL and compression
 */
export class SmartCache {
  private redis: Redis
  private config: CacheConfig
  private stats: CacheStats = { hits: 0, misses: 0, hitRate: 0, totalRequests: 0 }

  constructor(config: CacheConfig) {
    this.config = config
    this.redis = new Redis({
      url: config.redisUrl,
      token: config.redisToken
    })
  }

  /**
   * Get from cache with automatic decompression
   */
  async get(key: string): Promise<any | null> {
    try {
      console.log(`🔍 Cache GET attempt: ${key}`)
      this.stats.totalRequests++
      
      const cached = await this.redis.get(key)
      console.log(`📦 Redis response:`, cached === null ? 'NULL' : 'DATA FOUND')
      
      if (cached === null) {
        console.log(`📭 Cache MISS: ${key}`)
        this.stats.misses++
        this.updateHitRate()
        return null
      }

      console.log(`🎯 Cache HIT: ${key}`)
      this.stats.hits++
      this.updateHitRate()

      // Decompress if compression was used
      if (this.config.compressionEnabled && typeof cached === 'string') {
        try {
          return JSON.parse(cached)
        } catch {
          return cached
        }
      }

      return cached
    } catch (error) {
      console.error('❌ Cache GET error:', error)
      this.stats.misses++
      this.updateHitRate()
      return null
    }
  }

  /**
   * Set to cache with smart TTL and compression
   */
  async set(key: string, value: any, customTTL?: number): Promise<void> {
    try {
      console.log(`💾 Cache SET attempt: ${key}`)
      const ttl = customTTL || this.determineSmartTTL(key, value)
      console.log(`⏰ TTL: ${ttl} seconds`)
      
      let dataToStore = value
      
      // Compress large objects if enabled
      if (this.config.compressionEnabled && typeof value === 'object') {
        dataToStore = JSON.stringify(value)
        console.log(`🗜️ Data compressed (JSON stringified)`)
      }

      console.log(`📤 Calling Redis SETEX...`)
      const result = await this.redis.setex(key, ttl, dataToStore)
      console.log(`✅ Redis SETEX result:`, result)
      
      // Background: Update query popularity for future TTL decisions
      this.updateQueryPopularity(key).catch(console.error)
      
    } catch (error) {
      console.error('❌ Cache SET error:', error)
      // Don't throw - caching failures shouldn't break the search
    }
  }

  /**
   * Determine smart TTL based on query characteristics
   */
  private determineSmartTTL(key: string, value: any): number {
    // Longer TTL for queries that return many results (likely popular)
    if (value?.results?.length > 5) {
      return this.config.popularQueryTTL
    }

    // Shorter TTL for queries with few results (likely specific/timely)
    if (value?.results?.length <= 2) {
      return Math.floor(this.config.defaultTTL * 0.5)
    }

    return this.config.defaultTTL
  }

  /**
   * Update query popularity counter (for future TTL optimization)
   */
  private async updateQueryPopularity(key: string): Promise<void> {
    try {
      const popularityKey = `popularity:${key}`
      await this.redis.incr(popularityKey)
      await this.redis.expire(popularityKey, 86400) // 24 hours
    } catch (error) {
      // Ignore popularity tracking errors
    }
  }

  /**
   * Update hit rate statistics
   */
  private updateHitRate(): void {
    this.stats.hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests) * 100 
      : 0
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * Warm cache with popular searches (background operation)
   */
  async warmCache(popularQueries: string[]): Promise<void> {
    // This would be called in background to pre-populate cache
    // Implementation depends on your search function
    console.log(`Cache warming initiated for ${popularQueries.length} queries`)
  }

  /**
   * Clean expired entries (background maintenance)
   */
  async cleanExpired(): Promise<void> {
    // Redis handles TTL automatically, but we could implement
    // additional cleanup logic here if needed
  }
}

/**
 * Default cache configuration
 */
export const DEFAULT_CACHE_CONFIG: Partial<CacheConfig> = {
  defaultTTL: 3600, // 1 hour
  popularQueryTTL: 21600, // 6 hours  
  compressionEnabled: true
}

/**
 * Initialize cache with environment variables
 */
export function createCache(env: any): SmartCache {
  // Debug Redis credentials
  console.log('🔍 Cache Debug:', {
    redisUrl: env.UPSTASH_REDIS_REST_URL ? 'SET' : 'MISSING',
    redisToken: env.UPSTASH_REDIS_REST_TOKEN ? 'SET' : 'MISSING'
  })
  
  const config: CacheConfig = {
    redisUrl: env.UPSTASH_REDIS_REST_URL,
    redisToken: env.UPSTASH_REDIS_REST_TOKEN,
    defaultTTL: DEFAULT_CACHE_CONFIG.defaultTTL!,
    popularQueryTTL: DEFAULT_CACHE_CONFIG.popularQueryTTL!,
    compressionEnabled: DEFAULT_CACHE_CONFIG.compressionEnabled!
  }

  return new SmartCache(config)
}
