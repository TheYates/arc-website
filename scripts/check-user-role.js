#!/usr/bin/env node

/**
 * Quick script to check what role format is being returned from the database
 */

async function checkUserRole() {
  try {
    console.log('🔍 Checking user role format...\n');

    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@americanrescue.com',
        password: 'password'
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('👤 User details:');
      console.log('   Email:', result.user.email);
      console.log('   Role:', result.user.role);
      console.log('   Role type:', typeof result.user.role);
      console.log('   First Name:', result.user.firstName);
      console.log('   Last Name:', result.user.lastName);
      
      console.log('\n🔍 Role checking:');
      console.log('   Is ADMIN?', result.user.role === 'ADMIN');
      console.log('   Is admin?', result.user.role === 'admin');
      console.log('   Is SUPER_ADMIN?', result.user.role === 'SUPER_ADMIN');
      console.log('   Is super_admin?', result.user.role === 'super_admin');
      
      console.log('\n📋 Admin access check:');
      const hasAccess = result.user.role === 'ADMIN' || 
                       result.user.role === 'SUPER_ADMIN' || 
                       result.user.role === 'admin' || 
                       result.user.role === 'super_admin';
      console.log('   Has admin access?', hasAccess);
      
    } else {
      console.log('❌ Login failed:', result.error);
      console.log('\n🔧 Try with default admin:');
      console.log('   Email: admin@arc.com');
      console.log('   Password: password');
    }

  } catch (error) {
    console.log('❌ Connection error:', error.message);
    console.log('\n🔧 Make sure the server is running: npm run dev');
  }
}

checkUserRole();
