import { NextRequest, NextResponse } from "next/server";
import { createServiceItem } from "@/lib/api/services-prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const { id: serviceId } = await params;
    const itemData = await request.json();

    if (!itemData.name) {
      return NextResponse.json(
        { error: "Item name is required" },
        { status: 400 }
      );
    }

    const item = createServiceItem({
      serviceId: serviceId, // Use service ID from URL params
      parentId: itemData.parentItemId || undefined,
      name: itemData.name,
      description: itemData.description || undefined,
      isRequired: !(itemData.isOptional || false), // Convert isOptional to isRequired
      level: itemData.itemLevel || 1,
      sortOrder: itemData.sortOrder || 0,
      // Pricing properties removed - not part of CreateServiceItemData interface
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
