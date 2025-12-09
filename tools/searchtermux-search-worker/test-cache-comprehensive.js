#!/usr/bin/env node
/**
 * Comprehensive cache testing script for the test worker (no CORS/rate limits)
 */

const https = require('https');

function makeRequest(url, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const start = Date.now();
    
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; CacheTestScript/1.0)',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - start;
        try {
          const json = JSON.parse(data);
          resolve({ 
            duration, 
            status: res.statusCode, 
            data: json, 
            headers: res.headers 
          });
        } catch (e) {
          resolve({ 
            duration, 
            status: res.statusCode, 
            data: data, 
            headers: res.headers 
          });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function testCacheComprehensive() {
  console.log('🚀 COMPREHENSIVE CACHE TESTING');
  console.log('=' .repeat(50));
  
  // Test worker URL (no CORS restrictions)
  const TEST_WORKER_URL = 'https://test-searchtermux-worker.tech-a14.workers.dev';
  
  console.log(`Test Worker URL: ${TEST_WORKER_URL}`);
  console.log('Note: Update the URL above after deploying the test worker\n');
  
  const testQueries = [
    {
      name: 'JavaScript Async/Await',
      query: 'javascript async await tutorial',
      options: { limit: 5 }
    },
    {
      name: 'React Hooks',
      query: 'react hooks guide',
      options: { limit: 3 }
    }
  ];

  for (const test of testQueries) {
    console.log(`\n🧪 Testing: ${test.name}`);
    console.log('─'.repeat(40));
    console.log(`Query: "${test.query}"`);
    console.log(`Options: ${JSON.stringify(test.options)}`);
    
    try {
      // Test 1: First request (should be MISS)
      console.log('\n1️⃣ First request (expecting MISS):');
      const result1 = await makeRequest(TEST_WORKER_URL, 'POST', {
        query: test.query,
        options: test.options
      });
      
      console.log(`   Status: ${result1.status}`);
      console.log(`   Duration: ${result1.duration}ms`);
      console.log(`   Cached: ${result1.data.meta?.cached || false}`);
      console.log(`   X-Cache-Status: ${result1.headers['x-cache-status'] || 'not set'}`);
      console.log(`   Cache Key: ${result1.headers['x-cache-key'] || 'not set'}`);
      
      if (result1.status !== 200) {
        console.log(`   ❌ Request failed: ${result1.data.error || 'Unknown error'}`);
        console.log(`   Message: ${result1.data.message || 'No message'}`);
        continue;
      }
      
      console.log(`   Results: ${result1.data.results?.length || 0}`);
      console.log(`   ${result1.data.meta?.cached ? '❌ Unexpected cache HIT' : '✅ Cache MISS as expected'}`);
      
      // Wait for cache to be written
      console.log('\n   ⏳ Waiting 3 seconds for cache to be written...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Test 2: Second request (should be HIT)
      console.log('\n2️⃣ Second request (expecting HIT):');
      const result2 = await makeRequest(TEST_WORKER_URL, 'POST', {
        query: test.query,
        options: test.options
      });
      
      console.log(`   Status: ${result2.status}`);
      console.log(`   Duration: ${result2.duration}ms`);
      console.log(`   Cached: ${result2.data.meta?.cached || false}`);
      console.log(`   X-Cache-Status: ${result2.headers['x-cache-status'] || 'not set'}`);
      
      const isCacheHit = result2.data.meta?.cached === true || result2.headers['x-cache-status'] === 'HIT';
      const speedImprovement = result1.duration > result2.duration ? 
        Math.round((1 - result2.duration/result1.duration) * 100) : 0;
      
      console.log(`   ${isCacheHit ? '✅ Cache HIT confirmed' : '❌ Cache MISS (unexpected)'}`);
      console.log(`   Speed improvement: ${speedImprovement}%`);
      
      // Test 3: Same options, different order (test options hash stability)
      console.log('\n3️⃣ Options stability test:');
      const reorderedOptions = Object.keys(test.options).reverse().reduce((obj, key) => {
        obj[key] = test.options[key];
        return obj;
      }, {});
      
      const result3 = await makeRequest(TEST_WORKER_URL, 'POST', {
        query: test.query,
        options: reorderedOptions
      });
      
      const isOptionsStable = result3.data.meta?.cached === true || result3.headers['x-cache-status'] === 'HIT';
      console.log(`   Reordered options: ${JSON.stringify(reorderedOptions)}`);
      console.log(`   ${isOptionsStable ? '✅ Options hash STABLE' : '❌ Options hash UNSTABLE'}`);
      
      // Test 4: GET request (alternative method)
      console.log('\n4️⃣ GET request test:');
      const getUrl = `${TEST_WORKER_URL}?q=${encodeURIComponent(test.query)}&limit=${test.options.limit || 10}`;
      const result4 = await makeRequest(getUrl, 'GET');
      
      const isGetCached = result4.data.meta?.cached === true || result4.headers['x-cache-status'] === 'HIT';
      console.log(`   GET method: ${isGetCached ? '✅ Cache HIT' : '❌ Cache MISS'}`);
      
      // Summary for this test
      console.log('\n📊 Test Summary:');
      console.log(`   ✅ First request: ${result1.status === 200 ? 'SUCCESS' : 'FAILED'}`);
      console.log(`   ✅ Cache functionality: ${isCacheHit ? 'WORKING' : 'BROKEN'}`);
      console.log(`   ✅ Options stability: ${isOptionsStable ? 'STABLE' : 'UNSTABLE'}`);
      console.log(`   ✅ GET method: ${result4.status === 200 ? 'WORKING' : 'BROKEN'}`);
      console.log(`   ✅ Performance gain: ${speedImprovement}%`);
      
    } catch (error) {
      console.log(`\n❌ Test failed for ${test.name}: ${error.message}`);
      
      if (error.code === 'ENOTFOUND') {
        console.log('\n💡 Worker not deployed or URL incorrect.');
        console.log('To deploy the test worker:');
        console.log('1. wrangler deploy --env test --config test-wrangler.toml');
        console.log('2. Update TEST_WORKER_URL in this script');
        console.log('3. Set secrets: wrangler secret put REDDIT_CLIENT_ID --env test --config test-wrangler.toml');
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 CACHE TESTING INSTRUCTIONS');
  console.log('=' .repeat(50));
  
  console.log('\n📋 To deploy and test the cache fixes:');
  console.log('\n1️⃣ Deploy test worker (no CORS/rate limits):');
  console.log('   wrangler deploy --env test --config test-wrangler.toml');
  
  console.log('\n2️⃣ Set secrets for test worker:');
  console.log('   wrangler secret put REDDIT_CLIENT_ID --env test --config test-wrangler.toml');
  console.log('   wrangler secret put REDDIT_CLIENT_SECRET --env test --config test-wrangler.toml');
  console.log('   wrangler secret put UPSTASH_REDIS_REST_URL --env test --config test-wrangler.toml');
  console.log('   wrangler secret put UPSTASH_REDIS_REST_TOKEN --env test --config test-wrangler.toml');
  
  console.log('\n3️⃣ Update TEST_WORKER_URL in this script');
  
  console.log('\n4️⃣ Run this test again: node test-cache-comprehensive.js');
  
  console.log('\n🔧 Manual testing URLs (after deployment):');
  console.log('   GET:  https://your-test-worker.workers.dev/?q=javascript&limit=5');
  console.log('   POST: https://your-test-worker.workers.dev/ (with JSON body)');
  
  console.log('\n⚠️  Remember: Test worker has NO security - for testing only!');
}

testCacheComprehensive().catch(console.error);
