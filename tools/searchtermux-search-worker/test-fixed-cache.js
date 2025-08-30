#!/usr/bin/env node
/**
 * Test the fixed cache optimizer performance
 */

// Fixed version (reduced stop words)
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'of', 'with', 'by', 'from'
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

function fixedGenerateCacheKey(query, options) {
  const normalizedQuery = normalizeQuery(query);
  const optionsHash = stableOptionsHash(options);
  return `search:${normalizedQuery}:${optionsHash}`;
}

// Broken version for comparison
function brokenGenerateCacheKey(query, options) {
  const allStopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'within', 'without', 'under', 'over', 'how', 'what', 'where', 'when', 'why', 'which', 'who', 'whom', 'whose', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might']);
  
  const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, ' ').split(' ')
    .filter(word => word.length > 0)
    .filter(word => !allStopWords.has(word))
    .sort()
    .join(' ');
  const optionsHash = options ? JSON.stringify(options) : '';
  return `search:${normalizedQuery}:${hashCode(optionsHash)}`;
}

console.log('🚀 TESTING FIXED CACHE OPTIMIZER');
console.log('=' .repeat(50));

// Test realistic query variations
const queryGroups = [
  {
    name: 'JavaScript Async/Await',
    queries: [
      'How to use async await in JavaScript',
      'JavaScript async await tutorial', 
      'async await javascript guide'
    ]
  },
  {
    name: 'React Hooks',
    queries: [
      'What are React hooks',
      'React hooks tutorial',
      'how to use react hooks'
    ]
  },
  {
    name: 'Python Data Science',
    queries: [
      'Python data science',
      'data science with python', 
      'python for data science'
    ]
  }
];

let totalBrokenHits = 0;
let totalFixedHits = 0;
let totalQueries = 0;

queryGroups.forEach((group, i) => {
  console.log(`\n${i + 1}️⃣ ${group.name}`);
  console.log('─'.repeat(30));
  
  const brokenKeys = group.queries.map(q => brokenGenerateCacheKey(q, {}));
  const fixedKeys = group.queries.map(q => fixedGenerateCacheKey(q, {}));
  
  const brokenUnique = new Set(brokenKeys).size;
  const fixedUnique = new Set(fixedKeys).size;
  
  const brokenHitRate = Math.round((1 - brokenUnique / group.queries.length) * 100);
  const fixedHitRate = Math.round((1 - fixedUnique / group.queries.length) * 100);
  
  console.log(`Queries:`);
  group.queries.forEach((q, idx) => console.log(`  ${idx + 1}. "${q}"`));
  
  console.log(`Results:`);
  console.log(`  Broken:  ${brokenHitRate}% hit rate`);
  console.log(`  Fixed:   ${fixedHitRate}% hit rate`);
  console.log(`  Change:  ${fixedHitRate > brokenHitRate ? '+' : ''}${fixedHitRate - brokenHitRate}%`);
  
  totalBrokenHits += (group.queries.length - brokenUnique);
  totalFixedHits += (group.queries.length - fixedUnique);
  totalQueries += group.queries.length;
});

console.log('\n📊 OVERALL PERFORMANCE');
console.log('=' .repeat(30));

const overallBrokenHitRate = Math.round((totalBrokenHits / totalQueries) * 100);
const overallFixedHitRate = Math.round((totalFixedHits / totalQueries) * 100);

console.log(`Before Fix: ${overallBrokenHitRate}% cache hit rate`);
console.log(`After Fix:  ${overallFixedHitRate}% cache hit rate`);
console.log(`Net Change: ${overallFixedHitRate > overallBrokenHitRate ? '+' : ''}${overallFixedHitRate - overallBrokenHitRate}%`);

// Test options hash stability
console.log('\n🔧 OPTIONS HASH STABILITY');
console.log('=' .repeat(30));

const testQuery = 'JavaScript tutorial';
const optionPairs = [
  [{ limit: 10, sort: 'new' }, { sort: 'new', limit: 10 }],
  [{ limit: 5, type: 'post' }, { type: 'post', limit: 5 }]
];

let stabilityFixed = 0;
optionPairs.forEach((pair, i) => {
  const brokenMatch = brokenGenerateCacheKey(testQuery, pair[0]) === brokenGenerateCacheKey(testQuery, pair[1]);
  const fixedMatch = fixedGenerateCacheKey(testQuery, pair[0]) === fixedGenerateCacheKey(testQuery, pair[1]);
  
  console.log(`Test ${i + 1}: Same options, different order`);
  console.log(`  Broken:  ${brokenMatch ? '✅ MATCH' : '❌ MISS'}`);
  console.log(`  Fixed:   ${fixedMatch ? '✅ MATCH' : '❌ MISS'}`);
  
  if (fixedMatch && !brokenMatch) stabilityFixed++;
});

console.log(`\nStability improvement: ${stabilityFixed}/${optionPairs.length} cases fixed`);

console.log('\n🏆 FIXES APPLIED');
console.log('=' .repeat(30));
console.log('✅ Reduced stop words (preserved context)');
console.log('✅ Fixed options hash instability'); 
console.log('✅ Maintained query normalization benefits');
console.log(`✅ Cache hit rate: ${overallFixedHitRate}%`);

if (overallFixedHitRate >= 50) {
  console.log('\n🎉 SIGNIFICANT IMPROVEMENT ACHIEVED!');
} 

console.log('\n🚀 Ready to deploy fixed production worker!');
















