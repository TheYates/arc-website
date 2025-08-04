import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { PricingItem } from "@/lib/types/packages";

// Types for customer-friendly service display
export interface CustomerService {
  id: string;
  name: string;
  slug: string;
  description?: string;
  basePrice?: number;
  plans: CustomerPlan[];
  category: string;
  isPopular: boolean;
  metadata: {
    totalPlans: number;
    totalFeatures: number;
    totalAddons: number;
    startingPrice: number;
  };
}

export interface CustomerPlan {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  isRequired: boolean;
  isRecurring: boolean;
  features: CustomerFeature[];
  sortOrder: number;
  pricing: {
    hourly?: number;
    daily?: number;
    monthly?: number;
  };
}

export interface CustomerFeature {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  isRequired: boolean;
  isRecurring: boolean;
  addons: CustomerAddon[];
  sortOrder: number;
}

export interface CustomerAddon {
  id: string;
  name: string;
  description?: string;
  price: number;
  isRequired: boolean;
  isRecurring: boolean;
  sortOrder: number;
}

// Load pricing data from admin
const loadPricingData = (): PricingItem[] => {
  const pricingFile = join(process.cwd(), "data", "pricing.json");

  if (!existsSync(pricingFile)) {
    return [];
  }

  try {
    const data = readFileSync(pricingFile, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading pricing data:", error);
    return [];
  }
};

// Convert slug to searchable format
const slugToName = (slug: string): string => {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Find service by slug
const findServiceBySlug = (
  items: PricingItem[],
  slug: string
): PricingItem | null => {
  const searchName = slugToName(slug);

  for (const item of items) {
    if (item.type === "service") {
      // Direct name match or slug-style match
      if (
        item.name.toLowerCase() === searchName.toLowerCase() ||
        item.name.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()
      ) {
        return item;
      }
    }
  }

  return null;
};

// Transform admin pricing to customer format
const transformToCustomerService = (
  adminService: PricingItem
): CustomerService => {
  const features: CustomerFeature[] = [];
  let totalFeatures = 0;
  let totalAddons = 0;
  const serviceBasePrice = adminService.basePrice || 0;

  // Process features directly under service
  if (adminService.children) {
    for (const featureItem of adminService.children) {
      if (featureItem.type === "feature") {
        const addons: CustomerAddon[] = [];

        // Process addons within this feature
        if (featureItem.children) {
          for (const addonItem of featureItem.children) {
            if (addonItem.type === "addon") {
              addons.push({
                id: addonItem.id,
                name: addonItem.name,
                description: addonItem.description,
                price: addonItem.basePrice || 0,
                isRequired: addonItem.isRequired,
                isRecurring: addonItem.isRecurring || true,
                sortOrder: addonItem.sortOrder,
              });
              totalAddons++;
            }
          }
        }

        features.push({
          id: featureItem.id,
          name: featureItem.name,
          description: featureItem.description,
          basePrice: featureItem.basePrice || 0,
          isRequired: featureItem.isRequired,
          isRecurring: featureItem.isRecurring || true,
          addons,
          sortOrder: featureItem.sortOrder,
        });
        totalFeatures++;
      }
    }
  }

  // Sort features by sort order
  features.sort((a, b) => a.sortOrder - b.sortOrder);

  // Create a single "plan" that represents the service for backward compatibility
  const servicePlan: CustomerPlan = {
    id: adminService.id + "_plan",
    name: adminService.name + " Service",
    description: adminService.description,
    basePrice: serviceBasePrice,
    isRequired: true,
    isRecurring: adminService.isRecurring || true,
    features,
    sortOrder: 1,
    pricing: {
      daily: serviceBasePrice,
      monthly: serviceBasePrice * 30,
      hourly: serviceBasePrice / 24,
    },
  };

  return {
    id: adminService.id,
    name: adminService.name,
    slug: adminService.name.toLowerCase().replace(/\s+/g, "-"),
    description: adminService.description,
    basePrice: serviceBasePrice,
    plans: [servicePlan], // Single plan representing the service
    category: "home_care", // Default category, could be inferred from service name
    isPopular: false, // Could be determined by admin flags
    metadata: {
      totalPlans: 1, // Always 1 since we create one plan per service
      totalFeatures,
      totalAddons,
      startingPrice: serviceBasePrice,
    },
  };
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceSlug: string }> }
) {
  try {
    const { serviceSlug } = await params;
    const pricingData = loadPricingData();

    if (!pricingData.length) {
      return NextResponse.json(
        { error: "No pricing data available" },
        { status: 404 }
      );
    }

    const adminService = findServiceBySlug(pricingData, serviceSlug);

    if (!adminService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const customerService = transformToCustomerService(adminService);

    return NextResponse.json({
      success: true,
      service: customerService,
    });
  } catch (error) {
    console.error("Get service pricing API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
