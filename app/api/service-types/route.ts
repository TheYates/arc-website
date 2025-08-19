import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { authenticateRequest } from "@/lib/api/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");
    const popular = searchParams.get("popular");

    let whereClause: any = {};

    if (category) whereClause.category = category;
    if (isActive !== null) whereClause.isActive = isActive === "true";

    let orderBy: any = { usageCount: "desc" }; // Default to most used first
    if (popular === "true") {
      orderBy = { usageCount: "desc" };
    }

    const serviceTypes = await prisma.serviceType.findMany({
      where: whereClause,
      orderBy,
    });

    return NextResponse.json({ serviceTypes });
  } catch (error) {
    console.error("Error fetching service types:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;

    // Only admins can create service types
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only administrators can create service types" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, category, isActive = true } = body;

    // Check if service type already exists
    const existingType = await prisma.serviceType.findUnique({
      where: { name },
    });

    if (existingType) {
      return NextResponse.json(
        { error: "Service type with this name already exists" },
        { status: 400 }
      );
    }

    const serviceType = await prisma.serviceType.create({
      data: {
        name,
        description,
        category,
        isActive,
      },
    });

    return NextResponse.json({ serviceType }, { status: 201 });
  } catch (error) {
    console.error("Error creating service type:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
