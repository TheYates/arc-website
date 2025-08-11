import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/postgresql';

// GET /api/admin/patients/[id] - Get specific patient
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
            createdAt: true,
          }
        },
        caregiverAssignments: {
          where: {
            isActive: true
          },
          include: {
            caregiver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        },
        reviewerAssignments: {
          where: {
            isActive: true
          },
          include: {
            reviewer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        }
      }
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Transform the data
    const transformedPatient = {
      id: patient.id,
      firstName: patient.user.firstName,
      lastName: patient.user.lastName,
      email: patient.user.email,
      phone: patient.user.phone,
      address: patient.user.address,
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.toISOString().split('T')[0] : undefined,
      gender: patient.gender?.toLowerCase(),
      bloodType: patient.bloodType,
      heightCm: patient.heightCm,
      weightKg: patient.weightKg,
      careLevel: patient.careLevel?.toLowerCase(),
      status: patient.status?.toLowerCase(),
      assignedDate: patient.assignedDate,
      emergencyContactName: patient.emergencyContactName,
      emergencyContactRelationship: patient.emergencyContactRelationship,
      emergencyContactPhone: patient.emergencyContactPhone,
      medicalRecordNumber: patient.medicalRecordNumber,
      insuranceProvider: patient.insuranceProvider,
      insurancePolicyNumber: patient.insurancePolicyNumber,
      createdAt: patient.user.createdAt.toISOString(),
      // Add caregiver info if assigned
      assignedCaregiverId: patient.caregiverAssignments.length > 0 ? patient.caregiverAssignments[0].caregiver.id : undefined,
      assignedCaregiver: patient.caregiverAssignments.length > 0 ? {
        id: patient.caregiverAssignments[0].caregiver.id,
        name: `${patient.caregiverAssignments[0].caregiver.firstName} ${patient.caregiverAssignments[0].caregiver.lastName}`,
        email: patient.caregiverAssignments[0].caregiver.email,
        assignedAt: patient.caregiverAssignments[0].assignedAt.toISOString(),
        assignedBy: '', // TODO: Add assignedBy field to schema if needed
      } : undefined,
      // Add reviewer info if assigned
      assignedReviewerId: patient.reviewerAssignments.length > 0 ? patient.reviewerAssignments[0].reviewer.id : undefined,
      assignedReviewer: patient.reviewerAssignments.length > 0 ? {
        id: patient.reviewerAssignments[0].reviewer.id,
        name: `${patient.reviewerAssignments[0].reviewer.firstName} ${patient.reviewerAssignments[0].reviewer.lastName}`,
        email: patient.reviewerAssignments[0].reviewer.email,
        assignedAt: patient.reviewerAssignments[0].assignedAt.toISOString(),
        assignedBy: '', // TODO: Add assignedBy field to schema if needed
      } : undefined,
    };

    return NextResponse.json({ patient: transformedPatient });
  } catch (error) {
    console.error('Failed to fetch patient:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/patients/[id] - Update patient
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      firstName,
      lastName,
      phone,
      address,
      dateOfBirth,
      gender,
      bloodType,
      heightCm,
      weightKg,
      careLevel,
      status,
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactPhone,
      insuranceProvider,
      insurancePolicyNumber,
    } = body;

    // Check if patient exists
    const existingPatient = await prisma.patient.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingPatient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Update both user and patient records in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user record
      const user = await tx.user.update({
        where: { id: existingPatient.userId },
        data: {
          firstName: firstName || existingPatient.user.firstName,
          lastName: lastName || existingPatient.user.lastName,
          phone: phone || existingPatient.user.phone,
          address: address !== undefined ? address : existingPatient.user.address,
          updatedAt: new Date(),
        }
      });

      // Update patient record
      const patient = await tx.patient.update({
        where: { id },
        data: {
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : existingPatient.dateOfBirth,
          gender: gender ? gender.toUpperCase() : existingPatient.gender,
          bloodType: bloodType !== undefined ? bloodType : existingPatient.bloodType,
          heightCm: heightCm ? parseInt(heightCm) : existingPatient.heightCm,
          weightKg: weightKg ? parseFloat(weightKg) : existingPatient.weightKg,
          careLevel: careLevel ? careLevel.toUpperCase() : existingPatient.careLevel,
          status: status ? status.toUpperCase() : existingPatient.status,
          emergencyContactName: emergencyContactName !== undefined ? emergencyContactName : existingPatient.emergencyContactName,
          emergencyContactRelationship: emergencyContactRelationship !== undefined ? emergencyContactRelationship : existingPatient.emergencyContactRelationship,
          emergencyContactPhone: emergencyContactPhone !== undefined ? emergencyContactPhone : existingPatient.emergencyContactPhone,
          insuranceProvider: insuranceProvider !== undefined ? insuranceProvider : existingPatient.insuranceProvider,
          insurancePolicyNumber: insurancePolicyNumber !== undefined ? insurancePolicyNumber : existingPatient.insurancePolicyNumber,
        }
      });

      return { user, patient };
    });

    // Transform response
    const transformedPatient = {
      id: result.patient.id,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      email: result.user.email,
      phone: result.user.phone,
      address: result.user.address,
      dateOfBirth: result.patient.dateOfBirth ? result.patient.dateOfBirth.toISOString().split('T')[0] : undefined,
      gender: result.patient.gender?.toLowerCase(),
      bloodType: result.patient.bloodType,
      heightCm: result.patient.heightCm,
      weightKg: result.patient.weightKg,
      careLevel: result.patient.careLevel?.toLowerCase(),
      status: result.patient.status?.toLowerCase(),
      emergencyContactName: result.patient.emergencyContactName,
      emergencyContactRelationship: result.patient.emergencyContactRelationship,
      emergencyContactPhone: result.patient.emergencyContactPhone,
      medicalRecordNumber: result.patient.medicalRecordNumber,
      insuranceProvider: result.patient.insuranceProvider,
      insurancePolicyNumber: result.patient.insurancePolicyNumber,
      createdAt: result.user.createdAt.toISOString(),
    };

    return NextResponse.json({ patient: transformedPatient });
  } catch (error) {
    console.error('Failed to update patient - Full error:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: `Failed to update patient: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}