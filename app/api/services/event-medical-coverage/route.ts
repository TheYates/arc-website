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
    
    // Find Event Medical Coverage service (prioritize exact match)
    let eventMedicalService = pricingData.find(item => 
      item.type === 'service' && 
      (item.name.toUpperCase().includes('EVENT') && 
       item.name.toUpperCase().includes('MEDICAL')) ||
      (item.name.toUpperCase().includes('EVENT') && 
       item.name.toUpperCase().includes('COVERAGE'))
    );
    
    // If not found, try broader patterns
    if (!eventMedicalService) {
      eventMedicalService = pricingData.find(item => 
        item.type === 'service' && 
        (item.name.toUpperCase().includes('EVENT') ||
         item.name.toUpperCase().includes('MEDICAL') ||
         item.name.toUpperCase().includes('COVERAGE') ||
         item.name.toUpperCase().includes('EMERGENCY'))
      );
    }
    
    if (!eventMedicalService) {
      return NextResponse.json({
        success: false,
        error: 'Event Medical Coverage service not found in pricing data'
      }, { status: 404 });
    }
    
    // Transform to service format
    const serviceData = transformToServiceFormat(eventMedicalService);
    
    return NextResponse.json({
      success: true,
      data: serviceData
    });
    
  } catch (error) {
    console.error('Error fetching Event Medical Coverage service data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to load Event Medical Coverage service data'
    }, { status: 500 });
  }
}
