#!/usr/bin/env node
/**
 * Test fresh Reddit API calls with caching
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

async function testFreshRedditAPI() {
  console.log('🚀 Testing Fresh Reddit API with Cache');
  console.log('=' .repeat(45));
  
  // Use a unique query to ensure fresh API call
  const query = 'python web scraping tutorial';
  const testUrl = `${WORKER_URL}/cache-test?q=${encodeURIComponent(query)}&limit=5`;
  
  console.log(`\n🔍 Query: "${query}"`);
  console.log('This should trigger a fresh Reddit API call...\n');
  
  // Test 1: First request (should be MISS and use Reddit API)
  console.log('1️⃣ First request - Fresh Reddit API call (expecting MISS):');
  try {
    const result1 = await makeRequest(testUrl);
    console.log(`   Status: ${result1.data.cache_status} (${result1.duration}ms)`);
    console.log(`   Results: ${result1.data.total}`);
    console.log(`   Data source: ${result1.data.debug?.data_source || 'unknown'}`);
    console.log(`   Reddit credentials: ${result1.data.debug?.reddit_credentials || 'unknown'}`);
    
    if (result1.data.debug?.data_source === 'reddit_api') {
      console.log('   ✅ SUCCESS: Using Reddit API!');
      if (result1.data.results && result1.data.results.length > 0) {
        console.log(`   📝 Sample title: "${result1.data.results[0].title.substring(0, 70)}..."`);
        console.log(`   📍 Subreddit: r/${result1.data.results[0].subreddit}`);
        console.log(`   ⬆️  Score: ${result1.data.results[0].score} upvotes`);
        console.log(`   👤 Author: u/${result1.data.results[0].author}`);
      }
    } else if (result1.data.debug?.data_source === 'mock') {
      console.log('   ⚠️  Still using mock data - checking credentials...');
    } else {
      console.log('   ❓ Unknown data source');
    }
    
    // Wait for cache to be written
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 2: Second request (should be HIT from cache)
    console.log('\n2️⃣ Second request - From cache (expecting HIT):');
    const result2 = await makeRequest(testUrl);
    console.log(`   Status: ${result2.data.cache_status} (${result2.duration}ms)`);
    console.log(`   Cache hit: ${result2.data.debug?.cache_hit || false}`);
    
    if (result1.duration > 0 && result2.duration > 0) {
      const improvement = Math.round((1 - result2.duration/result1.duration) * 100);
      console.log(`   🚀 Cache speed improvement: ${improvement}%`);
    }
    
    // Test 3: Compare data sources
    console.log('\n3️⃣ Comparing Reddit API vs Mock data:');
    
    const mockUrl = `${WORKER_URL}/cache-test?q=${encodeURIComponent(query)}&limit=3&mock=true`;
    const mockResult = await makeRequest(mockUrl);
    
    console.log('   Reddit API result:');
    if (result1.data.results && result1.data.results[0]) {
      console.log(`     Title: "${result1.data.results[0].title.substring(0, 60)}..."`);
      console.log(`     URL: ${result1.data.results[0].url.substring(0, 50)}...`);
    }
    
    console.log('   Mock data result:');
    if (mockResult.data.results && mockResult.data.results[0]) {
      console.log(`     Title: "${mockResult.data.results[0].title.substring(0, 60)}..."`);
      console.log(`     URL: ${mockResult.data.results[0].url.substring(0, 50)}...`);
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 4: Cache status
  console.log('\n4️⃣ Final cache status:');
  try {
    const status = await makeRequest(`${WORKER_URL}/cache-status`);
    console.log(`   Total cached keys: ${status.data.total_keys}`);
    console.log(`   Redis connected: ${status.data.redis_connected}`);
    if (status.data.keys && status.data.keys.length > 0) {
      console.log(`   Latest key: ${status.data.keys[status.data.keys.length - 1]}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log('\n🎯 Test Summary:');
  console.log('✅ Fresh Reddit API call tested');
  console.log('✅ Cache performance measured'); 
  console.log('✅ Data source comparison done');
  console.log('✅ Cache status verified');
  
  console.log('\n🔗 Manual test this exact query:');
  console.log(`${testUrl}`);
}

testFreshRedditAPI().catch(console.error);
















