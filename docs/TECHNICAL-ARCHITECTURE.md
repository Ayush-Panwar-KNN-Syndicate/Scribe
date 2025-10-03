# 🏛️ Scribe - Technical Architecture Documentation

**Version:** 2.0  
**Date:** October 2025  
**Architecture Pattern:** MVC + Service Layer + Repository Pattern

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Layers](#architecture-layers)
3. [Data Flow Diagrams](#data-flow-diagrams)
4. [Component Interaction](#component-interaction)
5. [Database Schema](#database-schema)
6. [API Architecture](#api-architecture)
7. [Deployment Architecture](#deployment-architecture)
8. [Security Architecture](#security-architecture)
9. [File Structure Map](#file-structure-map)
10. [Technology Stack](#technology-stack)

---

## 📊 System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│                    (Browser / Mobile App)                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTPS
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                      VERCEL EDGE NETWORK                         │
│                    (CDN + Edge Functions)                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│                                                                   │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Presentation   │  │  Controller  │  │  Service Layer   │  │
│  │  (Next.js App   │→ │  (Business   │→ │  (External       │  │
│  │   Router)       │  │   Logic)     │  │   Services)      │  │
│  └─────────────────┘  └──────────────┘  └──────────────────┘  │
│                             │                      │             │
│                             ↓                      ↓             │
│                  ┌──────────────────┐  ┌──────────────────┐    │
│                  │  Repository      │  │  External APIs   │    │
│                  │  (Data Access)   │  │  (Cloudflare,    │    │
│                  │                  │  │   Supabase)      │    │
│                  └──────────────────┘  └──────────────────┘    │
└──────────────────────────┬──────────────────────┬───────────────┘
                           │                      │
                           ↓                      ↓
              ┌─────────────────────┐  ┌──────────────────────┐
              │  PostgreSQL         │  │  Cloudflare R2       │
              │  (Supabase)         │  │  (Object Storage)    │
              │  - Authors          │  │  - HTML Files        │
              │  - Articles         │  │  - CSS Files         │
              │  - Categories       │  │  - Images            │
              └─────────────────────┘  └──────────────────────┘
```

---

## 🏗️ Architecture Layers

### 1. Presentation Layer (View)

**Location:** `src/app/`

**Responsibilities:**
- Render UI components
- Handle user interactions
- Make API calls
- Display data to users

**Technologies:**
- Next.js 15 (App Router)
- React 19
- TailwindCSS 4
- shadcn/ui components

**Key Files:**
```
src/app/
├── (auth)/
│   ├── login/page.tsx          # Login page
│   └── signup/page.tsx         # Signup page
├── (dashboard)/
│   ├── articles/page.tsx       # Articles list
│   ├── articles/new/page.tsx   # Create article
│   └── layout.tsx              # Dashboard layout
└── api/
    ├── articles/route.ts       # Article API
    └── categories/route.ts     # Category API
```

---

### 2. Controller Layer (Business Logic)

**Location:** `src/controllers/`

**Responsibilities:**
- Orchestrate business operations
- Validate input data
- Enforce business rules
- Coordinate between services and repositories
- Handle transactions

**Key Controllers:**

#### ArticleController
```typescript
class ArticleController {
  // Orchestrates article operations
  async createArticle(data) {
    1. Validate data
    2. Ensure CSS files uploaded
    3. Save to database (via repository)
    4. Generate HTML
    5. Upload to R2 (via service)
    6. Purge cache
    7. Log to Google Sheets
    8. Return success
  }
}
```

#### AuthController
```typescript
class AuthController {
  // Manages authentication & authorization
  async getCurrentUser() { ... }
  canEditArticle(article, user) { ... }
  requireAdmin(email) { ... }
}
```

**Files:**
```
src/controllers/
├── ArticleController.ts      # Article operations
├── CategoryController.ts     # Category management
├── AuthController.ts         # Auth & permissions
└── StaticPagesController.ts  # Static page publishing
```

---

### 3. Service Layer (External Integrations)

**Location:** `src/services/`

**Responsibilities:**
- Handle external API calls
- Manage third-party integrations
- Provide reusable utilities
- Abstract implementation details

**Key Services:**

#### PrismaService
```typescript
class PrismaService {
  // Database connection singleton
  getInstance() {
    return prismaClient
  }
}
```

#### AuthService
```typescript
class AuthService {
  // User authentication
  async getCurrentUser() {
    1. Get user from Supabase
    2. Find or create Author in database
    3. Update profile if needed
    4. Return author record
  }
}
```

#### CloudflareService
```typescript
class CloudflareService {
  // R2 storage & CDN
  async uploadHtml(key, html) { ... }
  async purgeCache(urls) { ... }
  ensureCSSFiles() { ... }
}
```

**Files:**
```
src/services/
├── PrismaService.ts       # Database client
├── AuthService.ts         # Authentication
├── AdminService.ts        # Admin access
└── CloudflareService.ts   # R2 + CDN
```

---

### 4. Repository Layer (Data Access)

**Location:** `src/repositories/`

**Responsibilities:**
- CRUD operations only
- Abstract database implementation
- Return domain objects
- No business logic

**Key Repositories:**

#### ArticleRepository
```typescript
class ArticleRepository {
  async findAll() {
    return prisma.article.findMany({
      include: { author, category }
    })
  }
  
  async create(data) {
    return prisma.article.create({ data })
  }
  
  async update(id, data) {
    return prisma.article.update({ where: { id }, data })
  }
}
```

**Files:**
```
src/repositories/
├── ArticleRepository.ts   # Article CRUD
├── CategoryRepository.ts  # Category CRUD
└── AuthorRepository.ts    # Author CRUD
```

---

## 🔄 Data Flow Diagrams

### Flow 1: User Creates Article

```
┌─────────┐
│  USER   │ Fills form & clicks "Publish"
└────┬────┘
     │
     ↓
┌────────────────────┐
│ ArticleForm.tsx    │ Frontend Component
│ (React Client)     │ Validates input
└─────────┬──────────┘
          │ POST /api/articles
          │ {title, slug, sections, ...}
          ↓
┌──────────────────────┐
│ /api/articles/       │ API Route (Server)
│ route.ts             │ Receives request
└──────────┬───────────┘
           │ Calls
           ↓
┌────────────────────────────┐
│ ArticleController          │ Business Logic
│ createArticle(data)        │
│                            │
│ 1. Validate data           │
│ 2. Check permissions       │
│ 3. Ensure CSS uploaded     │
│ 4. Save to database        │
│ 5. Generate HTML           │
│ 6. Upload to R2            │
│ 7. Purge cache             │
│ 8. Log to sheets           │
└────────┬─────────┬─────────┘
         │         │
         │         │ Uses
         ↓         ↓
┌──────────────┐  ┌──────────────────┐
│ Repository   │  │ CloudflareService│
│              │  │                  │
│ .create()    │  │ .uploadHtml()    │
│              │  │ .purgeCache()    │
└──────┬───────┘  └────────┬─────────┘
       │                   │
       ↓                   ↓
┌────────────┐       ┌──────────┐
│ PostgreSQL │       │ R2 + CDN │
│ Database   │       │ Storage  │
└────────────┘       └──────────┘
       │                   │
       │                   │
       └───────┬───────────┘
               │
               ↓
         ┌──────────┐
         │ Response │
         │ {success,│
         │  url}    │
         └────┬─────┘
              │
              ↓
         ┌────────┐
         │  USER  │ Sees success message
         └────────┘
```

---

### Flow 2: User Views Article List

```
┌─────────┐
│  USER   │ Navigates to /articles
└────┬────┘
     │
     ↓
┌────────────────────┐
│ articles/page.tsx  │ Server Component
│ (Next.js)          │
└─────────┬──────────┘
          │ Calls
          ↓
┌──────────────────────┐
│ ArticleController    │
│ .getAllArticles()    │
└──────────┬───────────┘
           │ Uses
           ↓
┌──────────────────────┐
│ ArticleRepository    │
│ .findAll()           │
└──────────┬───────────┘
           │ Query
           ↓
┌────────────────────────┐
│ PostgreSQL             │
│ SELECT * FROM articles │
│ INCLUDE author,category│
└────────┬───────────────┘
         │ Returns data
         ↓
┌────────────────────┐
│ articles/page.tsx  │ Renders list
└─────────┬──────────┘
          │ HTML
          ↓
     ┌────────┐
     │  USER  │ Sees article list
     └────────┘
```

---

### Flow 3: Authentication Flow

```
┌─────────┐
│  USER   │ Enters email/password
└────┬────┘
     │
     ↓
┌────────────────────┐
│ login/page.tsx     │ Login form
└─────────┬──────────┘
          │ Calls
          ↓
┌────────────────────────┐
│ Supabase Auth          │ Validates credentials
│ .signInWithPassword()  │
└─────────┬──────────────┘
          │ Returns session
          ↓
┌────────────────────────┐
│ AuthService            │
│ .getCurrentUser()      │
└─────────┬──────────────┘
          │ Uses
          ↓
┌────────────────────────┐
│ AuthorRepository       │
│ .findByEmail()         │
│ .create() if not found │
└─────────┬──────────────┘
          │ Query
          ↓
┌────────────────────┐
│ PostgreSQL         │
│ authors table      │
└─────────┬──────────┘
          │ Returns author
          ↓
┌────────────────────┐
│ middleware.ts      │ Sets session
└─────────┬──────────┘
          │ Redirect
          ↓
     ┌────────┐
     │  USER  │ → Dashboard
     └────────┘
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐
│    Authors      │
├─────────────────┤
│ id (PK)         │─────┐
│ name            │     │
│ email (unique)  │     │ One-to-Many
│ avatar_url      │     │
│ bio             │     │
│ created_at      │     │
│ updated_at      │     │
└─────────────────┘     │
                        │
                        │
                        ↓
               ┌─────────────────┐
               │    Articles     │
               ├─────────────────┤
               │ id (PK)         │
               │ title           │
               │ slug (unique)   │
               │ excerpt         │
               │ sections (JSON) │
               │ image_id        │
    ┌──────────│ author_id (FK)  │
    │          │ category_id (FK)│←────┐
    │          │ published_at    │     │
    │          │ created_at      │     │
    │          │ updated_at      │     │
    │          └─────────────────┘     │
    │                                  │
    │                                  │ One-to-Many
    │  Many-to-One                     │
    │                                  │
    ↓                                  │
┌─────────────────┐                   │
│   Categories    │───────────────────┘
├─────────────────┤
│ id (PK)         │
│ name (unique)   │
│ slug (unique)   │
│ description     │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

### Schema Details

```sql
-- Authors Table
CREATE TABLE authors (
  id          VARCHAR PRIMARY KEY,
  name        VARCHAR NOT NULL,
  email       VARCHAR UNIQUE NOT NULL,
  avatar_url  VARCHAR,
  bio         TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Categories Table
CREATE TABLE categories (
  id          VARCHAR PRIMARY KEY,
  name        VARCHAR UNIQUE NOT NULL,
  slug        VARCHAR UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Articles Table
CREATE TABLE articles (
  id               VARCHAR PRIMARY KEY,
  title            VARCHAR NOT NULL,
  slug             VARCHAR UNIQUE NOT NULL,
  excerpt          TEXT,
  content_markdown TEXT,
  image_id         VARCHAR,
  sections         JSON NOT NULL,
  author_id        VARCHAR NOT NULL REFERENCES authors(id),
  category_id      VARCHAR REFERENCES categories(id),
  published_at     TIMESTAMP DEFAULT NOW(),
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_published ON articles(published_at);
CREATE INDEX idx_articles_slug ON articles(slug);
```

---

## 🌐 API Architecture

### RESTful API Endpoints

```
┌─────────────────────────────────────────────────────────────┐
│                     API ENDPOINTS                            │
└─────────────────────────────────────────────────────────────┘

Authentication
├── POST   /api/auth/login              # Login
└── POST   /api/auth/signup             # Sign up

Articles
├── GET    /api/articles                # List all articles
├── POST   /api/articles                # Create article
├── GET    /api/articles/[id]           # Get specific article
├── PUT    /api/articles/[id]           # Update article
└── DELETE /api/articles/[id]           # Delete article

Categories
├── GET    /api/categories              # List all categories
├── POST   /api/categories              # Create category
├── PUT    /api/categories/[id]         # Update category
└── DELETE /api/categories/[id]         # Delete category

AI Generation
├── POST   /api/ai/generate-article     # Generate article
└── POST   /api/ai/suggest-titles       # Suggest titles

Uploads
└── POST   /api/upload-image            # Upload image
```

### API Request/Response Flow

```
┌────────────┐
│  CLIENT    │
└──────┬─────┘
       │ 1. HTTP Request
       ↓
┌──────────────────┐
│  Next.js API     │
│  Route Handler   │
└──────┬───────────┘
       │ 2. Parse & Validate
       ↓
┌──────────────────┐
│  Auth Check      │ Verify session
│  (Middleware)    │
└──────┬───────────┘
       │ 3. Authorized
       ↓
┌──────────────────┐
│  Controller      │ Execute logic
└──────┬───────────┘
       │ 4. Process
       ↓
┌──────────────────┐
│  Repository/     │ Data operations
│  Service         │
└──────┬───────────┘
       │ 5. Data
       ↓
┌──────────────────┐
│  Response        │ Format & send
│  (JSON)          │
└──────┬───────────┘
       │ 6. HTTP Response
       ↓
┌────────────┐
│  CLIENT    │ Display result
└────────────┘
```

---

## 🚀 Deployment Architecture

### Production Environment

```
┌──────────────────────────────────────────────────────────┐
│                     USERS WORLDWIDE                       │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              CLOUDFLARE GLOBAL CDN                           │
│           (250+ Locations Worldwide)                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  US East     │  │  EU West     │  │  Asia        │     │
│  │  Cache       │  │  Cache       │  │  Cache       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────┬────────────────────────────────────────┘
                     │
           ┌─────────┴──────────┐
           │                    │
           ↓                    ↓
┌────────────────────┐  ┌──────────────────┐
│  VERCEL PLATFORM   │  │  CLOUDFLARE R2   │
│  (Next.js App)     │  │  (Object Storage)│
│                    │  │                  │
│  • Edge Functions  │  │  • HTML Files    │
│  • Serverless API  │  │  • CSS Files     │
│  • Auto-scaling    │  │  • Images        │
└──────────┬─────────┘  └──────────────────┘
           │
           ↓
┌────────────────────┐
│  SUPABASE          │
│  (Database)        │
│                    │
│  • PostgreSQL      │
│  • Auth            │
│  • Real-time       │
└────────────────────┘
```

### Deployment Flow

```
Developer
    │
    │ git push
    ↓
┌─────────┐
│ GitHub  │
└────┬────┘
     │ Webhook
     ↓
┌────────────┐
│  Vercel    │
│  Platform  │
└──────┬─────┘
       │
       ├─→ 1. Install dependencies (npm install)
       ├─→ 2. Run Prisma generate
       ├─→ 3. Build Next.js (npm run build)
       ├─→ 4. Run tests (if configured)
       ├─→ 5. Deploy to Edge
       └─→ 6. Invalidate CDN cache
           │
           ↓
    ┌──────────┐
    │   LIVE   │ 🎉
    └──────────┘
```

---

## 🔐 Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────────────┐
│             Security Layers                      │
└─────────────────────────────────────────────────┘

Layer 1: Transport Security
├─ HTTPS/TLS encryption
├─ Secure headers (CSP, HSTS)
└─ CORS policies

Layer 2: Authentication
├─ Supabase Auth (JWT tokens)
├─ Email/password + OAuth
├─ Session management
└─ Token refresh

Layer 3: Authorization
├─ Role-based access (Admin/User)
├─ Resource ownership checks
├─ Middleware protection
└─ API route guards

Layer 4: Data Security
├─ Input validation
├─ SQL injection prevention (Prisma)
├─ XSS protection (React)
└─ CSRF protection
```

### Request Security Flow

```
Client Request
    │
    ↓
┌────────────────┐
│  TLS/HTTPS     │ Encrypt transport
└────────┬───────┘
         ↓
┌────────────────┐
│  CORS Check    │ Verify origin
└────────┬───────┘
         ↓
┌────────────────┐
│  Session Check │ Verify JWT token
└────────┬───────┘
         ↓
┌────────────────┐
│  Role Check    │ Check permissions
└────────┬───────┘
         ↓
┌────────────────┐
│  Input Valid.  │ Sanitize data
└────────┬───────┘
         ↓
┌────────────────┐
│  Execute       │ Process request
└────────────────┘
```

---

## 📁 File Structure Map

### Complete Directory Tree

```
Scribe/
├── 📁 src/                          # Source code
│   │
│   ├── 📁 app/                      # Next.js App Router
│   │   ├── 📁 (auth)/              # Public routes
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── 📁 (dashboard)/         # Protected routes
│   │   │   ├── articles/
│   │   │   ├── static-pages/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── 📁 api/                 # API endpoints
│   │   │   ├── articles/
│   │   │   ├── categories/
│   │   │   ├── ai/
│   │   │   └── upload-image/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   └── layout.tsx
│   │
│   ├── 📁 controllers/              # Business logic
│   │   ├── ArticleController.ts
│   │   ├── CategoryController.ts
│   │   ├── AuthController.ts
│   │   └── StaticPagesController.ts
│   │
│   ├── 📁 services/                 # External services
│   │   ├── PrismaService.ts
│   │   ├── AuthService.ts
│   │   ├── AdminService.ts
│   │   └── CloudflareService.ts
│   │
│   ├── 📁 repositories/             # Data access
│   │   ├── ArticleRepository.ts
│   │   ├── CategoryRepository.ts
│   │   └── AuthorRepository.ts
│   │
│   ├── 📁 components/               # React components
│   │   ├── 📁 features/            # Feature modules
│   │   │   ├── articles/
│   │   │   ├── auth/
│   │   │   ├── layout/
│   │   │   └── static-pages/
│   │   ├── 📁 shared/              # Shared components
│   │   └── 📁 ui/                  # Base components
│   │
│   ├── 📁 lib/                      # Utilities & helpers
│   │   ├── supabase/
│   │   ├── utils.ts
│   │   ├── ai.ts
│   │   └── renderer.ts
│   │
│   ├── 📁 types/                    # TypeScript types
│   │   └── database.ts
│   │
│   ├── 📁 data/                     # Static data
│   │   └── staticArticles.ts
│   │
│   └── middleware.ts                # Next.js middleware
│
├── 📁 docs/                         # Documentation
│   ├── COMPLETE-GUIDE-FOR-HUMANS.md
│   ├── TECHNICAL-ARCHITECTURE.md
│   ├── ARCHITECTURE.md
│   ├── MIGRATION-GUIDE.md
│   ├── CLEANUP-SUMMARY.md
│   └── README.md
│
├── 📁 prisma/                       # Database schema
│   └── schema.prisma
│
├── 📁 tools/                        # External tools
│   ├── scripts/
│   └── searchtermux-search-worker/
│
├── 📁 public/                       # Static assets
│   ├── file.svg
│   └── globe.svg
│
├── package.json                     # Dependencies
├── next.config.ts                   # Next.js config
├── tsconfig.json                    # TypeScript config
└── tailwind.config.ts               # Tailwind CSS config
```

---

## 💻 Technology Stack

### Frontend
- **Framework:** Next.js 15.4.4 (App Router)
- **UI Library:** React 19.1.0
- **Styling:** TailwindCSS 4
- **Components:** shadcn/ui + Radix UI
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js 18+
- **API:** Next.js API Routes
- **ORM:** Prisma 6.12.0
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth

### Infrastructure
- **Hosting:** Vercel (Serverless)
- **Storage:** Cloudflare R2
- **CDN:** Cloudflare
- **Database:** Supabase (PostgreSQL)
- **Search Worker:** Cloudflare Workers

### Development Tools
- **Language:** TypeScript 5
- **Linting:** ESLint 9
- **Package Manager:** npm
- **Version Control:** Git

---

## 📈 Performance Metrics

### Target Performance

```
Page Load Times:
├─ Homepage: < 200ms (CDN cached)
├─ Article Page: < 200ms (CDN cached)
├─ Dashboard: < 1s (dynamic)
└─ API Response: < 300ms

Lighthouse Scores:
├─ Performance: 95+
├─ Accessibility: 100
├─ Best Practices: 100
└─ SEO: 100

Infrastructure:
├─ CDN Coverage: 250+ locations
├─ Database: Connection pooling
├─ Caching: Multi-layer (Browser → Edge → Origin)
└─ Scaling: Auto-scaling on Vercel
```

---

## 🔄 Data Consistency

### ACID Compliance

```
Atomicity   ✅ Prisma transactions
Consistency ✅ Foreign keys & constraints
Isolation   ✅ Database transaction isolation
Durability  ✅ PostgreSQL WAL
```

### Cache Invalidation Strategy

```
┌────────────┐
│   Update   │ Article updated
└──────┬─────┘
       │
       ├─→ 1. Save to database (source of truth)
       ├─→ 2. Upload new HTML to R2
       ├─→ 3. Purge CDN cache for that URL
       └─→ 4. Next request fetches fresh data
```

---

## 📝 Summary

This architecture provides:

✅ **Scalability** - Can handle millions of users  
✅ **Maintainability** - Clean separation of concerns  
✅ **Performance** - Sub-200ms response times  
✅ **Security** - Multi-layer security model  
✅ **Reliability** - 99.9% uptime target  
✅ **Developer Experience** - Easy to understand and extend  

---

*Last Updated: October 2025*  
*Architecture Version: 2.0*  
*Maintained by: Development Team*

