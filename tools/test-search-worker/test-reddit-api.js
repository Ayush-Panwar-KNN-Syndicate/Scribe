#!/usr/bin/env node
/**
 * Test Reddit API with caching functionality
 */

const https = require('https');

const WORKER_URL = 'https://test-search-worker.tech-a14.workers.dev';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - start;
        try {
          const json = JSON.parse(data);
          resolve({ duration, status: res.statusCode, data: json });
        } catch (e) {
          resolve({ duration, status: res.statusCode, data: data });
        }
      });
    }).on('error', reject);
  });
}

async function testRedditAPI() {
  console.log('🔍 Testing Reddit API with Cache\n');
  
  const query = 'javascript programming';
  
  console.log(`Testing query: "${query}"`);
  console.log('=' .repeat(40));
  
  // Test 1: Check current configuration
  console.log('\n1️⃣ Checking worker configuration:');
  try {
    const health = await makeRequest(`${WORKER_URL}/health`);
    console.log(`   Worker status: ${health.data.status}`);
    console.log(`   Environment: ${health.data.environment}`);
  } catch (error) {
    console.log(`   ❌ Health check failed: ${error.message}`);
    return;
  }
  
  // Test 2: First request (should be MISS)
  console.log('\n2️⃣ First request (expecting MISS):');
  const testUrl = `${WORKER_URL}/cache-test?q=${encodeURIComponent(query)}&limit=5`;
  
  try {
    const result1 = await makeRequest(testUrl);
    console.log(`   Status: ${result1.data.cache_status} (${result1.duration}ms)`);
    console.log(`   Results: ${result1.data.total}`);
    console.log(`   Data source: ${result1.data.debug?.data_source || 'unknown'}`);
    
    if (result1.data.debug?.reddit_credentials === 'missing') {
      console.log('   ⚠️  Reddit credentials not configured - using mock data');
      console.log('   📝 To set up Reddit API:');
      console.log('      1. Go to https://www.reddit.com/prefs/apps');
      console.log('      2. Create a new "script" app');
      console.log('      3. Copy client ID and secret');
      console.log('      4. Run: npx wrangler secret put REDDIT_CLIENT_ID --env test');
      console.log('      5. Run: npx wrangler secret put REDDIT_CLIENT_SECRET --env test');
      console.log('      6. Redeploy: npm run deploy');
    } else if (result1.data.debug?.data_source === 'reddit_api') {
      console.log('   ✅ Using Reddit API successfully!');
      if (result1.data.results && result1.data.results.length > 0) {
        console.log(`   Sample result: "${result1.data.results[0].title.substring(0, 50)}..."`);
        console.log(`   From: r/${result1.data.results[0].subreddit}`);
        console.log(`   Score: ${result1.data.results[0].score}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return;
  }
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: Second request (should be HIT)
  console.log('\n3️⃣ Second request (expecting HIT):');
  try {
    const result2 = await makeRequest(testUrl);
    console.log(`   Status: ${result2.data.cache_status} (${result2.duration}ms)`);
    console.log(`   Cache hit: ${result2.data.debug?.cache_hit || false}`);
    
    if (result2.data.cache_status === 'HIT') {
      console.log('   ✅ Cache working perfectly!');
    } else {
      console.log('   ⚠️  Expected cache HIT but got MISS');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 4: Cache status
  console.log('\n4️⃣ Cache status:');
  try {
    const status = await makeRequest(`${WORKER_URL}/cache-status`);
    console.log(`   Total cached keys: ${status.data.total_keys}`);
    console.log(`   Redis connected: ${status.data.redis_connected}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log('\n🎯 Test Complete!');
  console.log('\n🔗 Manual test URLs:');
  console.log(`   Cache test: ${WORKER_URL}/cache-test?q=javascript&limit=5`);
  console.log(`   Mock test: ${WORKER_URL}/cache-test?q=javascript&limit=5&mock=true`);
  console.log(`   Cache status: ${WORKER_URL}/cache-status`);
}

testRedditAPI().catch(console.error);
















