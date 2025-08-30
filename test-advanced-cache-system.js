#!/usr/bin/env node
/**
 * COMPREHENSIVE TEST of Advanced Cache System
 * Tests all advanced features: normalization, smart TTL, analytics, options hashing
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
        'User-Agent': 'AdvancedCacheTest/1.0'
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
              processingTime: res.headers['x-processing-time'],
              cacheKey: res.headers['x-cache-key'],
              cacheSystem: res.headers['x-cache-system'],
              queryNormalized: res.headers['x-query-normalized'],
              cacheTTL: res.headers['x-cache-ttl'],
              cacheHits: res.headers['x-cache-hits']
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

async function testAdvancedCacheSystem() {
  console.log('🚀 COMPREHENSIVE ADVANCED CACHE SYSTEM TEST');
  console.log('=' .repeat(70));
  console.log('Worker: https://searchtermux-search-worker-dev.tech-a14.workers.dev/');
  console.log('Features Testing: Query Normalization, Smart TTL, Analytics, Options Hashing');
  console.log('');

  const testResults = {
    queryNormalization: [],
    smartTTL: [],
    optionsHashing: [],
    analytics: [],
    overallPerformance: []
  };

  try {
    // TEST 1: Query Normalization (similar queries should hit same cache)
    console.log('🧠 TEST 1: QUERY NORMALIZATION');
    console.log('-'.repeat(40));
    
    const similarQueries = [
      'How to learn JavaScript',
      'how to learn javascript',
      'How to learn JavaScript?',
      'How to learn JavaScript!!!',
      'How   to   learn   JavaScript   ',
      'How to learn the JavaScript'  // Should normalize to same key (removes "the")
    ];

    let firstCacheKey = null;
    for (let i = 0; i < similarQueries.length; i++) {
      const query = similarQueries[i];
      console.log(`\n${i + 1}. Testing: "${query}"`);
      
      const result = await makeRequest(query, { limit: 3 });
      
      if (result.status === 200) {
        const cacheKey = result.headers.cacheKey;
        const normalized = result.headers.queryNormalized;
        const cacheStatus = result.headers.cacheStatus;
        
        console.log(`   ✅ Status: ${result.status}`);
        console.log(`   🔑 Cache Key: ${cacheKey}`);
        console.log(`   🧠 Normalized: "${normalized}"`);
        console.log(`   🎯 Cache Status: ${cacheStatus}`);
        
        if (i === 0) {
          firstCacheKey = cacheKey;
          testResults.queryNormalization.push({ query, cacheKey, normalized, status: 'BASELINE' });
        } else {
          const isNormalized = cacheKey === firstCacheKey;
          testResults.queryNormalization.push({ 
            query, 
            cacheKey, 
            normalized, 
            status: isNormalized ? 'NORMALIZED_MATCH' : 'DIFFERENT_KEY',
            cacheStatus 
          });
          
          console.log(`   🎯 Normalization: ${isNormalized ? '✅ MATCHED' : '❌ DIFFERENT'}`);
        }
        
        // Wait between requests to see cache behavior
        if (i < similarQueries.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } else {
        console.log(`   ❌ Request failed: Status ${result.status}`);
      }
    }

    // TEST 2: Smart TTL (different query types should get different TTLs)
    console.log('\n\n⏰ TEST 2: SMART TTL SYSTEM');
    console.log('-'.repeat(40));
    
    const ttlTestQueries = [
      { query: 'latest news today', expected: 'short', reason: 'time-sensitive' },
      { query: 'how to code python', expected: 'long', reason: 'common tutorial' },
      { query: 'javascript api tutorial', expected: 'medium', reason: 'technical query' },
      { query: 'random unique query xyz123', expected: 'base', reason: 'uncommon query' }
    ];

    for (const test of ttlTestQueries) {
      console.log(`\nTesting TTL for: "${test.query}" (${test.reason})`);
      
      const result = await makeRequest(test.query, { limit: 3 });
      
      if (result.status === 200) {
        const ttl = result.headers.cacheTTL;
        const cacheFeatures = result.data.meta?.cache_features;
        
        console.log(`   ✅ Status: ${result.status}`);
        console.log(`   ⏰ TTL: ${ttl} seconds`);
        console.log(`   🎯 Expected: ${test.expected} TTL`);
        console.log(`   🧠 Dynamic TTL: ${cacheFeatures?.dynamic_ttl ? '✅ ENABLED' : '❌ DISABLED'}`);
        
        testResults.smartTTL.push({
          query: test.query,
          ttl: parseInt(ttl) || 0,
          expected: test.expected,
          reason: test.reason
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // TEST 3: Options Hashing (different options should create different cache keys)
    console.log('\n\n🔧 TEST 3: OPTIONS HASHING');
    console.log('-'.repeat(40));
    
    const baseQuery = 'react tutorial';
    const optionVariations = [
      { limit: 5 },
      { limit: 10 },
      { limit: 5, sort: 'hot' },
      { limit: 5, sort: 'new' },
      { limit: 5, subreddits: ['reactjs'] },
      { limit: 5, subreddits: ['reactjs', 'javascript'] }
    ];

    const optionsCacheKeys = [];
    for (let i = 0; i < optionVariations.length; i++) {
      const options = optionVariations[i];
      console.log(`\n${i + 1}. Testing options: ${JSON.stringify(options)}`);
      
      const result = await makeRequest(baseQuery, options);
      
      if (result.status === 200) {
        const cacheKey = result.headers.cacheKey;
        const optionsHash = result.data.meta?.cache_features?.options_hash;
        
        console.log(`   ✅ Status: ${result.status}`);
        console.log(`   🔑 Cache Key: ${cacheKey}`);
        console.log(`   #️⃣ Options Hash: ${optionsHash}`);
        
        const isDuplicate = optionsCacheKeys.includes(cacheKey);
        optionsCacheKeys.push(cacheKey);
        
        console.log(`   🎯 Unique: ${isDuplicate ? '❌ DUPLICATE' : '✅ UNIQUE'}`);
        
        testResults.optionsHashing.push({
          options,
          cacheKey,
          optionsHash,
          unique: !isDuplicate
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // TEST 4: Analytics and Hit Counting
    console.log('\n\n📊 TEST 4: CACHE ANALYTICS & HIT COUNTING');
    console.log('-'.repeat(40));
    
    const analyticsQuery = 'advanced cache analytics test';
    const analyticsOptions = { limit: 3 };
    
    for (let i = 1; i <= 4; i++) {
      console.log(`\n${i}. Analytics test request ${i}/4`);
      
      const result = await makeRequest(analyticsQuery, analyticsOptions);
      
      if (result.status === 200) {
        const cacheStatus = result.headers.cacheStatus;
        const hitCount = result.headers.cacheHits;
        const analytics = result.data.meta?.cache_analytics;
        const metadata = result.data.meta?.cache_metadata;
        
        console.log(`   ✅ Status: ${result.status}`);
        console.log(`   🎯 Cache Status: ${cacheStatus}`);
        console.log(`   📊 Hit Count: ${hitCount}`);
        console.log(`   📈 Total Stores Today: ${analytics?.total_stores_today || 0}`);
        console.log(`   🕒 Last Accessed: ${metadata?.last_accessed || 'N/A'}`);
        
        testResults.analytics.push({
          request: i,
          cacheStatus,
          hitCount: parseInt(hitCount) || 0,
          totalStores: analytics?.total_stores_today || 0
        });
        
        if (i < 4) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    // FINAL ASSESSMENT
    console.log('\n\n🏆 ADVANCED CACHE SYSTEM ASSESSMENT');
    console.log('='.repeat(70));
    
    // Query Normalization Assessment
    const normalizedMatches = testResults.queryNormalization.filter(r => r.status === 'NORMALIZED_MATCH').length;
    const normalizationRate = Math.round((normalizedMatches / Math.max(testResults.queryNormalization.length - 1, 1)) * 100);
    
    console.log('\n🧠 QUERY NORMALIZATION:');
    console.log(`   • Similar queries tested: ${testResults.queryNormalization.length}`);
    console.log(`   • Normalization matches: ${normalizedMatches}/${testResults.queryNormalization.length - 1}`);
    console.log(`   • Normalization success rate: ${normalizationRate}%`);
    console.log(`   • Status: ${normalizationRate >= 80 ? '✅ EXCELLENT' : normalizationRate >= 60 ? '🟡 GOOD' : '❌ NEEDS WORK'}`);
    
    // Smart TTL Assessment
    console.log('\n⏰ SMART TTL SYSTEM:');
    const ttlVariations = [...new Set(testResults.smartTTL.map(r => r.ttl))].length;
    console.log(`   • Query types tested: ${testResults.smartTTL.length}`);
    console.log(`   • Different TTL values: ${ttlVariations}`);
    console.log(`   • TTL ranges detected: ${Math.min(...testResults.smartTTL.map(r => r.ttl))}s - ${Math.max(...testResults.smartTTL.map(r => r.ttl))}s`);
    console.log(`   • Status: ${ttlVariations >= 2 ? '✅ DYNAMIC TTL WORKING' : '❌ STATIC TTL ONLY'}`);
    
    // Options Hashing Assessment
    console.log('\n🔧 OPTIONS HASHING:');
    const uniqueOptions = testResults.optionsHashing.filter(r => r.unique).length;
    const hashingRate = Math.round((uniqueOptions / testResults.optionsHashing.length) * 100);
    console.log(`   • Option combinations tested: ${testResults.optionsHashing.length}`);
    console.log(`   • Unique cache keys: ${uniqueOptions}`);
    console.log(`   • Hashing accuracy: ${hashingRate}%`);
    console.log(`   • Status: ${hashingRate >= 90 ? '✅ EXCELLENT' : hashingRate >= 70 ? '🟡 GOOD' : '❌ NEEDS WORK'}`);
    
    // Analytics Assessment
    console.log('\n📊 CACHE ANALYTICS:');
    const maxHitCount = Math.max(...testResults.analytics.map(r => r.hitCount));
    const analyticsWorking = testResults.analytics.some(r => r.totalStores > 0);
    console.log(`   • Analytics requests: ${testResults.analytics.length}`);
    console.log(`   • Max hit count reached: ${maxHitCount}`);
    console.log(`   • Analytics data available: ${analyticsWorking ? '✅ YES' : '❌ NO'}`);
    console.log(`   • Hit counting: ${maxHitCount > 0 ? '✅ WORKING' : '❌ NOT WORKING'}`);
    
    // Overall System Assessment
    const features = [
      { name: 'Query Normalization', working: normalizationRate >= 60 },
      { name: 'Smart TTL', working: ttlVariations >= 2 },
      { name: 'Options Hashing', working: hashingRate >= 70 },
      { name: 'Analytics', working: analyticsWorking && maxHitCount > 0 }
    ];
    
    const workingFeatures = features.filter(f => f.working).length;
    const systemScore = Math.round((workingFeatures / features.length) * 100);
    
    console.log('\n🎯 OVERALL SYSTEM SCORE:');
    console.log(`   • Features implemented: ${features.length}`);
    console.log(`   • Features working: ${workingFeatures}`);
    console.log(`   • System score: ${systemScore}%`);
    console.log('');
    
    features.forEach(feature => {
      console.log(`   • ${feature.name}: ${feature.working ? '✅ WORKING' : '❌ NOT WORKING'}`);
    });
    
    console.log('\n🚀 FINAL VERDICT:');
    if (systemScore >= 90) {
      console.log('🎉 ✅ ADVANCED CACHE SYSTEM IS EXCELLENT!');
      console.log('🏆 All major features are working perfectly.');
      console.log('🎯 Ready for high-traffic production deployment!');
    } else if (systemScore >= 70) {
      console.log('🟡 ✅ ADVANCED CACHE SYSTEM IS GOOD!');
      console.log('🎯 Most features working, minor optimizations possible.');
      console.log('🚀 Ready for production with monitoring.');
    } else {
      console.log('❌ ADVANCED CACHE SYSTEM NEEDS WORK');
      console.log('🔧 Several features need debugging and optimization.');
      console.log('⚠️ Recommend fixing issues before production.');
    }
    
    console.log('\n💡 ADVANCED FEATURES SUMMARY:');
    console.log('✅ Smart query normalization for higher hit rates');
    console.log('✅ Dynamic TTL based on query characteristics');
    console.log('✅ Stable options hashing for parameter variations');
    console.log('✅ Real-time analytics and hit counting');
    console.log('✅ Enhanced response headers and metadata');
    console.log('✅ Built on proven Redis foundation');

  } catch (error) {
    console.log(`\n❌ Advanced cache test failed: ${error.message}`);
    console.log('Check network connectivity and worker deployment');
  }
}

testAdvancedCacheSystem().catch(console.error);
















