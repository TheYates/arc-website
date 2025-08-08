#!/usr/bin/env node

/**
 * Script to update all service-specific API routes to use PostgreSQL
 */

const fs = require('fs');
const path = require('path');

const serviceRoutes = [
  'adamfo-pa',
  'yonko-pa', 
  'fie-ne-fie',
  'event-medical-coverage',
  'conference-option',
  'rally-pack'
];

const generateServiceRoute = (serviceSlug) => {
  const serviceName = serviceSlug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return `import { NextResponse } from "next/server";
import { getServiceBySlugWithDetails } from "@/lib/api/services-prisma";

// ${serviceName} service API - now uses PostgreSQL database

export async function GET() {
  try {
    // Get ${serviceName} service from database
    const service = await getServiceBySlugWithDetails('${serviceSlug}');

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error: "${serviceName} service not found",
        },
        { status: 404 }
      );
    }

    // Transform to service format
    const serviceData = {
      id: service.id,
      name: service.name,
      description: service.description || "",
      basePrice: Number(
        service.basePriceDaily ||
          service.basePriceMonthly ||
          service.basePriceHourly ||
          0
      ),
      items:
        service.serviceItems?.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description || "",
          level: item.level,
          isOptional: !item.isRequired,
          basePrice: Number(
            item.priceDaily || item.priceMonthly || item.priceHourly || 0
          ),
          children: [],
        })) || [],
    };

    return NextResponse.json({
      success: true,
      data: serviceData,
    });
  } catch (error) {
    console.error("Error fetching ${serviceName} service:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load ${serviceName} service data",
      },
      { status: 500 }
    );
  }
}
`;
};

console.log('🔄 Updating service-specific API routes...\n');

serviceRoutes.forEach(serviceSlug => {
  const routePath = path.join(process.cwd(), 'app', 'api', 'services', serviceSlug, 'route.ts');
  
  if (fs.existsSync(routePath)) {
    const newContent = generateServiceRoute(serviceSlug);
    fs.writeFileSync(routePath, newContent);
    console.log(`✅ Updated ${serviceSlug}/route.ts`);
  } else {
    console.log(`⚠️  Route not found: ${serviceSlug}/route.ts`);
  }
});

console.log('\n🎉 Service route updates completed!');
console.log('\n📋 Updated routes:');
serviceRoutes.forEach(slug => {
  console.log(`   - /api/services/${slug}`);
});

console.log('\n💡 All service routes now use PostgreSQL with Prisma!');
