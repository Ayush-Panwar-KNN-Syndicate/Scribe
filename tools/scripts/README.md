# 🛠️ Database Scripts

Simple tools for setting up and managing your Scribe database.

## 📋 Available Scripts

### `npm run setup-database`
**Automated database setup** - Sets up everything needed for Scribe.
- ✅ Applies Prisma schema
- ✅ Enables required extensions  
- ✅ Configures security settings
- ✅ Tests the connection

### `npm run test-database`  
**Database verification** - Tests that everything is working.
- ✅ Tests all CRUD operations
- ✅ Verifies table structure
- ✅ Confirms authentication will work

## 📁 Manual Files

### `manual-setup.sql`
Run this SQL in your database console if automated setup fails:
```sql
-- Copy and paste the contents of this file
-- into Supabase SQL Editor or similar
```

## 🚀 Quick Start

1. **Add your database URL to `.env`**
2. **Run setup**: `npm run setup-database`  
3. **Test it**: `npm run test-database`
4. **Start your app**: `npm run dev`

That's it! 🎉
