import { NextResponse } from "next/server";
import { getServiceBySlugWithDetails } from "@/lib/api/services-prisma";
import { transformServiceToHierarchical } from "@/lib/utils/service-hierarchy";

// Conference Option service API - now uses PostgreSQL database

export async function GET() {
  try {
    // Get Conference Option service from database
    const service = await getServiceBySlugWithDetails("conference-option");

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error: "Conference Option service not found",
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
    console.error("Error fetching Conference Option service:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load Conference Option service data",
      },
      { status: 500 }
    );
  }
}
