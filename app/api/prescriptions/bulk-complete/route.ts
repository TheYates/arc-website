import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { authenticateRequest } from "@/lib/api/auth";

export async function PATCH(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;

    // Verify user is a reviewer
    if (user.role !== "reviewer") {
      return NextResponse.json(
        { error: "Forbidden - Only reviewers can mark prescriptions as complete" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { prescriptionIds } = body;

    // Validate input
    if (!prescriptionIds || !Array.isArray(prescriptionIds) || prescriptionIds.length === 0) {
      return NextResponse.json(
        { error: "prescriptionIds array is required and cannot be empty" },
        { status: 400 }
      );
    }

    // Update multiple prescriptions to COMPLETED status
    const updatedPrescriptions = await prisma.prescription.updateMany({
      where: { 
        id: { in: prescriptionIds },
        // Only update prescriptions that are not already completed
        status: { not: "COMPLETED" }
      },
      data: {
        status: "COMPLETED",
        updatedAt: new Date()
      }
    });

    // Get the updated prescriptions to return detailed info
    const prescriptions = await prisma.prescription.findMany({
      where: { id: { in: prescriptionIds } },
      include: {
        medication: true,
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        updatedCount: updatedPrescriptions.count,
        prescriptions
      },
      message: `${updatedPrescriptions.count} prescription(s) marked as complete successfully`
    });

  } catch (error) {
    console.error("Error in bulk prescription complete API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
