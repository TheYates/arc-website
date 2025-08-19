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

    // Get all service requests for this caregiver using the same logic as the main API
    let whereClause: any = {};

    if (user.role === "caregiver") {
      whereClause.caregiverId = user.id;
    }

    const serviceRequests = await prisma.serviceRequest.findMany({
      where: whereClause,
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
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Also get all service requests in the system for comparison
    const allServiceRequests = await prisma.serviceRequest.findMany({
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      currentUser: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      whereClause,
      serviceRequestsForCaregiver: serviceRequests,
      allServiceRequestsInSystem: allServiceRequests,
      debug: {
        totalRequestsForCaregiver: serviceRequests.length,
        totalRequestsInSystem: allServiceRequests.length,
        caregiverIdFilter: user.id,
        requestsMatchingCaregiverId: allServiceRequests.filter(req => req.caregiverId === user.id),
      },
    });
  } catch (error) {
    console.error("Debug caregiver requests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
