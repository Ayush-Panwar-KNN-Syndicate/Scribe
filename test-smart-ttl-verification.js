#!/usr/bin/env node
/**
 * Quick test to verify Smart TTL is working correctly
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
        'User-Agent': 'SmartTTLTest/1.0'
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

async function testSmartTTL() {
  console.log('⏰ SMART TTL VERIFICATION TEST');
  console.log('=' .repeat(50));
  
  const ttlTests = [
    { query: 'latest news today', expected: 'short (60s)', reason: 'time-sensitive' },
    { query: 'how to learn programming tutorial', expected: 'long (1800s)', reason: 'common tutorial' },
    { query: 'javascript api development guide', expected: 'medium (900s)', reason: 'technical query' },
    { query: 'empty results query zxcvbnm123', expected: 'short (180s)', reason: 'no results expected' }
  ];

  console.log('Testing different query types for TTL variation...\n');

  const results = [];
  
  for (const test of ttlTests) {
    console.log(`🔍 Testing: "${test.query}"`);
    console.log(`   Expected: ${test.expected} (${test.reason})`);
    
    const result = await makeRequest(test.query, { limit: 3 });
    
    if (result.status === 200) {
      const ttl = result.headers.cacheTTL;
      const ttlInfo = result.data.meta?.cache_metadata?.ttl_info;
      const resultCount = result.data.results?.length || 0;
      
      console.log(`   ✅ Status: ${result.status}`);
      console.log(`   ⏰ TTL Header: ${ttl}s`);
      console.log(`   📊 TTL Info: ${ttlInfo || 'N/A'}`);
      console.log(`   📈 Results: ${resultCount}`);
      
      results.push({
        query: test.query,
        ttl: parseInt(ttl) || 0,
        ttlInfo,
        resultCount,
        expected: test.expected,
        reason: test.reason
      });
      
      console.log('');
    } else {
      console.log(`   ❌ Request failed: Status ${result.status}\n`);
    }
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Analysis
  console.log('📊 SMART TTL ANALYSIS:');
  console.log('-'.repeat(40));
  
  const uniqueTTLs = [...new Set(results.map(r => r.ttl))];
  const ttlRange = results.length > 0 ? {
    min: Math.min(...results.map(r => r.ttl)),
    max: Math.max(...results.map(r => r.ttl))
  } : { min: 0, max: 0 };
  
  console.log(`Total queries tested: ${results.length}`);
  console.log(`Unique TTL values: ${uniqueTTLs.length} (${uniqueTTLs.join(', ')}s)`);
  console.log(`TTL range: ${ttlRange.min}s - ${ttlRange.max}s`);
  console.log('');
  
  results.forEach((result, i) => {
    console.log(`${i + 1}. "${result.query}"`);
    console.log(`   TTL: ${result.ttl}s | Expected: ${result.expected} | Reason: ${result.reason}`);
  });
  
  console.log('\n🎯 VERDICT:');
  if (uniqueTTLs.length >= 3) {
    console.log('✅ SMART TTL IS WORKING EXCELLENTLY!');
    console.log(`🎉 ${uniqueTTLs.length} different TTL values detected`);
    console.log('🚀 Dynamic TTL based on query characteristics confirmed');
  } else if (uniqueTTLs.length >= 2) {
    console.log('🟡 SMART TTL IS PARTIALLY WORKING');
    console.log(`⚠️ Only ${uniqueTTLs.length} TTL variations detected`);
    console.log('🔧 May need fine-tuning for better differentiation');
  } else {
    console.log('❌ SMART TTL NOT WORKING');
    console.log('🔧 All queries getting same TTL - check implementation');
  }
}

testSmartTTL().catch(console.error);
















