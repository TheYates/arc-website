import { NextRequest, NextResponse } from 'next/server';
import { assignCaregiverToPatient } from '@/lib/api/patients-prisma';

// POST /api/admin/assignments - Create assignment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, caregiverId, reviewerId, type } = body;

    if (!patientId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, type' },
        { status: 400 }
      );
    }

    if (type === 'caregiver' && !caregiverId) {
      return NextResponse.json(
        { error: 'caregiverId is required for caregiver assignments' },
        { status: 400 }
      );
    }

    if (type === 'reviewer' && !reviewerId) {
      return NextResponse.json(
        { error: 'reviewerId is required for reviewer assignments' },
        { status: 400 }
      );
    }

    let success = false;

    if (type === 'caregiver') {
      success = await assignCaregiverToPatient(caregiverId, patientId);
    } else if (type === 'reviewer') {
      // Handle reviewer assignment
      const { prisma } = require('@/lib/database/postgresql');
      
      try {
        // Deactivate any existing reviewer assignments for this patient
        await prisma.reviewerAssignment.updateMany({
          where: {
            patientId: patientId,
            isActive: true,
          },
          data: {
            isActive: false,
          },
        });

        // Create new reviewer assignment
        await prisma.reviewerAssignment.create({
          data: {
            patientId: patientId,
            reviewerId: reviewerId,
            isActive: true,
          },
        });
        
        success = true;
      } catch (error) {
        console.error('Reviewer assignment error:', error);
        success = false;
      }
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to create assignment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Assignment created successfully',
      assignment: { patientId, caregiverId, reviewerId, type }
    });

  } catch (error) {
    console.error('Failed to create assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}