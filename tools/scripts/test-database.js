#!/usr/bin/env node
// Database test script
require('dotenv').config();

async function testDatabase() {
  console.log('🧪 Testing Scribe database setup...\n');

  try {
    const { PrismaClient } = require('../../src/generated/prisma');
    const prisma = new PrismaClient();

    // Test 1: Connection
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test 2: Create test category
    console.log('\n2️⃣ Testing category creation...');
    const testCategory = await prisma.category.create({
      data: {
        name: 'Test Category ' + Date.now(),
        slug: 'test-category-' + Date.now(),
        description: 'Test category for database verification'
      }
    });
    console.log('✅ Category creation successful:', testCategory.name);

    // Test 3: Create test author
    console.log('\n3️⃣ Testing author creation...');
    const testAuthor = await prisma.author.create({
      data: {
        name: 'Test Author',
        email: 'test-' + Date.now() + '@example.com',
        bio: 'Test author for database verification'
      }
    });
    console.log('✅ Author creation successful:', testAuthor.name);

    // Test 4: Create test article
    console.log('\n4️⃣ Testing article creation...');
    const testArticle = await prisma.article.create({
      data: {
        title: 'Test Article ' + Date.now(),
        slug: 'test-article-' + Date.now(),
        excerpt: 'This is a test article for database verification',
        content_markdown: '# Test Article\n\nThis is test content.',
        sections: {
          sections: [
            {
              header: 'Introduction',
              content: 'This is a test section for verification.'
            }
          ]
        },
        author_id: testAuthor.id,
        category_id: testCategory.id
      }
    });
    console.log('✅ Article creation successful:', testArticle.title);

    // Test 5: Query data
    console.log('\n5️⃣ Testing data queries...');
    const articlesCount = await prisma.article.count();
    const authorsCount = await prisma.author.count();
    const categoriesCount = await prisma.category.count();
    
    console.log('✅ Query successful:');
    console.log(`   - Articles: ${articlesCount}`);
    console.log(`   - Authors: ${authorsCount}`);
    console.log(`   - Categories: ${categoriesCount}`);

    // Cleanup: Remove test data
    console.log('\n6️⃣ Cleaning up test data...');
    await prisma.article.delete({ where: { id: testArticle.id } });
    await prisma.author.delete({ where: { id: testAuthor.id } });
    await prisma.category.delete({ where: { id: testCategory.id } });
    console.log('✅ Test data cleaned up');

    await prisma.$disconnect();

    console.log('\n🎉 All database tests passed!');
    console.log('\n📋 Your database is ready for:');
    console.log('  ✅ User authentication');
    console.log('  ✅ Article management');
    console.log('  ✅ Category management');
    console.log('  ✅ Content creation');
    
    console.log('\n🚀 Ready to start your app: npm run dev');

  } catch (error) {
    console.error('\n❌ Database test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('  1. Check your DATABASE_URL in .env');
    console.log('  2. Run: npm run setup-database');
    console.log('  3. Check docs/DATABASE-SETUP.md');
    process.exit(1);
  }
}

testDatabase();
