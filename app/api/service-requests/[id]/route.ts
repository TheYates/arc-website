import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { authenticateRequest } from "@/lib/api/auth";
import { createServiceCompletionCareNote } from "@/lib/integrations/care-notes-integration";

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
    const { id } = await params;

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id },
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

    if (!serviceRequest) {
      return NextResponse.json(
        { error: "Service request not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const hasAccess = await checkServiceRequestAccess(user, serviceRequest);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ serviceRequest });
  } catch (error) {
    console.error("Error fetching service request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    const { id } = await params;
    const body = await request.json();

    const existingRequest = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        caregiver: true,
      },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Service request not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const hasAccess = await checkServiceRequestAccess(user, existingRequest);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    let updateData: any = {};
    let notificationData: any = null;

    // Handle different update types based on user role
    if (user.role === "patient") {
      // Patients can only update their own requests if not yet scheduled
      if (existingRequest.patient.userId !== user.id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
      if (
        existingRequest.status !== "PENDING" &&
        existingRequest.status !== "APPROVED"
      ) {
        return NextResponse.json(
          { error: "Cannot update request after it's been scheduled" },
          { status: 400 }
        );
      }

      const {
        title,
        description,
        customDescription,
        priority,
        preferredDate,
        notes,
      } = body;
      updateData = {
        ...(title && { title }),
        ...(description && { description }),
        ...(customDescription !== undefined && { customDescription }),
        ...(priority && { priority }),
        ...(preferredDate && { preferredDate: new Date(preferredDate) }),
        ...(notes !== undefined && { notes }),
      };
    } else if (user.role === "caregiver") {
      // Caregivers can update status, schedule, and add notes
      if (existingRequest.caregiverId !== user.id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      const { status, scheduledDate, caregiverNotes, outcome, completedDate } =
        body;

      updateData = {
        ...(status && { status }),
        ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
        ...(caregiverNotes !== undefined && { caregiverNotes }),
        ...(outcome !== undefined && { outcome }),
        ...(completedDate && { completedDate: new Date(completedDate) }),
      };

      // Create notifications for status changes
      if (status) {
        if (status === "SCHEDULED") {
          notificationData = {
            userId: existingRequest.patient.userId,
            type: "SERVICE_REQUEST_SCHEDULED",
            title: "Service Request Scheduled",
            message: `Your request "${existingRequest.title}" has been scheduled`,
            actionUrl: `/patient/service-requests/${id}`,
            serviceRequestId: id,
          };
        } else if (status === "COMPLETED") {
          notificationData = {
            userId: existingRequest.patient.userId,
            type: "SERVICE_REQUEST_COMPLETED",
            title: "Service Request Completed",
            message: `Your request "${existingRequest.title}" has been completed`,
            actionUrl: `/patient/service-requests/${id}`,
            serviceRequestId: id,
          };

          // Update corresponding caregiver schedules to completed
          if (existingRequest.scheduledDate) {
            try {
              await prisma.caregiverSchedule.updateMany({
                where: {
                  caregiverId: existingRequest.caregiverId,
                  patientId: existingRequest.patientId,
                  title: existingRequest.title,
                  scheduledDate: existingRequest.scheduledDate,
                  status: "SCHEDULED",
                },
                data: {
                  status: "COMPLETED",
                },
              });
            } catch (error) {
              console.error("Error updating corresponding schedules:", error);
              // Don't fail the request if schedule update fails
            }
          }

          // Create care note for completed service
          if (outcome) {
            try {
              await createServiceCompletionCareNote({
                serviceRequestId: id,
                patientId: existingRequest.patientId,
                caregiverId: existingRequest.caregiverId,
                serviceTitle: existingRequest.title,
                serviceDescription: existingRequest.description,
                outcome,
                caregiverNotes,
                completedDate: completedDate
                  ? new Date(completedDate)
                  : new Date(),
                priority: existingRequest.priority,
              });
            } catch (error) {
              console.error(
                "Error creating care note for service completion:",
                error
              );
              // Don't fail the request if care note creation fails
            }
          }
        }
      }
    } else if (
      user.role === "reviewer" ||
      user.role === "admin" ||
      user.role === "super_admin"
    ) {
      // Reviewers and admins can approve/reject requests
      const { status, reviewerNotes, approvedById, rejectionReason } = body;

      if (status === "APPROVED" || status === "REJECTED") {
        updateData = {
          status,
          ...(reviewerNotes !== undefined && { reviewerNotes }),
          ...(status === "APPROVED" && {
            approvedById: user.id,
            approvedDate: new Date(),
          }),
          ...(status === "REJECTED" && { rejectionReason }),
        };

        // Create notifications
        const notificationType =
          status === "APPROVED"
            ? "SERVICE_REQUEST_APPROVED"
            : "SERVICE_REQUEST_REJECTED";
        const message =
          status === "APPROVED"
            ? `Your request "${existingRequest.title}" has been approved`
            : `Your request "${existingRequest.title}" has been rejected`;

        notificationData = {
          userId: existingRequest.patient.userId,
          type: notificationType,
          title: `Service Request ${
            status === "APPROVED" ? "Approved" : "Rejected"
          }`,
          message,
          actionUrl: `/patient/service-requests/${id}`,
          serviceRequestId: id,
        };

        // Also notify caregiver if approved
        if (status === "APPROVED") {
          await prisma.inAppNotification.create({
            data: {
              userId: existingRequest.caregiverId,
              type: "SERVICE_REQUEST_APPROVED",
              title: "Service Request Approved",
              message: `Request "${existingRequest.title}" for ${existingRequest.patient.user.firstName} ${existingRequest.patient.user.lastName} has been approved`,
              actionUrl: `/caregiver/service-requests`,
              serviceRequestId: id,
            },
          });
        }
      }
    }

    // Update the service request
    const updatedRequest = await prisma.serviceRequest.update({
      where: { id },
      data: updateData,
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

    // Create notification if needed
    if (notificationData) {
      await prisma.inAppNotification.create({
        data: notificationData,
      });
    }

    return NextResponse.json({ serviceRequest: updatedRequest });
  } catch (error) {
    console.error("Error updating service request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function checkServiceRequestAccess(
  user: any,
  serviceRequest: any
): Promise<boolean> {
  if (user.role === "admin" || user.role === "super_admin") {
    return true;
  }

  if (user.role === "patient") {
    return serviceRequest.patient.userId === user.id;
  }

  if (user.role === "caregiver") {
    return serviceRequest.caregiverId === user.id;
  }

  if (user.role === "reviewer") {
    // Check if reviewer is assigned to this patient
    const assignment = await prisma.reviewerAssignment.findFirst({
      where: {
        reviewerId: user.id,
        patientId: serviceRequest.patientId,
        isActive: true,
      },
    });
    return !!assignment;
  }

  return false;
}
