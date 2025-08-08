import { NextRequest, NextResponse } from "next/server";
import { deleteServiceItem } from "@/lib/api/services-prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("🗑️ Deleting service item:", id);

    const success = await deleteServiceItem(id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete service item" },
        { status: 500 }
      );
    }

    console.log("✅ Service item deleted successfully:", id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete service item API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
