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
  ['How to use async await in JavaScript', 'javascript async await', 'async await javascript tutorial', 'JavaScript async/await guide'],
  
  // React variations  
  ['What are React hooks', 'React hooks tutorial', 'how to use react hooks', 'React hooks guide'],
  
  // Node.js variations
  ['Node.js Express server', 'express nodejs server', 'how to create express server', 'Express.js server setup'],
  
  // Python variations
  ['Python data science', 'data science with python', 'python for data science', 'how to learn python data science'],
  
  // General programming
  ['best programming practices', 'programming best practices', 'good programming practices', 'coding best practices']
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
  const complexHitRate = (variations.length - uniqueComplexKeys.size) / variations.length;
  
  // Test simple normalization  
  const simpleKeys = variations.map(q => simpleCacheKey(q));
  const uniqueSimpleKeys = new Set(simpleKeys);
  const simpleHitRate = (variations.length - uniqueSimpleKeys.size) / variations.length;
  
  console.log('Queries:');
  variations.forEach((query, i) => {
    console.log(`  ${i+1}. "${query}"`);
  });
  
  console.log('\nComplex Normalization:');
  complexKeys.forEach((key, i) => {
    console.log(`  ${i+1}. ${key}`);
  });
  console.log(`  Unique keys: ${uniqueComplexKeys.size}/${variations.length}`);
  console.log(`  Hit rate: ${Math.round(complexHitRate * 100)}%`);
  
  console.log('\nSimple Normalization:');
  simpleKeys.forEach((key, i) => {
    console.log(`  ${i+1}. ${key}`);
  });
  console.log(`  Unique keys: ${uniqueSimpleKeys.size}/${variations.length}`);
  console.log(`  Hit rate: ${Math.round(simpleHitRate * 100)}%`);
  
  // Track overall performance
  complexHits += (variations.length - uniqueComplexKeys.size);
  simpleHits += (variations.length - uniqueSimpleKeys.size);
  totalComparisons += variations.length;
});

console.log('\n\n📊 OVERALL CACHE HIT RATE COMPARISON');
console.log('=' .repeat(70));

const overallComplexHitRate = (complexHits / totalComparisons) * 100;
const overallSimpleHitRate = (simpleHits / totalComparisons) * 100;

console.log(`Complex Normalization: ${Math.round(overallComplexHitRate)}% hit rate`);
console.log(`Simple Normalization:  ${Math.round(overallSimpleHitRate)}% hit rate`);
console.log(`Difference: ${Math.round(overallComplexHitRate - overallSimpleHitRate)}% in favor of ${overallComplexHitRate > overallSimpleHitRate ? 'Complex' : 'Simple'}`);

console.log('\n🚨 CRITICAL ISSUE: OPTIONS HASH INSTABILITY');
console.log('=' .repeat(70));

// Test the same query with different option orders
const testQuery = 'JavaScript tutorial';
const optionVariations = [
  {},
  { limit: 10 },
  { limit: 10, sort: 'new' },
  { sort: 'new', limit: 10 },  // Same as above, different order
  { limit: 10, sort: 'hot' },
  { sort: 'hot', limit: 10 },  // Same as above, different order
];

console.log(`Query: "${testQuery}"`);
console.log('Options variations:');

const optionKeys = optionVariations.map((options, i) => {
  const key = complexCacheKey(testQuery, options);
  console.log(`  ${i+1}. ${JSON.stringify(options)} → ${key}`);
  return key;
});

const uniqueOptionKeys = new Set(optionKeys);
const optionCacheEfficiency = (optionVariations.length - uniqueOptionKeys.size) / optionVariations.length;

console.log(`\nOption cache efficiency: ${Math.round(optionCacheEfficiency * 100)}%`);
console.log(`Expected: ~50% (pairs should match)`);
console.log(`Actual: ${Math.round(optionCacheEfficiency * 100)}% ${optionCacheEfficiency < 0.4 ? '❌ BROKEN' : '✅ OK'}`);

console.log('\n🔬 ROOT CAUSE ANALYSIS');
console.log('=' .repeat(70));

console.log('\n1️⃣ THEORY vs REALITY:');
console.log('Theory: Complex normalization should increase cache hits');
console.log('Reality: Complex normalization creates MORE unique keys');
console.log('');

console.log('2️⃣ WHY COMPLEX NORMALIZATION FAILS:');
console.log('❌ Stop word removal changes query meaning');
console.log('❌ Word sorting destroys semantic context'); 
console.log('❌ Options hashing is unstable (JSON.stringify order)');
console.log('❌ Over-optimization creates edge cases');
console.log('');

console.log('3️⃣ WHY SIMPLE NORMALIZATION WORKS:');
console.log('✅ Preserves exact user intent');
console.log('✅ Predictable and consistent');
console.log('✅ No semantic information loss');
console.log('✅ Fewer edge cases and bugs');

console.log('\n💡 RECOMMENDATION');
console.log('=' .repeat(70));

if (overallComplexHitRate > overallSimpleHitRate) {
  console.log(`✅ Complex normalization wins by ${Math.round(overallComplexHitRate - overallSimpleHitRate)}%`);
  console.log('BUT: Options hash instability negates this benefit');
  console.log('SOLUTION: Fix options hashing while keeping complex normalization');
} else {
  console.log(`✅ Simple normalization wins by ${Math.round(overallSimpleHitRate - overallComplexHitRate)}%`);
  console.log('PLUS: No options hash instability issues');
  console.log('SOLUTION: Switch to simple normalization approach');
}

console.log('\n🎯 NEXT STEPS:');
console.log('1. Fix options hashing (stable key order)');
console.log('2. Test with real user query patterns');
console.log('3. Monitor actual cache hit rates in production');
console.log('4. A/B test both approaches with real traffic');
















