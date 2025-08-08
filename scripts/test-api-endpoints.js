#!/usr/bin/env node

/**
 * API Endpoints Test Script
 * 
 * This script tests the API endpoints to ensure they work with the new Prisma backend.
 * Run this after starting the development server.
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testAuthenticationAPI() {
  console.log('🔐 Testing Authentication API...');
  
  try {
    // Test login with default admin user
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@arc.com',
        password: 'password',
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    
    if (loginData.success && loginData.user) {
      console.log('✅ Authentication API working');
      console.log(`   - Logged in as: ${loginData.user.email}`);
      console.log(`   - Role: ${loginData.user.role}`);
      return loginData.user;
    } else {
      throw new Error('Login response invalid');
    }
  } catch (error) {
    console.error('❌ Authentication API failed:', error.message);
    return null;
  }
}

async function testInvalidLogin() {
  console.log('🔒 Testing invalid login...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid@example.com',
        password: 'wrongpassword',
      }),
    });

    if (response.status === 401) {
      console.log('✅ Invalid login properly rejected');
      return true;
    } else {
      throw new Error(`Expected 401, got ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Invalid login test failed:', error.message);
    return false;
  }
}

async function testMedicationAdministrationAPI() {
  console.log('💊 Testing Medication Administration API...');
  
  try {
    // This will fail without proper data, but we can test the endpoint exists
    const response = await fetch(`${BASE_URL}/api/medications/administrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Missing required fields intentionally to test validation
      }),
    });

    if (response.status === 400) {
      const errorData = await response.json();
      if (errorData.error && errorData.error.includes('Missing required fields')) {
        console.log('✅ Medication Administration API validation working');
        return true;
      }
    }
    
    throw new Error(`Unexpected response: ${response.status}`);
  } catch (error) {
    console.error('❌ Medication Administration API test failed:', error.message);
    return false;
  }
}

async function testServerHealth() {
  console.log('🏥 Testing server health...');
  
  try {
    const response = await fetch(`${BASE_URL}/`);
    
    if (response.ok) {
      console.log('✅ Server is running and responding');
      return true;
    } else {
      throw new Error(`Server responded with ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Server health check failed:', error.message);
    console.log('💡 Make sure the development server is running: npm run dev');
    return false;
  }
}

async function runAPITests() {
  console.log('🚀 Starting API endpoint tests...\n');
  console.log('📝 Note: Make sure the development server is running (npm run dev)\n');
  
  const tests = [
    { name: 'Server Health', test: testServerHealth },
    { name: 'Authentication API', test: testAuthenticationAPI },
    { name: 'Invalid Login Handling', test: testInvalidLogin },
    { name: 'Medication Administration API', test: testMedicationAdministrationAPI },
  ];

  const results = [];
  
  for (const { name, test } of tests) {
    try {
      const result = await test();
      results.push({ name, success: !!result });
    } catch (error) {
      console.error(`❌ ${name} test crashed:`, error.message);
      results.push({ name, success: false });
    }
    console.log(''); // Add spacing between tests
  }

  // Summary
  console.log('📊 API Test Results Summary:');
  console.log('============================');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(({ name, success }) => {
    console.log(`${success ? '✅' : '❌'} ${name}`);
  });
  
  console.log(`\n🎯 Overall: ${passed}/${total} API tests passed`);
  
  if (passed === total) {
    console.log('🎉 All API endpoints are working correctly!');
    console.log('\n✅ Your application is ready for use!');
  } else {
    console.log('⚠️  Some API tests failed. Please check the errors above.');
    console.log('\n💡 Common issues:');
    console.log('   - Make sure the development server is running: npm run dev');
    console.log('   - Ensure the database is set up: npm run setup-postgres');
    console.log('   - Check that the database is seeded with default users');
  }

  process.exit(passed === total ? 0 : 1);
}

// Check if node-fetch is available
try {
  require('node-fetch');
} catch (error) {
  console.log('📦 Installing node-fetch for API testing...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install node-fetch@2', { stdio: 'inherit' });
    console.log('✅ node-fetch installed successfully\n');
  } catch (installError) {
    console.error('❌ Failed to install node-fetch:', installError.message);
    console.log('💡 Please install manually: npm install node-fetch@2');
    process.exit(1);
  }
}

// Run tests
runAPITests().catch((error) => {
  console.error('❌ API test suite failed:', error);
  process.exit(1);
});
