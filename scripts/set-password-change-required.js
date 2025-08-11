#!/usr/bin/env node

/**
 * Script to set mustChangePassword flag for users with default password
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setPasswordChangeRequired() {
  console.log('🔐 Setting password change requirement for users with default password...\n');

  try {
    // Get all users
    const users = await prisma.$queryRaw`
      SELECT id, email, first_name, last_name, password_hash, must_change_password
      FROM users 
      ORDER BY email
    `;

    console.log('📋 Checking users for default password...');
    console.log('=' .repeat(80));

    const standardPassword = 'password';
    let usersToUpdate = [];

    for (const user of users) {
      console.log(`${user.email} (${user.first_name} ${user.last_name})`);
      
      // Test if the current hash matches "password"
      if (user.password_hash.startsWith('$2b$')) {
        try {
          const isDefaultPassword = await bcrypt.compare(standardPassword, user.password_hash);
          console.log(`   Has default password: ${isDefaultPassword ? '✅ YES' : '❌ NO'}`);
          console.log(`   Must change password: ${user.must_change_password ? '✅ YES' : '❌ NO'}`);
          
          if (isDefaultPassword && !user.must_change_password) {
            usersToUpdate.push(user);
            console.log(`   🔧 Will be updated to require password change`);
          }
        } catch (error) {
          console.log(`   Password test failed: ${error.message}`);
        }
      } else {
        console.log(`   Invalid password hash format`);
      }
      console.log('');
    }

    if (usersToUpdate.length === 0) {
      console.log('✅ No users need to be updated. All users with default passwords already require password change.');
      return;
    }

    console.log(`\n🔄 Updating ${usersToUpdate.length} users to require password change...\n`);
    
    for (const user of usersToUpdate) {
      try {
        await prisma.$executeRaw`
          UPDATE users 
          SET must_change_password = true,
              updated_at = NOW()
          WHERE id = ${user.id}
        `;
        console.log(`✅ Updated: ${user.email}`);
      } catch (error) {
        console.error(`❌ Failed to update ${user.email}:`, error.message);
      }
    }

    console.log('\n🎉 Password change requirement update completed!');
    console.log('\n📝 Users with default password "password" will now be prompted to change it on login.');
    console.log('\n👥 Updated users:');
    usersToUpdate.forEach(user => {
      console.log(`   - ${user.email} (${user.first_name} ${user.last_name})`);
    });

  } catch (error) {
    console.error('❌ Error setting password change requirement:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
setPasswordChangeRequired();
