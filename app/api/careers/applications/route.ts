import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { authenticateRequest } from "@/lib/api/auth";

// GET /api/careers/applications - Get all career applications (admin only)
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const jobPositionId = searchParams.get("jobPositionId");
    const status = searchParams.get("status");

    let whereClause: any = {};
    if (jobPositionId) whereClause.jobPositionId = jobPositionId;
    if (status) whereClause.status = status;

    const applications = await prisma.careerApplication.findMany({
      where: whereClause,
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
      orderBy: {
        appliedAt: "desc",
      },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Get applications API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/careers/applications - Create new career application (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      jobPositionId,
      firstName,
      lastName,
      email,
      phone,
      address,
      dateOfBirth,
      nationality,
      education,
      workExperience,
      skills,
      certifications,
      languages,
      coverLetter,
      resumeUrl,
      portfolioUrl,
      linkedinUrl,
      references,
      availableStartDate,
    } = body;

    if (!jobPositionId || !firstName || !lastName || !email) {
      return NextResponse.json(
        {
          error: "Job position, first name, last name, and email are required",
        },
        { status: 400 }
      );
    }

    // Verify job position exists and is active
    const jobPosition = await prisma.jobPosition.findUnique({
      where: { id: jobPositionId },
    });

    if (!jobPosition || jobPosition.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Job position not found or not accepting applications" },
        { status: 400 }
      );
    }

    // Check if application deadline has passed
    if (
      jobPosition.applicationDeadline &&
      new Date() > jobPosition.applicationDeadline
    ) {
      return NextResponse.json(
        { error: "Application deadline has passed" },
        { status: 400 }
      );
    }

    // Check for duplicate application
    const existingApplication = await prisma.careerApplication.findFirst({
      where: {
        jobPositionId,
        email,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied for this position" },
        { status: 409 }
      );
    }

    const application = await prisma.careerApplication.create({
      data: {
        jobPositionId,
        firstName,
        lastName,
        email,
        phone,
        address,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        nationality,
        education,
        workExperience,
        skills: skills || [],
        certifications,
        languages,
        coverLetter,
        resumeUrl,
        portfolioUrl,
        linkedinUrl,
        references,
        availableStartDate: availableStartDate
          ? new Date(availableStartDate)
          : null,
      },
      include: {
        jobPosition: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error("Create application API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
