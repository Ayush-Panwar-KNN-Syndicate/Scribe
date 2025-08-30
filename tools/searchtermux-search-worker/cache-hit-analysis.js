#!/usr/bin/env node
/**
 * Analyze whether complex normalization actually improves cache hit rates
 */

// Production worker's complex normalization
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

// Complex normalization (current production)
function complexNormalize(query) {
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

// Simple normalization (test worker)
function simpleNormalize(query) {
  return query.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_');
}

// Generate cache keys
function complexCacheKey(query, options = {}) {
  const normalized = complexNormalize(query);
  const optionsHash = JSON.stringify(options);
  return `search:${normalized}:${hashCode(optionsHash)}`;
}

function simpleCacheKey(query) {
  const normalized = simpleNormalize(query);
  return `test_search:${normalized}`;
}

console.log('🔍 CACHE HIT RATE ANALYSIS: Complex vs Simple Normalization');
console.log('=' .repeat(70));

// Realistic user query variations (what users actually search for)
const queryVariations = [
  // JavaScript variations
  ['How to use async await in JavaScript', 'javascript async await', 'async await javascript tutorial'],
  
  // React variations  
  ['What are React hooks', 'React hooks tutorial', 'how to use react hooks'],
  
  // Node.js variations
  ['Node.js Express server', 'express nodejs server', 'how to create express server'],
  
  // Python variations
  ['Python data science', 'data science with python', 'python for data science']
];

let complexHits = 0;
let simpleHits = 0;
let totalComparisons = 0;

queryVariations.forEach((variations, groupIndex) => {
  console.log(`\n${groupIndex + 1}️⃣ Query Group: ${variations[0].substring(0, 30)}...`);
  console.log('─'.repeat(50));
  
  // Test complex normalization
  const complexKeys = variations.map(q => complexCacheKey(q));
  const uniqueComplexKeys = new Set(complexKeys);
  
  // Test simple normalization  
  const simpleKeys = variations.map(q => simpleCacheKey(q));
  const uniqueSimpleKeys = new Set(simpleKeys);
  
  console.log('Queries:');
  variations.forEach((query, i) => {
    console.log(`  ${i+1}. "${query}"`);
  });
  
  console.log('\nComplex Keys:');
  complexKeys.forEach((key, i) => {
    console.log(`  ${i+1}. ${key}`);
  });
  console.log(`  Unique: ${uniqueComplexKeys.size}/${variations.length} (${Math.round((1-uniqueComplexKeys.size/variations.length)*100)}% hit rate)`);
  
  console.log('\nSimple Keys:');
  simpleKeys.forEach((key, i) => {
    console.log(`  ${i+1}. ${key}`);
  });
  console.log(`  Unique: ${uniqueSimpleKeys.size}/${variations.length} (${Math.round((1-uniqueSimpleKeys.size/variations.length)*100)}% hit rate)`);
  
  // Track overall performance
  complexHits += (variations.length - uniqueComplexKeys.size);
  simpleHits += (variations.length - uniqueSimpleKeys.size);
  totalComparisons += variations.length;
});

console.log('\n📊 OVERALL RESULTS');
console.log('=' .repeat(50));

const overallComplexHitRate = (complexHits / totalComparisons) * 100;
const overallSimpleHitRate = (simpleHits / totalComparisons) * 100;

console.log(`Complex Normalization: ${Math.round(overallComplexHitRate)}% hit rate`);
console.log(`Simple Normalization:  ${Math.round(overallSimpleHitRate)}% hit rate`);

console.log('\n🚨 THE REAL PROBLEM: OPTIONS HASH INSTABILITY');
console.log('=' .repeat(50));

const testQuery = 'JavaScript tutorial';
const optionTests = [
  [{ limit: 10, sort: 'new' }, { sort: 'new', limit: 10 }],
  [{ limit: 5, type: 'post' }, { type: 'post', limit: 5 }]
];

optionTests.forEach((pair, i) => {
  const key1 = complexCacheKey(testQuery, pair[0]);
  const key2 = complexCacheKey(testQuery, pair[1]);
  console.log(`\nTest ${i+1}: Same options, different order`);
  console.log(`  Options A: ${JSON.stringify(pair[0])}`);
  console.log(`  Options B: ${JSON.stringify(pair[1])}`);
  console.log(`  Key A: ${key1}`);
  console.log(`  Key B: ${key2}`);
  console.log(`  Match: ${key1 === key2 ? '✅ YES' : '❌ NO - CACHE MISS!'}`);
});

console.log('\n🎯 CONCLUSION');
console.log('=' .repeat(50));
console.log('Your complex normalization THEORY is correct:');
console.log('✅ It should improve cache hit rates for similar queries');
console.log('');
console.log('BUT there are 2 CRITICAL BUGS:');
console.log('❌ Options hash instability (JSON.stringify key order)');
console.log('❌ Over-aggressive stop word removal loses meaning');
console.log('');
console.log('SOLUTION: Fix the bugs, keep the concept!');
console.log('1. Stable options hashing (sort keys before stringify)');
console.log('2. Less aggressive stop word removal');
console.log('3. Test with real user query patterns');
















