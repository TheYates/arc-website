#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const commonMedications = [
  // Cardiovascular
  { name: "Lisinopril", category: "ACE Inhibitor", drugClass: "Cardiovascular" },
  { name: "Metoprolol", category: "Beta Blocker", drugClass: "Cardiovascular" },
  { name: "Amlodipine", category: "Calcium Channel Blocker", drugClass: "Cardiovascular" },
  { name: "Losartan", category: "ARB", drugClass: "Cardiovascular" },
  { name: "Hydrochlorothiazide", category: "Diuretic", drugClass: "Cardiovascular" },
  { name: "Atorvastatin", category: "Statin", drugClass: "Cardiovascular" },
  { name: "Simvastatin", category: "Statin", drugClass: "Cardiovascular" },

  // Endocrine
  { name: "Metformin", category: "Biguanide", drugClass: "Antidiabetic" },
  { name: "Insulin", category: "Hormone", drugClass: "Antidiabetic" },
  { name: "Glipizide", category: "Sulfonylurea", drugClass: "Antidiabetic" },

  // Gastrointestinal
  { name: "Omeprazole", category: "PPI", drugClass: "Gastrointestinal" },
  { name: "Lansoprazole", category: "PPI", drugClass: "Gastrointestinal" },
  { name: "Ranitidine", category: "H2 Blocker", drugClass: "Gastrointestinal" },

  // Respiratory
  { name: "Albuterol", category: "Bronchodilator", drugClass: "Respiratory" },
  { name: "Fluticasone", category: "Corticosteroid", drugClass: "Respiratory" },
  { name: "Montelukast", category: "Leukotriene Inhibitor", drugClass: "Respiratory" },

  // Neurological
  { name: "Gabapentin", category: "Anticonvulsant", drugClass: "Neurological" },
  { name: "Sertraline", category: "SSRI", drugClass: "Antidepressant" },
  { name: "Alprazolam", category: "Benzodiazepine", drugClass: "Anxiolytic" },
  { name: "Zolpidem", category: "Sedative", drugClass: "Sleep Aid" },

  // Pain/Inflammation
  { name: "Ibuprofen", category: "NSAID", drugClass: "Pain Relief" },
  { name: "Acetaminophen", category: "Analgesic", drugClass: "Pain Relief" },
  { name: "Aspirin", category: "NSAID", drugClass: "Pain Relief" },
  { name: "Tramadol", category: "Opioid", drugClass: "Pain Relief" },

  // Antibiotics
  { name: "Amoxicillin", category: "Penicillin", drugClass: "Antibiotic" },
  { name: "Azithromycin", category: "Macrolide", drugClass: "Antibiotic" },
  { name: "Ciprofloxacin", category: "Fluoroquinolone", drugClass: "Antibiotic" },
  { name: "Cephalexin", category: "Cephalosporin", drugClass: "Antibiotic" },

  // Others
  { name: "Warfarin", category: "Anticoagulant", drugClass: "Blood Thinner" },
  { name: "Furosemide", category: "Loop Diuretic", drugClass: "Cardiovascular" },
  { name: "Levothyroxine", category: "Thyroid Hormone", drugClass: "Endocrine" },
  { name: "Prednisone", category: "Corticosteroid", drugClass: "Anti-inflammatory" },
];

async function seedCommonMedications() {
  try {
    console.log('🌱 Seeding common medications...');
    
    // Check if medications table exists and has records
    try {
      const existingCount = await prisma.medicationCatalog.count();
      if (existingCount > 0) {
        console.log(`ℹ️  Found ${existingCount} existing medications. Skipping seed...`);
        return;
      }
    } catch (error) {
      console.log('ℹ️  MedicationCatalog table needs to be created first...');
    }
    
    // Insert common medications
    for (const med of commonMedications) {
      await prisma.medicationCatalog.create({
        data: {
          name: med.name,
          generic_name: med.name, // Same as brand name for simplicity
          drug_class: med.drugClass,
          category: med.category,
          is_common: true,
          is_active: true,
        }
      });
    }

    console.log(`✅ Successfully seeded ${commonMedications.length} common medications`);
    
    // Display summary
    const categoryCount = await prisma.medicationCatalog.groupBy({
      by: ['drug_class'],
      _count: { id: true },
      where: { is_common: true }
    });
    
    console.log('\n📊 Medication categories seeded:');
    categoryCount.forEach(cat => {
      console.log(`   ${cat.drug_class}: ${cat._count.id} medications`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding medications:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Add medication catalog table to schema if it doesn't exist
async function createMedicationCatalogTable() {
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "MedicationCatalog" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "generic_name" TEXT,
        "brand_names" TEXT[],
        "drug_class" TEXT,
        "category" TEXT,
        "dosage_forms" TEXT[],
        "strength_options" TEXT[],
        "route_of_administration" TEXT,
        "contraindications" TEXT[],
        "side_effects" TEXT[],
        "drug_interactions" TEXT[],
        "pregnancy_category" TEXT,
        "controlled_substance_schedule" TEXT,
        "is_common" BOOLEAN NOT NULL DEFAULT false,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "MedicationCatalog_pkey" PRIMARY KEY ("id")
      );
    `;
    console.log('✅ MedicationCatalog table ready');
  } catch (error) {
    console.log('ℹ️  MedicationCatalog table already exists or error:', error.message);
  }
}

if (require.main === module) {
  createMedicationCatalogTable()
    .then(() => seedCommonMedications())
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    });
}

export { seedCommonMedications };
