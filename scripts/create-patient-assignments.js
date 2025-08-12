const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createPatientAssignments() {
  console.log('🔧 Creating patient assignments...\n');

  try {
    // Find existing patients, caregivers, and reviewers
    console.log('1. Finding existing users and patients...');
    
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

    const caregivers = await prisma.user.findMany({
      where: {
        role: 'CAREGIVER'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      }
    });

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

    console.log(`   Found ${patients.length} patients`);
    console.log(`   Found ${caregivers.length} caregivers`);
    console.log(`   Found ${reviewers.length} reviewers\n`);

    if (patients.length === 0) {
      console.log('❌ No patients found. Please create patients first.');
      return;
    }

    if (caregivers.length === 0) {
      console.log('❌ No caregivers found. Please create caregivers first.');
      return;
    }

    if (reviewers.length === 0) {
      console.log('❌ No reviewers found. Please create reviewers first.');
      return;
    }

    // Create assignments for each patient
    console.log('2. Creating assignments...');
    
    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      const caregiver = caregivers[i % caregivers.length]; // Round-robin assignment
      const reviewer = reviewers[i % reviewers.length]; // Round-robin assignment

      console.log(`   Assigning patient ${patient.user.firstName} ${patient.user.lastName}:`);
      console.log(`     → Caregiver: ${caregiver.firstName} ${caregiver.lastName}`);
      console.log(`     → Reviewer: ${reviewer.firstName} ${reviewer.lastName}`);

      // Check if caregiver assignment already exists
      const existingCaregiverAssignment = await prisma.caregiverAssignment.findFirst({
        where: {
          patientId: patient.id,
          caregiverId: caregiver.id,
          isActive: true,
        }
      });

      if (!existingCaregiverAssignment) {
        await prisma.caregiverAssignment.create({
          data: {
            patientId: patient.id,
            caregiverId: caregiver.id,
            assignedAt: new Date(),
            isActive: true,
          }
        });
        console.log(`     ✅ Created caregiver assignment`);
      } else {
        console.log(`     ⚠️  Caregiver assignment already exists`);
      }

      // Check if reviewer assignment already exists
      const existingReviewerAssignment = await prisma.reviewerAssignment.findFirst({
        where: {
          patientId: patient.id,
          reviewerId: reviewer.id,
          isActive: true,
        }
      });

      if (!existingReviewerAssignment) {
        await prisma.reviewerAssignment.create({
          data: {
            patientId: patient.id,
            reviewerId: reviewer.id,
            assignedAt: new Date(),
            isActive: true,
          }
        });
        console.log(`     ✅ Created reviewer assignment`);
      } else {
        console.log(`     ⚠️  Reviewer assignment already exists`);
      }

      console.log('');
    }

    // Verify assignments
    console.log('3. Verifying assignments...');
    
    const caregiverAssignments = await prisma.caregiverAssignment.findMany({
      where: { isActive: true },
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        caregiver: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    const reviewerAssignments = await prisma.reviewerAssignment.findMany({
      where: { isActive: true },
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        reviewer: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    console.log(`   Active caregiver assignments: ${caregiverAssignments.length}`);
    console.log(`   Active reviewer assignments: ${reviewerAssignments.length}`);

    // Display assignment summary
    console.log('\n📊 Assignment Summary:');
    caregiverAssignments.forEach(assignment => {
      console.log(`   👩‍⚕️ ${assignment.patient.user.firstName} ${assignment.patient.user.lastName} → ${assignment.caregiver.firstName} ${assignment.caregiver.lastName} (Caregiver)`);
    });

    reviewerAssignments.forEach(assignment => {
      console.log(`   👨‍⚕️ ${assignment.patient.user.firstName} ${assignment.patient.user.lastName} → ${assignment.reviewer.firstName} ${assignment.reviewer.lastName} (Reviewer)`);
    });

    console.log('\n✅ Patient assignments created successfully!');

  } catch (error) {
    console.error('❌ Error creating patient assignments:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  createPatientAssignments()
    .then(() => {
      console.log('🎉 Assignment creation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Assignment creation failed:', error);
      process.exit(1);
    });
}

module.exports = { createPatientAssignments };
