import { NextResponse } from 'next/server'
import type { PricingItem } from '@/lib/types/packages'
import fs from 'fs'
import path from 'path'

// File path for storing pricing data
const PRICING_DATA_FILE = path.join(process.cwd(), 'data', 'pricing.json')

// Ensure data directory exists
const ensureDataDirectory = () => {
  const dataDir = path.dirname(PRICING_DATA_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Load pricing data from file or return default
const loadPricingData = (): PricingItem[] => {
  try {
    ensureDataDirectory()
    if (fs.existsSync(PRICING_DATA_FILE)) {
      const data = fs.readFileSync(PRICING_DATA_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading pricing data:', error)
  }

  // Return default data if file doesn't exist or error occurred
  return sampleAdminPricingData
}

// Save pricing data to file
const savePricingData = (data: PricingItem[]): void => {
  try {
    ensureDataDirectory()
    fs.writeFileSync(PRICING_DATA_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error saving pricing data:', error)
    throw error
  }
}

// Default admin pricing data
const sampleAdminPricingData: PricingItem[] = [
  {
    id: "service_1",
    name: "Home Care Service",
    description: "Comprehensive home care services",
    type: "service",
    basePrice: 150.00, // Services now require base price
    isRequired: true,
    isRecurring: true,
    parentId: null,
    sortOrder: 1,
    children: [
      {
        id: "feature_1",
        name: "Daily Check-ins",
        description: "Daily wellness checks",
        type: "feature",
        basePrice: 0,
        isRequired: true,
        isRecurring: true,
        parentId: "service_1",
        sortOrder: 1,
        children: [
          {
            id: "addon_1",
            name: "Vital signs monitoring",
            description: "Blood pressure, temperature, pulse monitoring",
            type: "addon",
            basePrice: 15.00,
            isRequired: false,
            isRecurring: true,
            parentId: "feature_1",
            sortOrder: 1,
            children: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "addon_2",
            name: "Medication reminders",
            description: "Automated medication reminder system",
            type: "addon",
            basePrice: 10.00,
            isRequired: false,
            isRecurring: true,
            parentId: "feature_1",
            sortOrder: 2,
            children: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "feature_2",
        name: "Emergency Response",
        description: "24/7 emergency support services",
        type: "feature",
        basePrice: 50.00,
        isRequired: false,
        isRecurring: true,
        parentId: "service_1",
        sortOrder: 2,
        children: [
          {
            id: "addon_3",
            name: "Medical alert device",
            description: "Wearable emergency alert device",
            type: "addon",
            basePrice: 20.00,
            isRequired: false,
            isRecurring: true,
            parentId: "feature_2",
            sortOrder: 1,
            children: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "feature_3",
        name: "Premium Care Package",
        description: "Full-service care package with enhanced features",
        type: "feature",
        basePrice: 200.00,
        isRequired: false,
        isRecurring: true,
        parentId: "service_1",
        sortOrder: 3,
        children: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
]

export async function GET() {
  try {
    const data = loadPricingData()
    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Error fetching admin pricing data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pricing data' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data } = body

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { success: false, error: 'Invalid data format' },
        { status: 400 }
      )
    }

    // Add timestamps to new items
    const processItems = (items: PricingItem[]): PricingItem[] => {
      return items.map(item => ({
        ...item,
        updatedAt: new Date().toISOString(),
        createdAt: item.createdAt || new Date().toISOString(),
        children: item.children ? processItems(item.children) : []
      }))
    }

    const processedData = processItems(data)
    savePricingData(processedData)

    return NextResponse.json({
      success: true,
      message: 'Pricing data saved successfully',
      data: processedData
    })
  } catch (error) {
    console.error('Error saving admin pricing data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save pricing data' },
      { status: 500 }
    )
  }
}
