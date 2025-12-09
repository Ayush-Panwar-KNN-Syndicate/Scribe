# 🚀 Simple Database Setup for Scribe

**One-command setup for new databases. No complexity, no issues.**

---

## ⚡ Quick Setup (2 Minutes)

### Step 1: Update Environment Variables
```env
# In your .env file
DATABASE_URL="your-new-database-url"
DIRECT_URL="your-new-database-url"
```

### Step 2: Run Setup Command
```bash
npm run setup-database
```

**That's it! ✅** Your database is ready.

---

## 📋 What the Setup Does

The `npm run setup-database` command will:
1. ✅ Generate Prisma client
2. ✅ Apply database schema  
3. ✅ Enable required extensions
4. ✅ Disable problematic RLS
5. ✅ Remove conflicting triggers
6. ✅ Test the setup

---

## 🔧 Manual Setup (If Needed)

If the automated setup doesn't work:

### Option A: Use Prisma Only
```bash
npx prisma db push --force-reset
npx prisma generate
```

### Option B: Use Supabase Dashboard
1. Go to **Supabase Dashboard → SQL Editor**
2. Run this command:
```sql
-- Enable required extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Disable RLS on main tables
ALTER TABLE IF EXISTS public.authors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.articles DISABLE ROW LEVEL SECURITY;  
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;

-- Remove any problematic triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
```

---

## 🚨 Troubleshooting

### Issue: "Database error saving new user"
**Solution**: Run the manual SQL commands above in Supabase Dashboard.

### Issue: "Cannot find module '@/generated/prisma'"  
**Solution**: Run `npx prisma generate`

### Issue: Connection timeout
**Solution**: Check your `DATABASE_URL` format and network connection.

---

## 📁 Database Providers

### Supabase
```env
DATABASE_URL="postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

### Neon
```env
DATABASE_URL="postgresql://[user]:[password]@[host]/[dbname]?sslmode=require"
DIRECT_URL="postgresql://[user]:[password]@[host]/[dbname]?sslmode=require"
```

### PlanetScale
```env
DATABASE_URL="mysql://[user]:[password]@[host]/[database]?sslaccept=strict"
DIRECT_URL="mysql://[user]:[password]@[host]/[database]?sslaccept=strict"
```

---

## ✅ Verification

After setup, verify everything works:
```bash
npm run test-database
```

This will test:
- ✅ Database connection
- ✅ Table creation
- ✅ User authentication
- ✅ Article creation

---

**🎉 Your database setup is now simple and reliable!**
