import { NextRequest, NextResponse } from "next/server";
import { createServiceItem } from "@/lib/api/services-sqlite";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const { id: serviceId, categoryId } = await params;
    const itemData = await request.json();

    if (!itemData.name) {
      return NextResponse.json(
        { error: "Item name is required" },
        { status: 400 }
      );
    }

    const item = createServiceItem({
      categoryId,
      parentItemId: itemData.parentItemId || undefined,
      name: itemData.name,
      description: itemData.description || undefined,
      isOptional: itemData.isOptional || false,
      itemLevel: itemData.itemLevel || 1,
      sortOrder: itemData.sortOrder || 0,
      priceHourly: itemData.priceHourly || 0,
      priceDaily: itemData.priceDaily || 0,
      priceMonthly: itemData.priceMonthly || 0,
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Create service item API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
