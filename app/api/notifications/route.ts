import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { authenticateRequest } from "@/lib/api/auth";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const isRead = searchParams.get("isRead");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let whereClause: any = {
      userId: user.id,
    };

    if (isRead !== null) {
      whereClause.isRead = isRead === "true";
    }

    if (type) {
      whereClause.type = type;
    }

    // Filter out expired notifications
    whereClause.OR = [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } },
    ];

    // Optimized query with performance considerations
    const [notifications, unreadCount] = await Promise.all([
      // Main query with limited includes for better performance
      prisma.inAppNotification.findMany({
        where: whereClause,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          isRead: true,
          priority: true,
          actionUrl: true,
          actionLabel: true,
          createdAt: true,
          // Only include related data if specifically needed
          serviceRequest: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          schedule: {
            select: {
              id: true,
              title: true,
              status: true,
              scheduledDate: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      
      // Separate optimized count query
      prisma.inAppNotification.count({
        where: {
          userId: user.id,
          isRead: false,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
      })
    ]);

    console.log(`⚡ Fetched ${notifications.length} notifications for user ${user.id} in ${Date.now() - startTime}ms`);
    
    return NextResponse.json(
      { notifications, unreadCount },
      {
        headers: {
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    const body = await request.json();
    const { notificationIds, markAsRead } = body;

    if (!Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "notificationIds must be an array" },
        { status: 400 }
      );
    }

    // Verify all notifications belong to the user
    const notifications = await prisma.inAppNotification.findMany({
      where: {
        id: { in: notificationIds },
        userId: user.id,
      },
    });

    if (notifications.length !== notificationIds.length) {
      return NextResponse.json(
        { error: "Some notifications not found or access denied" },
        { status: 404 }
      );
    }

    // Update notifications
    const updated = await prisma.inAppNotification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: user.id,
      },
      data: {
        isRead: markAsRead,
        ...(markAsRead && { readAt: new Date() }),
      },
    });

    return NextResponse.json({ updated: updated.count });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Mark all notifications as read
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;

    const updated = await prisma.inAppNotification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({ updated: updated.count });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
