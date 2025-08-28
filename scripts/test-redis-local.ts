import Redis from "ioredis";

async function testRedisConnection() {
  console.log("🔍 Testing local Redis connection...");

  const redis = new Redis({
    host: "localhost",
    port: 6379,
    enableReadyCheck: false,
    lazyConnect: true,
  });

  try {
    // Test connection
    await redis.ping();
    console.log("✅ Redis connection successful!");

    // Test basic operations
    await redis.set("test:key", "Hello Redis!");
    const value = await redis.get("test:key");
    console.log(`📝 Test write/read: ${value}`);

    // Test expiration
    await redis.setex("test:expire", 5, "This will expire");
    const ttl = await redis.ttl("test:expire");
    console.log(`⏰ Expiration test: TTL = ${ttl} seconds`);

    // Cleanup
    await redis.del("test:key", "test:expire");
    console.log("🧹 Test cleanup completed");

    // Get Redis info
    const info = await redis.info("server");
    const version = info.match(/redis_version:([^\r\n]+)/)?.[1];
    console.log(`🔧 Redis version: ${version}`);

    await redis.disconnect();
    console.log("👋 Connection closed gracefully");

    return true;
  } catch (error) {
    console.error("❌ Redis connection failed:", error);
    console.log("💡 Make sure Redis/Memurai is running on localhost:6379");
    return false;
  }
}

// Run the test
testRedisConnection()
  .then((success) => {
    if (success) {
      console.log("\n🎉 Redis is ready for your ARC website project!");
      process.exit(0);
    } else {
      console.log("\n🔧 Please install and start Redis/Memurai first");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("Test script error:", error);
    process.exit(1);
  });
