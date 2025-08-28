import { NextRequest, NextResponse } from "next/server";
import { getPrescriptionsByPatient } from "@/lib/api/medications-prisma";
import { CacheService } from "@/lib/redis";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const start = performance.now();
    const { patientId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // User-specific cache key for security
    const cacheKey = userId
      ? `prescriptions:${patientId}:user:${userId}`
      : `prescriptions:${patientId}`;

    // Try cache first
    const cachedPrescriptions = await CacheService.get(cacheKey);
    if (cachedPrescriptions) {
      console.log(`💾 Cache HIT for prescriptions ${patientId}`);
      return NextResponse.json({ prescriptions: cachedPrescriptions });
    }

    const dbStart = performance.now();
    const prescriptions = await getPrescriptionsByPatient(patientId);
    const dbEnd = performance.now();

    console.log(
      `💊 Prescriptions DB query took ${(dbEnd - dbStart).toFixed(
        2
      )}ms, found ${prescriptions?.length || 0} prescriptions`
    );

    // Cache for 15 minutes
    await CacheService.set(cacheKey, prescriptions, 900);
    console.log(`💾 Cache SET for prescriptions ${patientId}`);

    const end = performance.now();
    console.log(
      `✅ Prescriptions API completed in ${(end - start).toFixed(2)}ms`
    );

    return NextResponse.json({ prescriptions });
  } catch (error) {
    console.error("Get medications API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
