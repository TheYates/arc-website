import { NextResponse } from "next/server";
import { getServiceBySlugWithDetails } from "@/lib/api/services-prisma";
import { transformServiceToHierarchical } from "@/lib/utils/service-hierarchy";

// Yonko Pa service API - now uses PostgreSQL database

export async function GET() {
  try {
    // Get Yonko Pa service from database
    const service = await getServiceBySlugWithDetails("yonko-pa");

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error: "Yonko Pa service not found",
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
    console.error("Error fetching Yonko Pa service:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load Yonko Pa service data",
      },
      { status: 500 }
    );
  }
}
