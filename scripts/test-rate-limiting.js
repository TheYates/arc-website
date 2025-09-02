/**
 * Rate Limiting Test Script
 * 
 * This script tests the rate limiting implementation by making multiple requests
 * to various endpoints and verifying that rate limits are properly enforced.
 */

const BASE_URL = 'http://localhost:3000';

// Test configurations
const tests = [
  {
    name: 'Login Rate Limiting',
    endpoint: '/api/auth/login',
    method: 'POST',
    body: { email: 'test@example.com', password: 'wrongpassword' },
    expectedLimit: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    description: 'Should block after 5 failed login attempts'
  },
  {
    name: 'Admin Login Rate Limiting',
    endpoint: '/api/auth/login',
    method: 'POST',
    body: { email: 'admin@example.com', password: 'wrongpassword' },
    expectedLimit: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
    description: 'Should block admin login after 3 attempts'
  },
  {
    name: 'Read Operations Rate Limiting',
    endpoint: '/api/admin/users',
    method: 'GET',
    headers: { 'Authorization': 'Bearer fake-token' },
    expectedLimit: 100,
    windowMs: 60 * 1000, // 1 minute
    description: 'Should allow many read operations but eventually limit'
  }
];

/**
 * Make a single HTTP request
 */
async function makeRequest(test, requestNumber) {
  const options = {
    method: test.method,
    headers: {
      'Content-Type': 'application/json',
      ...test.headers
    }
  };

  if (test.body) {
    options.body = JSON.stringify(test.body);
  }

  try {
    const response = await fetch(`${BASE_URL}${test.endpoint}`, options);
    
    return {
      status: response.status,
      headers: {
        'x-ratelimit-limit': response.headers.get('x-ratelimit-limit'),
        'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining'),
        'x-ratelimit-reset': response.headers.get('x-ratelimit-reset'),
        'retry-after': response.headers.get('retry-after')
      },
      body: await response.json().catch(() => ({}))
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message,
      headers: {}
    };
  }
}

/**
 * Run a single test
 */
async function runTest(test) {
  console.log(`\n🧪 Testing: ${test.name}`);
  console.log(`📝 ${test.description}`);
  console.log(`🎯 Endpoint: ${test.method} ${test.endpoint}`);
  console.log(`⏱️  Expected limit: ${test.expectedLimit} requests`);
  
  const results = [];
  let rateLimitHit = false;
  let firstRateLimitAt = null;

  // Make requests until we hit the rate limit or reach a reasonable max
  const maxRequests = Math.min(test.expectedLimit + 10, 50);
  
  for (let i = 1; i <= maxRequests; i++) {
    const result = await makeRequest(test, i);
    results.push(result);

    // Log progress every 5 requests or on important events
    if (i % 5 === 0 || result.status === 429 || i === 1) {
      const remaining = result.headers['x-ratelimit-remaining'];
      const limit = result.headers['x-ratelimit-limit'];
      
      console.log(`  Request ${i}: Status ${result.status}${
        remaining !== null ? ` (${remaining}/${limit} remaining)` : ''
      }`);
    }

    // Check if we hit the rate limit
    if (result.status === 429 && !rateLimitHit) {
      rateLimitHit = true;
      firstRateLimitAt = i;
      console.log(`  🚨 Rate limit hit at request ${i}`);
      
      if (result.headers['retry-after']) {
        console.log(`  ⏰ Retry after: ${result.headers['retry-after']} seconds`);
      }
      
      // Stop testing after hitting rate limit
      break;
    }

    // Small delay between requests to avoid overwhelming
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Analyze results
  console.log(`\n📊 Test Results for ${test.name}:`);
  console.log(`  Total requests made: ${results.length}`);
  console.log(`  Rate limit hit: ${rateLimitHit ? 'Yes' : 'No'}`);
  
  if (rateLimitHit) {
    console.log(`  Rate limit triggered at request: ${firstRateLimitAt}`);
    
    // Check if the rate limit was triggered at the expected point
    const tolerance = 2; // Allow some tolerance
    const expectedRange = [test.expectedLimit - tolerance, test.expectedLimit + tolerance];
    
    if (firstRateLimitAt >= expectedRange[0] && firstRateLimitAt <= expectedRange[1]) {
      console.log(`  ✅ Rate limit triggered within expected range (${expectedRange[0]}-${expectedRange[1]})`);
    } else {
      console.log(`  ❌ Rate limit triggered outside expected range (expected: ${expectedRange[0]}-${expectedRange[1]}, actual: ${firstRateLimitAt})`);
    }
  } else {
    console.log(`  ⚠️  Rate limit not reached in ${results.length} requests`);
  }

  // Check for proper headers
  const lastResult = results[results.length - 1];
  if (lastResult.headers['x-ratelimit-limit']) {
    console.log(`  ✅ Rate limit headers present`);
  } else {
    console.log(`  ❌ Rate limit headers missing`);
  }

  return {
    testName: test.name,
    passed: rateLimitHit,
    requestsUntilLimit: firstRateLimitAt,
    expectedLimit: test.expectedLimit,
    hasHeaders: !!lastResult.headers['x-ratelimit-limit']
  };
}

/**
 * Test rate limit recovery
 */
async function testRecovery() {
  console.log(`\n🔄 Testing Rate Limit Recovery`);
  console.log(`📝 Verify that rate limits reset after the time window`);
  
  // This would require waiting for the actual time window to pass
  // For demo purposes, we'll just log what should happen
  console.log(`  ⏰ In a real test, we would wait for the time window to pass`);
  console.log(`  ⏰ Then verify that requests are allowed again`);
  console.log(`  ⏰ This ensures the sliding window is working correctly`);
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🚀 Starting Rate Limiting Tests');
  console.log('=' .repeat(50));

  const testResults = [];

  // Run each test
  for (const test of tests) {
    try {
      const result = await runTest(test);
      testResults.push(result);
    } catch (error) {
      console.error(`❌ Test failed: ${test.name}`, error);
      testResults.push({
        testName: test.name,
        passed: false,
        error: error.message
      });
    }
  }

  // Test recovery (conceptual)
  await testRecovery();

  // Summary
  console.log('\n📋 Test Summary');
  console.log('=' .repeat(50));
  
  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;
  
  console.log(`Tests passed: ${passedTests}/${totalTests}`);
  
  testResults.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`  ${status} ${result.testName}`);
    
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    } else if (result.requestsUntilLimit) {
      console.log(`    Rate limited after ${result.requestsUntilLimit} requests`);
    }
  });

  console.log('\n🎯 Recommendations:');
  console.log('  1. Monitor rate limit violations in production');
  console.log('  2. Adjust limits based on actual usage patterns');
  console.log('  3. Implement IP whitelisting for trusted sources');
  console.log('  4. Consider implementing progressive delays');
  console.log('  5. Set up alerts for unusual rate limit activity');

  return testResults;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, runTest, makeRequest };
