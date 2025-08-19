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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let whereClause: any = {};

    // Role-based filtering
    if (user.role === "caregiver") {
      // Caregivers can only see their own schedules
      whereClause.caregiverId = user.id;
    } else if (user.role === "reviewer") {
      // Reviewers can see schedules for their assigned patients
      const reviewerAssignments = await prisma.reviewerAssignment.findMany({
        where: { reviewerId: user.id, isActive: true },
        select: { patientId: true },
      });
      const assignedPatientIds = reviewerAssignments.map(a => a.patientId);
      whereClause.patientId = { in: assignedPatientIds };
    } else if (user.role === "patient") {
      // Patients cannot see caregiver schedules directly
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    // Admins can see all schedules (no additional filtering)

    // Apply additional filters
    if (status) whereClause.status = status;
    if (patientId && (user.role === "admin" || user.role === "super_admin")) {
      whereClause.patientId = patientId;
    }
    if (caregiverId && (user.role === "admin" || user.role === "super_admin")) {
      whereClause.caregiverId = caregiverId;
    }
    if (startDate) {
      whereClause.scheduledDate = {
        ...whereClause.scheduledDate,
        gte: new Date(startDate),
      };
    }
    if (endDate) {
      whereClause.scheduledDate = {
        ...whereClause.scheduledDate,
        lte: new Date(endDate),
      };
    }

    const schedules = await prisma.caregiverSchedule.findMany({
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
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { scheduledDate: "asc" },
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("Error fetching caregiver schedules:", error);
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
    const body = await request.json();
    const {
      patientId,
      scheduleType,
      title,
      description,
      scheduledDate,
      estimatedDuration,
      priority = "MEDIUM",
      isRecurring = false,
      recurringPattern,
      notes,
    } = body;

    // Only caregivers can create schedules (unless admin settings allow otherwise)
    if (user.role !== "caregiver" && user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only caregivers can create schedules" },
        { status: 403 }
      );
    }

    // Check if caregiver can create proactive schedules
    const proactiveSchedulingSetting = await prisma.adminSettings.findUnique({
      where: { key: "caregivers_can_schedule_proactively" },
    });
    const canScheduleProactively = proactiveSchedulingSetting?.value === "true";

    if (user.role === "caregiver" && !canScheduleProactively) {
      return NextResponse.json(
        { error: "Proactive scheduling is not enabled" },
        { status: 403 }
      );
    }

    // Verify caregiver is assigned to this patient
    let caregiverId = user.id;
    if (user.role === "admin" || user.role === "super_admin") {
      // Admins can specify caregiver, but default to finding assigned caregiver
      const assignment = await prisma.caregiverAssignment.findFirst({
        where: { patientId, isActive: true },
      });
      if (!assignment) {
        return NextResponse.json(
          { error: "No caregiver assigned to this patient" },
          { status: 400 }
        );
      }
      caregiverId = assignment.caregiverId;
    } else {
      // Verify caregiver is assigned to patient
      const assignment = await prisma.caregiverAssignment.findFirst({
        where: { caregiverId: user.id, patientId, isActive: true },
      });
      if (!assignment) {
        return NextResponse.json(
          { error: "You are not assigned to this patient" },
          { status: 403 }
        );
      }
    }

    // Check if schedule requires approval
    const approvalSetting = await prisma.adminSettings.findUnique({
      where: { key: "caregiver_schedules_require_approval" },
    });
    const requiresApproval = approvalSetting?.value === "true";

    // Create schedule
    const schedule = await prisma.caregiverSchedule.create({
      data: {
        caregiverId,
        patientId,
        scheduleType,
        title,
        description,
        scheduledDate: new Date(scheduledDate),
        estimatedDuration,
        priority,
        isRecurring,
        recurringPattern,
        notes,
        requiresApproval,
        status: requiresApproval ? "SCHEDULED" : "SCHEDULED", // Always scheduled for now
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
      },
    });

    // Create notification for patient (optional based on settings)
    const notifyPatientSetting = await prisma.adminSettings.findUnique({
      where: { key: "notify_patients_of_caregiver_schedules" },
    });
    const shouldNotifyPatient = notifyPatientSetting?.value === "true";

    if (shouldNotifyPatient) {
      await prisma.inAppNotification.create({
        data: {
          userId: schedule.patient.user.id,
          type: "SCHEDULE_CREATED",
          title: "Visit Scheduled",
          message: `${schedule.caregiver.firstName} ${schedule.caregiver.lastName} has scheduled a visit: ${title}`,
          actionUrl: `/patient/schedules/${schedule.id}`,
          actionLabel: "View Schedule",
          scheduleId: schedule.id,
          priority,
        },
      });
    }

    // If requires approval, notify reviewer/admin
    if (requiresApproval) {
      const reviewerAssignment = await prisma.reviewerAssignment.findFirst({
        where: { patientId, isActive: true },
      });

      if (reviewerAssignment) {
        await prisma.inAppNotification.create({
          data: {
            userId: reviewerAssignment.reviewerId,
            type: "SCHEDULE_CREATED",
            title: "Schedule Needs Approval",
            message: `${schedule.caregiver.firstName} ${schedule.caregiver.lastName} has scheduled a visit for ${schedule.patient.user.firstName} ${schedule.patient.user.lastName}`,
            actionUrl: `/reviewer/schedules/${schedule.id}`,
            actionLabel: "Review Schedule",
            scheduleId: schedule.id,
            priority,
          },
        });
      }
    }

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    console.error("Error creating caregiver schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
