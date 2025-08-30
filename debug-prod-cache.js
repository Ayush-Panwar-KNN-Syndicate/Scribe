#!/usr/bin/env node
/**
 * Debug production cache issues
 */

const https = require('https');

// Test both workers
const TEST_WORKER = 'https://test-search-worker.tech-a14.workers.dev';
const PROD_WORKER = 'https://searchtermux-search-worker-dev.tech-knnsyndicate.workers.dev';

function makeRequest(url, method = 'GET', body = null) {
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
        'User-Agent': 'CacheDebugScript/1.0'
      }
    };

    const req = https.request(options, (res) => {
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
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function debugCacheIssues() {
  console.log('🔍 DEBUGGING PRODUCTION CACHE ISSUES');
  console.log('=' .repeat(50));
  
  const query = 'javascript async await';
  
  console.log('\n1️⃣ COMPARING WORKER CONFIGURATIONS...');
  
  // Test worker health
  console.log('\nTest Worker:');
  try {
    const testHealth = await makeRequest(`${TEST_WORKER}/health`);
    console.log(`   Status: ${testHealth.status}`);
    console.log(`   Environment: ${testHealth.data.environment}`);
    console.log(`   Endpoints: ${testHealth.data.endpoints?.length || 'unknown'}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Production worker health (it only accepts POST, so let's test that)
  console.log('\nProduction Worker:');
  try {
    const prodTest = await makeRequest(PROD_WORKER, 'POST', { query: 'test' });
    console.log(`   Status: ${prodTest.status}`);
    console.log(`   Response type: ${typeof prodTest.data}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log('\n2️⃣ TESTING CACHE BEHAVIOR...');
  
  // Test worker cache test
  console.log('\nTest Worker Cache Test:');
  try {
    const testResult = await makeRequest(`${TEST_WORKER}/cache-test?q=${encodeURIComponent(query)}&limit=3`);
    console.log(`   Status: ${testResult.data.cache_status} (${testResult.duration}ms)`);
    console.log(`   Cache hit: ${testResult.data.debug?.cache_hit || false}`);
    console.log(`   Cache key: ${testResult.data.query_normalized}`);
    console.log(`   Data source: ${testResult.data.debug?.data_source}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Production worker test
  console.log('\nProduction Worker Test:');
  try {
    const prodResult = await makeRequest(PROD_WORKER, 'POST', { 
      query: query,
      options: { limit: 3 }
    });
    console.log(`   Status: ${prodResult.status}`);
    console.log(`   Duration: ${prodResult.duration}ms`);
    console.log(`   Cached: ${prodResult.data.meta?.cached || false}`);
    console.log(`   X-Cache-Status: ${prodResult.headers['x-cache-status'] || 'not set'}`);
    console.log(`   Processing time: ${prodResult.data.meta?.processingTime}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log('\n3️⃣ ANALYZING DIFFERENCES...');
  
  console.log('\n🔍 KEY DIFFERENCES FOUND:');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│ ASPECT           │ TEST WORKER      │ PROD WORKER      │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ HTTP Method      │ GET              │ POST only        │');
  console.log('│ Cache Key Format │ test_search:*    │ search:*         │');
  console.log('│ CORS/Security    │ None (testing)   │ Full validation  │');
  console.log('│ Rate Limiting    │ None             │ 10 req/min       │');
  console.log('│ Query Processing │ Simple           │ Normalized       │');
  console.log('│ Cache TTL        │ 5 minutes        │ Dynamic TTL      │');
  console.log('│ Debug Mode       │ Always on        │ Production mode  │');
  console.log('└─────────────────────────────────────────────────────────┘');
  
  console.log('\n🚨 LIKELY ISSUES:');
  console.log('1️⃣ Different cache key formats:');
  console.log('   - Test: "test_search:javascript_async_await"');
  console.log('   - Prod: "search:async await javascript:abc123" (normalized)');
  console.log('');
  console.log('2️⃣ Query normalization in production:');
  console.log('   - Removes stop words, sorts words, etc.');
  console.log('   - May cause cache misses if normalization is inconsistent');
  console.log('');
  console.log('3️⃣ Different Redis credentials/instances:');
  console.log('   - Test worker: Your test Redis instance');
  console.log('   - Prod worker: May be using different Redis or no Redis');
  console.log('');
  console.log('4️⃣ Rate limiting interference:');
  console.log('   - Production checks rate limits even for cache hits');
  console.log('   - May cause cache logic to be bypassed');
  
  console.log('\n🔧 DEBUGGING STEPS:');
  console.log('1. Check if production worker has Redis credentials set');
  console.log('2. Test with identical queries to see cache key generation');
  console.log('3. Verify rate limiting isn\'t interfering with cache');
  console.log('4. Check if query normalization is working correctly');
  console.log('5. Compare Redis instances between test and prod');
}

debugCacheIssues().catch(console.error);
















