import { NextRequest, NextResponse } from "next/server";
import { getMedications } from "@/lib/api/medications-sqlite";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const medications = getMedications(patientId);
    return NextResponse.json({ medications });
  } catch (error) {
    console.error("Get medications API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
