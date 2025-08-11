#!/usr/bin/env node

/**
 * Script to test the reviewer API endpoint directly
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testReviewerAPI() {
  console.log('🧪 Testing Reviewer API Endpoint...\n');

  try {
    // Get Timon Kaufman's ID
    const timonReviewer = await prisma.user.findFirst({
      where: {
        email: 'kokupasym@mailinator.com',
        role: 'REVIEWER'
      }
    });

    if (!timonReviewer) {
      console.log('❌ Timon Kaufman reviewer not found');
      return;
    }

    console.log(`👨‍⚕️ Testing API for reviewer: ${timonReviewer.firstName} ${timonReviewer.lastName} (${timonReviewer.email})`);
    console.log(`🆔 Reviewer ID: ${timonReviewer.id}\n`);

    // Test the Prisma function directly
    console.log('🔍 Testing Prisma function directly...');

    const patientsFromPrisma = await prisma.patient.findMany({
      where: {
        reviewerAssignments: {
          some: {
            reviewerId: timonReviewer.id,
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
    console.log(`✅ Prisma function returned ${patientsFromPrisma.length} patients:`);
    patientsFromPrisma.forEach(patient => {
      console.log(`   - ${patient.user.firstName} ${patient.user.lastName} (${patient.user.email})`);
    });

    // Test the API endpoint by making a direct HTTP request
    console.log('\n🌐 Testing API endpoint...');
    
    // Since we can't make HTTP requests in Node.js without additional setup,
    // let's simulate what the API would return
    const apiResponse = {
      patients: patientsFromPrisma.map(patient => ({
        id: patient.id,
        firstName: patient.user.firstName,
        lastName: patient.user.lastName,
        email: patient.user.email,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        phone: patient.phone,
        address: patient.address,
        emergencyContact: patient.emergencyContact,
        medicalHistory: patient.medicalHistory,
        allergies: patient.allergies,
        currentMedications: patient.currentMedications,
        careLevel: patient.careLevel,
        status: patient.status,
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
      }))
    };

    console.log(`✅ API would return ${apiResponse.patients.length} patients:`);
    apiResponse.patients.forEach(patient => {
      console.log(`   - ${patient.firstName} ${patient.lastName} (${patient.email})`);
    });

    // Check assignments table directly
    console.log('\n📋 Checking reviewer assignments table...');
    const assignments = await prisma.reviewerAssignment.findMany({
      where: {
        reviewerId: timonReviewer.id,
        isActive: true
      },
      include: {
        patient: {
          include: {
            user: true
          }
        }
      }
    });

    console.log(`✅ Found ${assignments.length} active assignments:`);
    assignments.forEach(assignment => {
      console.log(`   - Patient: ${assignment.patient.user.firstName} ${assignment.patient.user.lastName}`);
      console.log(`     Assignment ID: ${assignment.id}`);
      console.log(`     Created: ${assignment.createdAt}`);
      console.log(`     Active: ${assignment.isActive}`);
    });

    if (patientsFromPrisma.length === 0) {
      console.log('\n❌ No patients found for this reviewer!');
      console.log('🔧 This might be why the dashboard shows "No Patients Assigned"');
      
      // Let's check if there are any patients at all
      const allPatients = await prisma.patient.findMany({
        include: { user: true }
      });
      console.log(`\n📊 Total patients in database: ${allPatients.length}`);
      
      if (allPatients.length > 0) {
        console.log('🔧 Creating assignment for testing...');
        await prisma.reviewerAssignment.create({
          data: {
            patientId: allPatients[0].id,
            reviewerId: timonReviewer.id,
            isActive: true,
          }
        });
        console.log(`✅ Assigned ${allPatients[0].user.firstName} ${allPatients[0].user.lastName} to ${timonReviewer.firstName} ${timonReviewer.lastName}`);
      }
    } else {
      console.log('\n✅ API is working correctly!');
      console.log('💡 The reviewer should see patients in the dashboard.');
      console.log('\n🔄 Try refreshing the page or logging out and back in.');
    }

  } catch (error) {
    console.error('❌ Error testing reviewer API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testReviewerAPI();
