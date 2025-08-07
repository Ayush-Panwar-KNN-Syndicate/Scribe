# Search Termux Search Worker

A high-performance Cloudflare Worker that provides secure, rate-limited access to the Mewow Search API for the Search Termux application.

## 🚀 Features

- **Secure API Proxy**: Protects your Mewow API key from client-side exposure
- **Rate Limiting**: 10 requests per minute per IP with KV-based storage
- **CORS Support**: Configurable origin validation for security
- **Response Caching**: Optional caching for improved performance
- **Error Handling**: Comprehensive error responses and logging
- **TypeScript**: Full type safety and excellent developer experience

## 📦 Installation

```bash
# Clone and navigate to worker directory
cd searchtermux-search-worker

# Install dependencies
npm install

# Configure wrangler
wrangler login
```

## ⚙️ Configuration

### Environment Variables

Update `wrangler.toml` with your configuration:

```toml
name = "searchtermux-search-worker"
main = "dist/worker.js"
compatibility_date = "2024-12-01"

[env.dev]
vars = { ALLOWED_ORIGINS = "http://localhost:3000,https://your-domain.com" }

[[env.dev.kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "your-kv-namespace-id"
```

### Required Secrets

```bash
# Set your Mewow API key
wrangler secret put MEWOW_API_KEY --env dev
```

## 🔧 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare
npm run deploy
```

## 📡 API Usage

### Search Endpoint

**POST** `/search`

```json
{
  "query": "your search terms",
  "options": {
    "language": "en",
    "safe_search": true,
    "max_results": 10
  }
}
```

### Response Format

```json
{
  "results": [
    {
      "title": "Article Title",
      "url": "https://example.com/article",
      "snippet": "Article description...",
      "description": "Detailed description...",
      "source": "example.com",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "query": "your search terms",
  "totalResults": 42,
  "processingTime": "150ms",
  "sources": ["example.com", "another-site.com"],
  "meta": {
    "processingTime": "150ms",
    "rateLimit": {
      "remaining": 9,
      "reset": 1640995200,
      "limit": 10
    }
  }
}
```

## 🛡️ Security Features

- **Origin Validation**: Requests from unauthorized domains are blocked
- **Rate Limiting**: Prevents API abuse with per-IP limits
- **API Key Protection**: Mewow API key never exposed to clients
- **Input Sanitization**: Query parameters are validated and sanitized

## 📈 Performance

- **Edge Computing**: Runs on Cloudflare's global network
- **Minimal Latency**: Sub-100ms response times globally
- **Efficient Caching**: KV storage for rate limiting data
- **Optimized Bundling**: Small worker size for fast cold starts

## 🔍 Monitoring

The worker includes comprehensive logging and error tracking:

- Request/response logging
- Performance metrics
- Rate limit violations
- Error details and stack traces

## 📄 License

MIT License - see LICENSE file for details.

---

**Search Termux Search Worker** - Powering fast, secure search for the Search Termux platform. 