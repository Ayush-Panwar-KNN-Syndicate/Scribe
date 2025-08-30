# Test Search Worker

A simplified Cloudflare Worker for testing cache functionality without CORS restrictions or rate limiting.

## Features

- 🚫 **No CORS restrictions** - accepts requests from any origin
- 🚫 **No rate limiting** - unlimited requests for testing
- ✅ **Redis caching** - full cache testing capabilities
- ✅ **Mock data support** - works without Reddit API
- ✅ **Debug mode** - detailed logging and information
- ✅ **Multiple endpoints** - comprehensive testing options

## Quick Start

### 1. Install Dependencies

```bash
cd tools/test-search-worker
npm install
```

### 2. Configure Secrets

```bash
# Set your Redis credentials
wrangler secret put UPSTASH_REDIS_REST_URL --env test
wrangler secret put UPSTASH_REDIS_REST_TOKEN --env test

# Optional: Set Reddit credentials (will use mock data if not set)
wrangler secret put REDDIT_CLIENT_ID --env test
wrangler secret put REDDIT_CLIENT_SECRET --env test
```

### 3. Deploy

```bash
# Deploy to test environment
npm run deploy

# Or run locally for development
npm run dev
```

### 4. Test Cache

```bash
# Run comprehensive cache tests
node test-cache.js
```

## Endpoints

### Search Endpoints

#### `GET /?q=query`
Basic search with caching
```bash
curl "https://test-search-worker.your-subdomain.workers.dev/?q=javascript&limit=5"
```

#### `GET /cache-test?q=query`
Detailed cache testing with debug info
```bash
curl "https://test-search-worker.your-subdomain.workers.dev/cache-test?q=javascript&limit=5"
```

**Parameters:**
- `q` - Search query (required)
- `limit` - Number of results (1-25, default: 10)
- `refresh` - Force refresh cache (`true`/`false`)
- `mock` - Use mock data instead of Reddit API (`true`/`false`)

### Cache Management

#### `GET /cache-status`
View current cache statistics
```bash
curl "https://test-search-worker.your-subdomain.workers.dev/cache-status"
```

#### `POST /cache-clear`
Clear all cached data
```bash
curl -X POST "https://test-search-worker.your-subdomain.workers.dev/cache-clear"
```

### Utility

#### `GET /health`
Health check and endpoint listing
```bash
curl "https://test-search-worker.your-subdomain.workers.dev/health"
```

## Testing Cache Functionality

### Manual Testing

1. **Test Cache Miss (first request):**
   ```bash
   curl "https://your-worker.workers.dev/cache-test?q=test"
   # Should return: "cache_status": "MISS"
   ```

2. **Test Cache Hit (second request):**
   ```bash
   curl "https://your-worker.workers.dev/cache-test?q=test"
   # Should return: "cache_status": "HIT"
   ```

3. **Test Force Refresh:**
   ```bash
   curl "https://your-worker.workers.dev/cache-test?q=test&refresh=true"
   # Should return: "cache_status": "MISS" (bypassed cache)
   ```

4. **View Cache Status:**
   ```bash
   curl "https://your-worker.workers.dev/cache-status"
   # Shows total keys and Redis connection status
   ```

### Automated Testing

Run the comprehensive test script:

```bash
node test-cache.js
```

This will test:
- ✅ Worker health and availability
- ✅ Cache status and Redis connection
- ✅ Cache clearing functionality
- ✅ Cache hit/miss behavior
- ✅ Force refresh functionality
- ✅ Mock data mode
- ✅ Performance improvements from caching

## Response Format

All search endpoints return:

```json
{
  "results": [
    {
      "title": "Result Title",
      "description": "Result description...",
      "url": "https://reddit.com/...",
      "score": 42,
      "subreddit": "programming",
      "author": "username",
      "created": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 10,
  "cache_status": "HIT",
  "timestamp": "2024-01-01T12:00:00Z",
  "query_normalized": "test_search:normalized_query",
  "debug": {
    // Debug information (in debug mode)
  }
}
```

## Cache Configuration

- **TTL**: 5 minutes (300 seconds) for testing
- **Key Format**: `test_search:normalized_query`
- **Storage**: Upstash Redis
- **Compression**: JSON serialization

## Debug Mode

Debug mode is enabled by default in the test environment and provides:

- Cache hit/miss information
- Query normalization details
- Data source information (Reddit API vs Mock)
- Redis connection status
- Performance metrics
- Error details

## Troubleshooting

### Common Issues

1. **"Redis connection failed"**
   - Check `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` secrets
   - Verify Redis instance is active in Upstash dashboard

2. **"Missing query parameter"**
   - Add `?q=your_search_term` to the URL

3. **Mock data instead of Reddit results**
   - Set `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` secrets
   - Or use `?mock=true` parameter intentionally

### Debug Commands

```bash
# Check worker logs
npm run tail

# Test locally
npm run dev

# Check secrets
wrangler secret list --env test

# Test Redis connection manually
curl "https://your-worker.workers.dev/cache-status"
```

## Configuration

### Environment Variables

Set via `wrangler secret put`:

- `UPSTASH_REDIS_REST_URL` - Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN` - Redis authentication token
- `REDDIT_CLIENT_ID` - Reddit OAuth client ID (optional)
- `REDDIT_CLIENT_SECRET` - Reddit OAuth client secret (optional)

### Wrangler Configuration

The `wrangler.toml` file configures:
- Test environment deployment
- Route patterns (update for your domain)
- Debug mode enablement
- Compatibility settings

## Differences from Production Worker

This test worker differs from the production version:

- ❌ **No CORS restrictions** (accepts all origins)
- ❌ **No rate limiting** (unlimited requests)
- ✅ **Enhanced debugging** (detailed logs and info)
- ✅ **Mock data support** (works without Reddit API)
- ✅ **Additional endpoints** (cache management, health checks)
- ✅ **Shorter TTL** (5 minutes vs 30+ minutes)

This makes it perfect for development and testing, but should never be used in production!





