#!/usr/bin/env node
/**
 * Debug cache behavior with multiple rapid requests
 */

const https = require('https');

function makeRequest(query, options = {}) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    
    const postData = JSON.stringify({
      query: query,
      options: options
    });
    
    const requestOptions = {
      hostname: 'searchtermux-search-worker-dev.tech-a14.workers.dev',
      port: 443,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'CacheDebugScript/1.0'
      }
    };

    const req = https.request(requestOptions, (res) => {
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
            headers: {
              cacheStatus: res.headers['x-cache-status'],
              processingTime: res.headers['x-processing-time']
            }
          });
        } catch (e) {
          resolve({
            duration,
            status: res.statusCode,
            error: `Parse error: ${e.message}`,
            data: data.slice(0, 200)
          });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function debugCache() {
  console.log('🔍 DEBUGGING CACHE BEHAVIOR');
  console.log('=' .repeat(50));
  
  const testQuery = 'javascript tutorial';
  const testOptions = { limit: 5 };
  
  console.log(`Test Query: "${testQuery}"`);
  console.log(`Options: ${JSON.stringify(testOptions)}`);
  console.log('');

  // Test 1: First request
  console.log('1️⃣ First request:');
  const result1 = await makeRequest(testQuery, testOptions);
  console.log(`   Status: ${result1.status}`);
  console.log(`   Duration: ${result1.duration}ms`);
  console.log(`   Cache Status: ${result1.headers.cacheStatus || 'not set'}`);
  console.log(`   Processing Time: ${result1.headers.processingTime || 'not set'}`);
  console.log(`   Results: ${result1.data.results?.length || 0}`);
  
  if (result1.status !== 200) {
    console.log(`   Error: ${result1.error || result1.data}`);
    return;
  }

  // Test 2: Wait 2 seconds then try again
  console.log('\n⏳ Waiting 2 seconds...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\n2️⃣ Second request (after 2s):');
  const result2 = await makeRequest(testQuery, testOptions);
  console.log(`   Status: ${result2.status}`);
  console.log(`   Duration: ${result2.duration}ms`);
  console.log(`   Cache Status: ${result2.headers.cacheStatus || 'not set'}`);
  console.log(`   Processing Time: ${result2.headers.processingTime || 'not set'}`);
  console.log(`   Speed change: ${result1.duration - result2.duration}ms faster`);

  // Test 3: Wait 5 seconds then try again
  console.log('\n⏳ Waiting 5 more seconds...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('\n3️⃣ Third request (after 7s total):');
  const result3 = await makeRequest(testQuery, testOptions);
  console.log(`   Status: ${result3.status}`);
  console.log(`   Duration: ${result3.duration}ms`);
  console.log(`   Cache Status: ${result3.headers.cacheStatus || 'not set'}`);
  console.log(`   Processing Time: ${result3.headers.processingTime || 'not set'}`);
  console.log(`   Speed change: ${result1.duration - result3.duration}ms faster`);

  // Test 4: Rapid fire requests
  console.log('\n4️⃣ Rapid fire test (5 requests):');
  const rapidResults = [];
  
  for (let i = 0; i < 5; i++) {
    const result = await makeRequest(testQuery, testOptions);
    rapidResults.push(result);
    console.log(`   Request ${i+1}: ${result.status} | ${result.duration}ms | Cache: ${result.headers.cacheStatus || 'none'}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // 0.5s between requests
  }

  // Analysis
  console.log('\n📊 CACHE ANALYSIS:');
  console.log('=' .repeat(30));
  
  const allResults = [result1, result2, result3, ...rapidResults];
  const cacheHits = allResults.filter(r => r.headers.cacheStatus === 'HIT').length;
  const cacheMisses = allResults.filter(r => r.headers.cacheStatus === 'MISS').length;
  const avgDuration = Math.round(allResults.reduce((sum, r) => sum + r.duration, 0) / allResults.length);
  
  console.log(`Total requests: ${allResults.length}`);
  console.log(`Cache HITs: ${cacheHits}`);
  console.log(`Cache MISSes: ${cacheMisses}`);
  console.log(`Average duration: ${avgDuration}ms`);
  console.log(`Hit rate: ${Math.round((cacheHits / allResults.length) * 100)}%`);
  
  if (cacheHits === 0) {
    console.log('\n❌ NO CACHE HITS DETECTED');
    console.log('Possible issues:');
    console.log('• Redis connection failing');
    console.log('• Cache keys not being generated correctly');
    console.log('• Cache TTL too short');
    console.log('• Background cache.set() failing');
  } else if (cacheHits > 0) {
    console.log('\n✅ CACHE IS WORKING!');
    console.log('Cache hits detected - the fixes are working correctly');
  }
  
  console.log('\n💡 Next steps:');
  console.log('• Check worker logs for Redis errors');
  console.log('• Verify cache key generation');
  console.log('• Test with the working test-search-worker for comparison');
}

debugCache().catch(console.error);
















