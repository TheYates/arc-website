import { NextRequest, NextResponse } from "next/server";
import { getPrescriptionsByPatient } from "@/lib/api/medications-prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const prescriptions = await getPrescriptionsByPatient(patientId);
    return NextResponse.json({ prescriptions });
  } catch (error) {
    console.error("Get medications API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
