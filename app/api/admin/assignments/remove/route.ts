import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/admin/assignments/remove - Remove assignments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, type } = body;

    if (!patientId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, type' },
        { status: 400 }
      );
    }

    let success = false;

    if (type === 'caregiver') {
      // Remove all caregiver assignments for this patient
      await prisma.caregiverAssignment.updateMany({
        where: {
          patientId: patientId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
      success = true;
    }
    else if (type === 'reviewer') {
      // Remove all reviewer assignments for this patient
      await prisma.reviewerAssignment.updateMany({
        where: {
          patientId: patientId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
      success = true;
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to remove assignment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Assignment removed successfully',
      patientId,
      type
    });

  } catch (error) {
    console.error('Failed to remove assignment:', error);
    return NextResponse.json(
      { error: `Failed to remove assignment: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}