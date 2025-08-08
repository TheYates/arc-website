#!/usr/bin/env node

/**
 * Quick test script to verify authentication is working
 */

async function testAuth() {
  try {
    console.log('🔐 Testing authentication...\n');

    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@arc.com',
        password: 'password'
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Authentication successful!');
      console.log('👤 User:', result.user.email);
      console.log('🔑 Role:', result.user.role);
      console.log('\n📋 Login credentials that work:');
      console.log('   Email: admin@arc.com');
      console.log('   Password: password');
      console.log('\n🌐 Next steps:');
      console.log('   1. Go to http://localhost:3000/login');
      console.log('   2. Use the credentials above');
      console.log('   3. Navigate to /admin/services');
    } else {
      console.log('❌ Authentication failed:', result.error);
      console.log('\n🔧 Possible solutions:');
      console.log('   1. Make sure the database is seeded: npm run db:seed');
      console.log('   2. Check if the server is running: npm run dev');
      console.log('   3. Verify PostgreSQL is running');
    }

  } catch (error) {
    console.log('❌ Connection error:', error.message);
    console.log('\n🔧 Possible solutions:');
    console.log('   1. Make sure the server is running: npm run dev');
    console.log('   2. Check if PostgreSQL is running');
    console.log('   3. Verify the DATABASE_URL is correct');
  }
}

testAuth();
