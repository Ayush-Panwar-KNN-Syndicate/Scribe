#!/usr/bin/env node
/**
 * Quick test to check if the worker is responding
 */

const https = require('https');

function makeRequest(query = 'test query') {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      query: query,
      options: { limit: 3 }
    });
    
    const requestOptions = {
      hostname: 'searchtermux-search-worker-dev.tech-a14.workers.dev',
      port: 443,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'WorkerStatusTest/1.0'
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data.slice(0, 500),
          headers: res.headers
        });
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testWorkerStatus() {
  console.log('🔍 WORKER STATUS CHECK');
  console.log('Worker: https://searchtermux-search-worker-dev.tech-a14.workers.dev/');
  
  try {
    const result = await makeRequest('simple test');
    console.log(`Status: ${result.status}`);
    console.log(`Data: ${result.data}`);
    
    if (result.status === 200) {
      console.log('✅ Worker is responding correctly!');
    } else {
      console.log('❌ Worker returned error status');
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
  }
}

testWorkerStatus();
















