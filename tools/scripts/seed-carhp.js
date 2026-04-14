#!/usr/bin/env node
// Seed carhp.com domain into the shared Scribe database
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { S3Client, CreateBucketCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');
const { Client } = require('pg');

const DOMAIN_CONFIG = {
  domain: 'carhp.com',
  siteName: 'CarHP',
  tagline: 'Car Help, Guides & Research',
  email: 'hello@carhp.com',
  r2Bucket: 'carhp-static',
  r2PublicUrl: 'https://search.carhp.com',
  apiUrl: 'https://api.carhp.com',
};

async function createR2Bucket() {
  const r2 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });

  // Check if bucket already exists
  try {
    await r2.send(new HeadBucketCommand({ Bucket: DOMAIN_CONFIG.r2Bucket }));
    console.log(`✅ R2 bucket "${DOMAIN_CONFIG.r2Bucket}" already exists`);
    return;
  } catch (err) {
    if (err.name !== 'NoSuchBucket' && err.$metadata?.httpStatusCode !== 404) {
      // Bucket exists but access error — still ok
      console.log(`✅ R2 bucket "${DOMAIN_CONFIG.r2Bucket}" already exists`);
      return;
    }
  }

  // Create the bucket
  try {
    await r2.send(new CreateBucketCommand({ Bucket: DOMAIN_CONFIG.r2Bucket }));
    console.log(`✅ R2 bucket "${DOMAIN_CONFIG.r2Bucket}" created successfully`);
  } catch (err) {
    if (err.name === 'BucketAlreadyExists' || err.name === 'BucketAlreadyOwnedByYou') {
      console.log(`✅ R2 bucket "${DOMAIN_CONFIG.r2Bucket}" already exists`);
    } else {
      console.warn(`⚠️  Could not create R2 bucket: ${err.message}`);
      console.log('   You may need to create "carhp-static" bucket manually in Cloudflare R2 dashboard.');
    }
  }
}

async function seedDomain() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  // Check if domain already exists
  const existing = await client.query(
    'SELECT id FROM domains WHERE domain = $1',
    [DOMAIN_CONFIG.domain]
  );

  if (existing.rows.length > 0) {
    console.log(`✅ Domain "${DOMAIN_CONFIG.domain}" already exists in database (id: ${existing.rows[0].id})`);
    await client.end();
    return;
  }

  // Generate a cuid-style id using crypto
  const { randomBytes } = require('crypto');
  const id = 'c' + randomBytes(11).toString('base64url').slice(0, 24);

  // Insert new domain
  const result = await client.query(
    `INSERT INTO domains ("id", "domain", "siteName", "tagline", "email", "r2Bucket", "r2PublicUrl", "apiUrl", "isActive", "created_at", "updated_at")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())
     RETURNING id`,
    [
      id,
      DOMAIN_CONFIG.domain,
      DOMAIN_CONFIG.siteName,
      DOMAIN_CONFIG.tagline,
      DOMAIN_CONFIG.email,
      DOMAIN_CONFIG.r2Bucket,
      DOMAIN_CONFIG.r2PublicUrl,
      DOMAIN_CONFIG.apiUrl,
    ]
  );

  console.log(`✅ Domain "${DOMAIN_CONFIG.domain}" added to database (id: ${result.rows[0].id})`);
  await client.end();
}

async function main() {
  console.log('🚀 Setting up CarHP domain...\n');

  console.log('1️⃣  Creating R2 bucket...');
  await createR2Bucket();

  console.log('\n2️⃣  Seeding domain in database...');
  await seedDomain();

  console.log('\n✨ CarHP setup complete!');
  console.log('\nNext steps:');
  console.log('  1. Go to Cloudflare R2 dashboard → carhp-static bucket → Settings');
  console.log('  2. Add custom domain: search.carhp.com → point to carhp-static bucket');
  console.log('  3. Restart Scribe: npm run dev');
  console.log('  4. Select "CarHP" from the domain selector in Scribe and publish articles!');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
