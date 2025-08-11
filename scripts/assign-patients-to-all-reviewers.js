#!/usr/bin/env node

/**
 * Script to assign patients to all reviewers
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function assignPatientsToAllReviewers() {
  console.log('👨‍⚕️ Assigning patients to all reviewers...\n');

  try {
    // Get all patients
    const patients = await prisma.patient.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    // Get all reviewers
    const reviewers = await prisma.user.findMany({
      where: {
        role: 'REVIEWER'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      }
    });

    console.log(`📋 Found ${patients.length} patients and ${reviewers.length} reviewers\n`);

    if (patients.length === 0) {
      console.log('❌ No patients found. Please create patients first.');
      return;
    }

    if (reviewers.length === 0) {
      console.log('❌ No reviewers found. Please create reviewers first.');
      return;
    }

    // Assign all patients to all reviewers
    console.log('🔧 Creating assignments for all reviewers...\n');

    for (const reviewer of reviewers) {
      console.log(`👨‍⚕️ Assigning patients to ${reviewer.firstName} ${reviewer.lastName} (${reviewer.email}):`);
      
      for (const patient of patients) {
        try {
          // Check if assignment already exists
          const existingAssignment = await prisma.reviewerAssignment.findFirst({
            where: {
              patientId: patient.id,
              reviewerId: reviewer.id,
              isActive: true,
            }
          });

          if (existingAssignment) {
            console.log(`   ✅ Already assigned: ${patient.user.firstName} ${patient.user.lastName}`);
          } else {
            // Create new assignment
            await prisma.reviewerAssignment.create({
              data: {
                patientId: patient.id,
                reviewerId: reviewer.id,
                isActive: true,
              }
            });
            console.log(`   ✅ Assigned: ${patient.user.firstName} ${patient.user.lastName}`);
          }
        } catch (error) {
          console.log(`   ❌ Failed to assign ${patient.user.firstName} ${patient.user.lastName}: ${error.message}`);
        }
      }
      console.log('');
    }

    // Verify assignments
    console.log('🔍 Verifying assignments...\n');
    
    for (const reviewer of reviewers) {
      const assignedPatients = await prisma.patient.findMany({
        where: {
          reviewerAssignments: {
            some: {
              reviewerId: reviewer.id,
              isActive: true,
            },
          },
        },
        include: {
          user: true,
        },
      });

      console.log(`👨‍⚕️ ${reviewer.firstName} ${reviewer.lastName} (${reviewer.email}) has ${assignedPatients.length} assigned patients:`);
      assignedPatients.forEach(patient => {
        console.log(`   - ${patient.user.firstName} ${patient.user.lastName} (${patient.user.email})`);
      });
      console.log('');
    }

    console.log('🎉 Patient assignment completed!');
    console.log('\n💡 All reviewers should now see patients in their dashboard.');
    console.log('\n📝 Login credentials for reviewers:');
    reviewers.forEach(reviewer => {
      console.log(`   - Email: ${reviewer.email}, Password: password`);
    });

  } catch (error) {
    console.error('❌ Error assigning patients to reviewers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
assignPatientsToAllReviewers();
