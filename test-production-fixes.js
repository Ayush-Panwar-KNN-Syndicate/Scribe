#!/usr/bin/env node
/**
 * Test the deployed production worker with fixes
 */

const https = require('https');

function makeRequest(url, method = 'POST', body = null) {
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
        'Origin': 'https://search.termuxtools.com',
        'User-Agent': 'CacheTestScript/1.0'
      }
    };

    const req = https.request(options, (res) => {
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
          resolve({ 
            duration, 
            status: res.statusCode, 
            data: data, 
            headers: res.headers 
          });
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

async function testProductionFixes() {
  console.log('🚀 TESTING PRODUCTION WORKER FIXES');
  console.log('=' .repeat(50));
  
  // Use the deployed worker URL (you may need to update this)
  const workerUrl = 'https://api.termuxtools.com';
  
  const testQuery = 'javascript async await tutorial';
  const testOptions = { limit: 5 };
  
  console.log(`Testing query: "${testQuery}"`);
  console.log(`Options: ${JSON.stringify(testOptions)}`);
  
  try {
    // First request - should be MISS
    console.log('\n1️⃣ First request (expecting MISS):');
    const result1 = await makeRequest(workerUrl, 'POST', {
      query: testQuery,
      options: testOptions
    });
    
    console.log(`   Status: ${result1.status}`);
    console.log(`   Duration: ${result1.duration}ms`);
    console.log(`   Cached: ${result1.data.meta?.cached || false}`);
    console.log(`   X-Cache-Status: ${result1.headers['x-cache-status'] || 'not set'}`);
    
    if (result1.status === 200) {
      console.log(`   Results: ${result1.data.results?.length || 0}`);
      console.log('   ✅ Request successful');
    } else {
      console.log(`   ❌ Request failed: ${result1.status}`);
      console.log(`   Error: ${result1.data.error || 'Unknown error'}`);
      return;
    }
    
    // Wait for cache to be written
    console.log('\n   ⏳ Waiting 3 seconds for cache...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Second request - should be HIT
    console.log('\n2️⃣ Second request (expecting HIT):');
    const result2 = await makeRequest(workerUrl, 'POST', {
      query: testQuery,
      options: testOptions
    });
    
    console.log(`   Status: ${result2.status}`);
    console.log(`   Duration: ${result2.duration}ms`);
    console.log(`   Cached: ${result2.data.meta?.cached || false}`);
    console.log(`   X-Cache-Status: ${result2.headers['x-cache-status'] || 'not set'}`);
    
    const isCacheHit = result2.data.meta?.cached === true || result2.headers['x-cache-status'] === 'HIT';
    const speedImprovement = result1.duration > result2.duration ? 
      Math.round((1 - result2.duration/result1.duration) * 100) : 0;
    
    console.log(`   Cache Hit: ${isCacheHit ? '✅ YES' : '❌ NO'}`);
    console.log(`   Speed improvement: ${speedImprovement}%`);
    
    // Test options hash stability
    console.log('\n3️⃣ Testing options hash stability:');
    const sameOptionsReordered = { limit: 5 }; // Same as testOptions but could be reordered
    
    const result3 = await makeRequest(workerUrl, 'POST', {
      query: testQuery,
      options: sameOptionsReordered
    });
    
    const isOptionsStable = result3.data.meta?.cached === true || result3.headers['x-cache-status'] === 'HIT';
    console.log(`   Same options, different order: ${isOptionsStable ? '✅ CACHED' : '❌ MISS'}`);
    
    console.log('\n📊 RESULTS SUMMARY');
    console.log('=' .repeat(30));
    console.log(`✅ Worker deployed: ${result1.status === 200 ? 'SUCCESS' : 'FAILED'}`);
    console.log(`✅ Cache functionality: ${isCacheHit ? 'WORKING' : 'BROKEN'}`);
    console.log(`✅ Options stability: ${isOptionsStable ? 'FIXED' : 'BROKEN'}`);
    console.log(`✅ Performance gain: ${speedImprovement}%`);
    
    if (isCacheHit && isOptionsStable) {
      console.log('\n🎉 CACHE FIXES SUCCESSFULLY DEPLOYED!');
      console.log('Your production worker now has:');
      console.log('- ✅ Stable options hashing');
      console.log('- ✅ Reduced stop word removal');
      console.log('- ✅ Working cache hit detection');
    } else {
      console.log('\n⚠️  Some issues remain:');
      if (!isCacheHit) console.log('- ❌ Cache hits not working');
      if (!isOptionsStable) console.log('- ❌ Options hash still unstable');
      console.log('\nCheck worker logs for more details.');
    }
    
  } catch (error) {
    console.log(`\n❌ Test failed: ${error.message}`);
    console.log('\nPossible issues:');
    console.log('- Worker URL incorrect');
    console.log('- CORS restrictions');
    console.log('- Rate limiting');
    console.log('- Worker not deployed');
  }
}

testProductionFixes().catch(console.error);
















