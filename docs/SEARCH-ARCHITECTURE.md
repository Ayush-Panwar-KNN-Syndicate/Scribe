# Search Architecture - Reddit API Integration

## Overview

The search system is built as a standalone Cloudflare Worker that leverages Reddit's API for content discovery, with Redis caching for optimal performance.

## Architecture Components

### 1. Cloudflare Worker (`tools/searchtermux-search-worker/`)
- **Location**: Edge locations worldwide
- **Purpose**: Handle search requests with minimal latency
- **Features**: Rate limiting, caching, response optimization

### 2. Reddit API Integration
- **OAuth Authentication**: Single Reddit application
- **Rate Limits**: 100 requests per minute
- **Search Endpoint**: `/api/search.json`
- **Response Format**: Standardized JSON structure

### 3. Redis Caching (Upstash)
- **Cache Strategy**: Query normalization with smart TTL
- **Hit Rate Optimization**: 90%+ cache hit rate target
- **Compression**: Gzip for large responses
- **Geographic Distribution**: Global Redis instances

## Performance Metrics

- **Response Time**: <100ms (cached), <500ms (uncached)
- **Scalability**: 1M+ searches per day
- **Cache Hit Rate**: 90%+ target
- **Availability**: 99.9% uptime

## Configuration

### Environment Variables

```bash
# Reddit API
REDDIT_CLIENT_ID="your_reddit_client_id"
REDDIT_CLIENT_SECRET="your_reddit_client_secret"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_redis_token"

# Security
ALLOWED_ORIGINS="https://search.termuxtools.com,https://yoursite.com"
```

### Deployment

```bash
cd tools/searchtermux-search-worker
wrangler deploy
```

## API Usage

### Request Format

```http
GET https://searchtermux-worker.your-subdomain.workers.dev/?q=search+term&limit=10
```

### Response Format

```json
{
  "results": [
    {
      "title": "Article Title",
      "description": "Article description...",
      "url": "https://reddit.com/r/subreddit/comments/...",
      "score": 95,
      "subreddit": "technology",
      "author": "username",
      "created": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 42,
  "cache_status": "HIT"
}
```

## Cache Strategy

### Query Normalization
- Lowercase conversion
- Special character removal
- Whitespace normalization
- Stop word filtering

### TTL Strategy
- **Popular queries**: 1 hour
- **Regular queries**: 30 minutes
- **Error responses**: 5 minutes

### Compression
- Gzip compression for responses >1KB
- Base64 encoding for Redis storage

## Monitoring

### Key Metrics
- Cache hit rate
- Response times
- Error rates
- Reddit API usage

### Alerting
- Cache hit rate drops below 85%
- Response time exceeds 1 second
- Error rate exceeds 5%

## Troubleshooting

### Common Issues

1. **Cache Misses**
   - Check Redis connection
   - Verify Upstash credentials
   - Monitor Redis memory usage

2. **Slow Responses**
   - Check Reddit API status
   - Verify network connectivity
   - Monitor worker performance

3. **Rate Limiting**
   - Check Reddit API usage
   - Implement request queuing
   - Consider multiple OAuth clients

### Debug Commands

```bash
# Test Redis connection
curl -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN" \
     "$UPSTASH_REDIS_REST_URL/ping"

# Test Reddit API
curl -H "User-Agent: YourApp/1.0" \
     "https://www.reddit.com/api/search.json?q=test&limit=1"

# Test Worker
curl "https://your-worker.workers.dev/?q=test"
```

## Cost Analysis

### Reddit API
- **Free Tier**: 100 requests/minute
- **Cost**: $0 (within free limits)
- **Scaling**: Multiple OAuth clients if needed

### Upstash Redis
- **Free Tier**: 10K requests/day
- **Paid**: $0.20 per 100K requests
- **Monthly Cost**: ~$60 for 1M searches

### Cloudflare Workers
- **Free Tier**: 100K requests/day
- **Paid**: $0.50 per million requests
- **Monthly Cost**: ~$15 for 1M searches

**Total Monthly Cost**: ~$75 for 1M searches/day




