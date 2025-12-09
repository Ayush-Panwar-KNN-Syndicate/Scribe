# 🚀 Search Termux Search Worker - Deployment Guide

## 📋 Overview

This guide walks you through implementing Phase 1 of the Search Termux search functionality.

## ✅ Prerequisites

Before deploying, ensure you have:
- ✅ Cloudflare account with Workers plan
- ✅ Mewow Search API key
- ✅ Node.js 18+ installed
- ✅ Wrangler CLI configured
- ✅ Directory structure: `searchtermux-search-worker/`

## 🏗️ Project Structure

```
searchtermux-search-worker/
├── src/
│   ├── worker.ts              # Main worker entry point
│   ├── lib/
│   │   ├── mewow-client.ts    # Mewow API client
│   │   ├── rate-limit.ts      # Rate limiting logic
│   │   └── security.ts        # CORS & origin validation
├── wrangler.toml              # Cloudflare configuration
├── package.json               # Dependencies
└── README.md                  # Documentation
```

## 🚀 Quick Start

```bash
cd searchtermux-search-worker
npm install
wrangler login
wrangler secret put MEWOW_API_KEY --env dev
npm run deploy
```

## 📝 Detailed Setup

### Step 1: Environment Configuration

Update `wrangler.toml` with your allowed origins:

```toml
[env.dev]
vars = { 
  ALLOWED_ORIGINS = "http://localhost:3000,https://your-domain.com" 
}
```

### Step 2: KV Namespace Setup

The rate limiting requires a KV namespace. Update your `wrangler.toml`:

```toml
[[env.dev.kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "your-kv-namespace-id"
```

### Step 3: API Key Configuration

```bash
# Set your Mewow API key as a secret
wrangler secret put MEWOW_API_KEY --env dev
# Enter your API key when prompted
```

### Step 4: Deploy Worker

```bash
# Build and deploy
npm run build
npm run deploy
```

## 🧪 Testing

### Basic Search Test

```bash
curl -X POST https://searchtermux-search-worker.your-subdomain.workers.dev \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "query": "javascript tutorials",
    "options": {
      "language": "en", 
      "max_results": 5
    }
  }'
```

### Rate Limiting Test

```bash
# Make 11 rapid requests to test rate limiting
for i in {1..11}; do
  curl -X POST https://searchtermux-search-worker.your-subdomain.workers.dev \
    -H "Content-Type: application/json" \
    -H "Origin: http://localhost:3000" \
    -d '{"query": "test"}' \
    -w "Request $i: %{http_code}\n"
done
```

## 🔧 Development

### Local Development

```bash
# Start local development server
npm run dev

# Test locally
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"query": "test search"}'
```

### Build Process

```bash
# Clean build
npm run clean

# Type check
npm run type-check

# Build worker
npm run build

# Deploy
npm run deploy
```

## 🛡️ Security Configuration

### Origin Validation

Configure allowed origins in `wrangler.toml`:

```toml
vars = { 
  ALLOWED_ORIGINS = "https://yourdomain.com,https://www.yourdomain.com" 
}
```

### Rate Limiting

The worker implements:
- **10 requests per minute per IP**
- **Sliding window algorithm**
- **KV-based persistence**

### API Key Protection

The Mewow API key is stored as a Cloudflare secret and never exposed to clients.

## 📊 Monitoring

### Worker Analytics

Monitor your worker in the Cloudflare Dashboard:
1. Go to Workers & Pages
2. Select your worker
3. View Analytics tab for:
   - Request volume
   - Error rates
   - Latency metrics

### Logging

```bash
# View real-time logs
wrangler tail --env dev

# Filter by log level
wrangler tail --env dev --format=pretty
```

### Error Tracking

The worker logs:
- ✅ Successful searches
- ❌ Rate limit violations  
- ⚠️ API errors
- 🔒 Security violations

## 🔄 Updates & Maintenance

### Updating the Worker

```bash
# Pull latest changes
git pull

# Install dependencies
npm install

# Deploy updates
npm run deploy
```

### Configuration Changes

1. **Update Origins**: Modify `ALLOWED_ORIGINS` in `wrangler.toml`
2. **Redeploy**: Run `npm run deploy`
3. **Test**: Verify new origins work correctly

### API Key Rotation

```bash
# Update API key
wrangler secret put MEWOW_API_KEY --env dev

# Redeploy worker
npm run deploy
```

## 🌐 Production Deployment

### Custom Domain (Optional)

1. Go to Cloudflare Dashboard
2. Workers & Pages → Your Worker  
3. Settings → Triggers → Custom Domains
4. Add domain: `search-api.yourdomain.com`

### Environment-Specific Deployment

```bash
# Production deployment
wrangler deploy --env production

# Staging deployment  
wrangler deploy --env staging
```

Update `wrangler.toml` for multiple environments:

```toml
[env.staging]
vars = { ALLOWED_ORIGINS = "https://staging.yourdomain.com" }

[env.production]  
vars = { ALLOWED_ORIGINS = "https://yourdomain.com" }
```

## 🐛 Troubleshooting

### Common Issues

1. **Origin Not Allowed**
   - Check `ALLOWED_ORIGINS` configuration
   - Ensure protocol (http/https) matches

2. **Rate Limit Errors**
   - Verify KV namespace is properly bound
   - Check namespace ID in `wrangler.toml`

3. **API Key Issues**
   - Verify secret is set: `wrangler secret list --env dev`
   - Test with a direct API call to Mewow

### Debug Mode

Enable verbose logging for troubleshooting:

```bash
# Development with debug logs
wrangler dev --env dev --local

# Check worker logs
wrangler tail --env dev --format=pretty
```

## 💰 Cost Estimation

### Cloudflare Workers Pricing

- **Free Tier**: 100,000 requests/day
- **Paid Plan**: $5/month + $0.50 per million requests
- **KV Storage**: $0.50 per million reads

### Monthly Cost Example (100K searches)

- Worker Requests: Free (under 100K/day)
- KV Operations: ~$0.05
- **Total**: ~$0.05/month

## 📈 Performance Metrics

Expected performance:
- **Cold Start**: <50ms
- **Warm Response**: ~10ms
- **Global Latency**: <100ms (95th percentile)
- **Throughput**: 1000+ concurrent requests

## 🎯 Next Steps

After successful deployment:

1. ✅ Update frontend to use worker URL
2. ✅ Configure production domains
3. ✅ Set up monitoring alerts
4. ✅ Test rate limiting in production
5. ✅ Monitor API usage and costs

## 📞 Support

For issues or questions:
- Check worker logs: `wrangler tail`
- Review Cloudflare Dashboard analytics
- Test with curl commands above

---

Your Search Termux Search Worker is now ready to power lightning-fast search! 🚀

**Deployment URLs:**
- Development: `https://searchtermux-search-worker-dev.your-subdomain.workers.dev`
- Staging: `https://searchtermux-search-worker.your-subdomain.workers.dev`
- Production: `https://searchtermux-search-worker.your-subdomain.workers.dev` 
 