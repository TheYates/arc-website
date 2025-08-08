import { prisma } from '@/lib/database/postgresql'
import { Medication, Prescription, MedicationAdministration, PrescriptionStatus, MedicationAdministrationStatus } from '@prisma/client'

export interface CreateMedicationData {
  name: string
  genericName?: string
  brandNames?: string[]
  drugClass?: string
  dosageForms?: string[]
  strengthOptions?: string[]
  routeOfAdministration?: string
  contraindications?: string[]
  sideEffects?: string[]
  drugInteractions?: string[]
  pregnancyCategory?: string
  controlledSubstanceSchedule?: string
}

export interface CreatePrescriptionData {
  patientId: string
  medicationId: string
  prescribedById: string
  dosage: string
  frequency: string
  duration?: string
  instructions?: string
  startDate?: Date
  endDate?: Date
  notes?: string
  monitoringRequired?: boolean
  monitoringInstructions?: string
  costEstimate?: number
  insuranceCovered?: boolean
}

export interface PrescriptionWithDetails extends Prescription {
  patient: {
    id: string
    user: {
      firstName: string
      lastName: string
      email: string
    }
  }
  medication: Medication
  prescribedBy: {
    firstName: string
    lastName: string
    email: string
  }
  approvedBy?: {
    firstName: string
    lastName: string
    email: string
  } | null
}

// Get all medications
export async function getAllMedications(): Promise<Medication[]> {
  try {
    return await prisma.medication.findMany({
      orderBy: { name: 'asc' },
    })
  } catch (error) {
    console.error('Get all medications error:', error)
    return []
  }
}

// Get medication by ID
export async function getMedicationById(id: string): Promise<Medication | null> {
  try {
    return await prisma.medication.findUnique({
      where: { id },
    })
  } catch (error) {
    console.error('Get medication by ID error:', error)
    return null
  }
}

// Create medication
export async function createMedication(data: CreateMedicationData): Promise<Medication | null> {
  try {
    return await prisma.medication.create({
      data: {
        name: data.name,
        genericName: data.genericName,
        brandNames: data.brandNames || [],
        drugClass: data.drugClass,
        dosageForms: data.dosageForms || [],
        strengthOptions: data.strengthOptions || [],
        routeOfAdministration: data.routeOfAdministration,
        contraindications: data.contraindications || [],
        sideEffects: data.sideEffects || [],
        drugInteractions: data.drugInteractions || [],
        pregnancyCategory: data.pregnancyCategory,
        controlledSubstanceSchedule: data.controlledSubstanceSchedule,
      },
    })
  } catch (error) {
    console.error('Create medication error:', error)
    return null
  }
}

// Update medication
export async function updateMedication(id: string, data: Partial<CreateMedicationData>): Promise<Medication | null> {
  try {
    return await prisma.medication.update({
      where: { id },
      data,
    })
  } catch (error) {
    console.error('Update medication error:', error)
    return null
  }
}

// Search medications
export async function searchMedications(query: string): Promise<Medication[]> {
  try {
    return await prisma.medication.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            genericName: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            brandNames: {
              has: query,
            },
          },
        ],
      },
      orderBy: { name: 'asc' },
    })
  } catch (error) {
    console.error('Search medications error:', error)
    return []
  }
}

// Get all prescriptions
export async function getAllPrescriptions(): Promise<PrescriptionWithDetails[]> {
  try {
    return await prisma.prescription.findMany({
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        medication: true,
        prescribedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Get all prescriptions error:', error)
    return []
  }
}

// Get prescriptions by patient
export async function getPrescriptionsByPatient(patientId: string): Promise<PrescriptionWithDetails[]> {
  try {
    return await prisma.prescription.findMany({
      where: { patientId },
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        medication: true,
        prescribedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Get prescriptions by patient error:', error)
    return []
  }
}

// Create prescription
export async function createPrescription(data: CreatePrescriptionData): Promise<Prescription | null> {
  try {
    return await prisma.prescription.create({
      data: {
        patientId: data.patientId,
        medicationId: data.medicationId,
        prescribedById: data.prescribedById,
        dosage: data.dosage,
        frequency: data.frequency,
        duration: data.duration,
        instructions: data.instructions,
        startDate: data.startDate,
        endDate: data.endDate,
        notes: data.notes,
        monitoringRequired: data.monitoringRequired || false,
        monitoringInstructions: data.monitoringInstructions,
        costEstimate: data.costEstimate,
        insuranceCovered: data.insuranceCovered ?? true,
        status: 'DRAFT',
      },
    })
  } catch (error) {
    console.error('Create prescription error:', error)
    return null
  }
}

// Update prescription status
export async function updatePrescriptionStatus(id: string, status: PrescriptionStatus, approvedById?: string): Promise<Prescription | null> {
  try {
    const updateData: any = { status }
    
    if (status === 'APPROVED' && approvedById) {
      updateData.approvedById = approvedById
      updateData.approvedDate = new Date()
    }
    
    if (status === 'DISPENSED') {
      updateData.dispensedDate = new Date()
    }

    return await prisma.prescription.update({
      where: { id },
      data: updateData,
    })
  } catch (error) {
    console.error('Update prescription status error:', error)
    return null
  }
}

// Record medication administration
export async function recordMedicationAdministration(data: {
  prescriptionId: string
  patientId: string
  administeredById: string
  scheduledTime: Date
  administeredTime?: Date
  status: MedicationAdministrationStatus
  dosageGiven?: string
  notes?: string
  sideEffectsObserved?: string
  vitalSigns?: any
}): Promise<MedicationAdministration | null> {
  try {
    return await prisma.medicationAdministration.create({
      data,
    })
  } catch (error) {
    console.error('Record medication administration error:', error)
    return null
  }
}

// Get medication administrations by patient
export async function getMedicationAdministrationsByPatient(patientId: string): Promise<MedicationAdministration[]> {
  try {
    return await prisma.medicationAdministration.findMany({
      where: { patientId },
      include: {
        prescription: {
          include: {
            medication: true,
          },
        },
        administeredBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { scheduledTime: 'desc' },
    })
  } catch (error) {
    console.error('Get medication administrations by patient error:', error)
    return []
  }
}
