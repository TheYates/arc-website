import { prisma } from '@/lib/database/postgresql'
import { Patient, User, CareLevel, PatientStatus, Gender } from '@prisma/client'

export interface CreatePatientData {
  userId: string
  dateOfBirth?: Date
  gender?: Gender
  bloodType?: string
  heightCm?: number
  weightKg?: number
  careLevel?: CareLevel
  status?: PatientStatus
  emergencyContactName?: string
  emergencyContactRelationship?: string
  emergencyContactPhone?: string
  medicalRecordNumber?: string
  insuranceProvider?: string
  insurancePolicyNumber?: string
  primaryPhysician?: string
  allergies?: string[]
  chronicConditions?: string[]
  currentMedications?: string[]
  medicalHistory?: string
  specialInstructions?: string
}

export interface PatientWithUser extends Patient {
  user: User
}

// Get all patients
export async function getAllPatients(): Promise<PatientWithUser[]> {
  try {
    return await prisma.patient.findMany({
      include: {
        user: true,
      },
      orderBy: {
        user: {
          lastName: 'asc',
        },
      },
    })
  } catch (error) {
    console.error('Get all patients error:', error)
    return []
  }
}

// Get patient by ID - optimized for basic patient info only
export async function getPatientById(id: string): Promise<PatientWithUser | null> {
  try {
    return await prisma.patient.findUnique({
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
          }
        },
        caregiverAssignments: {
          where: { isActive: true },
          select: {
            id: true,
            assignedAt: true,
            caregiver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          },
          take: 1, // Only get the active caregiver
        },
        reviewerAssignments: {
          where: { isActive: true },
          select: {
            id: true,
            assignedAt: true,
            reviewer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          },
          take: 1, // Only get the active reviewer
        },
      },
    })
  } catch (error) {
    console.error('Get patient by ID error:', error)
    return null
  }
}

// Get patient by ID with full details (for admin use)
export async function getPatientByIdWithDetails(id: string): Promise<PatientWithUser | null> {
  try {
    return await prisma.patient.findUnique({
      where: { id },
      include: {
        user: true,
        caregiverAssignments: {
          include: {
            caregiver: true,
          },
        },
        prescriptions: {
          include: {
            medication: true,
            prescribedBy: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        vitalSigns: {
          orderBy: { recordedDate: 'desc' },
          take: 10,
        },
        medicalReviews: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })
  } catch (error) {
    console.error('Get patient by ID with details error:', error)
    return null
  }
}

// Get patient by user ID
export async function getPatientByUserId(userId: string): Promise<PatientWithUser | null> {
  try {
    return await prisma.patient.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    })
  } catch (error) {
    console.error('Get patient by user ID error:', error)
    return null
  }
}

// Create patient
export async function createPatient(data: CreatePatientData): Promise<Patient | null> {
  try {
    return await prisma.patient.create({
      data: {
        userId: data.userId,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        bloodType: data.bloodType,
        heightCm: data.heightCm,
        weightKg: data.weightKg,
        careLevel: data.careLevel || 'MEDIUM',
        status: data.status || 'STABLE',
        emergencyContactName: data.emergencyContactName,
        emergencyContactRelationship: data.emergencyContactRelationship,
        emergencyContactPhone: data.emergencyContactPhone,
        medicalRecordNumber: data.medicalRecordNumber,
        insuranceProvider: data.insuranceProvider,
        insurancePolicyNumber: data.insurancePolicyNumber,
        primaryPhysician: data.primaryPhysician,
        allergies: data.allergies || [],
        chronicConditions: data.chronicConditions || [],
        currentMedications: data.currentMedications || [],
        medicalHistory: data.medicalHistory,
        specialInstructions: data.specialInstructions,
      },
    })
  } catch (error) {
    console.error('Create patient error:', error)
    return null
  }
}

// Update patient
export async function updatePatient(id: string, data: Partial<CreatePatientData>): Promise<Patient | null> {
  try {
    return await prisma.patient.update({
      where: { id },
      data,
    })
  } catch (error) {
    console.error('Update patient error:', error)
    return null
  }
}

// Delete patient
export async function deletePatient(id: string): Promise<boolean> {
  try {
    await prisma.patient.delete({
      where: { id },
    })
    return true
  } catch (error) {
    console.error('Delete patient error:', error)
    return false
  }
}

// Get patients by caregiver
export async function getPatientsByCaregiver(caregiverId: string): Promise<PatientWithUser[]> {
  try {
    return await prisma.patient.findMany({
      where: {
        caregiverAssignments: {
          some: {
            caregiverId,
            isActive: true,
          },
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        user: {
          lastName: 'asc',
        },
      },
    })
  } catch (error) {
    console.error('Get patients by caregiver error:', error)
    return []
  }
}

// Get patients by reviewer
export async function getPatientsByReviewer(reviewerId: string): Promise<PatientWithUser[]> {
  try {
    return await prisma.patient.findMany({
      where: {
        reviewerAssignments: {
          some: {
            reviewerId,
            isActive: true,
          },
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        user: {
          lastName: 'asc',
        },
      },
    })
  } catch (error) {
    console.error('Get patients by reviewer error:', error)
    return []
  }
}

// Assign caregiver to patient
export async function assignCaregiverToPatient(caregiverId: string, patientId: string): Promise<boolean> {
  try {
    await prisma.caregiverAssignment.upsert({
      where: {
        caregiverId_patientId: {
          caregiverId,
          patientId,
        },
      },
      update: {
        isActive: true,
      },
      create: {
        caregiverId,
        patientId,
        isActive: true,
      },
    })
    return true
  } catch (error) {
    console.error('Assign caregiver error:', error)
    return false
  }
}

// Remove caregiver from patient
export async function removeCaregiverFromPatient(caregiverId: string, patientId: string): Promise<boolean> {
  try {
    await prisma.caregiverAssignment.updateMany({
      where: {
        caregiverId,
        patientId,
      },
      data: {
        isActive: false,
      },
    })
    return true
  } catch (error) {
    console.error('Remove caregiver error:', error)
    return false
  }
}

// Search patients
export async function searchPatients(query: string): Promise<PatientWithUser[]> {
  try {
    return await prisma.patient.findMany({
      where: {
        OR: [
          {
            user: {
              firstName: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
          {
            user: {
              lastName: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
          {
            user: {
              email: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
          {
            medicalRecordNumber: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        user: true,
      },
      orderBy: {
        user: {
          lastName: 'asc',
        },
      },
    })
  } catch (error) {
    console.error('Search patients error:', error)
    return []
  }
}
