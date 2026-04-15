require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { S3Client, CreateBucketCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');
const { Client } = require('pg');

const DOMAIN = {
  domain: 'articlespectrum.com',
  siteName: 'Article Spectrum',
  tagline: 'Fresh Articles Across Every Topic',
  email: 'hello@articlespectrum.com',
  r2Bucket: 'articlespectrum-static',
  r2PublicUrl: 'https://search.articlespectrum.com',
  apiUrl: 'https://api.articlespectrum.com',
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

  try {
    await r2.send(new HeadBucketCommand({ Bucket: DOMAIN.r2Bucket }));
    console.log(`bucket "${DOMAIN.r2Bucket}" already exists`);
    return;
  } catch (err) {
    if (err.name !== 'NoSuchBucket' && err.$metadata?.httpStatusCode !== 404) {
      console.log(`bucket "${DOMAIN.r2Bucket}" already exists`);
      return;
    }
  }

  try {
    await r2.send(new CreateBucketCommand({ Bucket: DOMAIN.r2Bucket }));
    console.log(`bucket "${DOMAIN.r2Bucket}" created`);
  } catch (err) {
    if (err.name === 'BucketAlreadyExists' || err.name === 'BucketAlreadyOwnedByYou') {
      console.log(`bucket "${DOMAIN.r2Bucket}" already exists`);
    } else {
      console.warn(`could not create R2 bucket: ${err.message}`);
    }
  }
}

async function seedDomain() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  const existing = await client.query('SELECT id FROM domains WHERE domain = $1', [DOMAIN.domain]);

  if (existing.rows.length > 0) {
    console.log(`domain "${DOMAIN.domain}" already in database`);
    await client.end();
    return;
  }

  const { randomBytes } = require('crypto');
  const id = 'c' + randomBytes(11).toString('base64url').slice(0, 24);

  const result = await client.query(
    `INSERT INTO domains ("id", "domain", "siteName", "tagline", "email", "r2Bucket", "r2PublicUrl", "apiUrl", "isActive", "created_at", "updated_at")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())
     RETURNING id`,
    [id, DOMAIN.domain, DOMAIN.siteName, DOMAIN.tagline, DOMAIN.email, DOMAIN.r2Bucket, DOMAIN.r2PublicUrl, DOMAIN.apiUrl]
  );

  console.log(`domain "${DOMAIN.domain}" added (id: ${result.rows[0].id})`);
  await client.end();
}

async function main() {
  console.log('setting up articlespectrum.com...');
  await createR2Bucket();
  await seedDomain();
  console.log('done');
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
