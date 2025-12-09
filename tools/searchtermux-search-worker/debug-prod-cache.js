#!/usr/bin/env node
/**
 * Debug why production worker always shows MISS
 */

const https = require('https');

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

async function debugProductionCache() {
  console.log('🔍 DEBUGGING: Why Production Worker Always Shows MISS');
  console.log('=' .repeat(60));
  
  const query = 'javascript tutorial';
  
  console.log('\n🧪 TESTING PRODUCTION WORKER CACHE...');
  console.log(`Query: "${query}"`);
  
  // Test production worker multiple times
  const prodWorkerUrl = 'https://searchtermux-search-worker-dev.tech-knnsyndicate.workers.dev';
  
  console.log('\n1️⃣ First request to production worker:');
  try {
    const result1 = await makeRequest(prodWorkerUrl, 'POST', { 
      query: query,
      options: { limit: 3 }
    });
    
    console.log(`   Status: ${result1.status}`);
    console.log(`   Duration: ${result1.duration}ms`);
    console.log(`   Cached: ${result1.data.meta?.cached || false}`);
    console.log(`   X-Cache-Status: ${result1.headers['x-cache-status'] || 'not set'}`);
    console.log(`   Processing time: ${result1.data.meta?.processingTime}`);
    console.log(`   Results count: ${result1.data.results?.length || 0}`);
    
    // Wait 2 seconds
    console.log('\n   ⏳ Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n2️⃣ Second request (should be HIT if cache working):');
    const result2 = await makeRequest(prodWorkerUrl, 'POST', { 
      query: query,
      options: { limit: 3 }
    });
    
    console.log(`   Status: ${result2.status}`);
    console.log(`   Duration: ${result2.duration}ms`);
    console.log(`   Cached: ${result2.data.meta?.cached || false}`);
    console.log(`   X-Cache-Status: ${result2.headers['x-cache-status'] || 'not set'}`);
    console.log(`   Processing time: ${result2.data.meta?.processingTime}`);
    console.log(`   Speed improvement: ${result1.duration > result2.duration ? Math.round((1 - result2.duration/result1.duration) * 100) + '%' : 'None'}`);
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🔍 ANALYSIS: Why Production Cache Always Shows MISS');
  console.log('=' .repeat(60));
  
  console.log('\n🚨 LIKELY ROOT CAUSES:');
  
  console.log('\n1️⃣ REDIS CREDENTIALS MISSING:');
  console.log('   - Production worker may not have Redis secrets configured');
  console.log('   - Check: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
  console.log('   - Solution: Set secrets with wrangler secret put');
  
  console.log('\n2️⃣ DIFFERENT CACHE KEY FORMAT:');
  console.log('   - Test worker: "test_search:javascript_tutorial"');
  console.log('   - Prod worker: "search:javascript tutorial:abc123" (normalized)');
  console.log('   - Query normalization may be inconsistent');
  
  console.log('\n3️⃣ CACHE ERROR HANDLING:');
  console.log('   - Production worker catches Redis errors silently');
  console.log('   - May fall back to API calls without indicating cache failure');
  
  console.log('\n4️⃣ RATE LIMITING INTERFERENCE:');
  console.log('   - Rate limiting happens even for cache hits');
  console.log('   - May bypass cache logic under certain conditions');
  
  console.log('\n5️⃣ QUERY NORMALIZATION ISSUES:');
  console.log('   - Stop word removal, sorting, etc. may cause cache misses');
  console.log('   - Same query string may generate different cache keys');
  
  console.log('\n🔧 DEBUGGING STEPS TO TAKE:');
  console.log('\n1. Check Redis credentials:');
  console.log('   npx wrangler secret list --name searchtermux-search-worker');
  
  console.log('\n2. Test cache key generation:');
  console.log('   - Add logging to see what cache keys are generated');
  console.log('   - Compare with test worker cache keys');
  
  console.log('\n3. Check Redis connection:');
  console.log('   - Add Redis ping test to worker');
  console.log('   - Verify Upstash Redis instance is active');
  
  console.log('\n4. Examine cache error logs:');
  console.log('   - Use wrangler tail to see real-time logs');
  console.log('   - Look for Redis connection errors');
  
  console.log('\n5. Test with identical setup:');
  console.log('   - Deploy test worker with production settings');
  console.log('   - Compare cache behavior');
  
  console.log('\n💡 IMMEDIATE FIXES TO TRY:');
  console.log('1. Set Redis secrets for production worker');
  console.log('2. Add debug logging to cache operations');
  console.log('3. Test Redis connection in production worker');
  console.log('4. Compare cache key generation between workers');
}

debugProductionCache().catch(console.error);
















