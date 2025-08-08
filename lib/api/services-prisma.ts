import { prisma } from "@/lib/database/postgresql";
import { Service, ServiceItem, ServiceCategory } from "@prisma/client";

export interface CreateServiceData {
  name: string;
  slug: string;
  displayName: string;
  description?: string;
  shortDescription?: string;
  category: ServiceCategory;
  basePrice?: number;
  priceDisplay?: string;
  isActive?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
  colorTheme?: string;
  icon?: string;
}

export interface CreateServiceItemData {
  serviceId: string;
  name: string;
  description?: string;
  isRequired?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
  level?: number;
  parentId?: string;
  basePrice?: number;
  priceDisplay?: string;
}

export interface ServiceWithItems extends Service {
  serviceItems: ServiceItem[];
}

// Get all services
export async function getAllServices(
  includeInactive = false
): Promise<Service[]> {
  try {
    return await prisma.service.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: [
        { createdAt: "asc" }, // Order by creation date first (oldest to newest)
        { sortOrder: "asc" },
        { name: "asc" },
      ],
    });
  } catch (error) {
    console.error("Get all services error:", error);
    return [];
  }
}

// Get service by ID
export async function getServiceById(id: string): Promise<Service | null> {
  try {
    return await prisma.service.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Get service by ID error:", error);
    return null;
  }
}

// Get service by slug
export async function getServiceBySlug(slug: string): Promise<Service | null> {
  try {
    return await prisma.service.findUnique({
      where: { slug },
    });
  } catch (error) {
    console.error("Get service by slug error:", error);
    return null;
  }
}

// Get service with details (including items)
export async function getServiceWithDetails(
  id: string
): Promise<ServiceWithItems | null> {
  try {
    return await prisma.service.findUnique({
      where: { id },
      include: {
        serviceItems: {
          orderBy: [{ level: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
        },
      },
    });
  } catch (error) {
    console.error("Get service with details error:", error);
    return null;
  }
}

// Get service by slug with details
export async function getServiceBySlugWithDetails(
  slug: string
): Promise<ServiceWithItems | null> {
  try {
    return await prisma.service.findUnique({
      where: { slug },
      include: {
        serviceItems: {
          orderBy: [{ level: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
        },
      },
    });
  } catch (error) {
    console.error("Get service by slug with details error:", error);
    return null;
  }
}

// Create service
export async function createService(
  data: CreateServiceData
): Promise<Service | null> {
  try {
    return await prisma.service.create({
      data: {
        name: data.name,
        slug: data.slug,
        displayName: data.displayName,
        description: data.description,
        shortDescription: data.shortDescription,
        category: data.category,
        basePrice: data.basePrice,
        priceDisplay: data.priceDisplay,
        isActive: data.isActive ?? true,
        isPopular: data.isPopular ?? false,
        sortOrder: data.sortOrder ?? 0,
        colorTheme: data.colorTheme ?? "teal",
        icon: data.icon,
      },
    });
  } catch (error) {
    console.error("Create service error:", error);
    return null;
  }
}

// Update service
export async function updateService(
  id: string,
  data: Partial<CreateServiceData>
): Promise<Service | null> {
  try {
    return await prisma.service.update({
      where: { id },
      data,
    });
  } catch (error) {
    console.error("Update service error:", error);
    return null;
  }
}

// Delete service
export async function deleteService(id: string): Promise<boolean> {
  try {
    await prisma.service.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error("Delete service error:", error);
    return false;
  }
}

// Service Items functions

// Get service items by service ID
export async function getServiceItems(
  serviceId: string
): Promise<ServiceItem[]> {
  try {
    return await prisma.serviceItem.findMany({
      where: { serviceId },
      orderBy: [{ level: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    });
  } catch (error) {
    console.error("Get service items error:", error);
    return [];
  }
}

// Create service item
export async function createServiceItem(
  data: CreateServiceItemData
): Promise<ServiceItem | null> {
  try {
    return await prisma.serviceItem.create({
      data: {
        serviceId: data.serviceId,
        name: data.name,
        description: data.description,
        isRequired: data.isRequired ?? false,
        isPopular: data.isPopular ?? false,
        sortOrder: data.sortOrder ?? 0,
        level: data.level ?? 1,
        parentId: data.parentId,
        basePrice: data.basePrice,
        priceDisplay: data.priceDisplay,
      },
    });
  } catch (error) {
    console.error("Create service item error:", error);
    return null;
  }
}

// Update service item
export async function updateServiceItem(
  id: string,
  data: Partial<CreateServiceItemData>
): Promise<ServiceItem | null> {
  try {
    return await prisma.serviceItem.update({
      where: { id },
      data,
    });
  } catch (error) {
    console.error("Update service item error:", error);
    return null;
  }
}

// Delete service item
export async function deleteServiceItem(id: string): Promise<boolean> {
  try {
    await prisma.serviceItem.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error("Delete service item error:", error);
    return false;
  }
}

// Search services
export async function searchServices(query: string): Promise<Service[]> {
  try {
    return await prisma.service.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                displayName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
        ],
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  } catch (error) {
    console.error("Search services error:", error);
    return [];
  }
}
