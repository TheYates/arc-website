#!/usr/bin/env node

/**
 * Migration script to create patient records for existing approved applications
 * that don't have corresponding patient records.
 * 
 * This script should be run after the application approval service is updated
 * to ensure all approved applications have patient records.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateApprovedApplications() {
  console.log('🔄 Starting migration of approved applications...');

  try {
    // Find all approved applications that have users but no patient records
    const approvedApplications = await prisma.application.findMany({
      where: {
        status: 'APPROVED',
        userId: {
          not: null
        }
      },
      include: {
        user: true
      }
    });

    console.log(`📋 Found ${approvedApplications.length} approved applications`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const application of approvedApplications) {
      if (!application.user) {
        console.log(`⚠️  Application ${application.id} has no user record, skipping...`);
        skippedCount++;
        continue;
      }

      // Check if patient record already exists
      const existingPatient = await prisma.patient.findUnique({
        where: {
          userId: application.user.id
        }
      });

      if (existingPatient) {
        console.log(`✅ Patient record already exists for ${application.user.firstName} ${application.user.lastName}`);
        skippedCount++;
        continue;
      }

      // Create patient record
      try {
        const patient = await prisma.patient.create({
          data: {
            userId: application.user.id,
            careLevel: 'MEDIUM',
            status: 'STABLE',
            assignedDate: application.processedAt || new Date(),
            medicalRecordNumber: `ARC-PAT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          }
        });

        console.log(`✅ Created patient record for ${application.user.firstName} ${application.user.lastName} (MRN: ${patient.medicalRecordNumber})`);
        migratedCount++;

        // Small delay to ensure unique MRN generation
        await new Promise(resolve => setTimeout(resolve, 10));

      } catch (error) {
        console.error(`❌ Failed to create patient record for ${application.user.firstName} ${application.user.lastName}:`, error.message);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${migratedCount} applications`);
    console.log(`   ⏭️  Skipped (already exists): ${skippedCount} applications`);
    console.log(`   📋 Total processed: ${approvedApplications.length} applications`);

    // Verify the migration
    console.log('\n🔍 Verifying migration...');
    const patientsCount = await prisma.patient.count();
    const approvedUsersCount = await prisma.user.count({
      where: {
        role: 'PATIENT'
      }
    });

    console.log(`   👥 Total patient users: ${approvedUsersCount}`);
    console.log(`   🏥 Total patient records: ${patientsCount}`);

    if (patientsCount === approvedUsersCount) {
      console.log('   ✅ Migration successful - all patient users have patient records!');
    } else {
      console.log('   ⚠️  Some patient users may still be missing patient records');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
if (require.main === module) {
  migrateApprovedApplications()
    .then(() => {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateApprovedApplications };
