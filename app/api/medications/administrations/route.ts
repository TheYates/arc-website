import { NextRequest, NextResponse } from 'next/server';
import { recordMedicationAdministration } from '@/lib/api/medications-sqlite';

export async function POST(request: NextRequest) {
  try {
    const administrationData = await request.json();

    if (!administrationData.medicationId || !administrationData.patientId || !administrationData.caregiverId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const administration = recordMedicationAdministration(administrationData);
    return NextResponse.json({ administration });
  } catch (error) {
    console.error('Record administration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
