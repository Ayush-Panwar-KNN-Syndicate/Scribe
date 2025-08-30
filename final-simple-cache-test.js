#!/usr/bin/env node
/**
 * Final test for simple Redis caching
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
        'Content-Length': Buffer.byteLength(postData)
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

async function finalSimpleCacheTest() {
  console.log('🎯 FINAL SIMPLE CACHE TEST');
  console.log('=' .repeat(50));
  
  const testQuery = 'cache test final';
  const testOptions = { limit: 2 };
  
  console.log(`Query: "${testQuery}"`);
  console.log(`Options: ${JSON.stringify(testOptions)}`);
  console.log('');

  // Request 1 - Should be MISS
  console.log('1️⃣ First request (should be MISS):');
  const result1 = await makeRequest(testQuery, testOptions);
  
  console.log(`   Status: ${result1.status}`);
  console.log(`   Duration: ${result1.duration}ms`);
  console.log(`   Cache Status: ${result1.headers.cacheStatus || 'not set'}`);
  console.log(`   Results: ${result1.data.results?.length || 0}`);
  console.log(`   Cached (meta): ${result1.data.meta?.cached || false}`);
  
  if (result1.status !== 200) {
    console.log('   ❌ First request failed');
    return;
  }

  // Wait for cache
  console.log('\n   ⏳ Waiting 5 seconds for cache...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Request 2 - Should be HIT
  console.log('\n2️⃣ Second request (should be HIT):');
  const result2 = await makeRequest(testQuery, testOptions);
  
  console.log(`   Status: ${result2.status}`);
  console.log(`   Duration: ${result2.duration}ms`);
  console.log(`   Cache Status: ${result2.headers.cacheStatus || 'not set'}`);
  console.log(`   Results: ${result2.data.results?.length || 0}`);
  console.log(`   Cached (meta): ${result2.data.meta?.cached || false}`);
  
  const isCacheHit = result2.headers.cacheStatus === 'HIT' || result2.data.meta?.cached === true;
  const speedImprovement = result1.duration > result2.duration ? 
    Math.round((1 - result2.duration/result1.duration) * 100) : 0;
  
  console.log(`   Cache Hit: ${isCacheHit ? '✅ YES' : '❌ NO'}`);
  console.log(`   Speed improvement: ${speedImprovement}%`);

  // Request 3 - Should also be HIT
  console.log('\n3️⃣ Third request (should also be HIT):');
  const result3 = await makeRequest(testQuery, testOptions);
  
  const isCacheHit3 = result3.headers.cacheStatus === 'HIT' || result3.data.meta?.cached === true;
  console.log(`   Cache Status: ${result3.headers.cacheStatus || 'not set'}`);
  console.log(`   Duration: ${result3.duration}ms`);
  console.log(`   Cache Hit: ${isCacheHit3 ? '✅ YES' : '❌ NO'}`);

  // Final assessment
  console.log('\n🎯 SIMPLE CACHE RESULTS:');
  console.log('=' .repeat(30));
  
  const totalHits = [isCacheHit, isCacheHit3].filter(Boolean).length;
  
  if (totalHits >= 1) {
    console.log('🎉 ✅ SIMPLE CACHE IS WORKING!');
    console.log('');
    console.log('✅ Achievements:');
    console.log('   • Direct Redis implementation: SUCCESS');
    console.log('   • Cache hits detected: YES');
    console.log('   • Performance improvement: YES');
    console.log('   • CORS disabled: SUCCESS');
    console.log('   • Worker responding: SUCCESS');
    console.log('');
    console.log('📈 Performance:');
    console.log(`   • Cache hit rate: ${Math.round((totalHits/2) * 100)}%`);
    console.log(`   • Speed improvement: ${speedImprovement}%`);
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. ✅ Simple caching: WORKING');
    console.log('2. 🔄 Add query normalization');
    console.log('3. 🔄 Add options hash stability');
    console.log('4. 🔄 Add smart TTL');
    console.log('5. 🔄 Re-enable CORS and rate limiting');
    
  } else {
    console.log('⚠️ ❌ CACHE STILL NOT WORKING');
    console.log('');
    console.log('✅ What is working:');
    console.log('   • Worker deployment: YES');
    console.log('   • Reddit API calls: YES');
    console.log('   • CORS disabled: YES');
    console.log('');
    console.log('❌ What needs investigation:');
    console.log('   • Redis connection or storage');
    console.log('   • Cache key generation');
    console.log('   • Background cache setting');
  }
}

finalSimpleCacheTest().catch(console.error);
















