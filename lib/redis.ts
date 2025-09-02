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

  // Redis sorted set operations for rate limiting
  static async zadd(key: string, score: number, member: string): Promise<number> {
    try {
      if (!redis) {
        // Fallback: use in-memory map to simulate sorted set
        const setKey = `zset:${key}`;
        if (!this.fallbackCache.has(setKey)) {
          this.fallbackCache.set(setKey, { data: new Map(), expires: Date.now() + 3600000 });
        }
        const cached = this.fallbackCache.get(setKey);
        if (cached && cached.expires > Date.now()) {
          cached.data.set(member, score);
          return 1;
        }
        return 0;
      }

      return await redis.zadd(key, score, member);
    } catch (error) {
      console.error('Redis zadd error:', error);
      return 0;
    }
  }

  static async zremrangebyscore(key: string, min: number, max: number): Promise<number> {
    try {
      if (!redis) {
        // Fallback: remove from in-memory map
        const setKey = `zset:${key}`;
        const cached = this.fallbackCache.get(setKey);
        if (cached && cached.expires > Date.now()) {
          let removed = 0;
          for (const [member, score] of cached.data.entries()) {
            if (score >= min && score <= max) {
              cached.data.delete(member);
              removed++;
            }
          }
          return removed;
        }
        return 0;
      }

      return await redis.zremrangebyscore(key, min, max);
    } catch (error) {
      console.error('Redis zremrangebyscore error:', error);
      return 0;
    }
  }

  static async zcard(key: string): Promise<number> {
    try {
      if (!redis) {
        // Fallback: count in-memory map
        const setKey = `zset:${key}`;
        const cached = this.fallbackCache.get(setKey);
        if (cached && cached.expires > Date.now()) {
          return cached.data.size;
        }
        return 0;
      }

      return await redis.zcard(key);
    } catch (error) {
      console.error('Redis zcard error:', error);
      return 0;
    }
  }

  static async expire(key: string, seconds: number): Promise<boolean> {
    try {
      if (!redis) {
        // Fallback: update expiration in memory
        const cached = this.fallbackCache.get(key);
        if (cached) {
          cached.expires = Date.now() + seconds * 1000;
          return true;
        }
        return false;
      }

      const result = await redis.expire(key, seconds);
      return result === 1;
    } catch (error) {
      console.error('Redis expire error:', error);
      return false;
    }
  }
}

export default redis;
