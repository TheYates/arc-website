import { NextRequest, NextResponse } from "next/server";
import { getMedicationAdministrations } from "@/lib/api/medications-sqlite";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const administrations = getMedicationAdministrations(patientId);
    return NextResponse.json({ administrations });
  } catch (error) {
    console.error("Get administrations API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
