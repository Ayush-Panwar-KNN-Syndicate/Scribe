import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function migrate() {
  try {
    console.log('🔄 Starting multi-tenant migration...')

    // Add domain columns with defaults
    console.log('1. Adding domain column to articles...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE articles ADD COLUMN IF NOT EXISTS domain TEXT DEFAULT 'topreserchtopics.com';
    `)

    console.log('2. Adding domain column to categories...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS domain TEXT DEFAULT 'topreserchtopics.com';
    `)

    // Drop old constraints
    console.log('3. Dropping old unique constraint on articles.slug...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_slug_key;
    `)

    console.log('4. Dropping old unique constraints on categories...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_slug_key;
    `)
    await prisma.$executeRawUnsafe(`
      ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;
    `)

    // Create new composite unique constraints
    console.log('5. Creating composite unique constraint for articles...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE articles ADD CONSTRAINT articles_slug_domain_key UNIQUE (slug, domain);
    `)

    console.log('6. Creating composite unique constraint for categories...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE categories ADD CONSTRAINT categories_slug_domain_key UNIQUE (slug, domain);
    `)

    // Create domains table
    console.log('7. Creating domains table...')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS domains (
        id TEXT PRIMARY KEY,
        domain TEXT UNIQUE NOT NULL,
        "siteName" TEXT NOT NULL,
        tagline TEXT NOT NULL,
        email TEXT NOT NULL,
        "r2Bucket" TEXT NOT NULL,
        "r2PublicUrl" TEXT NOT NULL,
        "apiUrl" TEXT NOT NULL,
        "isActive" BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `)

    console.log('✅ Migration completed successfully!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrate()
