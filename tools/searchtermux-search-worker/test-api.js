/**
 * Test script for Reddit API + Redis caching implementation
 * Tests both cache miss and cache hit scenarios
 */

const WORKER_URL = 'https://searchtermux-search-worker-dev.tech-knnsyndicate.workers.dev'

async function testSearch(query, label) {
  console.log(`\n🔍 Testing: ${label}`)
  console.log(`Query: "${query}"`)
  
  const startTime = Date.now()
  
  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000' // Allowed origin
      },
      body: JSON.stringify({
        query: query,
        options: {
          limit: 5
        }
      })
    })

    const endTime = Date.now()
    const data = await response.json()
    
    console.log(`📊 Status: ${response.status}`)
    console.log(`⏱️  Response Time: ${endTime - startTime}ms`)
    console.log(`💾 Cache Status: ${response.headers.get('X-Cache-Status') || 'Unknown'}`)
    console.log(`🔄 Processing Time: ${response.headers.get('X-Processing-Time') || 'Unknown'}`)
    
    if (response.ok) {
      console.log(`✅ Results: ${data.results?.length || 0} found`)
      console.log(`📝 Cached: ${data.meta?.cached ? 'Yes' : 'No'}`)
      console.log(`📋 First Result: ${data.results?.[0]?.title?.slice(0, 60)}...`)
      console.log(`🌍 Sources: ${data.sources?.join(', ') || 'None'}`)
    } else {
      console.log(`❌ Error: ${data.error}`)
      console.log(`📝 Message: ${data.message}`)
    }
    
    return { success: response.ok, cached: data.meta?.cached, responseTime: endTime - startTime }
    
  } catch (error) {
    console.log(`💥 Request failed: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function runTests() {
  console.log('🚀 Starting Reddit API + Redis Cache Tests')
  console.log('=' .repeat(50))
  
  // Test 1: First search (should be cache miss)
  const test1 = await testSearch('termux python install', 'Cache Miss Test')
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Test 2: Same search (should be cache hit)
  const test2 = await testSearch('termux python install', 'Cache Hit Test')
  
  // Test 3: Different search (should be cache miss)
  const test3 = await testSearch('termux nodejs setup', 'Different Query Test')
  
  // Test 4: Query normalization test
  const test4 = await testSearch('How to install Python in Termux', 'Query Normalization Test')
  
  // Results Summary
  console.log('\n📊 Test Results Summary')
  console.log('=' .repeat(50))
  
  const tests = [
    { name: 'Cache Miss', result: test1 },
    { name: 'Cache Hit', result: test2 },
    { name: 'Different Query', result: test3 },
    { name: 'Normalization', result: test4 }
  ]
  
  tests.forEach((test, i) => {
    const status = test.result.success ? '✅' : '❌'
    const cached = test.result.cached ? '💾 HIT' : '🔄 MISS'
    const time = test.result.responseTime ? `${test.result.responseTime}ms` : 'N/A'
    console.log(`${status} Test ${i + 1} (${test.name}): ${cached} - ${time}`)
  })
  
  // Performance Analysis
  const successfulTests = tests.filter(t => t.result.success)
  if (successfulTests.length > 0) {
    const avgTime = successfulTests.reduce((sum, t) => sum + (t.result.responseTime || 0), 0) / successfulTests.length
    const cacheHits = successfulTests.filter(t => t.result.cached).length
    const hitRate = (cacheHits / successfulTests.length) * 100
    
    console.log(`\n📈 Performance Analysis`)
    console.log(`Average Response Time: ${Math.round(avgTime)}ms`)
    console.log(`Cache Hit Rate: ${hitRate.toFixed(1)}%`)
    console.log(`Successful Tests: ${successfulTests.length}/${tests.length}`)
  }
  
  console.log('\n🎉 Testing Complete!')
}

// Run tests
runTests().catch(console.error)
