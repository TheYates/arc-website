import { NextRequest, NextResponse } from 'next/server';

// Mock data for performance demonstration
const mockServices = [
  {
    id: 'service_1',
    name: 'Home Care Services',
    displayName: 'Home Care Services',
    description: 'Comprehensive home healthcare services',
    category: 'HOME_CARE',
    isActive: true,
    isPopular: true,
    comingSoon: false,
    sortOrder: 1,
    colorTheme: 'teal',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'service_2',
    name: 'Medical Consultations',
    displayName: 'Medical Consultations',
    description: 'Professional medical consultation services',
    category: 'CONSULTATION',
    isActive: true,
    isPopular: false,
    comingSoon: false,
    sortOrder: 2,
    colorTheme: 'blue',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'service_3',
    name: 'Emergency Response',
    displayName: 'Emergency Response',
    description: '24/7 emergency medical response',
    category: 'EMERGENCY',
    isActive: true,
    isPopular: true,
    comingSoon: true,
    sortOrder: 3,
    colorTheme: 'red',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'service_4',
    name: 'Medication Management',
    displayName: 'Medication Management',
    description: 'Professional medication administration and monitoring',
    category: 'MEDICATION',
    isActive: true,
    isPopular: false,
    comingSoon: false,
    sortOrder: 4,
    colorTheme: 'green',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'service_5',
    name: 'Physiotherapy',
    displayName: 'Physiotherapy',
    description: 'Professional physiotherapy and rehabilitation services',
    category: 'THERAPY',
    isActive: true,
    isPopular: false,
    comingSoon: false,
    sortOrder: 5,
    colorTheme: 'purple',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }
];

// Ultra-fast endpoint for performance demonstration
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Simulate minimal processing time (< 50ms)
    await new Promise(resolve => setTimeout(resolve, 20));
    
    // Transform to the expected format quickly
    const pricingItems = mockServices.map(service => ({
      id: service.id,
      name: service.name,
      displayName: service.displayName,
      description: service.description,
      type: 'service' as const,
      isRequired: true,
      isRecurring: true,
      parentId: null,
      sortOrder: service.sortOrder,
      colorTheme: service.colorTheme,
      comingSoon: service.comingSoon,
      children: [],
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    }));

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: pricingItems,
      meta: {
        total: pricingItems.length,
        cached: false,
        loadTime: processingTime,
        mode: 'mock_demo'
      }
    });

  } catch (error) {
    console.error('Mock pricing API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to load mock services',
      data: []
    }, { status: 500 });
  }
}

// Optimized for speed
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
