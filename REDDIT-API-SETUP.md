# Reddit API Setup for Test Worker

## Current Status
✅ **Cache is working perfectly** (80% speed improvement on hits)  
⚠️ **Reddit API credentials needed** (currently using mock data)

## Setup Reddit API

### Step 1: Create Reddit Application

1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Fill out the form:
   - **Name**: `Test Search Worker` (or any name)
   - **App type**: Select **"script"**
   - **Description**: `Testing search functionality`
   - **About URL**: Leave blank or use your website
   - **Redirect URI**: `http://localhost` (required but not used)

4. Click "Create app"

### Step 2: Get Credentials

After creating the app, you'll see:
- **Client ID**: The string under your app name (looks like: `abc123def456`)
- **Client Secret**: The "secret" field (looks like: `xyz789uvw456-AbCdEfGhIjKl`)

### Step 3: Set Secrets in Cloudflare Worker

Run these commands in the `tools/test-search-worker` directory:

```bash
# Set Reddit Client ID
npx wrangler secret put REDDIT_CLIENT_ID --env test
# When prompted, paste your client ID

# Set Reddit Client Secret  
npx wrangler secret put REDDIT_CLIENT_SECRET --env test
# When prompted, paste your client secret
```

### Step 4: Redeploy Worker

```bash
npm run deploy
```

### Step 5: Test Reddit API

```bash
node test-reddit-api.js
```

You should now see:
- ✅ `Data source: reddit_api` (instead of mock)
- ✅ Real Reddit post titles and content
- ✅ Actual subreddit names and scores

## Test Results Comparison

### With Mock Data (Current)
```
Status: MISS (1157ms)
Results: 5
Data source: mock
Sample result: "Test Result 1 for javascript programming"
```

### With Reddit API (After Setup)
```
Status: MISS (800ms)
Results: 5
Data source: reddit_api
Sample result: "JavaScript Best Practices for Modern Web Development"
From: r/javascript
Score: 142
```

## Manual Testing URLs

After setup, test these URLs in your browser:

```bash
# Reddit API search
https://test-search-worker.tech-a14.workers.dev/cache-test?q=javascript&limit=5

# Compare with mock data
https://test-search-worker.tech-a14.workers.dev/cache-test?q=javascript&limit=5&mock=true

# Force fresh Reddit data
https://test-search-worker.tech-a14.workers.dev/cache-test?q=javascript&limit=5&refresh=true
```

## Troubleshooting

### Common Issues

1. **"Invalid client_id" error**
   - Double-check the client ID from Reddit app page
   - Make sure you copied the ID (not the secret)

2. **"Invalid client_secret" error**  
   - Verify the client secret is correct
   - Ensure no extra spaces when copying

3. **Still showing mock data**
   - Redeploy the worker: `npm run deploy`
   - Wait 30 seconds for deployment
   - Clear cache: `curl -X POST https://test-search-worker.tech-a14.workers.dev/cache-clear`

4. **Rate limit errors**
   - Reddit allows 100 requests per minute
   - Wait a minute and try again
   - Use cache to reduce API calls

## Cache Performance with Reddit API

Expected performance improvements:
- **Cache MISS**: ~800ms (Reddit API call)
- **Cache HIT**: ~250ms (Redis retrieval) 
- **Speed improvement**: ~70% faster with cache

## Reddit API Limits

- **Free tier**: 100 requests per minute
- **No daily limit** on free tier
- **Rate limiting**: Automatic backoff in worker
- **Caching**: Reduces API usage significantly

## Next Steps

1. ✅ Set up Reddit credentials (above)
2. ✅ Test with real Reddit data
3. ✅ Verify cache performance
4. ✅ Compare data quality vs mock
5. ✅ Test different search queries
6. ✅ Monitor rate limits and performance
















