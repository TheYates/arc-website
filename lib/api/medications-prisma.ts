import { prisma } from '@/lib/database/postgresql'
import { MedicationCatalog, Prescription, MedicationAdministration, PrescriptionStatus, MedicationAdministrationStatus } from '@prisma/client'

export interface CreateMedicationData {
  name: string
  genericName?: string
  drugClass?: string
  category?: string
  dosageForms?: string[]
  strengthOptions?: string[]
  routeOfAdministration?: string
}

export interface CreatePrescriptionData {
  patientId: string
  medicationId: string
  prescribedById: string
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
  medication: MedicationCatalog
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
export async function getAllMedications(): Promise<MedicationCatalog[]> {
  try {
    return await prisma.medicationCatalog.findMany({
      where: { is_active: true },
      orderBy: [
        { is_common: 'desc' },
        { name: 'asc' },
      ],
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
export async function createMedication(data: CreateMedicationData): Promise<MedicationCatalog | null> {
  try {
    return await prisma.medicationCatalog.create({
      data: {
        name: data.name,
        generic_name: data.genericName,
        drug_class: data.drugClass,
        category: data.category,
        dosage_forms: data.dosageForms || [],
        strength_options: data.strengthOptions || [],
        route_of_administration: data.routeOfAdministration,
        is_active: true,
        is_common: false,
      },
    })
  } catch (error) {
    console.error('Create medication error:', error)
    return null
  }
}

// Update medication
export async function updateMedication(id: string, data: Partial<CreateMedicationData>): Promise<MedicationCatalog | null> {
  try {
    const updateData: any = {}
    if (data.name) updateData.name = data.name
    if (data.genericName) updateData.generic_name = data.genericName
    if (data.drugClass) updateData.drug_class = data.drugClass
    if (data.category) updateData.category = data.category
    if (data.dosageForms) updateData.dosage_forms = data.dosageForms
    if (data.strengthOptions) updateData.strength_options = data.strengthOptions
    if (data.routeOfAdministration) updateData.route_of_administration = data.routeOfAdministration

    return await prisma.medicationCatalog.update({
      where: { id },
      data: updateData,
    })
  } catch (error) {
    console.error('Update medication error:', error)
    return null
  }
}

// Search medications
export async function searchMedications(query: string): Promise<MedicationCatalog[]> {
  try {
    return await prisma.medicationCatalog.findMany({
      where: {
        AND: [
          { is_active: true },
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                generic_name: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      },
      orderBy: [
        { is_common: 'desc' },
        { name: 'asc' },
      ],
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

// Transform prescription data to medication format for UI compatibility
function transformPrescriptionToMedication(prescription: any): Medication {
  return {
    id: prescription.id,
    patientId: prescription.patientId || '',
    prescribedBy: prescription.prescribedBy?.id || '',
    medicationName: prescription.medication?.name || 'Unknown Medication',
    genericName: prescription.medication?.generic_name,
    dosage: prescription.dosage || 'Not specified',
    frequency: prescription.frequency || 'Not specified',
    route: prescription.route || 'oral',
    startDate: prescription.startDate ? new Date(prescription.startDate).toISOString() : new Date().toISOString(),
    endDate: prescription.endDate ? new Date(prescription.endDate).toISOString() : undefined,
    instructions: prescription.instructions || '',
    isActive: prescription.status === 'APPROVED' || prescription.status === 'DISPENSED',
    isPRN: false,
    priority: "medium" as const,
    category: "other" as const,
    status: prescription.status,
    createdAt: prescription.createdAt ? new Date(prescription.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: prescription.updatedAt ? new Date(prescription.updatedAt).toISOString() : new Date().toISOString(),
    lastModifiedBy: prescription.prescribedBy?.id || '',
    notes: prescription.notes,
  };
}

// Get prescriptions by patient - optimized and transformed for UI
export async function getPrescriptionsByPatient(patientId: string): Promise<Medication[]> {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        patientId,
        status: { not: 'CANCELLED' } // Exclude cancelled prescriptions
      },
      select: {
        id: true,
        patientId: true,
        dosage: true,
        frequency: true,
        route: true,
        instructions: true,
        status: true,
        prescribedDate: true,
        startDate: true,
        endDate: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        medication: {
          select: {
            id: true,
            name: true,
            generic_name: true,
            drug_class: true,
            dosage_forms: true,
            strength_options: true,
            route_of_administration: true,
          }
        },
        prescribedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to recent prescriptions
    });

    // Transform prescriptions to medication format for UI compatibility
    return prescriptions.map(transformPrescriptionToMedication);
  } catch (error) {
    console.error('Get prescriptions by patient error:', error)
    return []
  }
}

// Create prescription
export async function createPrescription(data: CreatePrescriptionData): Promise<Prescription | null> {
  try {
    console.log('💊 Creating prescription with simplified data:', data)

    const prescriptionData = {
      patientId: data.patientId,
      medicationId: data.medicationId,
      prescribedById: data.prescribedById,
      instructions: data.instructions || '',
      startDate: data.startDate,
      endDate: data.endDate,
      notes: data.notes,
      monitoringRequired: data.monitoringRequired || false,
      monitoringInstructions: data.monitoringInstructions,
      costEstimate: data.costEstimate,
      insuranceCovered: data.insuranceCovered ?? true,
      status: 'DRAFT',
    }

    return await prisma.prescription.create({
      data: prescriptionData,
    })
  } catch (error) {
    console.error('Create prescription error:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
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

// Get medication administrations by patient - optimized
export async function getMedicationAdministrationsByPatient(patientId: string): Promise<MedicationAdministration[]> {
  try {
    return await prisma.medicationAdministration.findMany({
      where: { patientId },
      select: {
        id: true,
        prescriptionId: true,
        scheduledTime: true,
        administeredTime: true,
        status: true,
        dosageGiven: true,
        notes: true,
        sideEffectsObserved: true,
        createdAt: true,
        prescription: {
          select: {
            id: true,
            instructions: true,
            medication: {
              select: {
                id: true,
                name: true,
                generic_name: true,
              }
            },
          },
        },
        administeredBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { scheduledTime: 'desc' },
      take: 100, // Limit to recent administrations
    })
  } catch (error) {
    console.error('Get medication administrations by patient error:', error)
    return []
  }
}
