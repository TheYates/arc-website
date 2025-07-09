import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/services - Get all services
export async function GET(request: NextRequest) {
  try {
    // Note: In a production app, you would validate the user session here
    // For this demo, we'll skip server-side auth validation

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");

    // Mock data - replace with actual database queries
    let services = [
      {
        id: "1",
        name: "24/7 live-in nursing care",
        description: "Round-the-clock professional nursing care",
        category: "nursing",
        baseCost: 0,
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        name: "Emergency response & ambulance",
        description: "Emergency medical response and ambulance services",
        category: "emergency",
        baseCost: 50,
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "3",
        name: "Medication management",
        description: "Professional medication administration and monitoring",
        category: "nursing",
        baseCost: 25,
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "4",
        name: "Wound care management",
        description: "Professional wound care and dressing changes",
        category: "nursing",
        baseCost: 30,
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "5",
        name: "Vital signs monitoring",
        description: "Regular monitoring of vital signs",
        category: "nursing",
        baseCost: 15,
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
    ];

    // Apply filters
    if (category && category !== "all") {
      services = services.filter((service) => service.category === category);
    }

    if (isActive !== null) {
      const activeFilter = isActive === "true";
      services = services.filter(
        (service) => service.isActive === activeFilter
      );
    }

    return NextResponse.json({ services });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/services - Create new service
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !hasPermission(session.user.role, "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, category, baseCost = 0 } = body;

    // Validate required fields
    if (!name || !description || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Mock service creation - replace with actual database insert
    const newService = {
      id: `svc_${Date.now()}`,
      name,
      description,
      category,
      baseCost,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ service: newService }, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
