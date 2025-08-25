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
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const patientId = searchParams.get("patientId");
    const caregiverId = searchParams.get("caregiverId");

    let whereClause: any = {};

    // Role-based filtering
    if (user.role === "patient") {
      // Patients can only see their own service requests
      const patient = await prisma.patient.findUnique({
        where: { userId: user.id },
      });
      if (!patient) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 });
      }
      whereClause.patientId = patient.id;
    } else if (user.role === "caregiver") {
      // Caregivers can only see requests assigned to them
      whereClause.caregiverId = user.id;
    } else if (user.role === "reviewer") {
      // Reviewers can see requests for their assigned patients
      const reviewerAssignments = await prisma.reviewerAssignment.findMany({
        where: { reviewerId: user.id, isActive: true },
        select: { patientId: true },
      });
      const assignedPatientIds = reviewerAssignments.map(a => a.patientId);
      whereClause.patientId = { in: assignedPatientIds };
    }
    // Admins can see all requests (no additional filtering)

    // Apply additional filters
    if (status) whereClause.status = status;
    if (patientId && (user.role === "admin" || user.role === "super_admin")) {
      whereClause.patientId = patientId;
    }
    if (caregiverId && (user.role === "admin" || user.role === "super_admin")) {
      whereClause.caregiverId = caregiverId;
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ serviceRequests });
  } catch (error) {
    console.error("Error fetching service requests:", error);
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

    // Only patients can create service requests
    if (user.role !== "patient") {
      return NextResponse.json(
        { error: "Only patients can create service requests" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      customDescription,
      priority = "MEDIUM",
      preferredDate,
      estimatedDuration,
      notes,
      serviceTypeId,
    } = body;

    // Get patient record
    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient record not found" },
        { status: 404 }
      );
    }

    // Get caregiver assignment
    const caregiverAssignment = await prisma.caregiverAssignment.findFirst({
      where: { patientId: patient.id, isActive: true },
    });

    if (!caregiverAssignment) {
      return NextResponse.json(
        { error: "No caregiver assigned to this patient" },
        { status: 400 }
      );
    }

    // Check admin settings for approval requirement
    const approvalSetting = await prisma.adminSettings.findUnique({
      where: { key: "service_requests_require_approval" },
    });
    const requiresApproval = approvalSetting?.value === "true";

    // Create service request
    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        patientId: patient.id,
        caregiverId: caregiverAssignment.caregiverId,
        serviceTypeId,
        title,
        description,
        customDescription,
        priority,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        estimatedDuration,
        notes,
        requiresApproval,
        status: requiresApproval ? "PENDING" : "APPROVED",
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
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create notification for caregiver
    await prisma.inAppNotification.create({
      data: {
        userId: caregiverAssignment.caregiverId,
        type: "SERVICE_REQUEST_CREATED",
        title: "New Service Request",
        message: `${user.firstName} ${user.lastName} has requested: ${title}`,
        actionUrl: `/caregiver/service-requests`,
        actionLabel: "View Request",
        serviceRequestId: serviceRequest.id,
        priority,
      },
    });

    // If requires approval, notify reviewer/admin
    if (requiresApproval) {
      const reviewerAssignment = await prisma.reviewerAssignment.findFirst({
        where: { patientId: patient.id, isActive: true },
      });

      if (reviewerAssignment) {
        await prisma.inAppNotification.create({
          data: {
            userId: reviewerAssignment.reviewerId,
            type: "SERVICE_REQUEST_CREATED",
            title: "Service Request Needs Approval",
            message: `${user.firstName} ${user.lastName} has requested: ${title}`,
            actionUrl: `/reviewer/service-requests/${serviceRequest.id}`,
            actionLabel: "Review Request",
            serviceRequestId: serviceRequest.id,
            priority,
          },
        });
      }
    }

    // Update service type usage count if provided
    if (serviceTypeId) {
      await prisma.serviceType.update({
        where: { id: serviceTypeId },
        data: { usageCount: { increment: 1 } },
      });
    }

    return NextResponse.json({ serviceRequest }, { status: 201 });

  } catch (error) {
    console.error("Error creating service request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
