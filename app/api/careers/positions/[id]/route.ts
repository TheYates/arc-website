import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { authenticateRequest } from "@/lib/api/auth";

// GET /api/careers/positions/[id] - Get single job position
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const position = await prisma.jobPosition.findUnique({
      where: { id },
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
    });

    if (!position) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ position });
  } catch (error) {
    console.error("Get position API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/careers/positions/[id] - Update job position (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;

    // Only admins can update positions
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only administrators can update job positions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const {
      title,
      categoryId,
      description,
      requirements,
      responsibilities,
      location,
      employmentType,
      status,
      isRemote,
      experienceLevel,
      applicationDeadline,
    } = body;

    // Verify position exists
    const existingPosition = await prisma.jobPosition.findUnique({
      where: { id },
    });

    if (!existingPosition) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 }
      );
    }

    // Verify category exists if provided
    if (categoryId) {
      const category = await prisma.jobCategory.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return NextResponse.json(
          { error: "Invalid category ID" },
          { status: 400 }
        );
      }
    }

    const position = await prisma.jobPosition.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(categoryId && { categoryId }),
        ...(description && { description }),
        ...(requirements && { requirements }),
        ...(responsibilities && { responsibilities }),
        ...(location !== undefined && { location }),
        ...(employmentType && { employmentType }),
        ...(status && { status }),
        ...(isRemote !== undefined && { isRemote }),
        ...(experienceLevel && { experienceLevel }),
        ...(applicationDeadline !== undefined && {
          applicationDeadline: applicationDeadline
            ? new Date(applicationDeadline)
            : null,
        }),
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

    return NextResponse.json({ position });
  } catch (error) {
    console.error("Update position API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/careers/positions/[id] - Delete job position (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;

    // Only admins can delete positions
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only administrators can delete job positions" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if position has applications
    const positionWithApps = await prisma.jobPosition.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!positionWithApps) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 }
      );
    }

    if (positionWithApps._count.applications > 0) {
      return NextResponse.json(
        { error: "Cannot delete position with existing applications" },
        { status: 400 }
      );
    }

    await prisma.jobPosition.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Position deleted successfully" });
  } catch (error) {
    console.error("Delete position API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
