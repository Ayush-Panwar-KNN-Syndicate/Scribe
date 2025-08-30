#!/usr/bin/env node
/**
 * Debug: Why is cache not working for repeated queries?
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
        'User-Agent': 'CacheDebugTest/1.0'
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
              cacheSystem: res.headers['x-cache-system'],
              processingTime: res.headers['x-processing-time']
            }
          });
        } catch (e) {
          resolve({
            duration,
            status: res.statusCode,
            error: `Parse error: ${e.message}`,
            data: data.slice(0, 500)
          });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function debugCacheIssue() {
  console.log('🔍 DEBUGGING: Cache Not Working for Repeated Queries');
  console.log('=' .repeat(60));
  console.log('Issue: New query searched twice, second time should be HIT but shows MISS');
  console.log('');

  const testQuery = `debug cache test ${Date.now()}`;
  console.log(`🎯 Test Query: "${testQuery}"`);
  console.log('Expected: MISS → HIT');
  console.log('');

  // First request - should be MISS
  console.log('1️⃣ FIRST REQUEST (Expected: MISS):');
  console.log('-'.repeat(40));
  
  const result1 = await makeRequest(testQuery, { limit: 3 });
  
  if (result1.status === 200) {
    console.log(`✅ Status: ${result1.status}`);
    console.log(`🎯 Cache Status: ${result1.headers.cacheStatus}`);
    console.log(`🏷️  Cache System: ${result1.headers.cacheSystem}`);
    console.log(`⏱️  Duration: ${result1.duration}ms`);
    console.log(`📊 Results: ${result1.data.results?.length || 0}`);
    console.log(`🔄 Cached Flag: ${result1.data.cached}`);
    
    if (result1.headers.cacheStatus === 'MISS') {
      console.log('✅ First request correctly shows MISS');
    } else {
      console.log('⚠️ Unexpected: First request should be MISS');
    }
  } else {
    console.log(`❌ First request failed: Status ${result1.status}`);
    console.log(`Error: ${result1.error || result1.data}`);
    return;
  }

  console.log('');
  console.log('⏳ Waiting 10 seconds for cache to be written...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Second request - should be HIT
  console.log('2️⃣ SECOND REQUEST (Expected: HIT):');
  console.log('-'.repeat(40));
  
  const result2 = await makeRequest(testQuery, { limit: 3 });
  
  if (result2.status === 200) {
    console.log(`✅ Status: ${result2.status}`);
    console.log(`🎯 Cache Status: ${result2.headers.cacheStatus}`);
    console.log(`🏷️  Cache System: ${result2.headers.cacheSystem}`);
    console.log(`⏱️  Duration: ${result2.duration}ms`);
    console.log(`📊 Results: ${result2.data.results?.length || 0}`);
    console.log(`🔄 Cached Flag: ${result2.data.cached}`);
    
    if (result2.headers.cacheStatus === 'HIT') {
      console.log('✅ SUCCESS: Second request correctly shows HIT');
      const speedImprovement = Math.round((1 - result2.duration / result1.duration) * 100);
      console.log(`⚡ Speed improvement: ${speedImprovement}%`);
    } else {
      console.log('❌ PROBLEM: Second request should be HIT but shows MISS');
      console.log('');
      console.log('🔍 POSSIBLE CAUSES:');
      console.log('1. Cache not being written properly');
      console.log('2. Cache key generation inconsistent');
      console.log('3. Redis connection issues');
      console.log('4. Cache TTL too short');
      console.log('5. Background cache storage failing');
    }
  } else {
    console.log(`❌ Second request failed: Status ${result2.status}`);
    console.log(`Error: ${result2.error || result2.data}`);
    return;
  }

  // Third request to double-check
  console.log('');
  console.log('⏳ Waiting 5 seconds for third test...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('3️⃣ THIRD REQUEST (Should also be HIT):');
  console.log('-'.repeat(40));
  
  const result3 = await makeRequest(testQuery, { limit: 3 });
  
  if (result3.status === 200) {
    console.log(`✅ Status: ${result3.status}`);
    console.log(`🎯 Cache Status: ${result3.headers.cacheStatus}`);
    console.log(`⏱️  Duration: ${result3.duration}ms`);
    console.log(`🔄 Cached Flag: ${result3.data.cached}`);
  }

  // Analysis
  console.log('');
  console.log('📊 CACHE BEHAVIOR ANALYSIS:');
  console.log('=' .repeat(40));
  
  const requests = [
    { num: 1, status: result1.headers.cacheStatus, duration: result1.duration },
    { num: 2, status: result2.headers.cacheStatus, duration: result2.duration },
    { num: 3, status: result3.headers.cacheStatus, duration: result3.duration }
  ];
  
  requests.forEach(req => {
    console.log(`Request ${req.num}: ${req.status} (${req.duration}ms)`);
  });
  
  const hitCount = requests.filter(r => r.status === 'HIT').length;
  const missCount = requests.filter(r => r.status === 'MISS').length;
  
  console.log('');
  console.log(`Cache HITs: ${hitCount}/3`);
  console.log(`Cache MISSes: ${missCount}/3`);
  console.log(`Expected pattern: MISS → HIT → HIT`);
  
  if (hitCount >= 2) {
    console.log('✅ CACHE IS WORKING CORRECTLY');
  } else if (hitCount === 1) {
    console.log('🟡 CACHE IS PARTIALLY WORKING');
    console.log('💡 Possible issues:');
    console.log('- Cache storage delay');
    console.log('- Inconsistent cache key generation');
    console.log('- Redis connection problems');
  } else {
    console.log('❌ CACHE IS NOT WORKING');
    console.log('🚨 CRITICAL ISSUES:');
    console.log('- Cache storage completely failing');
    console.log('- Redis connection broken');
    console.log('- Cache key generation broken');
    console.log('- Background storage not working');
  }

  console.log('');
  console.log('🔧 DEBUGGING RECOMMENDATIONS:');
  console.log('1. Check worker logs for Redis errors');
  console.log('2. Verify Redis credentials are working');
  console.log('3. Test cache key generation consistency');
  console.log('4. Check if background cache storage is failing');
  console.log('5. Verify cache TTL is not too short');
}

debugCacheIssue().catch(console.error);
















