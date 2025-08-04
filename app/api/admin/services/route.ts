import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/database/sqlite";

export async function GET() {
  try {
    const db = getDatabase();
    
    // Fetch all services with their color themes
    const services = db.prepare(`
      SELECT 
        id,
        name,
        slug,
        display_name as displayName,
        description,
        short_description as shortDescription,
        category,
        base_price_daily as basePriceDaily,
        base_price_monthly as basePriceMonthly,
        base_price_hourly as basePriceHourly,
        price_display as priceDisplay,
        is_active as isActive,
        is_popular as isPopular,
        sort_order as sortOrder,
        color_theme as colorTheme,
        icon,
        created_at as createdAt,
        updated_at as updatedAt
      FROM services 
      WHERE is_active = 1
      ORDER BY sort_order ASC, name ASC
    `).all();

    // Transform to PricingItem format for the admin interface
    const pricingItems = services.map((service: any) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      type: "service",
      basePrice: service.basePriceDaily || service.basePriceMonthly || service.basePriceHourly || 0,
      isRequired: true,
      isRecurring: true,
      parentId: null,
      sortOrder: service.sortOrder,
      colorTheme: service.colorTheme,
      children: [], // Will be populated with features/categories later
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: pricingItems
    });

  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch services'
    }, { status: 500 });
  }
}
