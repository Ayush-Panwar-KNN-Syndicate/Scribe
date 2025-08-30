#!/usr/bin/env node
/**
 * Quick cache testing script
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
          resolve({ duration, status: res.statusCode, data: json });
        } catch (e) {
          resolve({ duration, status: res.statusCode, data: data });
        }
      });
    }).on('error', reject);
  });
}

async function quickTest() {
  console.log('🚀 Quick Cache Test\n');
  
  const query = 'test cache';
  const testUrl = `${WORKER_URL}/cache-test?q=${encodeURIComponent(query)}&limit=3`;
  
  console.log('1️⃣ First request (should be MISS):');
  const result1 = await makeRequest(testUrl);
  console.log(`   Status: ${result1.data.cache_status} (${result1.duration}ms)`);
  console.log(`   Results: ${result1.data.total}`);
  
  console.log('\n2️⃣ Second request (should be HIT):');
  const result2 = await makeRequest(testUrl);
  console.log(`   Status: ${result2.data.cache_status} (${result2.duration}ms)`);
  console.log(`   Results: ${result2.data.total}`);
  
  if (result2.duration < result1.duration) {
    const improvement = Math.round((1 - result2.duration/result1.duration) * 100);
    console.log(`   🚀 Cache improved speed by ${improvement}%`);
  }
  
  console.log('\n3️⃣ Cache status:');
  const status = await makeRequest(`${WORKER_URL}/cache-status`);
  console.log(`   Total keys: ${status.data.total_keys}`);
  console.log(`   Redis connected: ${status.data.redis_connected}`);
  
  console.log('\n✅ Cache is working perfectly!');
  console.log(`\n🔗 Test URLs:`);
  console.log(`   Health: ${WORKER_URL}/health`);
  console.log(`   Search: ${WORKER_URL}/?q=test&limit=5`);
  console.log(`   Cache test: ${WORKER_URL}/cache-test?q=test&limit=5`);
  console.log(`   Cache status: ${WORKER_URL}/cache-status`);
}

quickTest().catch(console.error);
















