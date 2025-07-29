import { NextRequest, NextResponse } from "next/server";
import { getPatientsByCaregiver } from "@/lib/api/patients-sqlite";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caregiverId: string }> }
) {
  try {
    const { caregiverId } = await params;
    const patients = getPatientsByCaregiver(caregiverId);
    return NextResponse.json({ patients });
  } catch (error) {
    console.error("Get patients by caregiver API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
