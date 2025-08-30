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
          resolve({ duration, status: res.statusCode, data: json, headers: res.headers });
        } catch (e) {
          resolve({ duration, status: res.statusCode, data: data, headers: res.headers });
        }
      });
    }).on('error', reject);
  });
}

async function testRedditAPI() {
  console.log('🔍 Testing Reddit API with Cache\n');
  
  const queries = [
    'javascript programming',
    'react hooks tutorial',
    'nodejs best practices'
  ];
  
  console.log('📋 Test Plan:');
  console.log('1. Test each query twice (MISS then HIT)');
  console.log('2. Compare Reddit API vs Mock data');
  console.log('3. Measure cache performance');
  console.log('4. Verify data quality\n');
  
  for (const query of queries) {
    console.log(`\n🧪 Testing: "${query}"`);
    console.log('=' .repeat(50));
    
    // Test 1: First request with Reddit API (should be MISS)
    console.log('\n1️⃣ First request with Reddit API (expecting MISS):');
    const redditUrl1 = `${WORKER_URL}/cache-test?q=${encodeURIComponent(query)}&limit=5`;
    
    try {
      const result1 = await makeRequest(redditUrl1);
      console.log(`   Status: ${result1.data.cache_status} (${result1.duration}ms)`);
      console.log(`   Results: ${result1.data.total}`);
      console.log(`   Data source: ${result1.data.debug?.data_source || 'unknown'}`);
      
      if (result1.data.results && result1.data.results.length > 0) {
        console.log(`   Sample title: "${result1.data.results[0].title.substring(0, 60)}..."`);
        console.log(`   Sample subreddit: r/${result1.data.results[0].subreddit}`);
        console.log(`   Sample score: ${result1.data.results[0].score}`);
      }
      
      if (result1.data.debug?.reddit_credentials === 'missing') {
        console.log('   ⚠️  Reddit credentials not configured - using mock data');
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      continue;
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 2: Second request (should be HIT)
    console.log('\n2️⃣ Second request (expecting HIT):');
    try {
      const result2 = await makeRequest(redditUrl1);
      console.log(`   Status: ${result2.data.cache_status} (${result2.duration}ms)`);
      console.log(`   Results: ${result2.data.total}`);
      console.log(`   Cache hit: ${result2.data.debug?.cache_hit || false}`);
      
      if (result2.data.cache_status === 'HIT') {
        console.log('   ✅ Cache working correctly!');
      } else {
        console.log('   ⚠️  Expected cache HIT but got MISS');
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    // Test 3: Force refresh to bypass cache
    console.log('\n3️⃣ Force refresh (bypassing cache):');
    const refreshUrl = `${WORKER_URL}/cache-test?q=${encodeURIComponent(query)}&limit=3&refresh=true`;
    try {
      const result3 = await makeRequest(refreshUrl);
      console.log(`   Status: ${result3.data.cache_status} (${result3.duration}ms)`);
      console.log(`   Force refresh: ${result3.data.debug?.force_refresh || false}`);
      console.log(`   Data source: ${result3.data.debug?.data_source || 'unknown'}`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    // Test 4: Compare with mock data
    console.log('\n4️⃣ Mock data comparison:');
    const mockUrl = `${WORKER_URL}/cache-test?q=${encodeURIComponent(query)}&limit=3&mock=true`;
    try {
      const result4 = await makeRequest(mockUrl);
      console.log(`   Status: ${result4.data.cache_status} (${result4.duration}ms)`);
      console.log(`   Data source: ${result4.data.debug?.data_source || 'unknown'}`);
      if (result4.data.results && result4.data.results.length > 0) {
        console.log(`   Mock title: "${result4.data.results[0].title.substring(0, 60)}..."`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  // Final cache status
  console.log('\n\n📊 Final Cache Status:');
  console.log('=' .repeat(50));
  try {
    const status = await makeRequest(`${WORKER_URL}/cache-status`);
    console.log(`Total cached keys: ${status.data.total_keys}`);
    console.log(`Redis connected: ${status.data.redis_connected}`);
    
    if (status.data.keys && status.data.keys.length > 0) {
      console.log(`Cached queries: ${status.data.keys.slice(0, 5).join(', ')}`);
    }
  } catch (error) {
    console.log(`❌ Error getting cache status: ${error.message}`);
  }
  
  console.log('\n🎯 Summary:');
  console.log('✅ Cache hit/miss functionality tested');
  console.log('✅ Force refresh functionality tested');
  console.log('✅ Mock vs Reddit API comparison tested');
  console.log('✅ Performance metrics collected');
  
  console.log('\n💡 To set up Reddit API (if not already configured):');
  console.log('1. Go to https://www.reddit.com/prefs/apps');
  console.log('2. Create a new app (script type)');
  console.log('3. Copy the client ID and secret');
  console.log('4. Run these commands:');
  console.log('   npx wrangler secret put REDDIT_CLIENT_ID --env test');
  console.log('   npx wrangler secret put REDDIT_CLIENT_SECRET --env test');
  console.log('5. Redeploy: npm run deploy');
  
  console.log('\n🔗 Test URLs for manual testing:');
  console.log(`   Health: ${WORKER_URL}/health`);
  console.log(`   Reddit search: ${WORKER_URL}/cache-test?q=javascript&limit=5`);
  console.log(`   Mock search: ${WORKER_URL}/cache-test?q=javascript&limit=5&mock=true`);
  console.log(`   Force refresh: ${WORKER_URL}/cache-test?q=javascript&limit=5&refresh=true`);
  console.log(`   Cache status: ${WORKER_URL}/cache-status`);
}

testRedditAPI().catch(console.error);
















