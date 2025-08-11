import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔧 Creating admin user...');

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
