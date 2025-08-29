import Redis from "ioredis";

// Redis configuration for local development and production
const getRedisConfig = () => {
  // Check if Redis should be disabled (for home development without Redis server)
  if (process.env.DISABLE_REDIS === "true") {
    return null;
  }

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

// Create Redis instance or null if disabled
const createRedisInstance = () => {
  const config = getRedisConfig();

  // If Redis is disabled, return null
  if (config === null) {
    console.log("🚫 Redis is disabled via DISABLE_REDIS environment variable");
    return null;
  }

  // If config is a string (URL), use it directly
  if (typeof config === "string") {
    return new Redis(config);
  }

  // If config is an object, use it as options
  return new Redis(config);
};

const redis = createRedisInstance();

// Connection event handlers (only if Redis is enabled)
if (redis) {
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
}

// Cache utility functions
export class CacheService {
  private static fallbackCache = new Map<
    string,
    { data: any; expires: number }
  >();

  static async get<T>(key: string): Promise<T | null> {
    try {
      // If Redis is disabled, use fallback cache directly
      if (!redis) {
        const cached = this.fallbackCache.get(key);
        if (cached && Date.now() < cached.expires) {
          return cached.data;
        }
        return null;
      }

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
      // If Redis is disabled, use fallback cache directly
      if (!redis) {
        this.fallbackCache.set(key, {
          data: value,
          expires: Date.now() + ttlSeconds * 1000,
        });
        return;
      }

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
      // If Redis is disabled, use fallback cache directly
      if (!redis) {
        this.fallbackCache.delete(key);
        return;
      }

      await redis.del(key);
    } catch (error) {
      this.fallbackCache.delete(key);
    }
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      // If Redis is disabled, use fallback cache directly
      if (!redis) {
        for (const key of this.fallbackCache.keys()) {
          if (key.includes(pattern.replace("*", ""))) {
            this.fallbackCache.delete(key);
          }
        }
        return;
      }

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
      // If Redis is disabled, always return fallback mode
      if (!redis) {
        return { redis: false, fallback: true };
      }

      await redis.ping();
      return { redis: true, fallback: false };
    } catch (error) {
      return { redis: false, fallback: true };
    }
  }
}

export default redis;
