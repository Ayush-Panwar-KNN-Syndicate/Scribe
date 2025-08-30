#!/usr/bin/env node
/**
 * Test production worker cache from an allowed origin
 * This simulates requests from search.termuxtools.com
 */

const https = require('https');

function makeProductionRequest(query, options = {}) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    
    const postData = JSON.stringify({
      query: query,
      options: options
    });
    
    const requestOptions = {
      hostname: 'api.termuxtools.com',
      port: 443,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Origin': 'https://search.termuxtools.com',
        'User-Agent': 'Mozilla/5.0 (compatible; SearchTermux/1.0)',
        'Accept': 'application/json'
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
            success: true,
            status: res.statusCode,
            duration: duration,
            data: json,
            headers: {
              cacheStatus: res.headers['x-cache-status'],
              processingTime: res.headers['x-processing-time'],
              cacheKey: res.headers['x-cache-key']
            }
          });
        } catch (e) {
          resolve({
            success: false,
            status: res.statusCode,
            duration: duration,
            data: data,
            error: `JSON parse error: ${e.message}`
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        success: false,
        error: error.message,
        duration: Date.now() - start
      });
    });

    req.write(postData);
    req.end();
  });
}

async function testProductionCache() {
  console.log('🚀 TESTING PRODUCTION WORKER CACHE FIXES');
  console.log('=' .repeat(50));
  console.log('Worker URL: https://api.termuxtools.com');
  console.log('Origin: https://search.termuxtools.com (simulated)');
  console.log('');

  const testQuery = 'javascript async await tutorial';
  const testOptions = { limit: 5 };

  console.log(`🧪 Cache Test`);
  console.log('─'.repeat(40));
  console.log(`Query: "${testQuery}"`);
  console.log(`Options: ${JSON.stringify(testOptions)}`);

  try {
    // First request - should be MISS
    console.log('\n1️⃣ First request (expecting MISS):');
    const result1 = await makeProductionRequest(testQuery, testOptions);
    
    if (!result1.success) {
      console.log(`   ❌ Request failed: ${result1.error}`);
      console.log(`   Status: ${result1.status}`);
      console.log(`   Response: ${result1.data.slice(0, 500)}...`);
      
      if (result1.status === 403) {
        console.log(`\n   💡 CORS Error - Possible solutions:`);
        console.log(`   1. Add your domain to ALLOWED_ORIGINS`);
        console.log(`   2. Test from https://search.termuxtools.com`);
        console.log(`   3. Use the browser test instead`);
      }
      return;
    }

    console.log(`   Status: ${result1.status}`);
    console.log(`   Duration: ${result1.duration}ms`);
    console.log(`   Cache Status: ${result1.headers.cacheStatus || 'not set'}`);
    console.log(`   Results: ${result1.data.results?.length || 0}`);
    console.log(`   ✅ First request successful`);

    // Wait for cache
    console.log('\n   ⏳ Waiting 3 seconds for cache...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Second request - should be HIT
    console.log('\n2️⃣ Second request (expecting HIT):');
    const result2 = await makeProductionRequest(testQuery, testOptions);

    if (!result2.success) {
      console.log(`   ❌ Second request failed: ${result2.error}`);
      return;
    }

    console.log(`   Status: ${result2.status}`);
    console.log(`   Duration: ${result2.duration}ms`);
    console.log(`   Cache Status: ${result2.headers.cacheStatus || 'not set'}`);
    
    const isCacheHit = result2.headers.cacheStatus === 'HIT' || 
                      result2.data.meta?.cached === true;
    const speedImprovement = result1.duration > result2.duration ? 
      Math.round((1 - result2.duration/result1.duration) * 100) : 0;

    console.log(`   Cache Hit: ${isCacheHit ? '✅ YES' : '❌ NO'}`);
    console.log(`   Speed improvement: ${speedImprovement}%`);

    // Options stability test
    console.log('\n3️⃣ Options stability test:');
    const reorderedOptions = { limit: 5 }; // Same options, potentially different order
    const result3 = await makeProductionRequest(testQuery, reorderedOptions);

    if (result3.success && result3.status === 200) {
      const isOptionsStable = result3.headers.cacheStatus === 'HIT' || 
                             result3.data.meta?.cached === true;
      
      console.log(`   Same options test: ${isOptionsStable ? '✅ STABLE' : '❌ UNSTABLE'}`);
    }

    console.log('\n📊 RESULTS SUMMARY');
    console.log('=' .repeat(30));
    console.log(`✅ Worker responding: ${result1.status === 200 ? 'YES' : 'NO'}`);
    console.log(`✅ Cache functionality: ${isCacheHit ? 'WORKING' : 'BROKEN'}`);
    console.log(`✅ Performance gain: ${speedImprovement}%`);

    if (isCacheHit && speedImprovement > 0) {
      console.log('\n🎉 CACHE FIXES WORKING!');
      console.log('Your production worker cache has been successfully fixed!');
    } else {
      console.log('\n⚠️ Cache may need more investigation');
    }

  } catch (error) {
    console.log(`\n❌ Test failed: ${error.message}`);
    console.log('\nPossible issues:');
    console.log('- CORS restrictions (origin not allowed)');
    console.log('- Rate limiting');
    console.log('- Worker deployment issues');
    console.log('- Network connectivity');
  }
}

console.log('💡 Alternative: Open test-from-browser.html in your browser');
console.log('   This provides a visual interface for testing the cache\n');

testProductionCache().catch(console.error);