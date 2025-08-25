import { NextRequest, NextResponse } from "next/server";
import { getMedicationsByPatient } from "@/lib/api/medications-prisma";

// GET /api/patients/[id]/medications - Get medications for a specific patient
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const medications = await getMedicationsByPatient(id);

    return NextResponse.json({
      success: true,
      data: medications || []
    });

  } catch (error) {
    console.error('Error fetching patient medications:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch patient medications' 
      },
      { status: 500 }
    );
  }
}
