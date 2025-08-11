const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔧 Checking for admin user...');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@alpharescue.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log('📧 Email: admin@alpharescue.com');
      console.log('🔑 Password: admin123');
      console.log('👤 User ID:', existingAdmin.id);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@alpharescue.com',
        passwordHash: hashedPassword,
        role: 'SUPER_ADMIN',
        phone: '+1234567890',
        isActive: true,
        mustChangePassword: false,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@alpharescue.com');
    console.log('🔑 Password: admin123');
    console.log('👤 User ID:', adminUser.id);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
