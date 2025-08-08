// Utility functions for building hierarchical service structures

export interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  level: number;
  isOptional?: boolean;
  basePrice?: number;
  children?: ServiceItem[];
  parentId?: string | null;
  sortOrder?: number;
  isRequired?: boolean;
}

/**
 * Builds a hierarchical structure from flat service items
 * @param items - Flat array of service items
 * @param parentId - Parent ID to filter by (null for top-level items)
 * @returns Hierarchical array of service items
 */
export const buildServiceHierarchy = (
  items: any[],
  parentId: string | null = null
): ServiceItem[] => {
  return items
    .filter((item) => item.parentId === parentId)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description || "",
      level: item.level,
      isOptional: !item.isRequired,
      basePrice: Number(
        item.priceDaily || item.priceMonthly || item.priceHourly || 0
      ),
      children: buildServiceHierarchy(items, item.id), // Recursively build children
    }));
};

/**
 * Transforms a service with flat items to a service with hierarchical items
 * @param service - Service object with flat serviceItems array
 * @returns Service object with hierarchical items structure
 */
export const transformServiceToHierarchical = (service: any) => {
  return {
    id: service.id,
    name: service.name,
    description: service.description || "",
    basePrice: Number(
      service.basePriceDaily ||
        service.basePriceMonthly ||
        service.basePriceHourly ||
        0
    ),
    items: service.serviceItems
      ? buildServiceHierarchy(service.serviceItems, null)
      : [],
  };
};
