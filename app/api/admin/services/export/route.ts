import { NextResponse } from "next/server";
import { getAllServicesWithItems } from "@/lib/api/services-prisma";

export async function GET() {
  try {
    // Get all services with their items
    const services = await getAllServicesWithItems();
    
    // Create export data with metadata
    const exportData = {
      exportDate: new Date().toISOString(),
      version: "1.0",
      totalServices: services.length,
      services: services.map(service => ({
        id: service.id,
        name: service.name,
        slug: service.slug,
        displayName: service.displayName,
        description: service.description,
        shortDescription: service.shortDescription,
        isActive: service.isActive,
        isPopular: service.isPopular,
        sortOrder: service.sortOrder,
        colorTheme: service.colorTheme,
        icon: service.icon,
        category: service.category,
        createdAt: service.createdAt.toISOString(),
        updatedAt: service.updatedAt.toISOString(),
        serviceItems: service.serviceItems.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          isRequired: item.isRequired,
          sortOrder: item.sortOrder,
          level: item.level,
          parentId: item.parentId,
          serviceId: item.serviceId,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        }))
      }))
    };

    return NextResponse.json({
      success: true,
      data: exportData
    });

  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to export services data"
      },
      { status: 500 }
    );
  }
}
