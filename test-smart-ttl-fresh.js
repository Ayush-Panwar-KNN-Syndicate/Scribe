#!/usr/bin/env node
/**
 * Test Smart TTL with fresh queries (no cache hits)
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
        'User-Agent': 'SmartTTLFreshTest/1.0'
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

async function testSmartTTLFresh() {
  console.log('⏰ SMART TTL TEST WITH FRESH QUERIES');
  console.log('=' .repeat(50));
  console.log('Using unique queries to force cache misses and test TTL calculation\n');
  
  const timestamp = Date.now();
  const ttlTests = [
    { 
      query: `latest news today ${timestamp}1`, 
      expected: 60, 
      reason: 'time-sensitive (contains "latest", "today")' 
    },
    { 
      query: `how to learn programming tutorial ${timestamp}2`, 
      expected: 1800, 
      reason: 'common tutorial (contains "how", "tutorial")' 
    },
    { 
      query: `javascript api development guide ${timestamp}3`, 
      expected: 900, 
      reason: 'technical query (contains "javascript", "api")' 
    },
    { 
      query: `random unique query zxcvbnm ${timestamp}4`, 
      expected: 300, 
      reason: 'uncommon query (default TTL)' 
    },
    {
      query: `current breaking news update ${timestamp}5`,
      expected: 60,
      reason: 'time-sensitive (contains "current", "news")'
    },
    {
      query: `best python coding tutorial guide ${timestamp}6`,
      expected: 1800,
      reason: 'common tutorial (contains "best", "tutorial", "guide")'
    }
  ];

  const results = [];
  
  for (const test of ttlTests) {
    console.log(`🔍 Testing: "${test.query.replace(` ${timestamp}`, '...')}"`);
    console.log(`   Expected TTL: ${test.expected}s (${test.reason})`);
    
    const result = await makeRequest(test.query, { limit: 3 });
    
    if (result.status === 200) {
      const ttl = parseInt(result.headers.cacheTTL) || 0;
      const cacheStatus = result.headers.cacheStatus;
      const smartTTLCalculated = result.data.meta?.cache_metadata?.smart_ttl_calculated;
      const resultCount = result.data.results?.length || 0;
      
      console.log(`   ✅ Status: ${result.status}`);
      console.log(`   🎯 Cache Status: ${cacheStatus}`);
      console.log(`   ⏰ TTL Header: ${ttl}s`);
      console.log(`   🧠 Smart TTL Calculated: ${smartTTLCalculated}s`);
      console.log(`   📈 Results: ${resultCount}`);
      
      const isCorrectTTL = ttl === test.expected || smartTTLCalculated === test.expected;
      console.log(`   ✅ TTL Correct: ${isCorrectTTL ? '✅ YES' : '❌ NO'}`);
      
      results.push({
        query: test.query,
        ttl,
        smartTTLCalculated,
        expected: test.expected,
        reason: test.reason,
        cacheStatus,
        resultCount,
        correct: isCorrectTTL
      });
      
      console.log('');
    } else {
      console.log(`   ❌ Request failed: Status ${result.status}\n`);
    }
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // Analysis
  console.log('📊 SMART TTL ANALYSIS:');
  console.log('-'.repeat(50));
  
  const uniqueTTLs = [...new Set(results.map(r => r.ttl))];
  const uniqueSmartTTLs = [...new Set(results.map(r => r.smartTTLCalculated))];
  const correctTTLs = results.filter(r => r.correct).length;
  const cacheMisses = results.filter(r => r.cacheStatus === 'MISS').length;
  
  console.log(`Total queries tested: ${results.length}`);
  console.log(`Cache misses (expected): ${cacheMisses}/${results.length}`);
  console.log(`Unique TTL header values: ${uniqueTTLs.length} (${uniqueTTLs.join(', ')}s)`);
  console.log(`Unique Smart TTL calculated: ${uniqueSmartTTLs.length} (${uniqueSmartTTLs.join(', ')}s)`);
  console.log(`Correct TTL assignments: ${correctTTLs}/${results.length} (${Math.round(correctTTLs/results.length*100)}%)`);
  console.log('');
  
  console.log('📋 DETAILED RESULTS:');
  results.forEach((result, i) => {
    const shortQuery = result.query.replace(/ \d+\d$/, '...');
    console.log(`${i + 1}. "${shortQuery}"`);
    console.log(`   Expected: ${result.expected}s | Got: ${result.ttl}s | Smart: ${result.smartTTLCalculated}s`);
    console.log(`   Reason: ${result.reason} | Status: ${result.cacheStatus}`);
    console.log(`   Correct: ${result.correct ? '✅' : '❌'}`);
    console.log('');
  });
  
  console.log('🎯 SMART TTL VERDICT:');
  if (correctTTLs >= results.length * 0.8 && uniqueSmartTTLs.length >= 3) {
    console.log('🎉 ✅ SMART TTL IS WORKING EXCELLENTLY!');
    console.log(`🏆 ${correctTTLs}/${results.length} queries got correct TTL`);
    console.log(`🚀 ${uniqueSmartTTLs.length} different TTL values detected`);
    console.log('✨ Dynamic TTL based on query characteristics confirmed!');
  } else if (correctTTLs >= results.length * 0.5 && uniqueSmartTTLs.length >= 2) {
    console.log('🟡 ✅ SMART TTL IS PARTIALLY WORKING');
    console.log(`⚠️ ${correctTTLs}/${results.length} queries got correct TTL`);
    console.log(`🔧 ${uniqueSmartTTLs.length} TTL variations detected - may need fine-tuning`);
  } else {
    console.log('❌ SMART TTL NOT WORKING PROPERLY');
    console.log(`🔧 Only ${correctTTLs}/${results.length} correct TTL assignments`);
    console.log('🛠️ Check Smart TTL algorithm implementation');
  }

  console.log('\n💡 TTL STRATEGY BREAKDOWN:');
  console.log('• Time-sensitive queries (news, today, current, latest): 60s');
  console.log('• Common tutorials (how, best, guide, tutorial): 1800s (30min)');
  console.log('• Technical queries (javascript, python, api, code): 900s (15min)');
  console.log('• Default/uncommon queries: 300s (5min)');
  console.log('• No-result queries: 180s (3min)');
}

testSmartTTLFresh().catch(console.error);
















