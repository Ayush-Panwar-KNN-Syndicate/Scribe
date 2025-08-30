#!/usr/bin/env node
/**
 * Comprehensive cache hit verification script
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
          resolve({ 
            duration, 
            status: res.statusCode, 
            data: json,
            headers: res.headers
          });
        } catch (e) {
          resolve({ duration, status: res.statusCode, data: data, headers: res.headers });
        }
      });
    }).on('error', reject);
  });
}

async function verifyCacheHits() {
  console.log('🔍 COMPREHENSIVE CACHE HIT VERIFICATION');
  console.log('=' .repeat(50));
  
  const query = 'nodejs express tutorial';
  const testUrl = `${WORKER_URL}/cache-test?q=${encodeURIComponent(query)}&limit=3`;
  
  console.log(`\n🎯 Test Query: "${query}"`);
  console.log(`📍 Test URL: ${testUrl}\n`);
  
  // Step 1: Clear cache first
  console.log('1️⃣ CLEARING CACHE...');
  try {
    const clearResult = await makeRequest(`${WORKER_URL}/cache-clear`);
    if (clearResult.status === 200) {
      console.log(`   ✅ Cache cleared: ${clearResult.data.keys_deleted} keys deleted`);
    } else {
      console.log(`   ❌ Cache clear failed: ${clearResult.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Cache clear error: ${error.message}`);
  }
  
  console.log('\n2️⃣ FIRST REQUEST (Should be MISS)...');
  
  try {
    const result1 = await makeRequest(testUrl);
    
    console.log('   📊 RESPONSE ANALYSIS:');
    console.log(`   Status Code: ${result1.status}`);
    console.log(`   Response Time: ${result1.duration}ms`);
    console.log(`   Cache Status: ${result1.data.cache_status}`);
    console.log(`   Results Count: ${result1.data.total}`);
    console.log(`   Data Source: ${result1.data.debug?.data_source || 'unknown'}`);
    
    console.log('\n   🔍 CACHE VERIFICATION INDICATORS:');
    console.log(`   ├─ cache_status: "${result1.data.cache_status}" (should be "MISS")`);
    console.log(`   ├─ X-Cache-Status header: "${result1.headers['x-cache-status'] || 'not set'}"`);
    console.log(`   ├─ cache_hit (debug): ${result1.data.debug?.cache_hit || false}`);
    console.log(`   ├─ Response time: ${result1.duration}ms (should be slower)`);
    console.log(`   └─ Data freshness: ${result1.data.timestamp}`);
    
    if (result1.data.cache_status === 'MISS') {
      console.log('   ✅ VERIFIED: Cache MISS as expected');
    } else {
      console.log('   ⚠️  UNEXPECTED: Expected MISS but got ' + result1.data.cache_status);
    }
    
    // Wait for cache to be written
    console.log('\n   ⏳ Waiting 2 seconds for cache to be written...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n3️⃣ SECOND REQUEST (Should be HIT)...');
    
    const result2 = await makeRequest(testUrl);
    
    console.log('   📊 RESPONSE ANALYSIS:');
    console.log(`   Status Code: ${result2.status}`);
    console.log(`   Response Time: ${result2.duration}ms`);
    console.log(`   Cache Status: ${result2.data.cache_status}`);
    console.log(`   Results Count: ${result2.data.total}`);
    
    console.log('\n   🔍 CACHE HIT VERIFICATION:');
    console.log(`   ├─ cache_status: "${result2.data.cache_status}" (should be "HIT")`);
    console.log(`   ├─ X-Cache-Status header: "${result2.headers['x-cache-status'] || 'not set'}"`);
    console.log(`   ├─ cache_hit (debug): ${result2.data.debug?.cache_hit || false}`);
    console.log(`   ├─ Response time: ${result2.duration}ms vs ${result1.duration}ms`);
    console.log(`   ├─ Speed improvement: ${result1.duration > result2.duration ? Math.round((1 - result2.duration/result1.duration) * 100) + '%' : 'No improvement'}`);
    console.log(`   └─ Same data: ${JSON.stringify(result1.data.results) === JSON.stringify(result2.data.results)}`);
    
    if (result2.data.cache_status === 'HIT') {
      console.log('   ✅ VERIFIED: Cache HIT confirmed');
    } else {
      console.log('   ❌ FAILED: Expected HIT but got ' + result2.data.cache_status);
    }
    
    console.log('\n4️⃣ CACHE STORAGE VERIFICATION...');
    
    const cacheStatus = await makeRequest(`${WORKER_URL}/cache-status`);
    console.log('   📊 REDIS CACHE STATUS:');
    console.log(`   ├─ Total keys: ${cacheStatus.data.total_keys}`);
    console.log(`   ├─ Redis connected: ${cacheStatus.data.redis_connected}`);
    console.log(`   ├─ Keys in cache: ${cacheStatus.data.keys?.join(', ') || 'none'}`);
    console.log(`   └─ Expected key present: ${cacheStatus.data.keys?.some(key => key.includes('nodejs_express_tutorial')) || false}`);
    
    console.log('\n5️⃣ THIRD REQUEST (Should still be HIT)...');
    
    const result3 = await makeRequest(testUrl);
    console.log(`   Cache Status: ${result3.data.cache_status} (${result3.duration}ms)`);
    console.log(`   Consistent HIT: ${result3.data.cache_status === 'HIT'}`);
    
    console.log('\n6️⃣ FORCE REFRESH TEST (Should be MISS)...');
    
    const refreshUrl = `${testUrl}&refresh=true`;
    const result4 = await makeRequest(refreshUrl);
    console.log(`   Force refresh status: ${result4.data.cache_status} (${result4.duration}ms)`);
    console.log(`   Bypass working: ${result4.data.cache_status === 'MISS'}`);
    console.log(`   Force flag detected: ${result4.data.debug?.force_refresh || false}`);
    
    console.log('\n' + '=' .repeat(50));
    console.log('📋 CACHE VERIFICATION SUMMARY');
    console.log('=' .repeat(50));
    
    const tests = [
      { name: 'Cache MISS on first request', passed: result1.data.cache_status === 'MISS' },
      { name: 'Cache HIT on second request', passed: result2.data.cache_status === 'HIT' },
      { name: 'Speed improvement with cache', passed: result2.duration < result1.duration },
      { name: 'Redis storage working', passed: cacheStatus.data.redis_connected },
      { name: 'Cache key created', passed: cacheStatus.data.total_keys > 0 },
      { name: 'Consistent cache hits', passed: result3.data.cache_status === 'HIT' },
      { name: 'Force refresh bypass', passed: result4.data.cache_status === 'MISS' },
      { name: 'Data consistency', passed: JSON.stringify(result1.data.results) === JSON.stringify(result2.data.results) }
    ];
    
    const passedTests = tests.filter(t => t.passed).length;
    const totalTests = tests.length;
    
    tests.forEach(test => {
      console.log(`${test.passed ? '✅' : '❌'} ${test.name}`);
    });
    
    console.log(`\n🎯 OVERALL SCORE: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests*100)}%)`);
    
    if (passedTests === totalTests) {
      console.log('🎉 ALL CACHE VERIFICATION TESTS PASSED!');
      console.log('✅ Cache is working perfectly with full hit/miss detection');
    } else {
      console.log('⚠️  Some cache verification tests failed');
      console.log('🔧 Check the failed tests above for debugging');
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

verifyCacheHits().catch(console.error);
















