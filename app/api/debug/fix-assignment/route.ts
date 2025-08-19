import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { authenticateRequest } from "@/lib/api/auth";

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;

    // Only allow admins to fix assignments
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json({ error: "Only admins can fix assignments" }, { status: 403 });
    }

    // Get Arna Wach's user ID
    const arnaWach = await prisma.user.findFirst({
      where: {
        firstName: "Arna",
        lastName: "Wach",
        role: "caregiver"
      }
    });

    if (!arnaWach) {
      return NextResponse.json({ error: "Arna Wach not found" }, { status: 404 });
    }

    // Get Abdul Huff's patient record
    const abdulHuff = await prisma.patient.findFirst({
      where: {
        user: {
          firstName: "Abdul",
          lastName: "Huff"
        }
      }
    });

    if (!abdulHuff) {
      return NextResponse.json({ error: "Abdul Huff patient not found" }, { status: 404 });
    }

    // Update the caregiver assignment
    const updatedAssignment = await prisma.caregiverAssignment.upsert({
      where: {
        caregiverId_patientId: {
          caregiverId: arnaWach.id,
          patientId: abdulHuff.id,
        },
      },
      update: {
        isActive: true,
      },
      create: {
        caregiverId: arnaWach.id,
        patientId: abdulHuff.id,
        isActive: true,
      },
    });

    // Deactivate old assignment (Ama Welch)
    await prisma.caregiverAssignment.updateMany({
      where: {
        patientId: abdulHuff.id,
        caregiverId: { not: arnaWach.id },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Update all service requests for this patient to point to Arna Wach
    const updatedServiceRequests = await prisma.serviceRequest.updateMany({
      where: {
        patientId: abdulHuff.id,
      },
      data: {
        caregiverId: arnaWach.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Assignment fixed successfully",
      details: {
        newCaregiverId: arnaWach.id,
        caregiverName: `${arnaWach.firstName} ${arnaWach.lastName}`,
        patientId: abdulHuff.id,
        patientName: "Abdul Huff",
        updatedServiceRequests: updatedServiceRequests.count,
        assignment: updatedAssignment,
      },
    });
  } catch (error) {
    console.error("Fix assignment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
