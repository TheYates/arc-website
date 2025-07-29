#!/usr/bin/env node

/**
 * Simple API Test Script
 * 
 * This script tests the SQLite API routes to ensure they're working correctly.
 * Run this after starting the development server.
 * 
 * Usage: node scripts/test-api.js
 */

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing ARC SQLite API Routes...\n');

  try {
    // Test authentication
    console.log('1. Testing Authentication...');
    const authResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'caregiver@arc.com',
        password: 'password'
      }),
    });

    if (!authResponse.ok) {
      throw new Error(`Auth failed: ${authResponse.status}`);
    }

    const authData = await authResponse.json();
    console.log('✅ Authentication successful');
    console.log(`   User: ${authData.user.firstName} ${authData.user.lastName} (${authData.user.role})`);

    const caregiverId = authData.user.id;

    // Test getting patients by caregiver
    console.log('\n2. Testing Get Patients by Caregiver...');
    const patientsResponse = await fetch(`${BASE_URL}/api/patients/caregiver/${caregiverId}`);
    
    if (!patientsResponse.ok) {
      throw new Error(`Get patients failed: ${patientsResponse.status}`);
    }

    const patientsData = await patientsResponse.json();
    console.log('✅ Get patients successful');
    console.log(`   Found ${patientsData.patients.length} patients`);

    if (patientsData.patients.length > 0) {
      const patient = patientsData.patients[0];
      console.log(`   Sample patient: ${patient.firstName} ${patient.lastName}`);

      // Test getting specific patient
      console.log('\n3. Testing Get Specific Patient...');
      const patientResponse = await fetch(`${BASE_URL}/api/patients/${patient.id}`);
      
      if (!patientResponse.ok) {
        throw new Error(`Get patient failed: ${patientResponse.status}`);
      }

      const patientData = await patientResponse.json();
      console.log('✅ Get specific patient successful');
      console.log(`   Patient: ${patientData.patient.firstName} ${patientData.patient.lastName}`);

      // Test getting medications
      console.log('\n4. Testing Get Medications...');
      const medicationsResponse = await fetch(`${BASE_URL}/api/medications/${patient.id}`);
      
      if (!medicationsResponse.ok) {
        throw new Error(`Get medications failed: ${medicationsResponse.status}`);
      }

      const medicationsData = await medicationsResponse.json();
      console.log('✅ Get medications successful');
      console.log(`   Found ${medicationsData.medications.length} medications`);

      if (medicationsData.medications.length > 0) {
        const medication = medicationsData.medications[0];
        console.log(`   Sample medication: ${medication.medicationName} ${medication.dosage}`);

        // Test recording administration
        console.log('\n5. Testing Record Administration...');
        const administrationResponse = await fetch(`${BASE_URL}/api/medications/administrations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            medicationId: medication.id,
            patientId: patient.id,
            caregiverId: caregiverId,
            scheduledTime: new Date().toISOString(),
            actualTime: new Date().toISOString(),
            status: 'administered',
            dosageGiven: medication.dosage,
            notes: 'Test administration via API',
            patientResponse: 'good'
          }),
        });

        if (!administrationResponse.ok) {
          throw new Error(`Record administration failed: ${administrationResponse.status}`);
        }

        const administrationData = await administrationResponse.json();
        console.log('✅ Record administration successful');
        console.log(`   Administration ID: ${administrationData.administration.id}`);
      }

      // Test getting administrations
      console.log('\n6. Testing Get Administrations...');
      const administrationsResponse = await fetch(`${BASE_URL}/api/medications/administrations/${patient.id}`);
      
      if (!administrationsResponse.ok) {
        throw new Error(`Get administrations failed: ${administrationsResponse.status}`);
      }

      const administrationsData = await administrationsResponse.json();
      console.log('✅ Get administrations successful');
      console.log(`   Found ${administrationsData.administrations.length} administrations`);
    }

    console.log('\n🎉 All API tests passed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Authentication API');
    console.log('   ✅ Patients API');
    console.log('   ✅ Medications API');
    console.log('   ✅ Administrations API');
    console.log('\n🚀 The SQLite migration is working correctly!');

  } catch (error) {
    console.error('\n❌ API Test Failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure the development server is running: npm run dev');
    console.log('   2. Check that the database is initialized: npm run init-db');
    console.log('   3. Verify the server is accessible at http://localhost:3000');
    process.exit(1);
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ with built-in fetch support');
  console.log('   Please upgrade Node.js or install node-fetch');
  process.exit(1);
}

testAPI();
