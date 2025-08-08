import { NextRequest, NextResponse } from "next/server";
import { recordMedicationAdministration } from "@/lib/api/medications-prisma";

export async function POST(request: NextRequest) {
  try {
    const administrationData = await request.json();

    if (
      !administrationData.prescriptionId ||
      !administrationData.patientId ||
      !administrationData.administeredById
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: prescriptionId, patientId, administeredById",
        },
        { status: 400 }
      );
    }

    const administration = await recordMedicationAdministration({
      prescriptionId: administrationData.prescriptionId,
      patientId: administrationData.patientId,
      administeredById: administrationData.administeredById,
      scheduledTime: new Date(administrationData.scheduledTime),
      administeredTime: administrationData.administeredTime
        ? new Date(administrationData.administeredTime)
        : undefined,
      status: administrationData.status || "ADMINISTERED",
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
