# Scribe - Professional Writing Platform

A modern, scalable writing platform built with Next.js 15, featuring article management, user authentication, and integrated search capabilities.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up database
npm run setup-database

# Start development server
npm run dev
```

## 📚 Documentation

- [Database Setup Guide](./DATABASE-SETUP.md) - Complete database configuration
- [Search Architecture](./SEARCH-ARCHITECTURE.md) - Reddit-based search system
- [Deployment Guide](./DEPLOYMENT.md) - Vercel deployment instructions
- [Admin Guide](./ADMIN.md) - Admin permissions and management

## 🏗️ Project Structure

```
scribe/
├── src/                    # Source code
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── lib/               # Utilities and configurations
│   └── types/             # TypeScript definitions
├── tools/                 # Development tools
│   ├── scripts/           # Database and utility scripts
│   └── searchtermux-search-worker/  # Cloudflare Worker
├── docs/                  # Documentation
├── configs/               # Configuration files
├── tests/                 # Test files
└── prisma/                # Database schema
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel
- **Search**: Cloudflare Workers + Reddit API + Upstash Redis
- **File Storage**: Cloudflare R2

## 🔧 Development

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Environment variables configured

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Site Configuration
NEXT_PUBLIC_SITE_URL="https://yoursite.com"

# Admin Configuration
ADMIN_EMAILS="admin@example.com,admin2@example.com"

# Cloudflare (for file storage)
CLOUDFLARE_ACCOUNT_ID="..."
CLOUDFLARE_API_TOKEN="..."
CLOUDFLARE_R2_BUCKET_NAME="..."
```

### Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run setup-database  # Set up new database
npm run test-database   # Test database connection

# Linting
npm run lint            # Run ESLint
```

## 🔐 Security Features

- **Admin-only permissions** for editing others' articles
- **Row Level Security (RLS)** on database
- **Environment-based admin configuration**
- **Secure authentication** with Supabase
- **Protected API routes**

## 📈 Performance Features

- **Static article generation** for ultra-fast loading
- **Redis caching** for search queries
- **CDN distribution** via Cloudflare
- **Image optimization** and compression
- **Edge computing** for global performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is proprietary software developed by KNN Syndicate.

---

**Built with ❤️ by the KNN Syndicate Team**


