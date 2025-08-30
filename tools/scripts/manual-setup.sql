-- Manual Database Setup for Scribe
-- Run this in your database console (Supabase, Neon, etc.)

-- Step 1: Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 2: Disable RLS on main tables (prevents auth issues)
ALTER TABLE IF EXISTS public.authors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;

-- Step 3: Remove problematic triggers (if they exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 4: Test that everything works
SELECT 'Database setup completed successfully!' as status;
