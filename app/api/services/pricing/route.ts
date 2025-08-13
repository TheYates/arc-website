import { NextResponse } from "next/server";
import type { PricingItem } from "@/lib/types/packages";
import { getAllServicesWithItems } from "@/lib/api/services-prisma";

// Transform admin pricing data to public service format
interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  children?: ServiceItem[];
  level: number;
  isOptional?: boolean;
}

interface PublicService {
  id: string;
  name: string;
  description?: string;
  items: ServiceItem[];
}

const transformPricingItemToServiceItem = (
  item: PricingItem,
  level: number = 1
): ServiceItem => {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    level,
    isOptional: !item.isRequired,
    children: item.children
      ? item.children.map((child) =>
          transformPricingItemToServiceItem(child, level + 1)
        )
      : [],
  };
};

const transformToPublicServices = (
  servicesWithItems: any[]
): PublicService[] => {
  return servicesWithItems.map((service) => {
    // Helper function to build hierarchical structure
    const buildHierarchy = (
      items: any[],
      parentId: string | null = null
    ): ServiceItem[] => {
      return items
        .filter((item) => item.parentId === parentId)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description || undefined,
          level: item.level,
          isOptional: !item.isRequired,
          children: buildHierarchy(items, item.id), // Recursively build children
        }));
    };

    // Build hierarchical structure starting with top-level items (parentId = null)
    const items = buildHierarchy(service.serviceItems, null);

    return {
      id: service.id,
      name: service.name,
      description: service.description || undefined,
      items,
    };
  });
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("id");
    const serviceName = searchParams.get("name");

    // Get active services with items in a single optimized query
    const allServicesWithItems = await getAllServicesWithItems(false); // Only active services for public
    const publicServices = transformToPublicServices(allServicesWithItems);

    // If specific service requested
    if (serviceId || serviceName) {
      const service = publicServices.find(
        (s) =>
          s.id === serviceId ||
          s.name.toLowerCase() === serviceName?.toLowerCase() ||
          s.name.toLowerCase().includes(serviceName?.toLowerCase() || "")
      );

      if (!service) {
        return NextResponse.json(
          { success: false, error: "Service not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: service,
      });
    }

    // Return all services with cache headers
    const response = NextResponse.json({
      success: true,
      data: publicServices,
    });

    // Cache for 5 minutes for public API
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    return response;
  } catch (error) {
    console.error("Error fetching service data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch service data" },
      { status: 500 }
    );
  }
}
