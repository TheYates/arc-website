import { NextRequest, NextResponse } from "next/server";
import { getMedicationAdministrationsByPatient } from "@/lib/api/medications-prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const administrations = await getMedicationAdministrationsByPatient(
      patientId
    );
    return NextResponse.json({ administrations });
  } catch (error) {
    console.error("Get administrations API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
