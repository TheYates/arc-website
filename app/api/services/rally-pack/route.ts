import { NextResponse } from "next/server";
import { getServiceBySlugWithDetails } from "@/lib/api/services-prisma";
import { transformServiceToHierarchical } from "@/lib/utils/service-hierarchy";

// Rally Pack service API - now uses PostgreSQL database

export async function GET() {
  try {
    // Get Rally Pack service from database
    const service = await getServiceBySlugWithDetails("rally-pack");

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error: "Rally Pack service not found",
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
    console.error("Error fetching Rally Pack service:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load Rally Pack service data",
      },
      { status: 500 }
    );
  }
}
