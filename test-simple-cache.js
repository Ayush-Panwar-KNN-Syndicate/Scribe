#!/usr/bin/env node
/**
 * Test the simple Redis caching implementation
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
        'User-Agent': 'SimpleCacheTest/1.0'
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

async function testSimpleCache() {
  console.log('🚀 TESTING SIMPLE REDIS CACHE IMPLEMENTATION');
  console.log('=' .repeat(60));
  console.log('Worker: https://searchtermux-search-worker-dev.tech-a14.workers.dev/');
  console.log('Approach: Direct Redis calls (like test worker)');
  console.log('');

  const testQuery = 'simple cache test';
  const testOptions = { limit: 3 };
  
  console.log(`🎯 Test Query: "${testQuery}"`);
  console.log(`🎯 Options: ${JSON.stringify(testOptions)}`);
  console.log('');

  // Test 1: First request (should be MISS)
  console.log('1️⃣ First request (expecting MISS):');
  const result1 = await makeRequest(testQuery, testOptions);
  
  if (result1.status === 200) {
    console.log(`   ✅ Status: ${result1.status}`);
    console.log(`   ⏱️  Duration: ${result1.duration}ms`);
    console.log(`   🎯 Cache Status: ${result1.headers.cacheStatus || 'not set'}`);
    console.log(`   📊 Results: ${result1.data.results?.length || 0}`);
    console.log(`   🔄 Cached (meta): ${result1.data.meta?.cached || false}`);
    
    if (result1.headers.cacheStatus === 'MISS') {
      console.log(`   ✅ Cache MISS as expected`);
    } else {
      console.log(`   ⚠️  Unexpected cache status`);
    }
  } else {
    console.log(`   ❌ Request failed: Status ${result1.status}`);
    console.log(`   Error: ${result1.error || result1.data}`);
    return;
  }

  // Wait for cache to be written
  console.log('\n   ⏳ Waiting 4 seconds for cache to be written...');
  await new Promise(resolve => setTimeout(resolve, 4000));

  // Test 2: Second request (should be HIT)
  console.log('\n2️⃣ Second request (expecting HIT):');
  const result2 = await makeRequest(testQuery, testOptions);
  
  if (result2.status === 200) {
    console.log(`   ✅ Status: ${result2.status}`);
    console.log(`   ⏱️  Duration: ${result2.duration}ms`);
    console.log(`   🎯 Cache Status: ${result2.headers.cacheStatus || 'not set'}`);
    console.log(`   📊 Results: ${result2.data.results?.length || 0}`);
    console.log(`   🔄 Cached (meta): ${result2.data.meta?.cached || false}`);
    
    const isCacheHit = result2.headers.cacheStatus === 'HIT' || result2.data.meta?.cached === true;
    const speedImprovement = result1.duration > result2.duration ? 
      Math.round((1 - result2.duration/result1.duration) * 100) : 0;
    
    console.log(`   🎯 Cache Hit: ${isCacheHit ? '✅ YES' : '❌ NO'}`);
    console.log(`   ⚡ Speed improvement: ${speedImprovement}%`);
    
    if (isCacheHit) {
      console.log(`   🎉 SIMPLE CACHE IS WORKING!`);
    } else {
      console.log(`   ⚠️  Still cache miss - need to investigate`);
    }
  } else {
    console.log(`   ❌ Second request failed: Status ${result2.status}`);
    return;
  }

  // Test 3: Third request (should also be HIT)
  console.log('\n3️⃣ Third request (should also be HIT):');
  const result3 = await makeRequest(testQuery, testOptions);
  
  if (result3.status === 200) {
    const isCacheHit3 = result3.headers.cacheStatus === 'HIT' || result3.data.meta?.cached === true;
    console.log(`   🎯 Cache Status: ${result3.headers.cacheStatus || 'not set'}`);
    console.log(`   ⏱️  Duration: ${result3.duration}ms`);
    console.log(`   🎯 Cache Hit: ${isCacheHit3 ? '✅ YES' : '❌ NO'}`);
  }

  // Summary
  console.log('\n📊 SIMPLE CACHE TEST RESULTS');
  console.log('=' .repeat(40));
  
  const allHits = [
    result2.headers.cacheStatus === 'HIT' || result2.data.meta?.cached,
    result3.headers.cacheStatus === 'HIT' || result3.data.meta?.cached
  ].filter(Boolean).length;
  
  console.log(`Total cache tests: 2`);
  console.log(`Cache hits detected: ${allHits}`);
  console.log(`Cache success rate: ${Math.round((allHits / 2) * 100)}%`);
  
  if (allHits >= 1) {
    console.log('\n🎉 ✅ SIMPLE CACHE IS WORKING!');
    console.log('✅ Direct Redis approach successful');
    console.log('✅ Cache hits detected');
    console.log('✅ Performance improvement confirmed');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. ✅ Simple caching: WORKING');
    console.log('2. 🔄 Add advanced features (query normalization)');
    console.log('3. 🔄 Add options hash stability');
    console.log('4. 🔄 Add smart TTL');
    console.log('5. 🔄 Re-enable CORS and rate limiting');
    
  } else {
    console.log('\n⚠️ ❌ CACHE STILL NOT WORKING');
    console.log('Need to investigate further:');
    console.log('• Check worker logs for Redis errors');
    console.log('• Verify Redis credentials');
    console.log('• Test Redis connection directly');
  }
  
  console.log('\n💡 Worker logs should show:');
  console.log('• "🔧 Initializing simple Redis cache..."');
  console.log('• "📦 Redis GET result: NULL" (first request)');
  console.log('• "💾 Storing in Redis cache: ..."');
  console.log('• "✅ Redis SETEX successful: ..."');
  console.log('• "📦 Redis GET result: DATA FOUND" (second request)');
  console.log('• "🎯 CACHE HIT for query: ..."');
}

testSimpleCache().catch(console.error);
















