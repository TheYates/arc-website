import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/postgresql';

// Optimized endpoint for fast loading of admin services page with features and add-ons
export async function GET(request: NextRequest) {
  try {
    // Use a single optimized query including service items (features/add-ons)
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
        category: true,
        isActive: true,
        isPopular: true,
        comingSoon: true,
        sortOrder: true,
        colorTheme: true,
        createdAt: true,
        updatedAt: true,
        serviceItems: {
          select: {
            id: true,
            name: true,
            description: true,
            level: true,
            isRequired: true,
            parentId: true,
            sortOrder: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: [
            { level: 'asc' },
            { sortOrder: 'asc' },
            { name: 'asc' }
          ]
        }
      },
      where: { isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      // Limit to prevent large payloads
      take: 100
    });

    // Helper function to build hierarchical structure for service items
    const buildHierarchy = (items: any[], parentId: string | null = null): any[] => {
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
          parentId: item.parentId,
          sortOrder: item.sortOrder,
          children: buildHierarchy(items, item.id), // Recursively build children
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        }));
    };

    // Transform to the expected format with hierarchical service items
    const pricingItems = services.map(service => {
      // Build hierarchical structure starting with top-level items (parentId = null)
      const children = buildHierarchy(service.serviceItems, null);

      return {
        id: service.id,
        name: service.name || service.displayName,
        displayName: service.displayName,
        description: service.description,
        type: 'service' as const,
        isRequired: true,
        isRecurring: true,
        parentId: null,
        sortOrder: service.sortOrder || 0,
        colorTheme: service.colorTheme || 'teal',
        comingSoon: service.comingSoon || false,
        children,
        createdAt: service.createdAt.toISOString(),
        updatedAt: service.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: pricingItems,
      meta: {
        total: services.length,
        cached: false,
        loadTime: Date.now()
      }
    });

  } catch (error) {
    console.error('Fast pricing API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to load services',
      data: []
    }, { status: 500 });
  }
}

// Cache headers for better performance
export const dynamic = 'force-dynamic';
export const revalidate = 30; // Cache for 30 seconds
