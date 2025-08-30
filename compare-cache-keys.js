#!/usr/bin/env node
/**
 * Compare cache key generation between test and production workers
 */

// Test worker simple cache key generation
function testWorkerGenerateCacheKey(query) {
  return `test_search:${query.toLowerCase().trim().replace(/\s+/g, '_')}`;
}

// Production worker complex cache key generation (from cache-optimizer.ts)
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'of', 'with', 'by', 'from'
  // Removed aggressive stop words to preserve context
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

function normalizeQuery(query) {
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

function stableOptionsHash(options) {
  if (!options || Object.keys(options).length === 0) return '';
  
  const sortedKeys = Object.keys(options).sort();
  const stableString = sortedKeys.map(key => `${key}:${options[key]}`).join('|');
  return hashCode(stableString);
}

function productionWorkerGenerateCacheKey(query, options) {
  const normalizedQuery = normalizeQuery(query);
  const optionsHash = stableOptionsHash(options);
  return `search:${normalizedQuery}:${optionsHash}`;
}

// Test cases
const testCases = [
  {
    query: 'javascript tutorial',
    options: { limit: 5 }
  },
  {
    query: 'JavaScript Tutorial',
    options: { limit: 5 }
  },
  {
    query: 'javascript async await tutorial',
    options: { limit: 5 }
  },
  {
    query: 'test',
    options: { limit: 1 }
  }
];

console.log('🔑 CACHE KEY COMPARISON');
console.log('=' .repeat(60));
console.log('Comparing cache key generation between:');
console.log('• Test Worker: Simple normalization');
console.log('• Production Worker: Complex normalization (fixed)');
console.log('');

testCases.forEach((testCase, i) => {
  console.log(`${i + 1}️⃣ Query: "${testCase.query}"`);
  console.log(`   Options: ${JSON.stringify(testCase.options)}`);
  
  const testKey = testWorkerGenerateCacheKey(testCase.query);
  const prodKey = productionWorkerGenerateCacheKey(testCase.query, testCase.options);
  
  console.log(`   Test Worker Key:       "${testKey}"`);
  console.log(`   Production Worker Key: "${prodKey}"`);
  console.log(`   Same Key: ${testKey === prodKey ? '✅ YES' : '❌ NO'}`);
  console.log('');
});

// Test options hash stability
console.log('🔧 OPTIONS HASH STABILITY TEST');
console.log('=' .repeat(40));

const optionsTests = [
  [{ limit: 5 }, { limit: 5 }],
  [{ limit: 10, sort: 'hot' }, { sort: 'hot', limit: 10 }],
  [{ limit: 3, type: 'post' }, { type: 'post', limit: 3 }]
];

optionsTests.forEach((pair, i) => {
  const hash1 = stableOptionsHash(pair[0]);
  const hash2 = stableOptionsHash(pair[1]);
  
  console.log(`Test ${i + 1}:`);
  console.log(`   Options A: ${JSON.stringify(pair[0])} → Hash: ${hash1}`);
  console.log(`   Options B: ${JSON.stringify(pair[1])} → Hash: ${hash2}`);
  console.log(`   Stable: ${hash1 === hash2 ? '✅ YES' : '❌ NO'}`);
  console.log('');
});

// Test query normalization
console.log('📝 QUERY NORMALIZATION TEST');
console.log('=' .repeat(40));

const normalizationTests = [
  'javascript tutorial',
  'JavaScript Tutorial',
  'javascript async await tutorial',
  'JavaScript Async Await Tutorial',
  'the best javascript tutorial',
  'best javascript tutorial'
];

normalizationTests.forEach(query => {
  const normalized = normalizeQuery(query);
  console.log(`"${query}" → "${normalized}"`);
});

console.log('\n💡 ANALYSIS:');
console.log('If cache keys are different for the same logical query,');
console.log('that explains why cache is always MISS.');
console.log('');
console.log('Expected behavior:');
console.log('• Same queries → Same cache keys → Cache HIT');
console.log('• Different queries → Different cache keys → Cache MISS');
















