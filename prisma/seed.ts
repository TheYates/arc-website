import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create default users
  const hashedPassword = await bcrypt.hash('password', 10)

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@arc.com' },
    update: {},
    create: {
      email: 'admin@arc.com',
      username: 'admin',
      passwordHash: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      isEmailVerified: true,
      profileComplete: true,
    },
  })

  // Create reviewer user
  const reviewer = await prisma.user.upsert({
    where: { email: 'reviewer@arc.com' },
    update: {},
    create: {
      email: 'reviewer@arc.com',
      username: 'reviewer',
      passwordHash: hashedPassword,
      firstName: 'Medical',
      lastName: 'Reviewer',
      role: 'REVIEWER',
      isEmailVerified: true,
      profileComplete: true,
    },
  })

  // Create caregiver user
  const caregiver = await prisma.user.upsert({
    where: { email: 'caregiver@arc.com' },
    update: {},
    create: {
      email: 'caregiver@arc.com',
      username: 'caregiver',
      passwordHash: hashedPassword,
      firstName: 'Care',
      lastName: 'Giver',
      role: 'CAREGIVER',
      isEmailVerified: true,
      profileComplete: true,
    },
  })

  // Create patient user
  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@arc.com' },
    update: {},
    create: {
      email: 'patient@arc.com',
      username: 'patient',
      passwordHash: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'PATIENT',
      isEmailVerified: true,
      profileComplete: true,
    },
  })

  // Create patient profile
  const patient = await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      userId: patientUser.id,
      dateOfBirth: new Date('1980-01-01'),
      gender: 'MALE',
      bloodType: 'O+',
      heightCm: 175,
      weightKg: 70.5,
      careLevel: 'MEDIUM',
      status: 'STABLE',
      emergencyContactName: 'Jane Doe',
      emergencyContactRelationship: 'Spouse',
      emergencyContactPhone: '+1-555-0123',
      medicalRecordNumber: 'MRN001',
      insuranceProvider: 'Health Insurance Co.',
      allergies: ['Penicillin', 'Shellfish'],
      chronicConditions: ['Hypertension'],
      currentMedications: ['Lisinopril 10mg'],
      medicalHistory: 'Patient has a history of hypertension, well controlled with medication.',
    },
  })

  // Create caregiver assignment
  await prisma.caregiverAssignment.upsert({
    where: {
      caregiverId_patientId: {
        caregiverId: caregiver.id,
        patientId: patient.id,
      },
    },
    update: {},
    create: {
      caregiverId: caregiver.id,
      patientId: patient.id,
    },
  })

  // Create sample medications
  const medication1 = await prisma.medication.upsert({
    where: { id: 'med-1' },
    update: {},
    create: {
      id: 'med-1',
      name: 'Lisinopril',
      genericName: 'Lisinopril',
      brandNames: ['Prinivil', 'Zestril'],
      drugClass: 'ACE Inhibitor',
      dosageForms: ['Tablet'],
      strengthOptions: ['2.5mg', '5mg', '10mg', '20mg'],
      routeOfAdministration: 'Oral',
      contraindications: ['Pregnancy', 'Angioedema'],
      sideEffects: ['Dry cough', 'Dizziness', 'Hyperkalemia'],
      drugInteractions: ['NSAIDs', 'Potassium supplements'],
      pregnancyCategory: 'D',
    },
  })

  const medication2 = await prisma.medication.upsert({
    where: { id: 'med-2' },
    update: {},
    create: {
      id: 'med-2',
      name: 'Metformin',
      genericName: 'Metformin',
      brandNames: ['Glucophage', 'Fortamet'],
      drugClass: 'Biguanide',
      dosageForms: ['Tablet', 'Extended Release'],
      strengthOptions: ['500mg', '850mg', '1000mg'],
      routeOfAdministration: 'Oral',
      contraindications: ['Kidney disease', 'Liver disease'],
      sideEffects: ['Nausea', 'Diarrhea', 'Lactic acidosis'],
      drugInteractions: ['Alcohol', 'Contrast dye'],
    },
  })

  console.log('✅ Database seeding completed!')
  console.log(`Created users: Admin, Reviewer, Caregiver, Patient`)
  console.log(`Created patient profile for: ${patientUser.firstName} ${patientUser.lastName}`)
  console.log(`Created medications: ${medication1.name}, ${medication2.name}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
