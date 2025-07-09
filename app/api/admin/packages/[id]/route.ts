import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/packages/[id] - Get specific package
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Note: In a production app, you would validate the user session here
    // For this demo, we'll skip server-side auth validation

    const packageId = params.id;

    // Mock data - replace with actual database query
    const mockPackages: Record<string, any> = {
      "1": {
        id: "1",
        name: "ahenefie",
        displayName: "AHENEFIE",
        description:
          "24/7 live-in home care with dedicated nursing support and emergency response.",
        category: "home_care",
        basePriceDaily: 150,
        basePriceMonthly: 4200,
        isActive: true,
        isPopular: true,
        sortOrder: 1,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
    };

    const package_ = mockPackages[packageId];

    if (!package_) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ package: package_ });
  } catch (error) {
    console.error("Error fetching package:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/packages/[id] - Update package
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !hasPermission(session.user.role, "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const packageId = params.id;
    const body = await request.json();

    // Mock update - replace with actual database update
    const updatedPackage = {
      id: packageId,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ package: updatedPackage });
  } catch (error) {
    console.error("Error updating package:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/packages/[id] - Delete package
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !hasPermission(session.user.role, "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const packageId = params.id;

    // Mock deletion - replace with actual database deletion
    // In practice, you might want to soft delete by setting isActive: false

    return NextResponse.json({ message: "Package deleted successfully" });
  } catch (error) {
    console.error("Error deleting package:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
