import { NextRequest, NextResponse } from "next/server";
import { recordMedicationAdministration } from "@/lib/api/medications-prisma";
import { prisma } from "@/lib/database/postgresql";
import { authenticateRequest } from "@/lib/api/auth";

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    const { user } = authResult;

    const administrationData = await request.json();

    // Handle both new (prescriptionId/administeredById) and legacy (medicationId/caregiverId) formats
    let prescriptionId =
      administrationData.prescriptionId || administrationData.medicationId;
    const administeredById =
      administrationData.administeredById || administrationData.caregiverId;

    // If we have medicationId instead of prescriptionId, find the corresponding prescription
    if (!administrationData.prescriptionId && administrationData.medicationId) {
      const prescription = await prisma.prescription.findFirst({
        where: {
          medicationId: administrationData.medicationId,
          patientId: administrationData.patientId,
          status: { in: ["PENDING", "APPROVED", "DISPENSED"] }, // Only active prescriptions
        },
        orderBy: { createdAt: "desc" }, // Get the most recent if multiple exist
      });

      if (!prescription) {
        return NextResponse.json(
          {
            error: "No active prescription found for this medication and patient",
          },
          { status: 400 }
        );
      }

      prescriptionId = prescription.id;
    }

    if (!prescriptionId || !administrationData.patientId || !administeredById) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: prescriptionId/medicationId, patientId, administeredById/caregiverId",
        },
        { status: 400 }
      );
    }

    const administration = await recordMedicationAdministration({
      prescriptionId,
      patientId: administrationData.patientId,
      administeredById,
      scheduledTime: new Date(administrationData.scheduledTime),
      administeredTime:
        administrationData.administeredTime || administrationData.actualTime
          ? new Date(
              administrationData.administeredTime ||
                administrationData.actualTime
            )
          : undefined,
      status: administrationData.status?.toUpperCase() || "ADMINISTERED",
      dosageGiven: administrationData.dosageGiven,
      notes: administrationData.notes,
      sideEffectsObserved: administrationData.sideEffectsObserved,
      vitalSigns: administrationData.vitalSigns,
    });

    if (!administration) {
      return NextResponse.json(
        { error: "Failed to record medication administration" },
        { status: 500 }
      );
    }

    return NextResponse.json({ administration });
  } catch (error) {
    console.error("Record administration API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
