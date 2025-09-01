import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { authenticateRequest } from "@/lib/api/auth";
import { ActivityFeedItem, ActivityFeedResponse } from "@/lib/types/activity-feed";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const cursor = searchParams.get("cursor");
    const priority = searchParams.get("priority") as "low" | "medium" | "high" | "urgent" | null;

    // Get patient IDs that the user has access to
    let patientIds: string[] = [];

    if (user.role === "caregiver") {
      // Caregivers see activities for their assigned patients
      const assignments = await prisma.caregiverAssignment.findMany({
        where: { caregiverId: user.id, isActive: true },
        select: { patientId: true }
      });
      patientIds = assignments.map(a => a.patientId);
    } else if (user.role === "reviewer") {
      // Reviewers see activities for their assigned patients
      const assignments = await prisma.reviewerAssignment.findMany({
        where: { reviewerId: user.id, isActive: true },
        select: { patientId: true }
      });
      patientIds = assignments.map(a => a.patientId);
    } else if (user.role === "admin" || user.role === "super_admin") {
      // Admins see all activities
      const patients = await prisma.patient.findMany({
        select: { id: true }
      });
      patientIds = patients.map(p => p.id);
    }

    if (patientIds.length === 0) {
      return NextResponse.json({
        activities: [],
        hasMore: false
      } as ActivityFeedResponse);
    }

    // Build where clause
    const whereClause: any = {
      patientId: { in: patientIds }
    };

    if (priority) {
      whereClause.priority = priority.toUpperCase();
    }

    if (cursor) {
      whereClause.createdAt = { lt: new Date(cursor) };
    }

    // Fetch activities with related data
    const activities = await prisma.activityFeed.findMany({
      where: whereClause,
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1 // Take one extra to check if there are more
    });

    const hasMore = activities.length > limit;
    const returnedActivities = hasMore ? activities.slice(0, limit) : activities;

    // Transform to response format
    const transformedActivities: ActivityFeedItem[] = returnedActivities.map((activity: any) => ({
      id: activity.id,
      type: activity.type.toLowerCase().replace(/_/g, "_") as any,
      priority: activity.priority.toLowerCase() as any,
      title: activity.title,
      description: activity.description,
      patientId: activity.patientId,
      patientName: `${activity.patient.user.firstName} ${activity.patient.user.lastName}`,
      createdById: activity.createdById,
      createdByName: `${activity.createdBy.firstName} ${activity.createdBy.lastName}`,
      createdByRole: activity.createdBy.role,
      createdAt: activity.createdAt.toISOString(),
      metadata: activity.metadata as any
    }));

    const nextCursor = hasMore ? returnedActivities[returnedActivities.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({
      activities: transformedActivities,
      hasMore,
      nextCursor
    } as ActivityFeedResponse);

  } catch (error) {
    console.error("Activity feed API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;
    const body = await request.json();

    const {
      type,
      priority = "medium",
      title,
      description,
      patientId,
      metadata
    } = body;

    // Validate required fields
    if (!type || !title || !description || !patientId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TEMPORARY: Return sample activity until Prisma client is regenerated
    console.log("Creating sample activity for user:", user.email);

    const sampleActivity: ActivityFeedItem = {
      id: `temp-${Date.now()}`,
      type: type as any,
      priority: priority as any,
      title,
      description,
      patientId,
      patientName: "Sample Patient",
      createdById: user.id,
      createdByName: `${user.firstName} ${user.lastName}`,
      createdByRole: user.role,
      createdAt: new Date().toISOString(),
      metadata
    };

    return NextResponse.json({ activity: sampleActivity });

  } catch (error) {
    console.error("Create activity API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
