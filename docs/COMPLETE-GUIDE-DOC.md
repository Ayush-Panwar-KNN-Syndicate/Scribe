# 📖 Scribe Platform - Complete Guide  
**Date: October 2025**


This document explains **everything** about the Scribe platform in simple terms. No complex jargon - just clear explanations that make sense!

Think of this as your friendly guide to understanding how this entire application works.

---

## 🎯 What is Scribe?

Scribe is a **professional publishing platform** where you can:
- ✍️ Write articles with AI assistance
- 📝 Manage your content (create, edit)
- 🌐 Publish to the web (Cloudflare R2 + CDN)
- 👥 Manage multiple authors
- 🔐 Control who can do what (Admin system)

**Think of it like WordPress, but modern and faster!**

---

## 🏗️ The Big Picture - Architecture Overview

### The 3-Layer Cake Analogy

Imagine Scribe as a **3-layer cake**:

```
┌─────────────────────────────────────────┐
│  TOP LAYER: What Users See 🎨          │ 
│  (Pages, Buttons, Forms)                 │
│  📁 Location: src/app/                   │
└─────────────────────────────────────────┘
           ⬇️
┌─────────────────────────────────────────┐
│  MIDDLE LAYER: The Brain 🧠             │
│  (Business Logic, Controllers)           │
│  📁 Location: src/controllers/           │
└─────────────────────────────────────────┘
           ⬇️
┌─────────────────────────────────────────┐
│  BOTTOM LAYER: The Storage 💾           │
│  (Database, Files, External Services)    │
│  📁 Location: src/repositories/          │
│                src/services/             │
└─────────────────────────────────────────┘
```

**This is called MVC Architecture** (Model-View-Controller)

---

## 📂 Folder Structure Explained

Let me walk you through every folder like we are on toure:

### 🏠 The Main House (Root Directory)

```
Scribe/
├── docs/           👈 Documentation (this file!)
├── src/            👈 All the code lives here
├── tools/          👈 Helper scripts
├── public/         👈 Images, icons
├── prisma/         👈 Database blueprint
├── package.json    👈 List of tools we use
└── next.config.ts  👈 App settings
```

### 🎨 The Frontend (What Users See)

```
src/app/
├── (auth)/         
│   ├── login/      👈 Login page
│   └── signup/     👈 Sign up page
│
├── (dashboard)/    
│   ├── articles/   👈 Article management
│   ├── static-pages/ 👈 Static page management
│   └── layout.tsx  👈 The sidebar & navigation
│
└── api/            
    ├── articles/   👈 Article API endpoints
    └── categories/ 👈 Category API endpoints
```

**What this means:**  
- `(auth)` = Pages anyone can access (login, signup)
- `(dashboard)` = Pages only logged-in users can access
- `api` = Backend endpoints that handle data

### 🧠 The Brain (Business Logic)

```
src/controllers/
├── ArticleController.ts   👈 Handles article operations
├── CategoryController.ts  👈 Handles category operations
├── AuthController.ts      👈 Handles login/permissions
└── StaticPagesController.ts 👈 Handles static pages
```

**What controllers do:**  
They're like **managers** who make decisions:
- "Should this user be allowed to edit this article?"
- "Let's save this article to the database"
- "Time to publish this to the web!"

### 🔌 The Connectors (Services)

```
src/services/
├── PrismaService.ts      👈 Database connection
├── AuthService.ts        👈 User authentication
├── AdminService.ts       👈 Admin permissions
└── CloudflareService.ts  👈 File storage & CDN
```

**What services do:**  
They're like **specialized workers**:
- PrismaService = Database specialist
- AuthService = Security guard
- CloudflareService = File courier (uploads files)

### 💾 The Data Handlers (Repositories)

```
src/repositories/
├── ArticleRepository.ts  👈 Article database operations
├── CategoryRepository.ts 👈 Category database operations
└── AuthorRepository.ts   👈 Author database operations
```

**What repositories do:**  
They **talk to the database**:
- "Give me all articles"
- "Save this new article"
- "Delete article #123"

### 🎭 The UI Components (Reusable Pieces)

```
src/components/
├── features/        👈 Feature-specific components
│   ├── articles/   👈 Article editor, forms
│   ├── auth/       👈 Login buttons
│   ├── layout/     👈 Sidebar, navigation
│   └── static-pages/ 👈 Static page components
│
├── shared/          👈 Reusable components
│   └── ErrorMessage.tsx
│
└── ui/              👈 Basic building blocks
    ├── button.tsx
    ├── card.tsx
    └── input.tsx
```

---

## 🔄 How Data Flows - A Real Example

Let's see what happens when you **create a new article**:

### Step-by-Step Journey

```
1️⃣ USER ACTION
   You fill out the article form and click "Publish"
   📍 Location: components/features/articles/ArticleForm.tsx

   ⬇️

2️⃣ API CALL
   Form sends data to the API endpoint
   📍 Location: app/api/articles/route.ts

   ⬇️

3️⃣ CONTROLLER TAKES OVER
   ArticleController receives the request
   📍 Location: controllers/ArticleController.ts
   
   What it does:
   ✓ Checks if you're logged in
   ✓ Validates the data
   ✓ Decides what to do next

   ⬇️

4️⃣ SAVE TO DATABASE
   Controller asks Repository to save data
   📍 Location: repositories/ArticleRepository.ts
   
   What it does:
   ✓ Talks to PostgreSQL database
   ✓ Saves the article
   ✓ Returns the saved article

   ⬇️

5️⃣ UPLOAD TO WEB
   Controller asks CloudflareService to publish
   📍 Location: services/CloudflareService.ts
   
   What it does:
   ✓ Generates HTML from your article
   ✓ Uploads to Cloudflare R2
   ✓ Purges CDN cache
   ✓ Makes it live on the internet!

   ⬇️

6️⃣ RESPONSE
   Success message sent back to you
   📍 Location: components/features/articles/ArticleForm.tsx
   
   You see: "✅ Article published successfully!"
```

### Visual Diagram

```
┌──────────┐
│   YOU    │ Clicks "Publish"
│  (User)  │
└─────┬────┘
      │
      ⬇️
┌─────────────────┐
│  Article Form   │ Frontend Component
│  (React)        │
└────────┬────────┘
         │ POST /api/articles
         ⬇️
┌──────────────────┐
│   API Route      │ Receives request
│                  │
└────────┬─────────┘
         │ Calls
         ⬇️
┌──────────────────────┐
│ ArticleController    │ Business Logic
│ - Validate data      │
│ - Check permissions  │
│ - Orchestrate        │
└──────────┬───────────┘
           │
     ┌─────┴─────┐
     │           │
     ⬇️           ⬇️
┌────────┐   ┌──────────────┐
│ Repo   │   │ Cloudflare   │
│ -Save  │   │ -Upload HTML │
│  to DB │   │ -Publish     │
└────────┘   └──────────────┘
     │            │
     ⬇️            ⬇️
┌──────┐     ┌──────┐
│ DB   │     │ R2   │
│  💾  │     │ CDN  │
└──────┘     └──────┘
```

---

## 🗂️ Every File Explained

### Controllers (The Decision Makers)

#### 📄 `ArticleController.ts`
**Purpose**: Manages everything related to articles

**Functions:**
- `getAllArticles()` - Get list of all articles
- `getArticleById(id)` - Get one specific article
- `createArticle(data)` - Create and publish new article
- `updateArticle(id, data)` - Update existing article
- `deleteArticle(id)` - Delete an article
- `getStatistics()` - Get article counts

**When it's used:**  
Every time you create, edit, view, or delete an article.

---

#### 📄 `CategoryController.ts`
**Purpose**: Manages article categories

**Functions:**
- `getAllCategories()` - Get all categories
- `getCategoryById(id)` - Get one category
- `createCategory(data)` - Create new category
- `updateCategory(id, data)` - Update category
- `deleteCategory(id)` - Delete category

**When it's used:**  
When you select a category for an article.

---

#### 📄 `AuthController.ts`
**Purpose**: Handles authentication and permissions

**Functions:**
- `getCurrentUser()` - Who is logged in?
- `requireAuth()` - Make sure user is logged in
- `isAdmin(email)` - Is this user an admin?
- `canEditArticle(article, user)` - Can user edit this?
- `canDeleteArticle(article, user)` - Can user delete this?

**When it's used:**  
Every single page load - to check who you are!

---

### Services (The Specialists)

#### 📄 `PrismaService.ts`
**Purpose**: Database connection manager

**What it does:**  
Creates a single connection to your PostgreSQL database and shares it across the app.

**Think of it as:** The phone line to your database.

---

#### 📄 `AuthService.ts`
**Purpose**: User authentication and author management

**Functions:**
- `getCurrentUser()` - Get logged-in user's info
- `requireAuth()` - Ensure user is logged in
- `createAuthor(user)` - Create author record
- `updateAuthorProfile(user, author)` - Update profile

**Think of it as:** Security guard + ID card manager.

---

#### 📄 `AdminService.ts`
**Purpose**: Admin access control

**Functions:**
- `isAdmin(email)` - Check if user is admin
- `requireAdmin(email)` - Ensure user is admin
- `getAdminEmails()` - List of admin emails

**Think of it as:** VIP access manager.

---

#### 📄 `CloudflareService.ts`
**Purpose**: File storage and CDN management

**Functions:**
- `uploadHtml(key, html)` - Upload HTML to R2
- `uploadCSS(key, css)` - Upload CSS files
- `delete(key)` - Delete file from R2
- `purgeCache(urls)` - Clear CDN cache
- `ensureCSSFiles()` - Make sure CSS is uploaded

**Think of it as:** Your file courier + web publisher.

---

### Repositories (Database Experts)

#### 📄 `ArticleRepository.ts`
**Purpose**: All database operations for articles

**Functions:**
- `findAll()` - SELECT * FROM articles
- `findById(id)` - SELECT WHERE id = ?
- `create(data)` - INSERT INTO articles
- `update(id, data)` - UPDATE articles
- `delete(id)` - DELETE FROM articles
- `count()` - COUNT articles

**Think of it as:** Database secretary for articles.

---

## 🎨 Component Structure

### Features vs Shared vs UI

```
components/
│
├── features/         👈 Complete features
│   ├── articles/    Example: Full article editor
│   ├── auth/        Example: Login/logout buttons
│   └── layout/      Example: Sidebar navigation
│
├── shared/           👈 Reusable across features
│   └── ErrorMessage.tsx  Example: Error display
│
└── ui/               👈 Basic building blocks
    ├── button.tsx   Example: Generic button
    └── card.tsx     Example: Generic card
```

**Rule of Thumb:**
- **UI** = Lego blocks (button, input, card)
- **Shared** = Common tools (error message, loader)
- **Features** = Complete modules (article editor, sidebar)

---

## 🔐 Authentication & Authorization

### How Login Works

```
1. User enters email & password
   ↓
2. Supabase checks credentials
   ↓
3. If valid, creates session
   ↓
4. AuthService creates Author record in database
   ↓
5. User can now access dashboard
```

### Permission Levels

```
┌──────────────────────────────┐
│  Guest (Not logged in)       │
│  ❌ Can't do anything          │
└──────────────────────────────┘

┌──────────────────────────────┐
│  Regular User                │
│  ✅ Create articles           │
│  ✅ Edit own articles         │
│  ✅ Delete own articles       │
│  ❌ Can't edit others         │
│  ❌ No static pages           │
└──────────────────────────────┘

┌──────────────────────────────┐
│  Admin                       │
│  ✅ Everything regular can do │
│  ✅ Edit ANY article          │
│  ✅ Delete ANY article        │
│  ✅ Manage static pages       │
│  ✅ Publish/unpublish         │
└──────────────────────────────┘
```

---

## 🌐 How Publishing Works

### The Publishing Pipeline

When you publish an article:

```
1. GENERATE HTML
   ├─ Take your article data
   ├─ Use structured-renderer.ts
   └─ Create beautiful HTML

2. UPLOAD TO R2
   ├─ Send HTML to Cloudflare R2
   ├─ Use slug as filename
   └─ Set cache headers

3. PURGE CDN
   ├─ Tell Cloudflare CDN
   ├─ "Clear old cache!"
   └─ Ensure fresh content

4. MAKE LIVE
   └─ Your article is now at:
      https://yourdomain.com/article-slug
```

### Cache Strategy

```
Browser Cache: 7 days
   ↓
Edge Cache: 30 days
   ↓
Origin (R2): Forever
```

**Why?**  
- **Fast:** Cached content loads in <200ms
- **Cheap:** Less bandwidth usage
- **Global:** Cached in 250+ locations

---

## 📊 Database Schema

### The 3 Main Tables

#### 1️⃣ Authors
```
authors
├── id (unique ID)
├── name (full name)
├── email (unique email)
├── avatar_url (profile picture)
└── bio (about me)
```

#### 2️⃣ Categories
```
categories
├── id (unique ID)
├── name (category name)
├── slug (URL-friendly name)
└── description
```

#### 3️⃣ Articles
```
articles
├── id (unique ID)
├── title
├── slug (URL-friendly title)
├── excerpt (short description)
├── sections (article content as JSON)
├── author_id → points to authors
├── category_id → points to categories
└── published_at (when published)
```

### Relationships

```
Author ─┬─ Article 1
        ├─ Article 2
        └─ Article 3

Category ─┬─ Article A
          ├─ Article B
          └─ Article C
```

**Translation:**  
- One author can write many articles
- One category can have many articles

---

## 🚀 Deployment Flow

```
1. LOCAL DEVELOPMENT
   npm run dev
   ↓
2. GIT COMMIT
   git commit -m "Added feature"
   ↓
3. PUSH TO GITHUB
   git push origin main
   ↓
4. VERCEL DEPLOYS
   ├─ Runs npm run build
   ├─ Generates optimized code
   └─ Deploys to production
   ↓
5. LIVE! 🎉
   https://scribe.vercel.app
```

---

## 🛠️ Development Workflow

### Daily Development

```
1. Start dev server
   npm run dev

2. Make changes to code

3. Browser auto-refreshes
   (Hot reload)

4. Test your changes

5. Commit when ready
   git add .
   git commit -m "Description"
   git push
```

### File Editing Guide

**Want to change UI?**  
→ Edit files in `src/app/` or `src/components/`

**Want to change logic?**  
→ Edit files in `src/controllers/`

**Want to change data operations?**  
→ Edit files in `src/repositories/`

**Want to change external services?**  
→ Edit files in `src/services/`

---

## 🔍 Debugging Guide

### Common Issues

#### "Module not found"
**Problem:** Import path is wrong  
**Solution:** Check the file path in your import

#### "Database connection failed"
**Problem:** DATABASE_URL not set  
**Solution:** Check your `.env` file

#### "Unauthorized"
**Problem:** Not logged in or not admin  
**Solution:** Log in with admin account

#### "Build failed"
**Problem:** TypeScript error  
**Solution:** Check the error message, fix the type

---

## 📈 Performance Optimizations

### What Makes Scribe Fast?

1. **Static Generation**
   - Articles are pre-rendered as HTML
   - No server needed to show articles
   - Instant page loads

2. **CDN Distribution**
   - Content cached in 250+ locations
   - Users get content from nearest location
   - Sub-200ms response time

3. **Aggressive Caching**
   - CSS cached for 30 days
   - HTML cached for 7 days
   - Images cached for 1 year

4. **Optimized Database**
   - Prisma ORM for fast queries
   - Indexes on frequently searched fields
   - Connection pooling

---

## 🎓 Learning Path

### For Chandan Kumar (or any beginner):

```
Week 1: Understanding
├─ Read this guide (you're doing it!)
├─ Explore the folder structure
└─ Try to find where things are

Week 2: Small Changes
├─ Change a button text
├─ Modify a color
└─ Add a console.log() to see data

Week 3: Components
├─ Create a new component
├─ Use it in a page
└─ Understand props and state

Week 4: Features
├─ Add a new field to article form
├─ Save it to database
└─ Display it on frontend

Week 5: Advanced
├─ Create a new controller
├─ Add a new repository
└─ Build a complete feature
```

---

## 📞 Quick Reference

### Common Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run setup-database  # Set up database
npm run test-database   # Test connection

# Code Quality
npm run lint         # Check code quality
```

### Important Paths

```
Pages        → src/app/
Components   → src/components/
Controllers  → src/controllers/
Services     → src/services/
Repositories → src/repositories/
Database     → prisma/schema.prisma
Docs         → docs/
```

### Environment Variables

```
DATABASE_URL=...              # Database connection
NEXT_PUBLIC_SUPABASE_URL=...  # Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...  # Supabase key
R2_ENDPOINT=...               # Cloudflare R2
R2_ACCESS_KEY_ID=...          # R2 credentials
R2_SECRET_ACCESS_KEY=...      # R2 credentials
ADMIN_EMAILS=...              # Admin email list
```

---

## 🎯 Summary

### The Big Takeaways

1. **MVC Architecture** = Clean separation of concerns
2. **Controllers** = Business logic and decision making
3. **Services** = External integrations (database, auth, storage)
4. **Repositories** = Database operations only
5. **Components** = Reusable UI pieces
6. **Everything works together** = Each layer has a specific job

### Remember:

```
Want to ADD a feature?
├─ 1. Create UI component
├─ 2. Add API route
├─ 3. Add controller logic
├─ 4. Add repository method (if needed)
└─ 5. Test and enjoy! ✅
```

---
 This architecture is **professional**, **scalable**, and **maintainable**.

**Key Points:**
- ✅ Everything has its place
- ✅ Code is organized logically
- ✅ Easy to find and fix issues
- ✅ Easy to add new features
- ✅ Follows industry best practices


Start small, experiment, break things (in development), and learn. That's how we all became developers!

---



**Questions?** Check other docs in the `docs/` folder or create an issue on GitHub.

---
*Written by: The Chandan Kumar*
*Last Updated: October 2025*  
*Made with ❤️ for developers like you*

