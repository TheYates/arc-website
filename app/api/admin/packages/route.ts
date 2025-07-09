import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/packages - Get all packages
export async function GET(request: NextRequest) {
  try {
    // Note: In a production app, you would validate the user session here
    // For this demo, we'll skip server-side auth validation

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");

    // Mock data - replace with actual database queries
    let packages = [
      {
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
      {
        id: "2",
        name: "adamfo-pa",
        displayName: "ADAMFO PA",
        description:
          "Professional daily home visits with flexible scheduling and health monitoring.",
        category: "home_care",
        basePriceDaily: 80,
        basePriceMonthly: 2240,
        isActive: true,
        isPopular: false,
        sortOrder: 2,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "3",
        name: "fie-ne-fie",
        displayName: "FIE NE FIE",
        description:
          "Live-in nanny service with professional childcare and educational support.",
        category: "nanny",
        basePriceDaily: 120,
        basePriceMonthly: 3360,
        isActive: true,
        isPopular: true,
        sortOrder: 1,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
    ];

    // Apply filters
    if (category && category !== "all") {
      packages = packages.filter((pkg) => pkg.category === category);
    }

    if (isActive !== null) {
      const activeFilter = isActive === "true";
      packages = packages.filter((pkg) => pkg.isActive === activeFilter);
    }

    return NextResponse.json({ packages });
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/packages - Create new package
export async function POST(request: NextRequest) {
  try {
    // Note: In a production app, you would validate the user session here
    // For this demo, we'll skip server-side auth validation

    const body = await request.json();
    const {
      name,
      displayName,
      description,
      category,
      basePriceDaily,
      basePriceMonthly,
      basePriceHourly,
      isPopular = false,
    } = body;

    // Validate required fields
    if (!name || !displayName || !description || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Mock package creation - replace with actual database insert
    const newPackage = {
      id: `pkg_${Date.now()}`,
      name,
      displayName,
      description,
      category,
      basePriceDaily: basePriceDaily || null,
      basePriceMonthly: basePriceMonthly || null,
      basePriceHourly: basePriceHourly || null,
      isActive: true,
      isPopular,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ package: newPackage }, { status: 201 });
  } catch (error) {
    console.error("Error creating package:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
