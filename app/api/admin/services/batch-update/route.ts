import { NextResponse } from "next/server";
import { updateService, updateServiceItem } from "@/lib/api/services-prisma";

interface BatchUpdateRequest {
  services?: Array<{
    id: string;
    updates: {
      name?: string;
      displayName?: string;
      description?: string;
      sortOrder?: number;
      colorTheme?: string;
      comingSoon?: boolean;
    };
  }>;
  serviceItems?: Array<{
    id: string;
    updates: {
      name?: string;
      description?: string;
      isRequired?: boolean;
      sortOrder?: number;
    };
  }>;
}

export async function POST(request: Request) {
  try {
    const body: BatchUpdateRequest = await request.json();
    const { services = [], serviceItems = [] } = body;

    console.log("🚀 Batch update started:", {
      servicesCount: services.length,
      serviceItemsCount: serviceItems.length,
    });

    const startTime = Date.now();
    let updatedServices = 0;
    let updatedServiceItems = 0;
    const errors: string[] = [];

    // Update services in parallel for better performance
    if (services.length > 0) {
      const servicePromises = services.map(async ({ id, updates }) => {
        try {
          const result = await updateService(id, updates);
          if (result) {
            updatedServices++;
            return { success: true, id };
          } else {
            errors.push(`Failed to update service: ${id}`);
            return { success: false, id };
          }
        } catch (error) {
          console.error(`Error updating service ${id}:`, error);
          errors.push(`Error updating service ${id}: ${error}`);
          return { success: false, id };
        }
      });

      await Promise.all(servicePromises);
    }

    // Update service items in parallel for better performance
    if (serviceItems.length > 0) {
      const itemPromises = serviceItems.map(async ({ id, updates }) => {
        try {
          const result = await updateServiceItem(id, updates);
          if (result) {
            updatedServiceItems++;
            return { success: true, id };
          } else {
            errors.push(`Failed to update service item: ${id}`);
            return { success: false, id };
          }
        } catch (error) {
          console.error(`Error updating service item ${id}:`, error);
          errors.push(`Error updating service item ${id}: ${error}`);
          return { success: false, id };
        }
      });

      await Promise.all(itemPromises);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    const result = {
      success: errors.length === 0,
      message: `Batch update complete. Services: ${updatedServices}, Items: ${updatedServiceItems}`,
      details: {
        updatedServices,
        updatedServiceItems,
        errors: errors.length,
        duration: `${duration}ms`,
      },
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log("✅ Batch update result:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in batch update:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process batch update" },
      { status: 500 }
    );
  }
}
