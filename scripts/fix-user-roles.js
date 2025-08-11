#!/usr/bin/env node

/**
 * Script to fix user role enum values in the database
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixUserRoles() {
  console.log('🔧 Fixing user role enum values...\n');

  try {
    // Check current user roles
    console.log('🔍 Checking current user roles in database...');
    
    // Use raw query to see what's actually in the database
    const users = await prisma.$queryRaw`SELECT id, email, role FROM users`;
    
    console.log('📊 Current users and roles:');
    users.forEach(user => {
      console.log(`   - ${user.email}: ${user.role}`);
    });

    // Check for invalid role values
    const invalidRoles = users.filter(user => 
      !['SUPER_ADMIN', 'ADMIN', 'REVIEWER', 'CAREGIVER', 'PATIENT'].includes(user.role)
    );

    if (invalidRoles.length > 0) {
      console.log('\n❌ Found invalid role values:');
      invalidRoles.forEach(user => {
        console.log(`   - ${user.email}: "${user.role}" (invalid)`);
      });

      console.log('\n🔧 Fixing invalid role values...');
      
      for (const user of invalidRoles) {
        let newRole = user.role.toUpperCase();
        
        // Map common variations
        if (newRole === 'CAREGIVER' || newRole === 'CARE_GIVER') {
          newRole = 'CAREGIVER';
        } else if (newRole === 'REVIEWER') {
          newRole = 'REVIEWER';
        } else if (newRole === 'ADMIN') {
          newRole = 'ADMIN';
        } else if (newRole === 'PATIENT') {
          newRole = 'PATIENT';
        } else if (newRole === 'SUPER_ADMIN') {
          newRole = 'SUPER_ADMIN';
        } else {
          console.log(`   ⚠️  Unknown role "${user.role}" for ${user.email}, skipping...`);
          continue;
        }

        // Update the role using raw SQL with proper casting
        await prisma.$executeRaw`UPDATE users SET role = ${newRole}::"UserRole" WHERE id = ${user.id}`;
        console.log(`   ✅ Updated ${user.email}: "${user.role}" → "${newRole}"`);
      }
    } else {
      console.log('\n✅ All user roles are valid!');
    }

    // Verify the fix
    console.log('\n🔍 Verifying user roles after fix...');
    const updatedUsers = await prisma.$queryRaw`SELECT id, email, role FROM users`;
    
    console.log('📊 Updated users and roles:');
    updatedUsers.forEach(user => {
      console.log(`   - ${user.email}: ${user.role}`);
    });

    // Test the patient query that was failing
    console.log('\n🧪 Testing patient query...');
    try {
      const patient = await prisma.patient.findFirst({
        include: {
          user: true
        }
      });
      
      if (patient) {
        console.log(`✅ Patient query successful: ${patient.user.firstName} ${patient.user.lastName} (${patient.user.email})`);
      } else {
        console.log('ℹ️  No patients found in database');
      }
    } catch (error) {
      console.log('❌ Patient query still failing:', error.message);
    }

    console.log('\n🎉 User role fix completed!');

  } catch (error) {
    console.error('❌ Error fixing user roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixUserRoles();
