import { NextResponse } from "next/server";
import { getAllServices } from "@/lib/api/services-prisma";

export async function GET() {
  try {
    // Fetch all services including inactive ones for admin
    const services = await getAllServices(true);

    // Transform to PricingItem format for the admin interface
    const pricingItems = services.map((service: any) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      type: "service",
      isRequired: true,
      isRecurring: true,
      parentId: null,
      sortOrder: service.sortOrder,
      colorTheme: service.colorTheme,
      children: [], // Will be populated with features/categories later
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: pricingItems,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch services",
      },
      { status: 500 }
    );
  }
}
