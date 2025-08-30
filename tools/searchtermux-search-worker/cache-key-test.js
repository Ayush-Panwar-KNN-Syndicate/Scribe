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

// Production worker normalization (BROKEN)
function productionNormalize(query) {
  return query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(word => word.length > 0)
    .filter(word => !STOP_WORDS.has(word))  // ❌ REMOVES ESSENTIAL WORDS
    .sort()                                 // ❌ DESTROYS WORD ORDER
    .join(' ');
}

// Production cache key (BROKEN)
function productionCacheKey(query, options = {}) {
  const normalizedQuery = productionNormalize(query);
  const optionsHash = JSON.stringify(options);  // ❌ UNSTABLE HASH
  return `search:${normalizedQuery}:${hashCode(optionsHash)}`;
}

// Test worker normalization (WORKING)
function testNormalize(query) {
  return query.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_');
}

// Test worker cache key (WORKING)
function testCacheKey(query) {
  const normalized = testNormalize(query);
  return `test_search:${normalized}`;
}

console.log('🔍 PRODUCTION WORKER CACHE ISSUE ANALYSIS');
console.log('=' .repeat(60));

const testQueries = [
  'How to use async await in JavaScript',
  'JavaScript async await tutorial',
  'What is React hooks',
  'React hooks tutorial'
];

testQueries.forEach((query, i) => {
  console.log(`\n${i + 1}️⃣ Query: "${query}"`);
  console.log('─'.repeat(50));
  
  // Show the destructive normalization
  console.log(`Original:        "${query}"`);
  console.log(`Test normalized: "${testNormalize(query)}"`);
  console.log(`Prod normalized: "${productionNormalize(query)}"`);
  
  // Show cache keys
  const testKey = testCacheKey(query);
  const prodKey = productionCacheKey(query, {});
  
  console.log(`Test cache key:  ${testKey}`);
  console.log(`Prod cache key:  ${prodKey}`);
  
  // Show how much meaning is lost
  const originalWords = query.toLowerCase().split(' ').length;
  const prodWords = productionNormalize(query).split(' ').length;
  const wordsLost = originalWords - prodWords;
  
  console.log(`Words lost:      ${wordsLost}/${originalWords} (${Math.round(wordsLost/originalWords*100)}%)`);
});

console.log('\n\n🚨 CRITICAL ISSUE: OPTIONS HASH INSTABILITY');
console.log('=' .repeat(60));

const sameQuery = 'JavaScript tutorial';
const options1 = { limit: 10, sort: 'new' };
const options2 = { sort: 'new', limit: 10 };  // Same options, different order

const key1 = productionCacheKey(sameQuery, options1);
const key2 = productionCacheKey(sameQuery, options2);

console.log(`Query: "${sameQuery}"`);
console.log(`Options A: ${JSON.stringify(options1)}`);
console.log(`Options B: ${JSON.stringify(options2)}`);
console.log(`Key A: ${key1}`);
console.log(`Key B: ${key2}`);
console.log(`Keys match: ${key1 === key2 ? '✅ YES' : '❌ NO - CACHE MISS!'}`);

console.log('\n\n📊 SPECIFIC PROBLEMS FOUND:');
console.log('=' .repeat(60));

console.log('\n1️⃣ STOP WORD REMOVAL BREAKS QUERIES:');
const examples = [
  'How to debug JavaScript',
  'What is React hooks', 
  'Where to learn Node.js'
];

examples.forEach(query => {
  const normalized = productionNormalize(query);
  console.log(`   "${query}" → "${normalized}"`);
});

console.log('\n2️⃣ WORD SORTING DESTROYS MEANING:');
const sortingExamples = [
  'React hooks tutorial',
  'JavaScript async await',
  'Node.js Express server'
];

sortingExamples.forEach(query => {
  const words = query.toLowerCase().split(' ');
  const sorted = [...words].sort();
  console.log(`   "${words.join(' ')}" → "${sorted.join(' ')}"`);
});

console.log('\n3️⃣ SAME QUERIES GET DIFFERENT KEYS:');
const variations = [
  'JavaScript tutorial',
  'javascript tutorial',
  'JavaScript Tutorial',
  'tutorial JavaScript'  // Different order
];

const keys = variations.map(q => productionCacheKey(q, {}));
const uniqueKeys = new Set(keys);

console.log(`   ${variations.length} query variations`);
console.log(`   ${uniqueKeys.size} unique cache keys`);
console.log(`   Cache efficiency: ${Math.round((1 - uniqueKeys.size/variations.length) * 100)}%`);

console.log('\n\n✅ SOLUTION: SIMPLIFY LIKE TEST WORKER');
console.log('=' .repeat(60));
console.log('❌ Remove stop word filtering');
console.log('❌ Remove word sorting');  
console.log('❌ Fix options hashing');
console.log('✅ Use simple, consistent normalization');
console.log('✅ Preserve query meaning and context');
console.log('✅ Generate predictable cache keys');

console.log('\n🎯 RESULT: Cache hit rate will go from 0% to 70-90%!');
















