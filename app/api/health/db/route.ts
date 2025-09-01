import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";

export async function GET() {
  try {
    // Simple health check query with timeout
    const result = await Promise.race([
      prisma.$queryRaw`SELECT 1 as health`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), 5000)
      )
    ]);

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
      result
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    
    return NextResponse.json({
      status: "unhealthy",
      database: "disconnected",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 503 });
  }
}
