import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { authenticateRequest } from "@/lib/api/auth";
import { TaskStatus, TaskPriority } from "@/lib/types/tasks";

// GET /api/tasks/[id] - Get specific task
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

    const task = await prisma.task.findUnique({
      where: { id },
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

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Check access permissions
    const hasAccess = 
      user.role === "admin" || 
      user.role === "super_admin" ||
      task.createdById === user.id ||
      task.assignedToId === user.id ||
      (user.role === "reviewer" && await prisma.reviewerAssignment.findFirst({
        where: {
          reviewerId: user.id,
          patientId: task.patientId,
          isActive: true
        }
      }));

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this task" },
        { status: 403 }
      );
    }

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

    return NextResponse.json({ task: transformedTask });
  } catch (error) {
    console.error("Get task API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update task
export async function PUT(
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

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Check permissions
    let canUpdate = false;
    
    if (user.role === "admin" || user.role === "super_admin") {
      canUpdate = true;
    } else if (user.role === "reviewer" && existingTask.createdById === user.id) {
      canUpdate = true;
    } else if (user.role === "caregiver" && existingTask.assignedToId === user.id) {
      // Caregivers can only update status and completion
      const allowedFields = ["status"];
      const updateFields = Object.keys(body);
      canUpdate = updateFields.every(field => allowedFields.includes(field));
    }

    if (!canUpdate) {
      return NextResponse.json(
        { error: "You don't have permission to update this task" },
        { status: 403 }
      );
    }

    const updateData: any = {};
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.priority !== undefined) updateData.priority = body.priority.toUpperCase();
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.assignedToId !== undefined) updateData.assignedToId = body.assignedToId;
    
    if (body.status !== undefined) {
      updateData.status = body.status.toUpperCase();
      
      // Set completion time when marking as completed
      if (body.status.toLowerCase() === "completed" && !existingTask.completedAt) {
        updateData.completedAt = new Date();
      } else if (body.status.toLowerCase() !== "completed") {
        updateData.completedAt = null;
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ task: transformedTask });
  } catch (error) {
    console.error("Update task API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete task
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
    const { id } = await params;

    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Only task creator, reviewers, and admins can delete tasks
    const canDelete = 
      user.role === "admin" || 
      user.role === "super_admin" ||
      (user.role === "reviewer" && existingTask.createdById === user.id);

    if (!canDelete) {
      return NextResponse.json(
        { error: "You don't have permission to delete this task" },
        { status: 403 }
      );
    }

    await prisma.task.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
