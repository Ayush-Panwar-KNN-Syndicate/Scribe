#!/usr/bin/env node
/**
 * Test Redis connection directly using the same credentials as production worker
 */

const https = require('https');

// Test the production worker's cache functionality with a simple direct test
async function testProductionWorkerCache() {
  console.log('🔍 TESTING PRODUCTION WORKER CACHE DIRECTLY');
  console.log('=' .repeat(50));
  
  const workerUrl = 'https://searchtermux-search-worker-dev.tech-a14.workers.dev';
  const testQuery = 'redis test';
  const testOptions = { limit: 1 };
  
  console.log(`Worker URL: ${workerUrl}`);
  console.log(`Test Query: "${testQuery}"`);
  console.log(`Options: ${JSON.stringify(testOptions)}`);
  console.log('');
  
  // Make multiple requests with the exact same query/options
  console.log('📤 Making 3 identical requests to test cache...');
  
  for (let i = 1; i <= 3; i++) {
    console.log(`\n${i}️⃣ Request ${i}:`);
    
    const start = Date.now();
    const postData = JSON.stringify({
      query: testQuery,
      options: testOptions
    });
    
    try {
      const response = await new Promise((resolve, reject) => {
        const req = https.request({
          hostname: 'searchtermux-search-worker-dev.tech-a14.workers.dev',
          port: 443,
          path: '/',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        }, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              const json = JSON.parse(data);
              resolve({
                status: res.statusCode,
                headers: res.headers,
                data: json,
                duration: Date.now() - start
              });
            } catch (e) {
              resolve({
                status: res.statusCode,
                headers: res.headers,
                data: data,
                duration: Date.now() - start,
                parseError: e.message
              });
            }
          });
        });
        
        req.on('error', reject);
        req.write(postData);
        req.end();
      });
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Duration: ${response.duration}ms`);
      console.log(`   Cache Status: ${response.headers['x-cache-status'] || 'not set'}`);
      console.log(`   Processing Time: ${response.headers['x-processing-time'] || 'not set'}`);
      
      if (response.status === 200) {
        console.log(`   Results: ${response.data.results?.length || 0}`);
        console.log(`   Cached (meta): ${response.data.meta?.cached || false}`);
        
        if (response.headers['x-cache-status'] === 'HIT') {
          console.log(`   🎉 CACHE HIT DETECTED!`);
        } else {
          console.log(`   📭 Cache miss`);
        }
      } else {
        console.log(`   ❌ Error: ${response.data}`);
      }
      
      // Wait between requests to allow cache to be written
      if (i < 3) {
        console.log(`   ⏳ Waiting 4 seconds for cache...`);
        await new Promise(resolve => setTimeout(resolve, 4000));
      }
      
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
    }
  }
  
  console.log('\n📊 DIAGNOSIS:');
  console.log('If all requests show MISS, possible issues:');
  console.log('• Redis connection failing silently');
  console.log('• Cache keys being generated differently each time');
  console.log('• Cache TTL too short');
  console.log('• Background cache.set() failing');
  console.log('• Cache-optimizer logic issues');
  
  console.log('\n💡 NEXT STEPS:');
  console.log('1. Check worker logs for cache debugging output');
  console.log('2. Compare with working test-search-worker');
  console.log('3. Test Redis connection directly');
  console.log('4. Simplify cache implementation');
}

testProductionWorkerCache().catch(console.error);
















