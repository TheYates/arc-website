import { prisma } from '@/lib/database/postgresql'
import { VitalSigns as PrismaVitalSigns, TemperatureUnit, BloodSugarType } from '@prisma/client'

export interface CreateVitalSignsData {
  patientId: string
  recordedById: string
  systolicBp?: number
  diastolicBp?: number
  heartRate?: number
  temperature?: number
  temperatureUnit?: TemperatureUnit
  oxygenSaturation?: number
  respiratoryRate?: number
  weightKg?: number
  heightCm?: number
  bloodSugar?: number
  bloodSugarType?: BloodSugarType
  painLevel?: number
  notes?: string
}

export interface VitalSignsWithRecorder extends PrismaVitalSigns {
  recordedBy?: {
    id: string
    firstName: string
    lastName: string
  } | null
}

// Get vital signs for a patient
export async function getVitalSignsByPatientId(patientId: string): Promise<VitalSignsWithRecorder[]> {
  try {
    return await prisma.vitalSigns.findMany({
      where: { patientId },
      include: {
        recordedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { recordedDate: 'desc' },
    })
  } catch (error) {
    console.error('Get vital signs error:', error)
    return []
  }
}

// Create new vital signs record
export async function createVitalSigns(data: CreateVitalSignsData): Promise<PrismaVitalSigns | null> {
  try {
    return await prisma.vitalSigns.create({
      data: {
        patientId: data.patientId,
        recordedById: data.recordedById,
        systolicBp: data.systolicBp,
        diastolicBp: data.diastolicBp,
        heartRate: data.heartRate,
        temperature: data.temperature,
        temperatureUnit: data.temperatureUnit || 'C',
        oxygenSaturation: data.oxygenSaturation,
        respiratoryRate: data.respiratoryRate,
        weightKg: data.weightKg,
        heightCm: data.heightCm,
        bloodSugar: data.bloodSugar,
        bloodSugarType: data.bloodSugarType,
        painLevel: data.painLevel,
        notes: data.notes,
      },
    })
  } catch (error) {
    console.error('Create vital signs error:', error)
    return null
  }
}

// Get latest vital signs for a patient
export async function getLatestVitalSigns(patientId: string): Promise<VitalSignsWithRecorder | null> {
  try {
    return await prisma.vitalSigns.findFirst({
      where: { patientId },
      include: {
        recordedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { recordedDate: 'desc' },
    })
  } catch (error) {
    console.error('Get latest vital signs error:', error)
    return null
  }
}

// Update vital signs record
export async function updateVitalSigns(
  id: string,
  data: Partial<CreateVitalSignsData>
): Promise<PrismaVitalSigns | null> {
  try {
    return await prisma.vitalSigns.update({
      where: { id },
      data: {
        systolicBp: data.systolicBp,
        diastolicBp: data.diastolicBp,
        heartRate: data.heartRate,
        temperature: data.temperature,
        temperatureUnit: data.temperatureUnit,
        oxygenSaturation: data.oxygenSaturation,
        respiratoryRate: data.respiratoryRate,
        weightKg: data.weightKg,
        heightCm: data.heightCm,
        bloodSugar: data.bloodSugar,
        bloodSugarType: data.bloodSugarType,
        painLevel: data.painLevel,
        notes: data.notes,
      },
    })
  } catch (error) {
    console.error('Update vital signs error:', error)
    return null
  }
}

// Delete vital signs record
export async function deleteVitalSigns(id: string): Promise<boolean> {
  try {
    await prisma.vitalSigns.delete({
      where: { id },
    })
    return true
  } catch (error) {
    console.error('Delete vital signs error:', error)
    return false
  }
}
