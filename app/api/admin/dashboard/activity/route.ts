import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api/auth";
import { prisma } from "@/lib/database/postgresql";

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only administrators can view dashboard activity" },
        { status: 403 }
      );
    }

    // Get recent activity from various sources
    const [recentApplications, recentServiceRequests, recentUsers] = await Promise.all([
      // Recent applications
      prisma.application.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      
      // Recent service requests
      prisma.serviceRequest.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          patient: {
            select: {
              id: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
      
      // Recent user registrations
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    // Format activities for the dashboard
    const activities = [
      // Application activities
      ...recentApplications.map(app => ({
        id: `app-${app.id}`,
        type: "application",
        action: app.status === "PENDING" ? "submitted" : "updated",
        user: `${app.firstName} ${app.lastName}`,
        description: `Application ${app.status.toLowerCase()}`,
        timestamp: app.updatedAt || app.createdAt,
        status: app.status.toLowerCase(),
      })),
      
      // Service request activities
      ...recentServiceRequests.map(req => ({
        id: `req-${req.id}`,
        type: "service_request",
        action: "created",
        user: req.patient?.user ? `${req.patient.user.firstName} ${req.patient.user.lastName}` : "Unknown Patient",
        description: `Service request ${req.status.toLowerCase()}`,
        timestamp: req.createdAt,
        status: req.status.toLowerCase(),
      })),
      
      // User registration activities
      ...recentUsers.map(user => ({
        id: `user-${user.id}`,
        type: "user_registration",
        action: "registered",
        user: `${user.firstName} ${user.lastName}`,
        description: `New ${user.role.toLowerCase()} registered`,
        timestamp: user.createdAt,
        status: "active",
      })),
    ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10); // Get the 10 most recent activities

    return NextResponse.json({
      success: true,
      activities,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Dashboard activity error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch dashboard activity",
        activities: []
      },
      { status: 500 }
    );
  }
}
