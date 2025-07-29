// Package API utilities for fetching admin-configured package data

import {
  ServicePackage,
  Service,
  PackageService,
  PackageDisplayConfig,
} from "@/lib/types/packages";

// Mock API functions - replace with actual API calls
export async function getActivePackages(): Promise<ServicePackage[]> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 150));

  // Mock data - replace with actual API endpoint
  return [
    {
      id: "1",
      name: "ahenefie",
      displayName: "AHENEFIE",
      description:
        "24/7 live-in home care with dedicated nursing support and emergency response.",
      category: "home_care",
      basePriceDaily: 150,
      basePriceMonthly: 4200,
      isActive: true,
      isPopular: true,
      sortOrder: 1,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      name: "adamfo-pa",
      displayName: "ADAMFO PA",
      description:
        "Professional daily home visits with flexible scheduling and health monitoring.",
      category: "home_care",
      basePriceDaily: 80,
      basePriceMonthly: 2240,
      isActive: true,
      isPopular: false,
      sortOrder: 2,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "3",
      name: "fie-ne-fie",
      displayName: "FIE NE FIE",
      description:
        "Live-in nanny service with professional childcare and educational support.",
      category: "nanny",
      basePriceDaily: 120,
      basePriceMonthly: 3360,
      isActive: true,
      isPopular: true,
      sortOrder: 1,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "4",
      name: "yonko-pa",
      displayName: "YONKO PA",
      description: "Visit-on-request nanny service with flexible scheduling.",
      category: "nanny",
      basePriceHourly: 50,
      isActive: true,
      isPopular: false,
      sortOrder: 2,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  ];
}

export async function getPackageServices(
  packageId: string
): Promise<PackageService[]> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Mock data - replace with actual API endpoint
  const mockPackageServices: Record<string, PackageService[]> = {
    "1": [
      // AHENEFIE
      {
        id: "ps1",
        packageId: "1",
        serviceId: "1",
        inclusionType: "standard",
        additionalPriceDaily: 0,
        additionalPriceMonthly: 0,
        additionalPriceHourly: 0,
        isActive: true,
        sortOrder: 1,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        service: {
          id: "1",
          name: "24/7 live-in nursing care",
          description: "Round-the-clock professional nursing care",
          category: "nursing",
          baseCost: 0,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      },
      {
        id: "ps2",
        packageId: "1",
        serviceId: "2",
        inclusionType: "standard",
        additionalPriceDaily: 0,
        additionalPriceMonthly: 0,
        additionalPriceHourly: 0,
        isActive: true,
        sortOrder: 2,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        service: {
          id: "2",
          name: "Emergency response & ambulance",
          description: "Emergency medical response and ambulance services",
          category: "emergency",
          baseCost: 50,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      },
      {
        id: "ps3",
        packageId: "1",
        serviceId: "3",
        inclusionType: "optional",
        additionalPriceDaily: 25,
        additionalPriceMonthly: 700,
        additionalPriceHourly: 5,
        isActive: true,
        sortOrder: 3,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        service: {
          id: "3",
          name: "Medication management",
          description: "Professional medication administration and monitoring",
          category: "nursing",
          baseCost: 25,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      },
      {
        id: "ps4",
        packageId: "1",
        serviceId: "5",
        inclusionType: "standard",
        additionalPriceDaily: 0,
        additionalPriceMonthly: 0,
        additionalPriceHourly: 0,
        isActive: true,
        sortOrder: 4,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        service: {
          id: "5",
          name: "Vital signs monitoring",
          description: "Regular monitoring of vital signs",
          category: "nursing",
          baseCost: 15,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      },
      {
        id: "ps5",
        packageId: "1",
        serviceId: "4",
        inclusionType: "optional",
        additionalPriceDaily: 30,
        additionalPriceMonthly: 840,
        additionalPriceHourly: 6,
        isActive: true,
        sortOrder: 5,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        service: {
          id: "4",
          name: "Wound care management",
          description: "Professional wound care and dressing changes",
          category: "nursing",
          baseCost: 30,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      },
    ],
    "2": [
      // ADAMFO PA
      {
        id: "ps6",
        packageId: "2",
        serviceId: "6",
        inclusionType: "standard",
        additionalPriceDaily: 0,
        additionalPriceMonthly: 0,
        additionalPriceHourly: 0,
        isActive: true,
        sortOrder: 1,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        service: {
          id: "6",
          name: "Daily professional visits",
          description: "Regular professional home visits",
          category: "nursing",
          baseCost: 0,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      },
      {
        id: "ps7",
        packageId: "2",
        serviceId: "7",
        inclusionType: "standard",
        additionalPriceDaily: 0,
        additionalPriceMonthly: 0,
        additionalPriceHourly: 0,
        isActive: true,
        sortOrder: 2,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        service: {
          id: "7",
          name: "Health monitoring & reports",
          description: "Comprehensive health monitoring and reporting",
          category: "monitoring",
          baseCost: 0,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      },
      {
        id: "ps8",
        packageId: "2",
        serviceId: "3",
        inclusionType: "optional",
        additionalPriceDaily: 25,
        additionalPriceMonthly: 700,
        additionalPriceHourly: 5,
        isActive: true,
        sortOrder: 3,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        service: {
          id: "3",
          name: "Medication management",
          description: "Professional medication administration and monitoring",
          category: "nursing",
          baseCost: 25,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      },
    ],
  };

  return mockPackageServices[packageId] || [];
}

export async function getPackageDisplayConfigs(): Promise<
  PackageDisplayConfig[]
> {
  const packages = await getActivePackages();
  const displayConfigs: PackageDisplayConfig[] = [];

  for (const pkg of packages) {
    const packageServices = await getPackageServices(pkg.id);

    const standardServices = packageServices
      .filter((ps) => ps.inclusionType === "standard" && ps.service)
      .map((ps) => ps.service!.name);

    const optionalServices = packageServices
      .filter((ps) => ps.inclusionType === "optional" && ps.service)
      .map((ps) => ({
        name: ps.service!.name,
        price: {
          daily: ps.additionalPriceDaily
            ? `GHS ${ps.additionalPriceDaily}`
            : undefined,
          monthly: ps.additionalPriceMonthly
            ? `GHS ${ps.additionalPriceMonthly}`
            : undefined,
          hourly: ps.additionalPriceHourly
            ? `GHS ${ps.additionalPriceHourly}`
            : undefined,
        },
      }));

    const displayConfig: PackageDisplayConfig = {
      id: pkg.id,
      name: pkg.name,
      displayName: pkg.displayName,
      description: pkg.description,
      price: {
        daily: pkg.basePriceDaily ? `GHS ${pkg.basePriceDaily}` : undefined,
        monthly: pkg.basePriceMonthly
          ? `GHS ${pkg.basePriceMonthly}`
          : undefined,
        hourly: pkg.basePriceHourly ? `GHS ${pkg.basePriceHourly}` : undefined,
      },
      features: standardServices,
      standardServices,
      optionalServices,
      mostPopular: pkg.isPopular,
      category: pkg.category,
      href: "/get-started",
    };

    displayConfigs.push(displayConfig);
  }

  // Sort by category and sort order
  return displayConfigs.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return 0; // Maintain original order within category
  });
}
