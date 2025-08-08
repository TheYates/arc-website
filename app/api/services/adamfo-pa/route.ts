import { NextResponse } from "next/server";
import { getServiceBySlugWithDetails } from "@/lib/api/services-prisma";
import { transformServiceToHierarchical } from "@/lib/utils/service-hierarchy";

// Adamfo Pa service API - now uses PostgreSQL database

export async function GET() {
  try {
    // Get Adamfo Pa service from database
    const service = await getServiceBySlugWithDetails("adamfo-pa");

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error: "Adamfo Pa service not found",
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
    console.error("Error fetching Adamfo Pa service:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load Adamfo Pa service data",
      },
      { status: 500 }
    );
  }
}
