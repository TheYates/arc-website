import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { PricingItem } from '@/lib/types/packages';

// File path for pricing data
const PRICING_DATA_FILE = path.join(process.cwd(), 'data', 'pricing.json');

// Load pricing data from file
const loadPricingData = (): PricingItem[] => {
  try {
    if (fs.existsSync(PRICING_DATA_FILE)) {
      const data = fs.readFileSync(PRICING_DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading pricing data:', error);
  }
  return [];
};

// Transform PricingItem to service format
const transformToServiceFormat = (service: PricingItem) => {
  return {
    id: service.id,
    name: service.name,
    description: service.description || '',
    basePrice: service.basePrice || 0,
    items: service.children?.map(transformPricingItemToServiceItem) || []
  };
};

// Transform PricingItem to ServiceItem format
const transformPricingItemToServiceItem = (item: PricingItem, level: number = 1): any => {
  return {
    id: item.id,
    name: item.name,
    description: item.description || '',
    level: level,
    isOptional: !item.isRequired,
    basePrice: item.basePrice,
    children: item.children?.map(child => transformPricingItemToServiceItem(child, level + 1)) || []
  };
};

export async function GET() {
  try {
    // Load all pricing data
    const pricingData = loadPricingData();

    // Find ADAMFO-PA service (look for service with name containing "ADAMFO" or "PA")
    const adamfoPaService = pricingData.find(item =>
      item.type === 'service' &&
      (item.name.toUpperCase().includes('ADAMFO') ||
       item.name.toUpperCase().includes('PA') ||
       item.id.toLowerCase().includes('adamfo'))
    );

    if (!adamfoPaService) {
      return NextResponse.json({
        success: false,
        error: 'ADAMFO-PA service not found in pricing data'
      }, { status: 404 });
    }

    // Transform to service format
    const serviceData = transformToServiceFormat(adamfoPaService);

    return NextResponse.json({
      success: true,
      data: serviceData
    });

  } catch (error) {
    console.error('Error fetching ADAMFO-PA service data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to load ADAMFO-PA service data'
    }, { status: 500 });
  }
}
