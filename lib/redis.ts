import Redis from "ioredis";

// Redis configuration for local development and production
const getRedisConfig = () => {
  // For local development
  if (process.env.NODE_ENV === "development") {
    return {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    };
  }

  // For production (Upstash, Redis Cloud, etc.)
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  // Fallback to local
  return {
    host: "localhost",
    port: 6379,
  };
};

// Create Redis instance
const createRedisInstance = () => {
  const config = getRedisConfig();

  // If config is a string (URL), use it directly
  if (typeof config === "string") {
    return new Redis(config);
  }

  // If config is an object, use it as options
  return new Redis(config);
};

const redis = createRedisInstance();

// Connection event handlers
redis.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redis.on("error", (err) => {
  console.warn("⚠️ Redis connection error:", err.message);
  console.log("📝 Falling back to in-memory cache");
});

redis.on("ready", () => {
  console.log("🚀 Redis is ready to accept commands");
});

// Cache utility functions
export class CacheService {
  private static fallbackCache = new Map<
    string,
    { data: any; expires: number }
  >();

  static async get<T>(key: string): Promise<T | null> {
    try {
      const result = await redis.get(key);
      return result ? JSON.parse(result) : null;
    } catch (error) {
      // Fallback to in-memory cache
      const cached = this.fallbackCache.get(key);
      if (cached && Date.now() < cached.expires) {
        return cached.data;
      }
      return null;
    }
  }

  static async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      // Fallback to in-memory cache
      this.fallbackCache.set(key, {
        data: value,
        expires: Date.now() + ttlSeconds * 1000,
      });
    }
  }

  static async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      this.fallbackCache.delete(key);
    }
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      // Fallback: clear matching keys from in-memory cache
      for (const key of this.fallbackCache.keys()) {
        if (key.includes(pattern.replace("*", ""))) {
          this.fallbackCache.delete(key);
        }
      }
    }
  }

  static async health(): Promise<{ redis: boolean; fallback: boolean }> {
    try {
      await redis.ping();
      return { redis: true, fallback: false };
    } catch (error) {
      return { redis: false, fallback: true };
    }
  }
}

export default redis;
