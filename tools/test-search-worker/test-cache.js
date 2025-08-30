#!/usr/bin/env node
/**
 * Comprehensive cache testing script for the test search worker
 */

const https = require('https');
const http = require('http');

// Configuration
const WORKER_URL = 'https://test-search-worker.tech-a14.workers.dev'; // Deployed URL
const TEST_QUERIES = [
  'javascript',
  'python programming',
  'react hooks',
  'nodejs tutorial',
  'web development'
];

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const lib = isHttps ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'CacheTestScript/1.0',
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = lib.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test functions
async function testWorkerHealth() {
  console.log('🏥 Testing worker health...');
  try {
    const response = await makeRequest(`${WORKER_URL}/health`);
    if (response.status === 200) {
      console.log('✅ Worker is healthy');
      console.log(`   Environment: ${response.data.environment}`);
      console.log(`   Endpoints available: ${response.data.endpoints.length}`);
      return true;
    } else {
      console.log(`❌ Worker health check failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Worker health check error: ${error.message}`);
    return false;
  }
}

async function testCacheStatus() {
  console.log('\n📊 Checking cache status...');
  try {
    const response = await makeRequest(`${WORKER_URL}/cache-status`);
    if (response.status === 200) {
      console.log('✅ Cache status retrieved');
      console.log(`   Total cached keys: ${response.data.total_keys}`);
      console.log(`   Redis connected: ${response.data.redis_connected}`);
      if (response.data.keys.length > 0) {
        console.log(`   Sample keys: ${response.data.keys.slice(0, 3).join(', ')}`);
      }
      return response.data;
    } else {
      console.log(`❌ Cache status check failed: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Cache status error: ${error.message}`);
    return null;
  }
}

async function testCacheClear() {
  console.log('\n🧹 Clearing cache...');
  try {
    const response = await makeRequest(`${WORKER_URL}/cache-clear`, { method: 'POST' });
    if (response.status === 200) {
      console.log('✅ Cache cleared successfully');
      console.log(`   Keys deleted: ${response.data.keys_deleted}`);
      return true;
    } else {
      console.log(`❌ Cache clear failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Cache clear error: ${error.message}`);
    return false;
  }
}

async function testCacheHitMiss(query) {
  console.log(`\n🔍 Testing cache hit/miss for: "${query}"`);
  
  // First request - should be MISS
  console.log('   First request (expecting MISS)...');
  const startTime1 = Date.now();
  try {
    const response1 = await makeRequest(`${WORKER_URL}/cache-test?q=${encodeURIComponent(query)}&limit=5`);
    const duration1 = Date.now() - startTime1;
    
    if (response1.status === 200) {
      console.log(`   ✅ Status: ${response1.data.cache_status} (${duration1}ms)`);
      console.log(`   Results: ${response1.data.total}`);
      console.log(`   Data source: ${response1.data.debug?.data_source || 'unknown'}`);
    } else {
      console.log(`   ❌ Request failed: ${response1.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ First request error: ${error.message}`);
    return false;
  }

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Second request - should be HIT
  console.log('   Second request (expecting HIT)...');
  const startTime2 = Date.now();
  try {
    const response2 = await makeRequest(`${WORKER_URL}/cache-test?q=${encodeURIComponent(query)}&limit=5`);
    const duration2 = Date.now() - startTime2;
    
    if (response2.status === 200) {
      console.log(`   ✅ Status: ${response2.data.cache_status} (${duration2}ms)`);
      console.log(`   Results: ${response2.data.total}`);
      console.log(`   Cache hit: ${response2.data.debug?.cache_hit || false}`);
      
      // Performance comparison
      if (duration2 < duration1) {
        console.log(`   🚀 Cache improved speed by ${duration1 - duration2}ms (${Math.round((1 - duration2/duration1) * 100)}% faster)`);
      }
      
      return response2.data.cache_status === 'HIT';
    } else {
      console.log(`   ❌ Second request failed: ${response2.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Second request error: ${error.message}`);
    return false;
  }
}

async function testForceRefresh(query) {
  console.log(`\n🔄 Testing force refresh for: "${query}"`);
  
  try {
    const response = await makeRequest(`${WORKER_URL}/cache-test?q=${encodeURIComponent(query)}&refresh=true&limit=3`);
    if (response.status === 200) {
      console.log(`   ✅ Status: ${response.data.cache_status}`);
      console.log(`   Force refresh: ${response.data.debug?.force_refresh || false}`);
      console.log(`   Results: ${response.data.total}`);
      return true;
    } else {
      console.log(`   ❌ Force refresh failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Force refresh error: ${error.message}`);
    return false;
  }
}

async function testMockData(query) {
  console.log(`\n🎭 Testing mock data for: "${query}"`);
  
  try {
    const response = await makeRequest(`${WORKER_URL}/cache-test?q=${encodeURIComponent(query)}&mock=true&limit=5`);
    if (response.status === 200) {
      console.log(`   ✅ Status: ${response.data.cache_status}`);
      console.log(`   Data source: ${response.data.debug?.data_source || 'unknown'}`);
      console.log(`   Results: ${response.data.total}`);
      console.log(`   Sample title: ${response.data.results[0]?.title || 'No results'}`);
      return true;
    } else {
      console.log(`   ❌ Mock data test failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Mock data error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting comprehensive cache testing...\n');
  console.log(`Worker URL: ${WORKER_URL}`);
  console.log(`Test queries: ${TEST_QUERIES.join(', ')}\n`);
  
  let totalTests = 0;
  let passedTests = 0;
  
  // Test 1: Worker health
  totalTests++;
  if (await testWorkerHealth()) passedTests++;
  
  // Test 2: Initial cache status
  totalTests++;
  const initialCacheStatus = await testCacheStatus();
  if (initialCacheStatus !== null) passedTests++;
  
  // Test 3: Clear cache
  totalTests++;
  if (await testCacheClear()) passedTests++;
  
  // Test 4: Cache hit/miss for each query
  for (const query of TEST_QUERIES.slice(0, 3)) { // Test first 3 queries
    totalTests++;
    if (await testCacheHitMiss(query)) passedTests++;
  }
  
  // Test 5: Final cache status
  totalTests++;
  const finalCacheStatus = await testCacheStatus();
  if (finalCacheStatus !== null) passedTests++;
  
  // Test 6: Force refresh
  totalTests++;
  if (await testForceRefresh(TEST_QUERIES[0])) passedTests++;
  
  // Test 7: Mock data
  totalTests++;
  if (await testMockData('test query')) passedTests++;
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📋 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Cache is working perfectly!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
  }
  
  console.log('\n💡 Manual testing URLs:');
  console.log(`   Health: ${WORKER_URL}/health`);
  console.log(`   Search: ${WORKER_URL}/?q=test&limit=5`);
  console.log(`   Cache test: ${WORKER_URL}/cache-test?q=test&limit=5`);
  console.log(`   Cache status: ${WORKER_URL}/cache-status`);
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, makeRequest };
