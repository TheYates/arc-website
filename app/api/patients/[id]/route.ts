import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { authenticateRequest } from "@/lib/api/auth";

// GET /api/patients/[id] - Get patient by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Authenticate the request
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;

    // Find patient with user data
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
            updatedAt: true,
          }
        }
      }
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Check authorization based on user role
    let hasAccess = false;

    if (user.role === "admin" || user.role === "super_admin") {
      // Admins can access all patients
      hasAccess = true;
    } else if (user.role === "patient") {
      // Patients can only access their own record
      hasAccess = patient.userId === user.id;
    } else if (user.role === "caregiver") {
      // Check if caregiver is assigned to this patient
      const assignment = await prisma.caregiverAssignment.findFirst({
        where: {
          caregiverId: user.id,
          patientId: id,
          isActive: true,
        },
      });
      hasAccess = !!assignment;
    } else if (user.role === "reviewer") {
      // Check if reviewer is assigned to this patient
      const assignment = await prisma.reviewerAssignment.findFirst({
        where: {
          reviewerId: user.id,
          patientId: id,
          isActive: true,
        },
      });
      hasAccess = !!assignment;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Transform response to match expected format
    const transformedPatient = {
      id: patient.id,
      firstName: patient.user.firstName,
      lastName: patient.user.lastName,
      email: patient.user.email,
      phone: patient.user.phone,
      address: patient.user.address,
      dateOfBirth: patient.dateOfBirth?.toISOString(),
      gender: patient.gender,
      bloodType: patient.bloodType,
      heightCm: patient.heightCm,
      weightKg: patient.weightKg,
      careLevel: patient.careLevel?.toLowerCase(),
      status: patient.status?.toLowerCase(),
      emergencyContactName: patient.emergencyContactName,
      emergencyContactRelationship: patient.emergencyContactRelationship,
      emergencyContactPhone: patient.emergencyContactPhone,
      medicalHistory: patient.medicalHistory,
      allergies: patient.allergies,
      currentMedications: patient.currentMedications,
      insuranceProvider: patient.insuranceProvider,
      insurancePolicyNumber: patient.insurancePolicyNumber,
      createdAt: patient.createdAt?.toISOString(),
      updatedAt: patient.updatedAt?.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: transformedPatient
    });

  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch patient information'
      },
      { status: 500 }
    );
  }
}

// PUT /api/patients/[id] - Update patient (for caregiver/reviewer access)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Authenticate the request
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;

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

    // Check authorization for updates
    let hasUpdateAccess = false;

    if (user.role === "admin" || user.role === "super_admin") {
      // Admins can update all patients
      hasUpdateAccess = true;
    } else if (user.role === "patient") {
      // Patients can only update their own record
      hasUpdateAccess = existingPatient.userId === user.id;
    } else if (user.role === "caregiver") {
      // Check if caregiver is assigned to this patient
      const assignment = await prisma.caregiverAssignment.findFirst({
        where: {
          caregiverId: user.id,
          patientId: id,
          isActive: true,
        },
      });
      hasUpdateAccess = !!assignment;
    } else if (user.role === "reviewer") {
      // Check if reviewer is assigned to this patient
      const assignment = await prisma.reviewerAssignment.findFirst({
        where: {
          reviewerId: user.id,
          patientId: id,
          isActive: true,
        },
      });
      hasUpdateAccess = !!assignment;
    }

    if (!hasUpdateAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
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