import { CacheService } from "../lib/redis";

async function generateTestCacheData() {
  console.log("🔄 Generating test cache data for RedisInsight...");

  try {
    // Test basic caching
    await CacheService.set("test:hello", "Hello from ARC Website!", 300);
    await CacheService.set("test:timestamp", new Date().toISOString(), 60);

    // Healthcare-related test data
    const patientData = {
      id: "patient-123",
      name: "John Doe",
      age: 45,
      condition: "Diabetes",
      lastVisit: new Date().toISOString(),
    };
    await CacheService.set("patients:patient-123", patientData, 600);

    // Medication test data
    const medicationData = [
      {
        id: "med-1",
        name: "Metformin",
        dosage: "500mg",
        frequency: "twice daily",
      },
      {
        id: "med-2",
        name: "Insulin",
        dosage: "10 units",
        frequency: "before meals",
      },
    ];
    await CacheService.set("medications:patient-123", medicationData, 600);

    // Service data
    const serviceData = {
      id: "service-456",
      name: "Home Health Care",
      price: 150,
      duration: "2 hours",
      available: true,
    };
    await CacheService.set("services:home-health", serviceData, 900);

    // Logo test data (simulating the protected endpoint)
    const logoData = [
      { id: "1", name: "UTB", active: true, sortOrder: 1 },
      { id: "2", name: "NOVA", active: true, sortOrder: 2 },
      { id: "3", name: "Pastosa", active: false, sortOrder: 3 },
    ];
    await CacheService.set("logos:test-data", logoData, 300);

    // System stats
    const systemStats = {
      totalPatients: 1250,
      activeServices: 8,
      todayAppointments: 23,
      pendingReviews: 5,
      cacheGenerated: new Date().toISOString(),
    };
    await CacheService.set("system:stats", systemStats, 120);

    console.log("✅ Test cache data generated successfully!");
    console.log("📊 Cache keys created:");
    console.log("  - test:hello");
    console.log("  - test:timestamp");
    console.log("  - patients:patient-123");
    console.log("  - medications:patient-123");
    console.log("  - services:home-health");
    console.log("  - logos:test-data");
    console.log("  - system:stats");
    console.log("");
    console.log("🔍 You should now see these keys in RedisInsight!");
    console.log("💡 Refresh the RedisInsight interface to see the new data");

    // Test reading the data
    const hello = await CacheService.get("test:hello");
    console.log("");
    console.log("🧪 Test read from cache:", hello);

    return true;
  } catch (error) {
    console.error("❌ Failed to generate cache data:", error);
    return false;
  }
}

// Run the test
generateTestCacheData()
  .then((success) => {
    if (success) {
      console.log("\n🎉 Cache data generation complete!");
      process.exit(0);
    } else {
      console.log("\n🔧 Please check Redis connection and try again");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("Script error:", error);
    process.exit(1);
  });
