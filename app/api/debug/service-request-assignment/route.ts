import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { authenticateRequest } from "@/lib/api/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;

    // Only allow admins and caregivers to debug
    if (
      user.role !== "admin" &&
      user.role !== "super_admin" &&
      user.role !== "caregiver"
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get the service request from the admin screenshot (Wound Dressing)
    const serviceRequest = await prisma.serviceRequest.findFirst({
      where: {
        title: "Wound Dressing",
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        caregiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        serviceType: true,
      },
    });

    if (!serviceRequest) {
      return NextResponse.json(
        { error: "Service request not found" },
        { status: 404 }
      );
    }

    // Get caregiver assignments for this patient
    const caregiverAssignments = await prisma.caregiverAssignment.findMany({
      where: {
        patientId: serviceRequest.patientId,
      },
      include: {
        caregiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Get the current user info
    const currentCaregiverInfo = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };

    // Check if there are multiple Ama Welch accounts
    const allAmaWelchAccounts = await prisma.user.findMany({
      where: {
        firstName: "Ama",
        lastName: "Welch",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      serviceRequest: {
        id: serviceRequest.id,
        title: serviceRequest.title,
        status: serviceRequest.status,
        caregiverId: serviceRequest.caregiverId,
        patientId: serviceRequest.patientId,
        patient: serviceRequest.patient,
        caregiver: serviceRequest.caregiver,
      },
      caregiverAssignments,
      currentCaregiverInfo,
      allAmaWelchAccounts,
      debug: {
        serviceRequestCaregiverId: serviceRequest.caregiverId,
        currentUserId: user.id,
        match: serviceRequest.caregiverId === user.id,
        activeAssignments: caregiverAssignments.filter((a) => a.isActive),
        expectedCaregiverEmail: "ama@arc.com",
        currentUserEmail: user.email,
        emailMatch: user.email === "ama@arc.com",
      },
    });
  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
