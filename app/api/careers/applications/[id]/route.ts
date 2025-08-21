import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { authenticateRequest } from "@/lib/api/auth";

// GET /api/careers/applications/[id] - Get single career application (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;

    // Only admins can view applications
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only administrators can view career applications" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const application = await prisma.careerApplication.findUnique({
      where: { id },
      include: {
        jobPosition: {
          include: {
            category: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Get application API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/careers/applications/[id] - Update career application status (admin only)
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

    // Only admins can update applications
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only administrators can update career applications" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const {
      status,
      adminNotes,
      interviewDate,
      interviewType,
      interviewNotes,
    } = body;

    // Verify application exists
    const existingApplication = await prisma.careerApplication.findUnique({
      where: { id },
    });

    if (!existingApplication) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const application = await prisma.careerApplication.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(adminNotes !== undefined && { adminNotes }),
        ...(interviewDate !== undefined && { 
          interviewDate: interviewDate ? new Date(interviewDate) : null 
        }),
        ...(interviewType !== undefined && { interviewType }),
        ...(interviewNotes !== undefined && { interviewNotes }),
        reviewedAt: new Date(),
        reviewedById: user.id,
      },
      include: {
        jobPosition: {
          include: {
            category: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Update application API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
