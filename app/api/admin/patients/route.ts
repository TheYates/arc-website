import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/postgresql';
import { generateTempPassword, hashPassword } from '@/lib/utils/password';

// GET /api/admin/patients - Get all patients
export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
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
      },
      orderBy: {
        assignedDate: 'desc'
      }
    });

    // Transform the data to match our Patient type
    const transformedPatients = patients.map((patient: any) => ({
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
    }));

    return NextResponse.json({ patients: transformedPatients });
  } catch (error) {
    console.error('Failed to fetch patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

// POST /api/admin/patients - Create new patient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      firstName,
      lastName, 
      email, 
      phone, 
      address,
      dateOfBirth,
      gender,
      bloodType,
      heightCm,
      weightKg,
      careLevel,
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactPhone,
      insuranceProvider,
      insurancePolicyNumber,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Generate temporary password and hash it
    const tempPassword = generateTempPassword(firstName);
    const hashedPassword = await hashPassword(tempPassword);

    // Create user first, then patient
    const result = await prisma.$transaction(async (tx) => {
      // Create user record
      const user = await tx.user.create({
        data: {
          email,
          username: email.split('@')[0] + '_patient', // Simple username generation
          passwordHash: hashedPassword,
          mustChangePassword: true, // Force password change on first login
          firstName,
          lastName,
          phone,
          address: address || null,
          role: 'PATIENT',
          isEmailVerified: false,
          isActive: true,
          profileComplete: true,
        }
      });

      // Create patient record
      const patient = await tx.patient.create({
        data: {
          userId: user.id,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender: gender ? gender.toUpperCase() : null,
          bloodType: bloodType || null,
          heightCm: heightCm ? parseInt(heightCm) : null,
          weightKg: weightKg ? parseFloat(weightKg) : null,
          careLevel: careLevel ? careLevel.toUpperCase() : 'MEDIUM',
          status: 'STABLE',
          emergencyContactName: emergencyContactName || null,
          emergencyContactRelationship: emergencyContactRelationship || null,
          emergencyContactPhone: emergencyContactPhone || null,
          medicalRecordNumber: `ARC-PAT-${Date.now()}`, // Simple MRN generation
          insuranceProvider: insuranceProvider || null,
          insurancePolicyNumber: insurancePolicyNumber || null,
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

    return NextResponse.json({ 
      patient: transformedPatient,
      tempPassword: tempPassword, // Return temp password for admin to share with patient
      message: `Patient created successfully. Temporary password: ${tempPassword}`
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create patient:', error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}