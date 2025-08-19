import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { authenticateRequest } from "@/lib/auth-server";

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

    // Only admins can update service types
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only administrators can update service types" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, category, isActive } = body;

    // Check if service type exists
    const existingType = await prisma.serviceType.findUnique({
      where: { id },
    });

    if (!existingType) {
      return NextResponse.json(
        { error: "Service type not found" },
        { status: 404 }
      );
    }

    // Check if name is already taken by another service type
    if (name !== existingType.name) {
      const nameExists = await prisma.serviceType.findUnique({
        where: { name },
      });

      if (nameExists) {
        return NextResponse.json(
          { error: "Service type with this name already exists" },
          { status: 400 }
        );
      }
    }

    const updatedServiceType = await prisma.serviceType.update({
      where: { id },
      data: {
        name,
        description,
        category,
        isActive,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ serviceType: updatedServiceType });
  } catch (error) {
    console.error("Error updating service type:", error);
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

    // Only admins can delete service types
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only administrators can delete service types" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if service type exists
    const existingType = await prisma.serviceType.findUnique({
      where: { id },
      include: {
        serviceRequests: true,
      },
    });

    if (!existingType) {
      return NextResponse.json(
        { error: "Service type not found" },
        { status: 404 }
      );
    }

    // Check if service type is being used in service requests
    if (existingType.serviceRequests.length > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete service type that is being used in service requests",
          details: `This service type is used in ${existingType.serviceRequests.length} service request(s)`
        },
        { status: 400 }
      );
    }

    await prisma.serviceType.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Service type deleted successfully" });
  } catch (error) {
    console.error("Error deleting service type:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { id } = await params;

    const serviceType = await prisma.serviceType.findUnique({
      where: { id },
      include: {
        serviceRequests: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
        },
      },
    });

    if (!serviceType) {
      return NextResponse.json(
        { error: "Service type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ serviceType });
  } catch (error) {
    console.error("Error fetching service type:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
