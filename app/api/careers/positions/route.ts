import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { authenticateRequest } from "@/lib/api/auth";

// GET /api/careers/positions - Get all job positions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");

    let whereClause: any = {};
    if (categoryId) whereClause.categoryId = categoryId;
    if (status) whereClause.status = status;

    const positions = await prisma.jobPosition.findMany({
      where: whereClause,
      include: {
        category: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ positions });
  } catch (error) {
    console.error("Get positions API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/careers/positions - Create new job position (admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;

    // Only admins can create positions
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only administrators can create job positions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      categoryId,
      description,
      requirements,
      responsibilities,
      location,
      employmentType,
      isRemote,
      experienceLevel,
      applicationDeadline,
    } = body;

    if (!title || !categoryId || !description) {
      return NextResponse.json(
        { error: "Title, category, and description are required" },
        { status: 400 }
      );
    }

    // Verify category exists
    const category = await prisma.jobCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const position = await prisma.jobPosition.create({
      data: {
        title,
        categoryId,
        description,
        requirements: requirements || [],
        responsibilities: responsibilities || [],
        location,
        employmentType: employmentType || "FULL_TIME",
        isRemote: isRemote || false,
        experienceLevel: experienceLevel || "MID_LEVEL",
        applicationDeadline: applicationDeadline
          ? new Date(applicationDeadline)
          : null,
        createdById: user.id,
      },
      include: {
        category: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ position }, { status: 201 });
  } catch (error) {
    console.error("Create position API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
