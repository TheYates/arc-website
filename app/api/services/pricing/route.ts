import { NextResponse } from 'next/server'
import type { PricingItem } from '@/lib/types/packages'
import fs from 'fs'
import path from 'path'

// File path for storing pricing data
const PRICING_DATA_FILE = path.join(process.cwd(), 'data', 'pricing.json')

// Load pricing data from file
const loadPricingData = (): PricingItem[] => {
  try {
    if (fs.existsSync(PRICING_DATA_FILE)) {
      const data = fs.readFileSync(PRICING_DATA_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading pricing data:', error)
  }

  // Return empty array if no data found
  return []
}

// Transform admin pricing data to public service format
interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  children?: ServiceItem[];
  level: number;
  isOptional?: boolean;
  basePrice?: number;
}

interface PublicService {
  id: string;
  name: string;
  description?: string;
  items: ServiceItem[];
}

const transformPricingItemToServiceItem = (item: PricingItem, level: number = 1): ServiceItem => {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    level,
    isOptional: !item.isRequired,
    basePrice: item.basePrice,
    children: item.children ? item.children.map(child => transformPricingItemToServiceItem(child, level + 1)) : []
  }
}

const transformToPublicServices = (pricingData: PricingItem[]): PublicService[] => {
  return pricingData
    .filter(item => item.type === 'service')
    .map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      items: service.children ? service.children.map(child => transformPricingItemToServiceItem(child)) : []
    }))
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('id')
    const serviceName = searchParams.get('name')

    const pricingData = loadPricingData()
    const publicServices = transformToPublicServices(pricingData)

    // If specific service requested
    if (serviceId || serviceName) {
      const service = publicServices.find(s => 
        s.id === serviceId || 
        s.name.toLowerCase() === serviceName?.toLowerCase() ||
        s.name.toLowerCase().includes(serviceName?.toLowerCase() || '')
      )

      if (!service) {
        return NextResponse.json(
          { success: false, error: 'Service not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: service
      })
    }

    // Return all services
    return NextResponse.json({
      success: true,
      data: publicServices
    })
  } catch (error) {
    console.error('Error fetching service data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service data' },
      { status: 500 }
    )
  }
}
