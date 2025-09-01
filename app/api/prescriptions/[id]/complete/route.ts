import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { authenticateRequest } from "@/lib/api/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: prescriptionId } = await params;

    // Update the prescription status to COMPLETED
    const updatedPrescription = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        status: "COMPLETED",
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedPrescription,
      message: "Prescription marked as complete successfully"
    });

  } catch (error) {
    console.error("Error in prescription complete API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
