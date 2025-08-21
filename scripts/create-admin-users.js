const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUsers() {
  console.log('🔧 Creating admin and super admin users...');

  try {
    // Create super admin user
    const superAdminExists = await prisma.user.findUnique({
      where: { email: 'superadmin@arccare.com' }
    });

    if (!superAdminExists) {
      const superAdminPasswordHash = await bcrypt.hash('superadmin123', 10);
      
      const superAdmin = await prisma.user.create({
        data: {
          email: 'superadmin@arccare.com',
          username: 'superadmin',
          passwordHash: superAdminPasswordHash,
          firstName: 'Super',
          lastName: 'Admin',
          role: 'SUPER_ADMIN',
          isActive: true,
        },
      });
      
      console.log('✅ Super Admin created:', superAdmin.email);
    } else {
      console.log('ℹ️  Super Admin already exists:', superAdminExists.email);
    }

    // Create admin user
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@arccare.com' }
    });

    if (!adminExists) {
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      
      const admin = await prisma.user.create({
        data: {
          email: 'admin@arccare.com',
          username: 'admin',
          passwordHash: adminPasswordHash,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          isActive: true,
        },
      });
      
      console.log('✅ Admin created:', admin.email);
    } else {
      console.log('ℹ️  Admin already exists:', adminExists.email);
    }

    console.log('\n🎉 Admin users setup complete!');
    console.log('\n📋 Login Credentials:');
    console.log('Super Admin:');
    console.log('  Email: superadmin@arccare.com');
    console.log('  Password: superadmin123');
    console.log('\nAdmin:');
    console.log('  Email: admin@arccare.com');
    console.log('  Password: admin123');

  } catch (error) {
    console.error('❌ Error creating admin users:', error);
    throw error;
  }
}

createAdminUsers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
