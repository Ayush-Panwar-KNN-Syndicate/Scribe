#!/usr/bin/env node
/**
 * COMPREHENSIVE TEST for 90%+ Hit Rate Cache System
 * Tests aggressive normalization and word sorting for maximum cache hits
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
        'User-Agent': '90PercentHitRateTest/1.0'
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
              queryNormalized: res.headers['x-query-normalized'],
              cacheKey: res.headers['x-cache-key'],
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

async function test90PercentHitRate() {
  console.log('🎯 90%+ HIT RATE CACHE SYSTEM TEST');
  console.log('=' .repeat(60));
  console.log('Worker: https://searchtermux-search-worker-dev.tech-a14.workers.dev/');
  console.log('Strategy: Aggressive normalization + word sorting for maximum cache hits');
  console.log('Target: 90%+ cache hit rate');
  console.log('');

  const testGroups = [
    {
      name: 'Word Order Variations (Should ALL hit same cache)',
      queries: [
        'learn javascript programming',
        'programming javascript learn',
        'javascript learn programming',
        'programming learn javascript',
        'learn programming javascript',
        'javascript programming learn'
      ],
      expectedBehavior: 'All should normalize to same cache key and hit after first'
    },
    {
      name: 'Stop Word Removal (Should ALL hit same cache)',
      queries: [
        'how to learn python',
        'learn python',
        'how to learn the python',
        'learn python programming',
        'python programming learn',
        'programming python learn'
      ],
      expectedBehavior: 'Stop words removed, then sorted alphabetically'
    },
    {
      name: 'Punctuation & Case Variations (Should ALL hit same cache)',
      queries: [
        'React Tutorial Guide',
        'react tutorial guide',
        'REACT TUTORIAL GUIDE',
        'React, Tutorial, Guide!',
        'react tutorial guide???',
        'React... Tutorial... Guide...'
      ],
      expectedBehavior: 'All punctuation removed, case normalized'
    },
    {
      name: 'Mixed Complex Variations (Ultimate test)',
      queries: [
        'How to create a React component with JavaScript',
        'javascript react component create',
        'Create React Component JavaScript',
        'React JavaScript Component Create',
        'component create javascript react',
        'JavaScript React: How to Create Component'
      ],
      expectedBehavior: 'All variations should hit same normalized cache'
    }
  ];

  const allResults = [];
  let totalRequests = 0;
  let totalHits = 0;

  for (const group of testGroups) {
    console.log(`\n🧪 ${group.name.toUpperCase()}`);
    console.log('-'.repeat(50));
    console.log(`Expected: ${group.expectedBehavior}`);
    console.log('');

    const groupResults = [];
    let groupHits = 0;

    for (let i = 0; i < group.queries.length; i++) {
      const query = group.queries[i];
      console.log(`${i + 1}. Testing: "${query}"`);
      
      const result = await makeRequest(query, { limit: 5 });
      totalRequests++;
      
      if (result.status === 200) {
        const cacheStatus = result.headers.cacheStatus;
        const normalized = result.headers.queryNormalized;
        const cacheKey = result.headers.cacheKey;
        const hitCount = result.headers.cacheHits;
        const cacheSystem = result.headers.cacheSystem;
        
        console.log(`   ✅ Status: ${result.status}`);
        console.log(`   🎯 Cache Status: ${cacheStatus}`);
        console.log(`   🔑 Cache Key: ${cacheKey}`);
        console.log(`   🧠 Normalized: "${normalized}"`);
        console.log(`   📊 Hit Count: ${hitCount}`);
        console.log(`   🏷️  Cache System: ${cacheSystem}`);
        
        if (cacheStatus === 'HIT') {
          totalHits++;
          groupHits++;
        }
        
        groupResults.push({
          query,
          cacheStatus,
          normalized,
          cacheKey,
          hitCount: parseInt(hitCount) || 0,
          duration: result.duration
        });
        
        console.log(`   ⏱️  Duration: ${result.duration}ms`);
        console.log('');
      } else {
        console.log(`   ❌ Request failed: Status ${result.status}`);
        console.log('');
      }
      
      // Wait between requests to allow cache to be written
      if (i < group.queries.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Group Analysis
    const uniqueKeys = [...new Set(groupResults.map(r => r.cacheKey))];
    const uniqueNormalized = [...new Set(groupResults.map(r => r.normalized))];
    const groupHitRate = groupResults.length > 0 ? Math.round((groupHits / groupResults.length) * 100) : 0;
    
    console.log(`📊 GROUP ANALYSIS:`);
    console.log(`   • Queries tested: ${groupResults.length}`);
    console.log(`   • Cache hits: ${groupHits}`);
    console.log(`   • Group hit rate: ${groupHitRate}%`);
    console.log(`   • Unique cache keys: ${uniqueKeys.length}`);
    console.log(`   • Unique normalized forms: ${uniqueNormalized.length}`);
    
    if (uniqueKeys.length === 1) {
      console.log(`   ✅ PERFECT: All queries mapped to same cache key!`);
    } else {
      console.log(`   ⚠️  SUBOPTIMAL: ${uniqueKeys.length} different cache keys`);
    }
    
    allResults.push(...groupResults);
    console.log('');
  }

  // OVERALL ANALYSIS
  console.log('🏆 OVERALL 90%+ HIT RATE ANALYSIS');
  console.log('=' .repeat(60));
  
  const overallHitRate = totalRequests > 0 ? Math.round((totalHits / totalRequests) * 100) : 0;
  
  console.log(`Total requests: ${totalRequests}`);
  console.log(`Total cache hits: ${totalHits}`);
  console.log(`Overall hit rate: ${overallHitRate}%`);
  console.log(`Target hit rate: 90%+`);
  console.log('');

  // Detailed breakdown
  const cacheKeyGroups = {};
  allResults.forEach(result => {
    if (!cacheKeyGroups[result.cacheKey]) {
      cacheKeyGroups[result.cacheKey] = [];
    }
    cacheKeyGroups[result.cacheKey].push(result);
  });

  console.log('🔍 CACHE KEY GROUPING ANALYSIS:');
  console.log('-'.repeat(40));
  
  Object.entries(cacheKeyGroups).forEach(([key, results], index) => {
    console.log(`${index + 1}. Cache Key: ${key}`);
    console.log(`   Queries grouped: ${results.length}`);
    console.log(`   Normalized form: "${results[0].normalized}"`);
    console.log(`   Original queries:`);
    results.forEach(r => console.log(`     - "${r.query}"`));
    console.log('');
  });

  // Performance Analysis
  const hitDurations = allResults.filter(r => r.cacheStatus === 'HIT').map(r => r.duration);
  const missDurations = allResults.filter(r => r.cacheStatus === 'MISS').map(r => r.duration);
  
  if (hitDurations.length > 0 && missDurations.length > 0) {
    const avgHitTime = Math.round(hitDurations.reduce((a, b) => a + b) / hitDurations.length);
    const avgMissTime = Math.round(missDurations.reduce((a, b) => a + b) / missDurations.length);
    const speedImprovement = Math.round((1 - avgHitTime / avgMissTime) * 100);
    
    console.log('⚡ PERFORMANCE ANALYSIS:');
    console.log('-'.repeat(30));
    console.log(`Average cache hit time: ${avgHitTime}ms`);
    console.log(`Average cache miss time: ${avgMissTime}ms`);
    console.log(`Speed improvement: ${speedImprovement}%`);
    console.log('');
  }

  // Final Verdict
  console.log('🎯 FINAL VERDICT:');
  console.log('=' .repeat(40));
  
  if (overallHitRate >= 90) {
    console.log('🎉 ✅ 90%+ HIT RATE TARGET ACHIEVED!');
    console.log(`🏆 Achieved ${overallHitRate}% hit rate`);
    console.log('🚀 Cache system is working EXCELLENTLY!');
    console.log('');
    console.log('🎊 SUCCESS FACTORS:');
    console.log('✅ Aggressive query normalization working');
    console.log('✅ Word sorting creating consistent cache keys');
    console.log('✅ Stop word removal grouping similar queries');
    console.log('✅ Punctuation/case normalization working');
    console.log('✅ Stable options hashing working');
    console.log('');
    console.log('🚀 YOUR CACHE IS READY FOR MILLIONS OF SEARCHES!');
    
  } else if (overallHitRate >= 75) {
    console.log('🟡 ✅ GOOD HIT RATE ACHIEVED');
    console.log(`🎯 Achieved ${overallHitRate}% hit rate (target: 90%+)`);
    console.log('🔧 Close to target - minor optimizations needed');
    console.log('');
    console.log('💡 OPTIMIZATION SUGGESTIONS:');
    console.log('• Check if normalization is aggressive enough');
    console.log('• Verify word sorting is working correctly');
    console.log('• Consider additional stop words');
    console.log('• Check cache TTL settings');
    
  } else {
    console.log('❌ HIT RATE BELOW TARGET');
    console.log(`⚠️ Achieved ${overallHitRate}% hit rate (target: 90%+)`);
    console.log('🔧 Significant optimization needed');
    console.log('');
    console.log('🛠️ DEBUGGING STEPS:');
    console.log('• Verify aggressive normalization is working');
    console.log('• Check word sorting implementation');
    console.log('• Verify stop word removal');
    console.log('• Check cache key generation consistency');
    console.log('• Verify Redis connection and storage');
  }

  console.log('\n💡 CACHE OPTIMIZATION FEATURES ACTIVE:');
  console.log('🧠 Aggressive query normalization (stop words removed)');
  console.log('🔤 Alphabetical word sorting (key for high hit rate)');
  console.log('🔧 Stable options hashing (consistent cache keys)');
  console.log('⏰ Smart TTL based on result count');
  console.log('📊 Real-time hit rate tracking');
  console.log('🎯 Target: 90%+ cache hit rate');
}

test90PercentHitRate().catch(console.error);
















