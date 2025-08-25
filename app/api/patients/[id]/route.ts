import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PUT /api/patients/[id] - Update patient (for caregiver/reviewer access)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Limited fields that non-admin users can update
    const { 
      phone,
      address,
      heightCm,
      weightKg,
      careLevel,
      status,
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactPhone,
      medicalHistory,
      allergies,
      currentMedications,
    } = body;

    // Check if patient exists
    const existingPatient = await prisma.patient.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingPatient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Update both user and patient records in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user record (limited fields)
      const user = await tx.user.update({
        where: { id: existingPatient.userId },
        data: {
          phone: phone !== undefined ? phone : existingPatient.user.phone,
          address: address !== undefined ? address : existingPatient.user.address,
          updatedAt: new Date(),
        }
      });

      // Update patient record (limited fields)
      const patient = await tx.patient.update({
        where: { id },
        data: {
          heightCm: heightCm ? parseInt(heightCm) : existingPatient.heightCm,
          weightKg: weightKg ? parseFloat(weightKg) : existingPatient.weightKg,
          careLevel: careLevel ? careLevel.toUpperCase() : existingPatient.careLevel,
          status: status ? status.toUpperCase() : existingPatient.status,
          emergencyContactName: emergencyContactName !== undefined ? emergencyContactName : existingPatient.emergencyContactName,
          emergencyContactRelationship: emergencyContactRelationship !== undefined ? emergencyContactRelationship : existingPatient.emergencyContactRelationship,
          emergencyContactPhone: emergencyContactPhone !== undefined ? emergencyContactPhone : existingPatient.emergencyContactPhone,
          medicalHistory: medicalHistory !== undefined ? medicalHistory : existingPatient.medicalHistory,
          allergies: allergies !== undefined ? allergies : existingPatient.allergies,
          currentMedications: currentMedications !== undefined ? currentMedications : existingPatient.currentMedications,
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
      dateOfBirth: result.patient.dateOfBirth?.toISOString(),
      gender: result.patient.gender,
      bloodType: result.patient.bloodType,
      heightCm: result.patient.heightCm,
      weightKg: result.patient.weightKg,
      careLevel: result.patient.careLevel?.toLowerCase(),
      status: result.patient.status?.toLowerCase(),
      emergencyContactName: result.patient.emergencyContactName,
      emergencyContactRelationship: result.patient.emergencyContactRelationship,
      emergencyContactPhone: result.patient.emergencyContactPhone,
      medicalHistory: result.patient.medicalHistory,
      allergies: result.patient.allergies,
      currentMedications: result.patient.currentMedications,
      insuranceProvider: result.patient.insuranceProvider,
      insurancePolicyNumber: result.patient.insurancePolicyNumber,
    };

    return NextResponse.json({
      success: true,
      data: transformedPatient
    });

  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update patient information' 
      },
      { status: 500 }
    );
  }
}