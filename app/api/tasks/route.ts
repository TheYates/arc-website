import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { authenticateRequest } from "@/lib/api/auth";
import { TaskStatus, TaskPriority } from "@/lib/types/tasks";

// GET /api/tasks - Get tasks with optional filtering
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    
    const patientId = searchParams.get("patientId");
    const createdById = searchParams.get("createdById");
    const assignedToId = searchParams.get("assignedToId");
    const status = searchParams.get("status") as TaskStatus | null;
    const priority = searchParams.get("priority") as TaskPriority | null;

    let whereClause: any = {};

    // Role-based filtering
    if (user.role === "caregiver") {
      // Caregivers can only see tasks assigned to them
      whereClause.assignedToId = user.id;
    } else if (user.role === "reviewer") {
      // Reviewers can see tasks they created or for patients they're assigned to
      const reviewerPatients = await prisma.reviewerAssignment.findMany({
        where: { reviewerId: user.id, isActive: true },
        select: { patientId: true }
      });
      const patientIds = reviewerPatients.map(assignment => assignment.patientId);
      
      whereClause.OR = [
        { createdById: user.id },
        { patientId: { in: patientIds } }
      ];
    } else if (user.role === "admin" || user.role === "super_admin") {
      // Admins can see all tasks
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Apply additional filters
    if (patientId) whereClause.patientId = patientId;
    if (createdById) whereClause.createdById = createdById;
    if (assignedToId) whereClause.assignedToId = assignedToId;
    if (status) whereClause.status = status.toUpperCase();
    if (priority) whereClause.priority = priority.toUpperCase();

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
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
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      },
      orderBy: [
        { status: "asc" },
        { priority: "desc" },
        { dueDate: "asc" },
        { createdAt: "desc" }
      ]
    });

    // Transform the data to match our interface
    const transformedTasks = tasks.map(task => ({
      id: task.id,
      patientId: task.patientId,
      createdById: task.createdById,
      assignedToId: task.assignedToId,
      title: task.title,
      description: task.description,
      priority: task.priority.toLowerCase() as TaskPriority,
      status: task.status.toLowerCase() as TaskStatus,
      dueDate: task.dueDate?.toISOString(),
      completedAt: task.completedAt?.toISOString(),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      patient: {
        id: task.patient.id,
        firstName: task.patient.user.firstName,
        lastName: task.patient.user.lastName
      },
      createdBy: task.createdBy,
      assignedTo: task.assignedTo
    }));

    return NextResponse.json({ tasks: transformedTasks });
  } catch (error) {
    console.error("Get tasks API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create new task
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;

    // Only reviewers and admins can create tasks
    if (!["reviewer", "admin", "super_admin"].includes(user.role)) {
      return NextResponse.json(
        { error: "Only reviewers and administrators can create tasks" },
        { status: 403 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { patientId, title, description } = body;

    if (!patientId || !title) {
      return NextResponse.json(
        { error: "Patient ID and title are required" },
        { status: 400 }
      );
    }

    // Verify the patient exists and user has access
    if (user.role === "reviewer") {
      const hasAccess = await prisma.reviewerAssignment.findFirst({
        where: {
          reviewerId: user.id,
          patientId: patientId,
          isActive: true
        }
      });

      if (!hasAccess) {
        return NextResponse.json(
          { error: "You don't have access to this patient" },
          { status: 403 }
        );
      }
    }

    // Get all active caregivers assigned to this patient
    const caregiverAssignments = await prisma.caregiverAssignment.findMany({
      where: {
        patientId: patientId,
        isActive: true
      },
      include: {
        caregiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    });

    if (caregiverAssignments.length === 0) {
      return NextResponse.json(
        { error: "No caregivers are assigned to this patient" },
        { status: 400 }
      );
    }

    // Create tasks for all assigned caregivers
    const createdTasks = [];

    for (const assignment of caregiverAssignments) {
      const task = await prisma.task.create({
        data: {
          patientId,
          createdById: user.id,
          assignedToId: assignment.caregiverId,
          title,
          description,
          priority: "MEDIUM", // Default to medium priority
          status: "PENDING"
        },
        include: {
          patient: {
            select: {
              id: true,
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
              id: true,
              firstName: true,
              lastName: true,
              role: true
            }
          },
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true
            }
          }
        }
      });

      const transformedTask = {
        id: task.id,
        patientId: task.patientId,
        createdById: task.createdById,
        assignedToId: task.assignedToId,
        title: task.title,
        description: task.description,
        priority: task.priority.toLowerCase() as TaskPriority,
        status: task.status.toLowerCase() as TaskStatus,
        dueDate: task.dueDate?.toISOString(),
        completedAt: task.completedAt?.toISOString(),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        patient: {
          id: task.patient.id,
          firstName: task.patient.user.firstName,
          lastName: task.patient.user.lastName
        },
        createdBy: task.createdBy,
        assignedTo: task.assignedTo
      };

      createdTasks.push(transformedTask);
    }

    return NextResponse.json({
      tasks: createdTasks,
      message: `Task created and assigned to ${createdTasks.length} caregiver(s)`
    }, { status: 201 });
  } catch (error) {
    console.error("Create task API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
