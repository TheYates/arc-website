import { NextResponse } from "next/server";
import type { PricingItem } from "@/lib/types/packages";
import { getAllServicesWithItems, getServiceItems } from "@/lib/api/services-prisma";

// Ultra-optimized transform function (works with pre-loaded service items)
const transformServiceToPricingItemUltraOptimized = (
  serviceWithItems: any
): PricingItem => {
  // Helper function to build hierarchical structure
  const buildHierarchy = (
    items: any[],
    parentId: string | null = null
  ): any[] => {
    return items
      .filter((item) => item.parentId === parentId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description || "",
        type: item.level === 1 ? "feature" : ("addon" as "feature" | "addon"),
        basePrice: Number(item.basePrice || 0),
        isRequired: item.isRequired,
        isRecurring: true,
        parentId: item.parentId || serviceWithItems.id,
        sortOrder: item.sortOrder,
        children: buildHierarchy(items, item.id), // Recursively build children
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      }));
  };

  // Build hierarchical structure starting with top-level items (parentId = null)
  const children = buildHierarchy(serviceWithItems.serviceItems, null);

  return {
    id: serviceWithItems.id,
    name: serviceWithItems.name,
    description: serviceWithItems.description || "",
    type: "service",
    basePrice: Number(serviceWithItems.basePrice || 0),
    isRequired: true,
    isRecurring: true,
    parentId: null,
    sortOrder: serviceWithItems.sortOrder,
    colorTheme: serviceWithItems.colorTheme,
    children,
    createdAt: serviceWithItems.createdAt.toISOString(),
    updatedAt: serviceWithItems.updatedAt.toISOString(),
  };
};

// Note: Sample data removed - now using PostgreSQL database

export async function GET() {
  try {
    // Get all services with their items in a single optimized query
    const servicesWithItems = await getAllServicesWithItems(true); // Include inactive for admin

    // Transform to PricingItem format (no additional queries needed!)
    const data = servicesWithItems.map((service) =>
      transformServiceToPricingItemUltraOptimized(service)
    );

    // Add cache headers for better performance
    const response = NextResponse.json({
      success: true,
      data: data,
    });

    // Cache for 30 seconds to reduce database load
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

    return response;
  } catch (error) {
    console.error("Error fetching admin pricing data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pricing data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { success: false, error: "Invalid data format" },
        { status: 400 }
      );
    }

    console.log("💾 Saving pricing data to database:", {
      itemCount: data.length,
    });

    // Import the necessary functions
    const {
      updateService,
      createServiceItem,
      updateServiceItem,
      deleteServiceItem,
    } = await import("@/lib/api/services-prisma");

    let updatedCount = 0;
    let createdCount = 0;
    let errors: string[] = [];

    // Helper function to clean up duplicates for a service
    const cleanupDuplicates = async (serviceId: string) => {
      const { getServiceItems } = await import("@/lib/api/services-prisma");
      const allItems = await getServiceItems(serviceId);

      // Group items by name, parentId, and level
      const itemGroups = new Map<string, any[]>();

      allItems.forEach((item) => {
        const key = `${item.name}-${item.parentId || "null"}-${item.level}`;
        if (!itemGroups.has(key)) {
          itemGroups.set(key, []);
        }
        itemGroups.get(key)!.push(item);
      });

      // Remove duplicates (keep the oldest one)
      for (const [, items] of itemGroups) {
        if (items.length > 1) {
          // Sort by creation date, keep the first (oldest)
          items.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          const toKeep = items[0];
          const toDelete = items.slice(1);

          console.log(
            `🧹 Cleaning up ${toDelete.length} duplicates of "${toKeep.name}"`
          );

          for (const duplicate of toDelete) {
            await deleteServiceItem(duplicate.id);
          }
        }
      }
    };

    // Helper function to recursively process service items (features and addons)
    const processServiceItems = async (
      items: any[],
      serviceId: string,
      parentId: string | null = null,
      level: number = 1
    ) => {
      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        try {
          console.log(
            `📝 Processing ${item.type}: ${item.name} (level ${level}, order ${index})`
          );

          const itemData = {
            serviceId: serviceId,
            name: item.name,
            description: item.description,
            isRequired: item.isRequired,
            sortOrder: index, // Use array index to preserve order
            level: level,
            parentId: parentId || undefined, // Convert null to undefined
            basePrice: item.basePrice,
          };

          let savedItem = null;

          // Check if this is a real database ID (UUIDs) or a temporary frontend ID
          const isRealId =
            item.id &&
            item.id.length > 20 &&
            !item.id.includes("temp_") &&
            !item.id.includes("new_");

          if (isRealId) {
            // Try to update existing item with real ID
            savedItem = await updateServiceItem(item.id, itemData);
            if (savedItem) {
              updatedCount++;
              console.log(
                `✅ Service item updated: ${item.name} (order: ${index})`
              );
            }
          }

          if (!savedItem) {
            // Either no real ID or update failed, check if item exists by name and parent
            const existingItems = await getServiceItems(serviceId);
            const existingItem = existingItems.find(
              (existing) =>
                existing.name === item.name &&
                existing.parentId === parentId &&
                existing.level === level
            );

            if (existingItem) {
              // Update existing item found by name/parent
              savedItem = await updateServiceItem(existingItem.id, itemData);
              if (savedItem) {
                updatedCount++;
                console.log(
                  `✅ Service item updated by name match: ${item.name} (order: ${index})`
                );
              }
            } else {
              // Create new item
              savedItem = await createServiceItem(itemData);
              if (savedItem) {
                createdCount++;
                console.log(
                  `✅ Service item created: ${item.name} (order: ${index})`
                );
              }
            }

            if (!savedItem) {
              errors.push(`Failed to create/update service item: ${item.name}`);
              continue;
            }
          }

          // Recursively process nested children (addons)
          if (item.children && item.children.length > 0) {
            console.log(
              `🔄 Processing ${item.children.length} nested items for ${item.name}`
            );
            await processServiceItems(
              item.children,
              serviceId,
              savedItem.id,
              level + 1
            );
          }
        } catch (itemError) {
          console.error(`Error processing item ${item.name}:`, itemError);
          errors.push(`Error processing ${item.name}: ${itemError}`);
        }
      }
    };

    // Process each pricing item (service)
    for (let serviceIndex = 0; serviceIndex < data.length; serviceIndex++) {
      const item = data[serviceIndex];
      try {
        if (item.type === "service") {
          console.log(
            `📝 Updating service: ${item.name} (${item.id}) - order: ${serviceIndex}`
          );

          // Clean up any existing duplicates first
          await cleanupDuplicates(item.id);

          // Update the service with preserved order
          const serviceData = {
            name: item.name,
            displayName: item.name,
            description: item.description,
            basePrice: item.basePrice,
            sortOrder: serviceIndex, // Use array index to preserve service order
            colorTheme: item.colorTheme || "teal",
          };

          const updatedService = await updateService(item.id, serviceData);
          if (updatedService) {
            updatedCount++;
            console.log(
              `✅ Service updated: ${item.name} (order: ${serviceIndex})`
            );
          } else {
            errors.push(`Failed to update service: ${item.name}`);
            continue;
          }

          // Process all children recursively (features and nested addons)
          if (item.children && item.children.length > 0) {
            console.log(
              `🔄 Processing ${item.children.length} items for service ${item.name}`
            );
            await processServiceItems(item.children, item.id, null, 1);
          }
        }
      } catch (itemError) {
        console.error(`Error processing service ${item.name}:`, itemError);
        errors.push(`Error processing service ${item.name}: ${itemError}`);
      }
    }

    const result = {
      success: errors.length === 0,
      message: `Database update complete. Updated: ${updatedCount}, Created: ${createdCount}`,
      details: {
        updated: updatedCount,
        created: createdCount,
        errors: errors.length,
        servicesProcessed: data.filter((item) => item.type === "service")
          .length,
      },
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log("💾 Save result:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing admin pricing data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process pricing data" },
      { status: 500 }
    );
  }
}
