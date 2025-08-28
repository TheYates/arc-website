import { NextResponse } from "next/server";
import { CacheService } from "@/lib/redis";

export async function GET() {
  try {
    const health = await CacheService.health();
    const timestamp = new Date().toISOString();

    const status = {
      timestamp,
      redis: {
        connected: health.redis,
        status: health.redis ? "healthy" : "disconnected",
      },
      fallback: {
        active: health.fallback,
        status: health.fallback ? "in-use" : "standby",
      },
      overall: health.redis ? "optimal" : "degraded",
      cache: {
        write: false,
        read: false,
        delete: false,
        functional: false,
      } as any,
    };

    // Test cache functionality
    const testKey = "health-check-test";
    const testValue = { test: true, timestamp };

    try {
      await CacheService.set(testKey, testValue, 10); // 10 seconds
      const retrieved = await CacheService.get(testKey);
      await CacheService.del(testKey);

      status.cache = {
        write: true,
        read: !!retrieved,
        delete: true,
        functional: !!retrieved,
      };
    } catch (error) {
      status.cache = {
        write: false,
        read: false,
        delete: false,
        functional: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    return NextResponse.json(status, {
      status: health.redis ? 200 : 206, // 206 = Partial Content (degraded mode)
    });
  } catch (error) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        redis: { connected: false, status: "error" },
        fallback: { active: true, status: "in-use" },
        overall: "degraded",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
