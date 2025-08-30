# Deployment Guide

## Vercel Deployment

### Prerequisites

- Vercel account
- GitHub repository
- Supabase database
- Cloudflare account (for R2 storage)
- Upstash Redis account

### 1. Environment Variables

Set these in Vercel dashboard (`Settings → Environment Variables`):

#### Database
```env
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres
```

#### Supabase Auth
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Site Configuration
```env
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

#### Admin Configuration
```env
ADMIN_EMAILS=admin@example.com,editor@example.com
```

#### Cloudflare (File Storage)
```env
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

### 2. Build Configuration

Vercel will automatically detect the Next.js project. The build process includes:

1. **Install dependencies**: `npm install`
2. **Generate Prisma client**: `prisma generate` (included in build script)
3. **Build Next.js**: `next build`

### 3. Deploy Process

#### Automatic Deployment
1. Push to main branch
2. Vercel automatically deploys
3. Build logs available in Vercel dashboard

#### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 4. Post-Deployment Setup

#### Database Setup
After first deployment, run database setup:

```bash
# Locally with production DATABASE_URL
npm run setup-database
```

#### Supabase Configuration
1. Go to Supabase Dashboard
2. Navigate to Authentication → URL Configuration
3. Add your Vercel URL to Redirect URLs:
   - `https://your-app.vercel.app/auth/callback`

### 5. Custom Domain (Optional)

1. In Vercel dashboard: `Settings → Domains`
2. Add your custom domain
3. Update environment variables:
   ```env
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```
4. Update Supabase redirect URLs

## Cloudflare Worker Deployment

### Search Worker Setup

```bash
cd tools/searchtermux-search-worker

# Install dependencies
npm install

# Login to Cloudflare
wrangler login

# Set secrets
wrangler secret put REDDIT_CLIENT_ID
wrangler secret put REDDIT_CLIENT_SECRET
wrangler secret put UPSTASH_REDIS_REST_URL
wrangler secret put UPSTASH_REDIS_REST_TOKEN

# Deploy
wrangler deploy
```

### Worker Configuration

Update `tools/searchtermux-search-worker/wrangler.toml`:

```toml
[vars]
ALLOWED_ORIGINS = "https://your-app.vercel.app,https://yourdomain.com"
```

## Monitoring & Maintenance

### Health Checks

#### Main Application
- Check: `https://your-app.vercel.app/api/health`
- Expected: 200 status

#### Search Worker
- Check: `https://your-worker.workers.dev/?q=test`
- Expected: JSON response with results

#### Database
```bash
npm run test-database
```

### Performance Monitoring

#### Vercel Analytics
1. Enable in Vercel dashboard
2. Monitor Core Web Vitals
3. Track page load times

#### Cloudflare Analytics
1. Worker analytics in Cloudflare dashboard
2. Monitor request volume
3. Track error rates

### Error Tracking

#### Common Issues

1. **Build Failures**
   - Check build logs in Vercel
   - Verify environment variables
   - Ensure all dependencies are listed

2. **Database Connection Issues**
   - Verify `DATABASE_URL` format
   - Check Supabase connection pooling
   - Ensure `pgcrypto` extension is enabled

3. **Authentication Problems**
   - Verify Supabase configuration
   - Check redirect URLs
   - Ensure `NEXT_PUBLIC_SITE_URL` is correct

4. **Search Not Working**
   - Check Cloudflare Worker status
   - Verify Reddit API credentials
   - Check Upstash Redis connection

### Backup Strategy

#### Database Backups
- Supabase automatically backs up daily
- Export schema: `pg_dump --schema-only`
- Export data: `pg_dump --data-only`

#### Code Backups
- GitHub repository (primary backup)
- Regular commits and tags
- Branch protection rules

## Scaling Considerations

### Traffic Growth
- Vercel automatically scales
- Monitor function execution limits
- Consider Pro plan for high traffic

### Database Scaling
- Supabase connection pooling
- Read replicas for heavy read workloads
- Database optimization and indexing

### Search Scaling
- Multiple Cloudflare Workers regions
- Additional Redis instances
- Multiple Reddit OAuth applications

## Cost Optimization

### Vercel
- Free tier: 100GB bandwidth
- Pro tier: $20/month for commercial use
- Monitor usage in dashboard

### Supabase
- Free tier: 2 projects, 500MB database
- Pro tier: $25/month per project
- Monitor database size and connections

### Cloudflare
- Workers: $5/month for 10M requests
- R2 Storage: $0.015/GB per month
- Zero egress fees

### Total Estimated Monthly Cost
- **Small app** (<10K users): $0-50
- **Medium app** (10K-100K users): $50-200
- **Large app** (100K+ users): $200-500




