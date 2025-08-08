import { NextResponse } from "next/server";
import { getServiceBySlugWithDetails } from "@/lib/api/services-prisma";
import { transformServiceToHierarchical } from "@/lib/utils/service-hierarchy";

// Fie Ne Fie service API - now uses PostgreSQL database

export async function GET() {
  try {
    // Get Fie Ne Fie service from database
    const service = await getServiceBySlugWithDetails("fie-ne-fie");

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error: "Fie Ne Fie service not found",
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
    console.error("Error fetching Fie Ne Fie service:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load Fie Ne Fie service data",
      },
      { status: 500 }
    );
  }
}
