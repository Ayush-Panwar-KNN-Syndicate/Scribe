#!/usr/bin/env node
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
          resolve({ duration, status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ duration, status: res.statusCode, data: data });
        }
      });
    }).on('error', reject);
  });
}

async function test() {
  console.log('🚀 Testing Reddit API with Cache\n');
  
  const query = 'react hooks 2024';
  const url = `${WORKER_URL}/cache-test?q=${encodeURIComponent(query)}&limit=3`;
  
  console.log(`Query: "${query}"`);
  console.log('Testing fresh Reddit API call...\n');
  
  const result = await makeRequest(url);
  console.log(`Status: ${result.data.cache_status} (${result.duration}ms)`);
  console.log(`Results: ${result.data.total}`);
  console.log(`Data source: ${result.data.debug?.data_source || 'unknown'}`);
  console.log(`Reddit creds: ${result.data.debug?.reddit_credentials || 'unknown'}`);
  
  if (result.data.results && result.data.results[0]) {
    console.log(`\nSample result:`);
    console.log(`  Title: "${result.data.results[0].title}"`);
    console.log(`  Subreddit: r/${result.data.results[0].subreddit}`);
    console.log(`  Score: ${result.data.results[0].score}`);
    console.log(`  Author: u/${result.data.results[0].author}`);
  }
}

test().catch(console.error);
















