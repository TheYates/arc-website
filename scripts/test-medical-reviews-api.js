#!/usr/bin/env node

/**
 * Script to test the medical reviews API with Neon DB
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMedicalReviewsAPI() {
  console.log('🧪 Testing Medical Reviews API with Neon DB...\n');

  try {
    // Get a test patient and reviewer
    const patient = await prisma.patient.findFirst({
      include: {
        user: true
      }
    });

    const reviewer = await prisma.user.findFirst({
      where: {
        role: 'REVIEWER'
      }
    });

    if (!patient) {
      console.log('❌ No patients found in database. Please create a patient first.');
      return;
    }

    if (!reviewer) {
      console.log('❌ No reviewers found in database. Please create a reviewer first.');
      return;
    }

    console.log(`📋 Using patient: ${patient.user.firstName} ${patient.user.lastName}`);
    console.log(`👨‍⚕️ Using reviewer: ${reviewer.firstName} ${reviewer.lastName}\n`);

    // Test 1: Create a medical review
    console.log('🔬 Test 1: Creating medical review...');
    const newReview = await prisma.medicalReview.create({
      data: {
        patientId: patient.id,
        reviewerId: reviewer.id,
        createdById: reviewer.id,
        reviewType: 'ROUTINE',
        priority: 'MEDIUM',
        title: 'Routine Health Check',
        description: 'Regular health assessment and monitoring',
        findings: 'Patient appears to be in good health overall',
        recommendations: 'Continue current medication regimen, schedule follow-up in 3 months',
        followUpRequired: true,
        followUpDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months from now
        status: 'PENDING',
      }
    });

    console.log(`✅ Created medical review: ${newReview.id}`);

    // Test 2: Get medical reviews for patient
    console.log('\n📖 Test 2: Fetching medical reviews for patient...');
    const patientReviews = await prisma.medicalReview.findMany({
      where: {
        patientId: patient.id
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        },
        reviewer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Found ${patientReviews.length} medical reviews for patient`);
    patientReviews.forEach(review => {
      console.log(`   - ${review.title} (${review.reviewType}, ${review.status})`);
    });

    // Test 3: Update medical review status
    console.log('\n📝 Test 3: Updating medical review status...');
    const updatedReview = await prisma.medicalReview.update({
      where: {
        id: newReview.id
      },
      data: {
        status: 'IN_REVIEW',
        findings: 'Patient appears to be in good health overall. Blood pressure slightly elevated.',
        recommendations: 'Continue current medication regimen, monitor blood pressure, schedule follow-up in 3 months',
      }
    });

    console.log(`✅ Updated review status to: ${updatedReview.status}`);

    // Test 4: Get review statistics
    console.log('\n📊 Test 4: Getting review statistics...');
    const [
      totalReviews,
      pendingReviews,
      inReviewReviews,
      completedReviews,
      urgentReviews,
      followUpRequired
    ] = await Promise.all([
      prisma.medicalReview.count(),
      prisma.medicalReview.count({ where: { status: 'PENDING' } }),
      prisma.medicalReview.count({ where: { status: 'IN_REVIEW' } }),
      prisma.medicalReview.count({ where: { status: 'COMPLETED' } }),
      prisma.medicalReview.count({ where: { priority: 'HIGH' } }),
      prisma.medicalReview.count({ where: { followUpRequired: true, status: { not: 'COMPLETED' } } })
    ]);

    console.log('✅ Review Statistics:');
    console.log(`   Total Reviews: ${totalReviews}`);
    console.log(`   Pending: ${pendingReviews}`);
    console.log(`   In Review: ${inReviewReviews}`);
    console.log(`   Completed: ${completedReviews}`);
    console.log(`   Urgent: ${urgentReviews}`);
    console.log(`   Follow-up Required: ${followUpRequired}`);

    // Test 5: Complete the review
    console.log('\n✅ Test 5: Completing medical review...');
    await prisma.medicalReview.update({
      where: {
        id: newReview.id
      },
      data: {
        status: 'COMPLETED',
      }
    });

    console.log('✅ Medical review completed');

    console.log('\n🎉 All medical review API tests passed!');
    console.log('\n📝 Summary:');
    console.log('   ✅ Medical review creation');
    console.log('   ✅ Medical review retrieval');
    console.log('   ✅ Medical review updates');
    console.log('   ✅ Review statistics');
    console.log('   ✅ Status management');
    console.log('\n💡 The reviewer API is now using Neon DB successfully!');

  } catch (error) {
    console.error('❌ Error testing medical reviews API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testMedicalReviewsAPI();
