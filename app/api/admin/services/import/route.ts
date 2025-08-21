import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { services, clearExisting = false } = body;

    if (!services || !Array.isArray(services)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid data format: services array is required"
        },
        { status: 400 }
      );
    }

    let importedCount = 0;
    let updatedCount = 0;
    let errors: string[] = [];

    // Use a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Clear existing services if requested
      if (clearExisting) {
        await tx.serviceItem.deleteMany({});
        await tx.service.deleteMany({});
      }

      // Import each service
      for (const serviceData of services) {
        try {
          // Check if service already exists
          const existingService = await tx.service.findUnique({
            where: { id: serviceData.id }
          });

          let service;
          if (existingService) {
            // Update existing service
            service = await tx.service.update({
              where: { id: serviceData.id },
              data: {
                name: serviceData.name,
                slug: serviceData.slug,
                displayName: serviceData.displayName,
                description: serviceData.description,
                shortDescription: serviceData.shortDescription,
                isActive: serviceData.isActive,
                isPopular: serviceData.isPopular,
                sortOrder: serviceData.sortOrder,
                colorTheme: serviceData.colorTheme,
                icon: serviceData.icon,
                category: serviceData.category,
              }
            });
            updatedCount++;
          } else {
            // Create new service
            service = await tx.service.create({
              data: {
                id: serviceData.id,
                name: serviceData.name,
                slug: serviceData.slug,
                displayName: serviceData.displayName,
                description: serviceData.description,
                shortDescription: serviceData.shortDescription,
                isActive: serviceData.isActive,
                isPopular: serviceData.isPopular,
                sortOrder: serviceData.sortOrder,
                colorTheme: serviceData.colorTheme,
                icon: serviceData.icon,
                category: serviceData.category,
              }
            });
            importedCount++;
          }

          // Import service items
          if (serviceData.serviceItems && Array.isArray(serviceData.serviceItems)) {
            // Clear existing items for this service
            await tx.serviceItem.deleteMany({
              where: { serviceId: service.id }
            });

            // Create new items
            for (const itemData of serviceData.serviceItems) {
              await tx.serviceItem.create({
                data: {
                  id: itemData.id,
                  name: itemData.name,
                  description: itemData.description,
                  isRequired: itemData.isRequired,
                  sortOrder: itemData.sortOrder,
                  level: itemData.level,
                  parentId: itemData.parentId,
                  serviceId: service.id,
                }
              });
            }
          }

        } catch (serviceError) {
          console.error(`Error importing service ${serviceData.name}:`, serviceError);
          errors.push(`Failed to import service: ${serviceData.name}`);
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Import completed. Created: ${importedCount}, Updated: ${updatedCount}`,
      details: {
        imported: importedCount,
        updated: updatedCount,
        errors: errors.length,
        totalProcessed: services.length
      },
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to import services data"
      },
      { status: 500 }
    );
  }
}
