import { NextResponse } from "next/server";
import type { PricingItem } from "@/lib/types/packages";
import {
  getAllServicesWithItems,
  getServiceItems,
} from "@/lib/api/services-prisma";

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
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=30, stale-while-revalidate=60"
    );

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

    // Start timing for performance monitoring
    const startTime = Date.now();

    // Batch operations for better performance
    const batchSize = 10;

    // Import the necessary functions and Prisma client for batch operations
    const {
      createService,
      updateService,
      createServiceItem,
      updateServiceItem,
      deleteServiceItem,
    } = await import("@/lib/api/services-prisma");

    const { prisma } = await import("@/lib/database/postgresql");

    let updatedCount = 0;
    let createdCount = 0;
    let errors: string[] = [];

    // Performance optimizations applied:
    // 1. Caching service items to avoid repeated database queries
    // 2. Reduced verbose logging
    // 3. Simplified error handling

    // Cache for service items to avoid repeated database queries
    const serviceItemsCache = new Map<string, any[]>();

    // Helper function to get cached service items
    const getCachedServiceItems = async (serviceId: string) => {
      if (!serviceItemsCache.has(serviceId)) {
        const { getServiceItems } = await import("@/lib/api/services-prisma");
        const items = await getServiceItems(serviceId);
        serviceItemsCache.set(serviceId, items);
      }
      return serviceItemsCache.get(serviceId)!;
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
          // Processing item...

          const itemData = {
            serviceId: serviceId,
            name: item.name,
            description: item.description,
            isRequired: item.isRequired,
            sortOrder: index, // Use array index to preserve order
            level: level,
            parentId: parentId || undefined, // Convert null to undefined
          };

          let savedItem = null;

          // Check if this is a real database ID (UUIDs) or a temporary frontend ID
          const isRealId =
            item.id &&
            item.id.length > 20 &&
            !item.id.includes("temp_") &&
            !item.id.includes("new_") &&
            !item.id.includes("_clone_"); // Don't try to update cloned items

          if (isRealId) {
            // Try to update existing item with real ID
            savedItem = await updateServiceItem(item.id, itemData);
            if (savedItem) {
              updatedCount++;
              // Reduced logging for performance
            }
          }

          if (!savedItem) {
            // Either no real ID or update failed, check if item exists by name and parent
            const existingItems = await getCachedServiceItems(serviceId);
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
                // Reduced logging for performance
              }
            } else {
              // Create new item
              savedItem = await createServiceItem(itemData);
              if (savedItem) {
                createdCount++;
                // Item created successfully
              }
            }

            if (!savedItem) {
              errors.push(`Failed to create/update service item: ${item.name}`);
              continue;
            }
          }

          // Recursively process nested children (addons)
          if (item.children && item.children.length > 0) {
            // Processing nested items...
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
          // Check if this is a cloned service (has _clone_ in ID)
          const isClonedService = item.id.includes("_clone_");

          if (isClonedService) {
            console.log(
              `📝 Creating new service: ${item.name} (cloned) - order: ${serviceIndex}`
            );

            // Create new service for cloned items
            const serviceData = {
              name: item.name,
              slug: item.name.toLowerCase().replace(/\s+/g, "-"),
              displayName: item.name,
              description: item.description || "",
              shortDescription: item.shortDescription || "",
              category: item.category || "CUSTOM", // Default to CUSTOM category
              sortOrder: serviceIndex,
              colorTheme: item.colorTheme || "teal",
              isActive: true,
              isPopular: false,
            };

            // Create service immediately but with optimized approach
            const newService = await createService(serviceData);
            if (newService) {
              // Update the item ID to the new service ID for processing children
              item.id = newService.id;
              createdCount++;
              console.log(`✅ Service created: ${item.name}`);
            } else {
              errors.push(`Failed to create service: ${item.name}`);
              continue;
            }
          } else {
            console.log(
              `📝 Updating service: ${item.name} (${item.id}) - order: ${serviceIndex}`
            );

            // Skip cleanup for performance - only clean if there are actual issues

            // Update service immediately but with optimized approach
            const serviceData = {
              name: item.name,
              displayName: item.name,
              description: item.description,
              sortOrder: serviceIndex,
              colorTheme: item.colorTheme || "teal",
            };

            const updatedService = await updateService(item.id, serviceData);
            if (updatedService) {
              updatedCount++;
              console.log(`✅ Service updated: ${item.name}`);
            } else {
              errors.push(`Failed to update service: ${item.name}`);
              continue;
            }
          }

          // Process all children recursively (features and nested addons)
          if (item.children && item.children.length > 0) {
            // Processing service items...
            await processServiceItems(item.children, item.id, null, 1);
          }
        }
      } catch (itemError) {
        console.error(`Error processing service ${item.name}:`, itemError);
        errors.push(`Error processing service ${item.name}: ${itemError}`);
      }
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    const result = {
      success: errors.length === 0,
      message: `Database update complete. Updated: ${updatedCount}, Created: ${createdCount}`,
      details: {
        updated: updatedCount,
        created: createdCount,
        errors: errors.length,
        servicesProcessed: data.filter((item) => item.type === "service")
          .length,
        duration: `${duration}ms`,
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
