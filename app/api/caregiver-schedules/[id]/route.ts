import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { authenticateRequest } from "@/lib/api/auth";
import { createScheduleCompletionCareNote } from "@/lib/integrations/care-notes-integration";

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

    const schedule = await prisma.caregiverSchedule.findUnique({
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
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const hasAccess = await checkScheduleAccess(user, schedule);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("Error fetching schedule:", error);
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
    // Admins should not be able to edit schedules (read-only for admins)
    if (user.role === "admin") {
      return NextResponse.json({ error: "Admins cannot modify schedules" }, { status: 403 });
    }
    const { id } = await params;
    const body = await request.json();

    const existingSchedule = await prisma.caregiverSchedule.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        caregiver: true,
      },
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const hasAccess = await checkScheduleAccess(user, existingSchedule);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    let updateData: any = {};
    let notificationData: any = null;

    // Handle different update types based on user role
    if (user.role === "caregiver") {
      // Caregivers can update status, completion notes, and outcome
      if (existingSchedule.caregiverId !== user.id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      const { status, completionNotes, outcome, completedDate, cancelledReason } = body;
      
      updateData = {
        ...(status && { status }),
        ...(completionNotes !== undefined && { completionNotes }),
        ...(outcome !== undefined && { outcome }),
        ...(completedDate && { completedDate: new Date(completedDate) }),
        ...(cancelledReason !== undefined && { cancelledReason }),
      };

      // Create notifications for status changes
      if (status) {
        if (status === "COMPLETED") {
          notificationData = {
            userId: existingSchedule.patient.userId,
            type: "SCHEDULE_COMPLETED",
            title: "Visit Completed",
            message: `Your scheduled visit "${existingSchedule.title}" has been completed`,
            actionUrl: `/patient/schedules/${id}`,
            scheduleId: id,
          };

          // Create care note for completed schedule
          if (outcome) {
            try {
              await createScheduleCompletionCareNote({
                scheduleId: id,
                patientId: existingSchedule.patientId,
                caregiverId: existingSchedule.caregiverId,
                scheduleTitle: existingSchedule.title,
                scheduleType: existingSchedule.scheduleType,
                outcome,
                completionNotes,
                completedDate: completedDate ? new Date(completedDate) : new Date(),
                priority: existingSchedule.priority,
              });
            } catch (error) {
              console.error("Error creating care note for schedule completion:", error);
              // Don't fail the request if care note creation fails
            }
          }
        } else if (status === "CANCELLED") {
          notificationData = {
            userId: existingSchedule.patient.userId,
            type: "SCHEDULE_CANCELLED",
            title: "Visit Cancelled",
            message: `Your scheduled visit "${existingSchedule.title}" has been cancelled`,
            actionUrl: `/patient/schedules/${id}`,
            scheduleId: id,
          };
        }
      }
    } else if (user.role === "reviewer" || user.role === "admin" || user.role === "super_admin") {
      // Reviewers and admins can approve/modify schedules based on settings
      const { status, notes, approvedById } = body;
      
      updateData = {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(approvedById && { approvedById }),
      };

      // Create notifications for approval/rejection
      if (status === "CANCELLED") {
        notificationData = {
          userId: existingSchedule.caregiverId,
          type: "SCHEDULE_CANCELLED",
          title: "Schedule Cancelled",
          message: `Schedule "${existingSchedule.title}" for ${existingSchedule.patient.user.firstName} ${existingSchedule.patient.user.lastName} has been cancelled`,
          actionUrl: `/caregiver/schedules/${id}`,
          scheduleId: id,
        };
      }
    }

    // Update the schedule
    const updatedSchedule = await prisma.caregiverSchedule.update({
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

    return NextResponse.json({ schedule: updatedSchedule });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    // Admins should not be able to delete schedules (read-only for admins)
    if (user.role === "admin") {
      return NextResponse.json({ error: "Admins cannot modify schedules" }, { status: 403 });
    }
    const { id } = await params;

    // Get existing schedule
    const existingSchedule = await prisma.caregiverSchedule.findUnique({
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
      },
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    // Check permissions
    if (user.role === "caregiver") {
      if (existingSchedule.caregiverId !== user.id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    } else if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete the schedule
    await prisma.caregiverSchedule.delete({
      where: { id },
    });

    // Create notification for patient
    await prisma.inAppNotification.create({
      data: {
        userId: existingSchedule.patient.userId,
        type: "SCHEDULE_CANCELLED",
        title: "Visit Cancelled",
        message: `Your scheduled visit "${existingSchedule.title}" has been cancelled`,
        actionUrl: `/patient/schedules`,
        scheduleId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function checkScheduleAccess(user: any, schedule: any): Promise<boolean> {
  if (user.role === "admin" || user.role === "super_admin") {
    return true;
  }

  if (user.role === "caregiver") {
    return schedule.caregiverId === user.id;
  }

  if (user.role === "reviewer") {
    // Check if reviewer is assigned to this patient
    const assignment = await prisma.reviewerAssignment.findFirst({
      where: {
        reviewerId: user.id,
        patientId: schedule.patientId,
        isActive: true,
      },
    });
    return !!assignment;
  }

  if (user.role === "patient") {
    return schedule.patient.userId === user.id;
  }

  return false;
}
