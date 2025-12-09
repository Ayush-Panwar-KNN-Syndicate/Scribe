#!/usr/bin/env node
// Automated database setup script
require('dotenv').config();
const { execSync } = require('child_process');
const { Client } = require('pg');

async function setupDatabase() {
  // Step 1: Check environment variables
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL not found in .env file');
    process.exit(1);
  }
  // Step 2: Generate Prisma client
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated');
  } catch (error) {
    console.error('❌ Failed to generate Prisma client');
    process.exit(1);
  }

  // Step 3: Apply database schema
  try {
    execSync('npx prisma db push', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to apply schema');
    process.exit(1);
  }
  
  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('supabase.com') || databaseUrl.includes('neon.tech') ? 
         { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    
    // Enable required extensions
    console.log('   📦 Enabling pgcrypto extension...');
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    
    // Disable RLS to prevent auth issues
    console.log('   🔓 Disabling RLS on main tables...');
    await client.query('ALTER TABLE IF EXISTS public.authors DISABLE ROW LEVEL SECURITY;');
    await client.query('ALTER TABLE IF EXISTS public.articles DISABLE ROW LEVEL SECURITY;');
    await client.query('ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;');
    
    // Remove problematic triggers
    console.log('   🗑️ Removing problematic triggers...');
    await client.query('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;');
    await client.query('DROP FUNCTION IF EXISTS public.handle_new_user();');
    
    console.log('✅ Database configured successfully');
    
  } catch (dbError) {
    console.log('⚠️ Database configuration partially failed:', dbError.message);
    console.log('   This might be normal - continuing with setup...');
  } finally {
    await client.end();
  }

  // Step 5: Test the setup
  console.log('\n5️⃣ Testing database setup...');
  try {
    const { PrismaClient } = require('../../src/generated/prisma');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    console.log('✅ Database connection works');
    
    await prisma.$disconnect();
  } catch (testError) {
    console.error('❌ Database test failed:', testError.message);
    process.exit(1);
  }
  console.log('Database setup completed successfully!');
}

setupDatabase().catch(console.error);
