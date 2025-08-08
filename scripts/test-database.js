#!/usr/bin/env node

/**
 * Database Operations Test Script
 * 
 * This script tests all database operations to ensure PostgreSQL and Prisma are working correctly.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function testUserOperations() {
  console.log('\n👤 Testing User operations...');
  
  try {
    // Test user creation
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'PATIENT',
      },
    });
    console.log('✅ User creation successful:', testUser.email);

    // Test user retrieval
    const retrievedUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });
    console.log('✅ User retrieval successful:', retrievedUser?.email);

    // Test user update
    const updatedUser = await prisma.user.update({
      where: { id: testUser.id },
      data: { firstName: 'Updated' },
    });
    console.log('✅ User update successful:', updatedUser.firstName);

    // Clean up test user
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    console.log('✅ User deletion successful');

    return true;
  } catch (error) {
    console.error('❌ User operations failed:', error.message);
    return false;
  }
}

async function testPatientOperations() {
  console.log('\n🏥 Testing Patient operations...');
  
  try {
    // Create a test user first
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const testUser = await prisma.user.create({
      data: {
        email: 'patient-test@example.com',
        username: 'patienttest',
        passwordHash: hashedPassword,
        firstName: 'Patient',
        lastName: 'Test',
        role: 'PATIENT',
      },
    });

    // Test patient creation
    const testPatient = await prisma.patient.create({
      data: {
        userId: testUser.id,
        dateOfBirth: new Date('1990-01-01'),
        gender: 'MALE',
        bloodType: 'O+',
        heightCm: 175,
        weightKg: 70.5,
        allergies: ['Penicillin'],
        chronicConditions: ['Hypertension'],
      },
    });
    console.log('✅ Patient creation successful');

    // Test patient retrieval with user data
    const retrievedPatient = await prisma.patient.findUnique({
      where: { id: testPatient.id },
      include: { user: true },
    });
    console.log('✅ Patient retrieval successful:', retrievedPatient?.user.email);

    // Clean up
    await prisma.patient.delete({
      where: { id: testPatient.id },
    });
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    console.log('✅ Patient cleanup successful');

    return true;
  } catch (error) {
    console.error('❌ Patient operations failed:', error.message);
    return false;
  }
}

async function testMedicationOperations() {
  console.log('\n💊 Testing Medication operations...');
  
  try {
    // Test medication creation
    const testMedication = await prisma.medication.create({
      data: {
        name: 'Test Medication',
        genericName: 'Test Generic',
        brandNames: ['Brand A', 'Brand B'],
        drugClass: 'Test Class',
        dosageForms: ['Tablet', 'Capsule'],
        strengthOptions: ['10mg', '20mg'],
        sideEffects: ['Nausea', 'Dizziness'],
      },
    });
    console.log('✅ Medication creation successful:', testMedication.name);

    // Test medication retrieval
    const retrievedMedication = await prisma.medication.findUnique({
      where: { id: testMedication.id },
    });
    console.log('✅ Medication retrieval successful:', retrievedMedication?.name);

    // Test medication search
    const searchResults = await prisma.medication.findMany({
      where: {
        name: {
          contains: 'Test',
          mode: 'insensitive',
        },
      },
    });
    console.log('✅ Medication search successful, found:', searchResults.length);

    // Clean up
    await prisma.medication.delete({
      where: { id: testMedication.id },
    });
    console.log('✅ Medication cleanup successful');

    return true;
  } catch (error) {
    console.error('❌ Medication operations failed:', error.message);
    return false;
  }
}

async function testAuthenticationOperations() {
  console.log('\n🔐 Testing Authentication operations...');
  
  try {
    // Test password hashing and verification
    const password = 'testpassword123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const isValid = await bcrypt.compare(password, hashedPassword);
    
    if (isValid) {
      console.log('✅ Password hashing and verification successful');
    } else {
      throw new Error('Password verification failed');
    }

    // Test user authentication flow
    const testUser = await prisma.user.create({
      data: {
        email: 'auth-test@example.com',
        username: 'authtest',
        passwordHash: hashedPassword,
        firstName: 'Auth',
        lastName: 'Test',
        role: 'ADMIN',
      },
    });

    // Simulate authentication
    const foundUser = await prisma.user.findUnique({
      where: { email: 'auth-test@example.com' },
    });

    if (foundUser && await bcrypt.compare(password, foundUser.passwordHash)) {
      console.log('✅ Authentication flow successful');
      
      // Update last login
      await prisma.user.update({
        where: { id: foundUser.id },
        data: { lastLogin: new Date() },
      });
      console.log('✅ Last login update successful');
    } else {
      throw new Error('Authentication failed');
    }

    // Clean up
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    console.log('✅ Authentication cleanup successful');

    return true;
  } catch (error) {
    console.error('❌ Authentication operations failed:', error.message);
    return false;
  }
}

async function testDatabaseSchema() {
  console.log('\n📋 Testing Database schema...');
  
  try {
    // Test that all main tables exist by querying them
    const userCount = await prisma.user.count();
    const patientCount = await prisma.patient.count();
    const medicationCount = await prisma.medication.count();
    
    console.log('✅ Schema validation successful:');
    console.log(`   - Users table: ${userCount} records`);
    console.log(`   - Patients table: ${patientCount} records`);
    console.log(`   - Medications table: ${medicationCount} records`);

    return true;
  } catch (error) {
    console.error('❌ Schema validation failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive database tests...\n');
  
  const tests = [
    { name: 'Database Connection', test: testDatabaseConnection },
    { name: 'Database Schema', test: testDatabaseSchema },
    { name: 'User Operations', test: testUserOperations },
    { name: 'Patient Operations', test: testPatientOperations },
    { name: 'Medication Operations', test: testMedicationOperations },
    { name: 'Authentication Operations', test: testAuthenticationOperations },
  ];

  const results = [];
  
  for (const { name, test } of tests) {
    try {
      const result = await test();
      results.push({ name, success: result });
    } catch (error) {
      console.error(`❌ ${name} test crashed:`, error.message);
      results.push({ name, success: false });
    }
  }

  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(({ name, success }) => {
    console.log(`${success ? '✅' : '❌'} ${name}`);
  });
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All database operations are working correctly!');
    console.log('\n✅ Your PostgreSQL + Prisma setup is ready for production!');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
  }

  await prisma.$disconnect();
  process.exit(passed === total ? 0 : 1);
}

// Handle errors gracefully
process.on('unhandledRejection', async (error) => {
  console.error('❌ Unhandled error:', error);
  await prisma.$disconnect();
  process.exit(1);
});

// Run tests
runAllTests().catch(async (error) => {
  console.error('❌ Test suite failed:', error);
  await prisma.$disconnect();
  process.exit(1);
});
