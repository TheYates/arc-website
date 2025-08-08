import { NextRequest, NextResponse } from "next/server";
import {
  updateServiceItem,
  deleteServiceItem,
} from "@/lib/api/services-prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id: serviceId, itemId } = await params;
    const updates = await request.json();

    const updatedItem = await updateServiceItem(itemId, updates);

    if (!updatedItem) {
      return NextResponse.json(
        { error: "Item not found or no changes made" },
        { status: 404 }
      );
    }

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error("Update service item API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id: serviceId, itemId } = await params;
    const success = await deleteServiceItem(itemId);

    if (!success) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete service item API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
