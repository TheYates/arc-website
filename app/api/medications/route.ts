import { NextRequest, NextResponse } from "next/server";
import { createMedication } from "@/lib/api/medications-prisma";

// POST /api/medications - Create new medication prescription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      prescribedBy,
      medicationName,
      dosage,
      frequency,
      route,
      startDate,
      endDate,
      instructions,
      priority = 'medium',
      category = 'other'
    } = body;

    // Validate required fields
    if (!patientId || !prescribedBy || !medicationName || !dosage || !frequency) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: patientId, prescribedBy, medicationName, dosage, frequency' 
        },
        { status: 400 }
      );
    }

    // Create medication data
    const medicationData = {
      patientId,
      prescribedBy,
      medicationName: medicationName.trim(),
      dosage: dosage.trim(),
      frequency,
      route: route || 'oral',
      startDate: startDate || new Date().toISOString(),
      endDate,
      instructions: instructions?.trim(),
      isActive: true,
      isPRN: frequency === 'as_needed',
      priority,
      category,
      lastModifiedBy: prescribedBy
    };

    const result = await createMedication(medicationData);

    if (!result) {
      throw new Error('Failed to create medication');
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error creating medication:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create medication prescription' 
      },
      { status: 500 }
    );
  }
}
