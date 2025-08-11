#!/usr/bin/env node

/**
 * Script to test and create reviewer assignments
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testReviewerAssignments() {
  console.log('🔍 Testing Reviewer Assignments...\n');

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

    // Show current patients
    console.log('👥 Available Patients:');
    patients.forEach((patient, index) => {
      console.log(`   ${index + 1}. ${patient.user.firstName} ${patient.user.lastName} (${patient.user.email})`);
    });

    console.log('\n👨‍⚕️ Available Reviewers:');
    reviewers.forEach((reviewer, index) => {
      console.log(`   ${index + 1}. ${reviewer.firstName} ${reviewer.lastName} (${reviewer.email})`);
    });

    // Check existing assignments
    console.log('\n🔍 Checking existing reviewer assignments...');
    const existingAssignments = await prisma.reviewerAssignment.findMany({
      where: {
        isActive: true
      },
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

    if (existingAssignments.length > 0) {
      console.log('✅ Current active assignments:');
      existingAssignments.forEach(assignment => {
        console.log(`   - ${assignment.patient.user.firstName} ${assignment.patient.user.lastName} → ${assignment.reviewer.firstName} ${assignment.reviewer.lastName}`);
      });
    } else {
      console.log('📝 No active assignments found.');
      
      // Create test assignments
      if (patients.length > 0 && reviewers.length > 0) {
        console.log('\n🔧 Creating test assignments...');
        
        // Assign first patient to first reviewer
        const assignment = await prisma.reviewerAssignment.create({
          data: {
            patientId: patients[0].id,
            reviewerId: reviewers[0].id,
            isActive: true,
          }
        });

        console.log(`✅ Created assignment: ${patients[0].user.firstName} ${patients[0].user.lastName} → ${reviewers[0].firstName} ${reviewers[0].lastName}`);

        // If there are more patients, assign them too
        if (patients.length > 1 && reviewers.length > 0) {
          const assignment2 = await prisma.reviewerAssignment.create({
            data: {
              patientId: patients[1].id,
              reviewerId: reviewers[0].id,
              isActive: true,
            }
          });

          console.log(`✅ Created assignment: ${patients[1].user.firstName} ${patients[1].user.lastName} → ${reviewers[0].firstName} ${reviewers[0].lastName}`);
        }
      }
    }

    // Test the API endpoint
    console.log('\n🧪 Testing reviewer patients API...');
    const testReviewer = reviewers[0];
    
    const assignedPatients = await prisma.patient.findMany({
      where: {
        reviewerAssignments: {
          some: {
            reviewerId: testReviewer.id,
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
    });

    console.log(`📊 Reviewer ${testReviewer.firstName} ${testReviewer.lastName} has ${assignedPatients.length} assigned patients:`);
    assignedPatients.forEach(patient => {
      console.log(`   - ${patient.user.firstName} ${patient.user.lastName} (${patient.user.email})`);
    });

    console.log('\n🎉 Reviewer assignment test completed!');
    console.log('\n💡 You should now see patients in the reviewer dashboard.');

  } catch (error) {
    console.error('❌ Error testing reviewer assignments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testReviewerAssignments();
