#!/usr/bin/env node
/**
 * Test how production worker generates cache keys vs test worker
 */

// Simulate production worker's normalization
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'between', 'among', 'within', 'without', 'under', 'over',
  'how', 'what', 'where', 'when', 'why', 'which', 'who', 'whom', 'whose',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might'
]);

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Production worker normalization
function productionNormalize(query) {
  return query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(word => word.length > 0)
    .filter(word => !STOP_WORDS.has(word))
    .sort()
    .join(' ');
}

// Production cache key
function productionCacheKey(query, options = {}) {
  const normalizedQuery = productionNormalize(query);
  const optionsHash = JSON.stringify(options);
  return `search:${normalizedQuery}:${hashCode(optionsHash)}`;
}

// Test worker normalization  
function testNormalize(query) {
  return query.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_');
}

// Test worker cache key
function testCacheKey(query) {
  const normalized = testNormalize(query);
  return `test_search:${normalized}`;
}

console.log('🔍 CACHE KEY COMPARISON ANALYSIS');
console.log('=' .repeat(60));

const testQueries = [
  'How to use async await in JavaScript',
  'JavaScript async await tutorial',
  'async await javascript tutorial', 
  'What is React hooks',
  'React hooks tutorial',
  'Node.js Express server setup',
  'How to debug JavaScript code'
];

const testOptions = [
  {},
  { limit: 10 },
  { limit: 10, sort: 'new' },
  { sort: 'new', limit: 10 }  // Same options, different order
];

testQueries.forEach((query, i) => {
  console.log(`\n${i + 1}️⃣ Query: "${query}"`);
  console.log('─'.repeat(50));
  
  // Test worker approach
  const testKey = testCacheKey(query);
  console.log(`Test Worker:  ${testKey}`);
  
  // Production worker approach  
  const prodKey1 = productionCacheKey(query, testOptions[0]);
  const prodKey2 = productionCacheKey(query, testOptions[1]);
  console.log(`Production:   ${prodKey1}`);
  console.log(`With options: ${prodKey2}`);
  
  // Show normalization difference
  console.log(`Original:     "${query}"`);
  console.log(`Test norm:    "${testNormalize(query)}"`);
  console.log(`Prod norm:    "${productionNormalize(query)}"`);
});

console.log('\n\n🚨 CRITICAL ISSUE DEMONSTRATION:');
console.log('=' .repeat(60));

// Show how same options create different keys
const sameQuery = 'JavaScript tutorial';
const options1 = { limit: 10, sort: 'new' };
const options2 = { sort: 'new', limit: 10 };

const key1 = productionCacheKey(sameQuery, options1);
const key2 = productionCacheKey(sameQuery, options2);

console.log(`Same query: "${sameQuery}"`);
console.log(`Options 1: ${JSON.stringify(options1)}`);
console.log(`Options 2: ${JSON.stringify(options2)}`);
console.log(`Key 1: ${key1}`);
console.log(`Key 2: ${key2}`);
console.log(`Same keys: ${key1 === key2 ? '✅ YES' : '❌ NO - CACHE MISS!'}`);

console.log('\n📊 ANALYSIS SUMMARY:');
console.log('─'.repeat(60));
console.log('❌ Production worker creates inconsistent cache keys');
console.log('❌ Stop word removal destroys query meaning');
console.log('❌ Word sorting breaks semantic context');
console.log('❌ Options hashing is unstable');
console.log('✅ Test worker creates consistent, predictable keys');
console.log('\n💡 Solution: Use test worker\'s simple approach!');
















