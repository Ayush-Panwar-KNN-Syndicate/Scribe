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

## 📚 Documentation (Essential Only)

This project has **4 essential documents** - everything you need, nothing more:

### 🌟 **[Complete Guide for Humans](./COMPLETE-GUIDE-FOR-HUMANS.md)** ⭐
**Start here!** Beginner-friendly guide that explains everything in simple language with diagrams and examples. Perfect for learning the codebase.

### 📘 **[Technical Architecture](./TECHNICAL-ARCHITECTURE.md)**
Deep technical documentation with architecture diagrams, data flows, database schema, API docs, and deployment details.

### 🔧 **[Database Setup](./DATABASE-SETUP.md)**
Complete database configuration guide with PostgreSQL setup and troubleshooting.

### 📖 **[README](./README.md)** (This file)
Project overview, quick start, and deployment instructions.

## 🏗️ Project Structure (MVC Architecture)

```
scribe/
├── src/                         # Source code
│   ├── app/                    # Next.js App Router (Presentation)
│   ├── controllers/            # Business logic layer
│   ├── services/               # External service integrations
│   ├── repositories/           # Data access layer
│   ├── components/             # React components
│   │   ├── features/          # Feature-based components
│   │   ├── shared/            # Shared components
│   │   └── ui/                # Base UI components
│   ├── lib/                   # Utilities and helpers
│   └── types/                 # TypeScript definitions
├── tools/                      # Development tools
│   ├── scripts/               # Database and utility scripts
│   └── searchtermux-search-worker/  # Cloudflare Worker
├── docs/                       # Comprehensive documentation
├── prisma/                     # Database schema
└── [config files]              # Root configuration
```

**Architecture Pattern:** Clean MVC + Service Layer + Repository Pattern

Learn more in the [Technical Architecture](./TECHNICAL-ARCHITECTURE.md) guide.

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

## 🚀 Deployment

### Deploy to Vercel

```bash
# 1. Push to GitHub
git push origin main

# 2. Import to Vercel
# Visit vercel.com → Import Project → Select your repo

# 3. Configure Environment Variables
# Add all variables from .env in Vercel dashboard

# 4. Deploy!
# Vercel will auto-deploy on every push to main
```

### Environment Variables for Production

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Cloudflare R2
R2_ENDPOINT="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="..."
R2_PUBLIC_URL="..."

# Admin
ADMIN_EMAILS="admin@example.com"

# Optional: Google Sheets logging
GSHEETS_WEBAPP_URL="..."
GSHEETS_SHEET_ID="..."

# Optional: AI (Gemini)
GEMINI_API_KEY="..."
```

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


