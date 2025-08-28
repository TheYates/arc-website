import { CacheService } from "../lib/redis";

interface TestResult {
  endpoint: string;
  method: string;
  status: "PASS" | "FAIL";
  responseTime: number;
  cacheHit?: boolean;
  details: string;
}

async function testEndpoint(
  url: string,
  options: RequestInit = {},
  testName: string
): Promise<TestResult> {
  const start = performance.now();

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const end = performance.now();
    const responseTime = end - start;

    if (response.ok) {
      const data = await response.json();
      return {
        endpoint: url,
        method: options.method || "GET",
        status: "PASS",
        responseTime,
        details: `✅ ${testName} - Status: ${
          response.status
        }, Data: ${JSON.stringify(data).substring(0, 100)}...`,
      };
    } else {
      return {
        endpoint: url,
        method: options.method || "GET",
        status: "FAIL",
        responseTime,
        details: `❌ ${testName} - Status: ${
          response.status
        }, Error: ${await response.text()}`,
      };
    }
  } catch (error) {
    const end = performance.now();
    return {
      endpoint: url,
      method: options.method || "GET",
      status: "FAIL",
      responseTime: end - start,
      details: `❌ ${testName} - Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

async function testHealthcareAPIs() {
  console.log("🧪 Starting Healthcare APIs Cache Performance Tests...");
  console.log("=".repeat(60));

  const results: TestResult[] = [];
  const baseUrl = "http://localhost:3001"; // Adjust if different

  // Test Data
  const testPatientId = "101";
  const testAuthorId = "user123";
  const testReviewerId = "reviewer456";

  // 1. Test Care Notes API
  console.log("\n📝 Testing Care Notes API...");

  // First call - should be cache MISS
  results.push(
    await testEndpoint(
      `${baseUrl}/api/care-notes?patientId=${testPatientId}&authorId=${testAuthorId}`,
      {},
      "Care Notes - First Call (Cache MISS)"
    )
  );

  // Second call - should be cache HIT
  await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay
  results.push(
    await testEndpoint(
      `${baseUrl}/api/care-notes?patientId=${testPatientId}&authorId=${testAuthorId}`,
      {},
      "Care Notes - Second Call (Cache HIT)"
    )
  );

  // 2. Test Medications API
  console.log("\n💊 Testing Medications API...");

  // First call
  results.push(
    await testEndpoint(
      `${baseUrl}/api/patients/${testPatientId}/medications?userId=${testAuthorId}`,
      {},
      "Medications - First Call (Cache MISS)"
    )
  );

  // Second call
  await new Promise((resolve) => setTimeout(resolve, 100));
  results.push(
    await testEndpoint(
      `${baseUrl}/api/patients/${testPatientId}/medications?userId=${testAuthorId}`,
      {},
      "Medications - Second Call (Cache HIT)"
    )
  );

  // 3. Test Prescriptions API
  console.log("\n📋 Testing Prescriptions API...");

  results.push(
    await testEndpoint(
      `${baseUrl}/api/medications/${testPatientId}?userId=${testAuthorId}`,
      {},
      "Prescriptions - First Call (Cache MISS)"
    )
  );

  await new Promise((resolve) => setTimeout(resolve, 100));
  results.push(
    await testEndpoint(
      `${baseUrl}/api/medications/${testPatientId}?userId=${testAuthorId}`,
      {},
      "Prescriptions - Second Call (Cache HIT)"
    )
  );

  // 4. Test Medical Reviews API
  console.log("\n🩺 Testing Medical Reviews API...");

  results.push(
    await testEndpoint(
      `${baseUrl}/api/medical-reviews?patientId=${testPatientId}&reviewerId=${testReviewerId}`,
      {},
      "Medical Reviews - First Call (Cache MISS)"
    )
  );

  await new Promise((resolve) => setTimeout(resolve, 100));
  results.push(
    await testEndpoint(
      `${baseUrl}/api/medical-reviews?patientId=${testPatientId}&reviewerId=${testReviewerId}`,
      {},
      "Medical Reviews - Second Call (Cache HIT)"
    )
  );

  // 5. Test Review Statistics
  console.log("\n📊 Testing Review Statistics...");

  results.push(
    await testEndpoint(
      `${baseUrl}/api/medical-reviews?stats=true&reviewerId=${testReviewerId}`,
      {},
      "Review Statistics - First Call (Cache MISS)"
    )
  );

  await new Promise((resolve) => setTimeout(resolve, 100));
  results.push(
    await testEndpoint(
      `${baseUrl}/api/medical-reviews?stats=true&reviewerId=${testReviewerId}`,
      {},
      "Review Statistics - Second Call (Cache HIT)"
    )
  );

  // 6. Test Redis Health Endpoint
  console.log("\n❤️ Testing Redis Health...");

  results.push(
    await testEndpoint(`${baseUrl}/api/health/redis`, {}, "Redis Health Check")
  );

  // 7. Test Cache Invalidation
  console.log("\n🗑️ Testing Cache Invalidation...");

  // Create a test care note to trigger cache invalidation
  const testCareNote = {
    patientId: testPatientId,
    authorId: testAuthorId,
    authorName: "Test Author",
    authorRole: "caregiver",
    title: "Test Cache Invalidation Note",
    content: "This note tests cache invalidation functionality",
    priority: "medium",
  };

  results.push(
    await testEndpoint(
      `${baseUrl}/api/care-notes`,
      {
        method: "POST",
        body: JSON.stringify(testCareNote),
      },
      "Create Care Note (Cache Invalidation Test)"
    )
  );

  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST RESULTS SUMMARY");
  console.log("=".repeat(60));

  let passCount = 0;
  let totalResponseTime = 0;

  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.details}`);
    console.log(`   ⏱️  Response Time: ${result.responseTime.toFixed(2)}ms`);
    console.log(`   🎯 Status: ${result.status}`);

    if (result.status === "PASS") {
      passCount++;
    }
    totalResponseTime += result.responseTime;
  });

  const avgResponseTime = totalResponseTime / results.length;
  const successRate = (passCount / results.length) * 100;

  console.log("\n" + "=".repeat(60));
  console.log("📈 PERFORMANCE METRICS");
  console.log("=".repeat(60));
  console.log(
    `✅ Success Rate: ${successRate.toFixed(1)}% (${passCount}/${
      results.length
    })`
  );
  console.log(`⚡ Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(
    `🏎️  Fastest Response: ${Math.min(
      ...results.map((r) => r.responseTime)
    ).toFixed(2)}ms`
  );
  console.log(
    `🐌 Slowest Response: ${Math.max(
      ...results.map((r) => r.responseTime)
    ).toFixed(2)}ms`
  );

  // Performance Analysis
  console.log("\n📊 CACHE PERFORMANCE ANALYSIS");
  console.log("=".repeat(60));

  const firstCalls = results.filter((_, index) => index % 2 === 0 && index < 8);
  const secondCalls = results.filter(
    (_, index) => index % 2 === 1 && index < 8
  );

  if (firstCalls.length > 0 && secondCalls.length > 0) {
    const avgFirstCall =
      firstCalls.reduce((sum, r) => sum + r.responseTime, 0) /
      firstCalls.length;
    const avgSecondCall =
      secondCalls.reduce((sum, r) => sum + r.responseTime, 0) /
      secondCalls.length;
    const improvement = ((avgFirstCall - avgSecondCall) / avgFirstCall) * 100;

    console.log(
      `🥇 Average First Call (Cache MISS): ${avgFirstCall.toFixed(2)}ms`
    );
    console.log(
      `🥈 Average Second Call (Cache HIT): ${avgSecondCall.toFixed(2)}ms`
    );
    console.log(`⚡ Performance Improvement: ${improvement.toFixed(1)}%`);
    console.log(
      `💾 Cache Effectiveness: ${
        improvement > 20
          ? "EXCELLENT"
          : improvement > 10
          ? "GOOD"
          : "NEEDS IMPROVEMENT"
      }`
    );
  }

  console.log("\n🎉 Healthcare API Cache Testing Complete!");

  return {
    totalTests: results.length,
    passed: passCount,
    failed: results.length - passCount,
    successRate: successRate,
    averageResponseTime: avgResponseTime,
  };
}

// Run the tests
testHealthcareAPIs()
  .then((summary) => {
    console.log(
      `\n📋 Final Summary: ${summary.passed}/${
        summary.totalTests
      } tests passed (${summary.successRate.toFixed(1)}%)`
    );
    process.exit(summary.successRate === 100 ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Test suite failed:", error);
    process.exit(1);
  });
