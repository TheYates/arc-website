import { NextResponse } from "next/server";
import { getServiceBySlugWithDetails } from "@/lib/api/services-prisma";
import { transformServiceToHierarchical } from "@/lib/utils/service-hierarchy";

// AHENEFIE service API - now uses PostgreSQL database

export async function GET() {
  try {
    // Get AHENEFIE service from database
    const service = await getServiceBySlugWithDetails("ahenefie");

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error: "AHENEFIE service not found",
        },
        { status: 404 }
      );
    }

    // Transform to service format with hierarchical structure
    const serviceData = transformServiceToHierarchical(service);

    return NextResponse.json({
      success: true,
      data: serviceData,
    });
  } catch (error) {
    console.error("Error fetching AHENEFIE service data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load AHENEFIE service data",
      },
      { status: 500 }
    );
  }
}
