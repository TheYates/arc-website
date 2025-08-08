import { NextResponse } from "next/server";
import { getServiceBySlugWithDetails } from "@/lib/api/services-prisma";
import { transformServiceToHierarchical } from "@/lib/utils/service-hierarchy";

// Event Medical Coverage service API - now uses PostgreSQL database

export async function GET() {
  try {
    // Get Event Medical Coverage service from database
    const service = await getServiceBySlugWithDetails("event-medical-coverage");

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error: "Event Medical Coverage service not found",
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
    console.error("Error fetching Event Medical Coverage service:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load Event Medical Coverage service data",
      },
      { status: 500 }
    );
  }
}
