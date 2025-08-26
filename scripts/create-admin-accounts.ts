#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface AdminAccount {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

const adminAccounts: AdminAccount[] = [
  {
    email: 'admin@arc.com',
    username: 'admin',
    password: 'password',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN'
  },
  {
    email: 'super@arc.com',
    username: 'superadmin',
    password: 'superpassword',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'SUPER_ADMIN'
  }
];

async function createAdminAccounts() {
  try {
    console.log('🔐 Creating admin accounts...');
    
    for (const account of adminAccounts) {
      console.log(`\n📧 Processing ${account.role}: ${account.email}`);
      
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: account.email },
            { username: account.username },
          ],
        },
      });

      if (existingUser) {
        console.log(`⚠️  User already exists with email: ${existingUser.email}`);
        
        // Update password if it's the same user
        if (existingUser.email === account.email) {
          const hashedPassword = await bcrypt.hash(account.password, 10);
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              passwordHash: hashedPassword,
              role: account.role,
              mustChangePassword: false, // Admins don't need to change password
              isEmailVerified: true, // Auto-verify admin users
              isActive: true,
              profileComplete: true,
              passwordChangedAt: new Date(),
            },
          });
          console.log(`✅ Updated existing user: ${account.email} with new password and role`);
        }
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(account.password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: account.email,
          username: account.username,
          passwordHash: hashedPassword,
          firstName: account.firstName,
          lastName: account.lastName,
          role: account.role,
          mustChangePassword: false, // Admins don't need to change password
          isEmailVerified: true, // Auto-verify admin users
          isActive: true,
          profileComplete: true,
          passwordChangedAt: new Date(),
        },
      });

      console.log(`✅ Created ${account.role}: ${user.email} (ID: ${user.id})`);
    }

    console.log('\n🎉 Admin account creation completed!');
    
    // Display summary
    const adminUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
      },
      orderBy: {
        role: 'desc' // SUPER_ADMIN first, then ADMIN
      }
    });

    console.log('\n📊 Current admin accounts:');
    adminUsers.forEach(user => {
      const status = user.isActive ? '🟢 Active' : '🔴 Inactive';
      const verified = user.isEmailVerified ? '✅ Verified' : '❌ Unverified';
      console.log(`   ${user.role}: ${user.email} (${user.username}) - ${status} ${verified}`);
    });

    console.log('\n🔑 Login credentials:');
    adminAccounts.forEach(account => {
      console.log(`   ${account.role}:`);
      console.log(`     Email: ${account.email}`);
      console.log(`     Password: ${account.password}`);
    });

  } catch (error) {
    console.error('❌ Error creating admin accounts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createAdminAccounts()
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { createAdminAccounts };
