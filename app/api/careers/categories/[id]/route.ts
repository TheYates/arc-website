import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { authenticateRequest } from "@/lib/api/auth";

// DELETE /api/careers/categories/[id] - Delete job category (admin only)
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

    // Only admins can delete categories
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only administrators can delete job categories" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if category has job positions
    const categoryWithJobs = await prisma.jobCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            jobPositions: true,
          },
        },
      },
    });

    if (!categoryWithJobs) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (categoryWithJobs._count.jobPositions > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with existing job positions" },
        { status: 400 }
      );
    }

    await prisma.jobCategory.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
