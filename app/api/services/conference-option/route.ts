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
    
    // Find Conference Option service (prioritize exact match)
    let conferenceService = pricingData.find(item => 
      item.type === 'service' && 
      (item.name.toUpperCase().includes('CONFERENCE') && 
       item.name.toUpperCase().includes('OPTION')) ||
      (item.name.toUpperCase().includes('CONFERENCE'))
    );
    
    // If not found, try broader patterns
    if (!conferenceService) {
      conferenceService = pricingData.find(item => 
        item.type === 'service' && 
        (item.name.toUpperCase().includes('CONFERENCE') ||
         item.name.toUpperCase().includes('BUSINESS') ||
         item.name.toUpperCase().includes('MEETING') ||
         item.name.toUpperCase().includes('CORPORATE'))
      );
    }
    
    if (!conferenceService) {
      return NextResponse.json({
        success: false,
        error: 'Conference Option service not found in pricing data'
      }, { status: 404 });
    }
    
    // Transform to service format
    const serviceData = transformToServiceFormat(conferenceService);
    
    return NextResponse.json({
      success: true,
      data: serviceData
    });
    
  } catch (error) {
    console.error('Error fetching Conference Option service data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to load Conference Option service data'
    }, { status: 500 });
  }
}
