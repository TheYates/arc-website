import { NextRequest, NextResponse } from "next/server";
import { getMedications } from "@/lib/api/medications";
import { CacheService } from "@/lib/redis";

// GET /api/patients/[id]/medications - Get medications for a specific patient
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const start = performance.now();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId"); // For user-specific caching

    // Create user-specific cache key for security
    const cacheKey = userId
      ? `medications:${id}:user:${userId}`
      : `medications:${id}`;

    // Try cache first
    const cachedMedications = await CacheService.get(cacheKey);
    if (cachedMedications) {
      console.log(`💾 Cache HIT for medications ${id}`);
      return NextResponse.json({
        success: true,
        data: cachedMedications,
      });
    }

    const dbStart = performance.now();
    const medications = getMedications(id);
    const dbEnd = performance.now();

    console.log(
      `💊 Medications DB query took ${(dbEnd - dbStart).toFixed(2)}ms, found ${
        medications?.length || 0
      } medications`
    );

    // Cache for 10 minutes
    await CacheService.set(cacheKey, medications || [], 600);
    console.log(`💾 Cache SET for medications ${id}`);

    const end = performance.now();
    console.log(
      `✅ Medications API completed in ${(end - start).toFixed(2)}ms`
    );

    return NextResponse.json({
      success: true,
      data: medications || [],
    });
  } catch (error) {
    console.error("Error fetching patient medications:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch patient medications",
      },
      { status: 500 }
    );
  }
}
