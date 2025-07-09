import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/packages/[id]/services - Get package services configuration
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !hasPermission(session.user.role, "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const packageId = params.id;

    // Mock data - replace with actual database query
    const mockPackageServices: Record<string, any[]> = {
      "1": [
        {
          id: "ps1",
          packageId: "1",
          serviceId: "1",
          inclusionType: "standard",
          additionalPriceDaily: 0,
          additionalPriceMonthly: 0,
          additionalPriceHourly: 0,
          isActive: true,
          sortOrder: 1,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          service: {
            id: "1",
            name: "24/7 live-in nursing care",
            description: "Round-the-clock professional nursing care",
            category: "nursing",
            baseCost: 0,
            isActive: true,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
          },
        },
        {
          id: "ps2",
          packageId: "1",
          serviceId: "2",
          inclusionType: "standard",
          additionalPriceDaily: 0,
          additionalPriceMonthly: 0,
          additionalPriceHourly: 0,
          isActive: true,
          sortOrder: 2,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          service: {
            id: "2",
            name: "Emergency response & ambulance",
            description: "Emergency medical response and ambulance services",
            category: "emergency",
            baseCost: 50,
            isActive: true,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
          },
        },
        {
          id: "ps3",
          packageId: "1",
          serviceId: "3",
          inclusionType: "optional",
          additionalPriceDaily: 25,
          additionalPriceMonthly: 700,
          additionalPriceHourly: 5,
          isActive: true,
          sortOrder: 3,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          service: {
            id: "3",
            name: "Medication management",
            description:
              "Professional medication administration and monitoring",
            category: "nursing",
            baseCost: 25,
            isActive: true,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
          },
        },
      ],
    };

    const packageServices = mockPackageServices[packageId] || [];

    return NextResponse.json({ packageServices });
  } catch (error) {
    console.error("Error fetching package services:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/packages/[id]/services - Add service to package
export async function POST(
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
    const {
      serviceId,
      inclusionType = "optional",
      additionalPriceDaily = 0,
      additionalPriceMonthly = 0,
      additionalPriceHourly = 0,
      sortOrder = 0,
    } = body;

    // Validate required fields
    if (!serviceId) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      );
    }

    // Mock package service creation - replace with actual database insert
    const newPackageService = {
      id: `ps_${Date.now()}`,
      packageId,
      serviceId,
      inclusionType,
      additionalPriceDaily,
      additionalPriceMonthly,
      additionalPriceHourly,
      isActive: true,
      sortOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      { packageService: newPackageService },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding service to package:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
