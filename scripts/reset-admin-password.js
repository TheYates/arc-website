const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log('🔧 Resetting password for admin@arc.com...');

    // Find the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@arc.com' }
    });

    if (!adminUser) {
      console.log('❌ Admin user with email admin@arc.com not found!');
      console.log('💡 You can create the admin user by running: npm run db:seed');
      return;
    }

    console.log('✅ Found admin user:', {
      id: adminUser.id,
      email: adminUser.email,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      role: adminUser.role
    });

    // Set new password to "password"
    const newPassword = 'password';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        passwordHash: hashedPassword,
        mustChangePassword: false, // Allow login without forced password change
        passwordChangedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('✅ Password reset successfully!');
    console.log('📧 Email: admin@arc.com');
    console.log('🔑 New Password: password');
    console.log('🚀 You can now login with these credentials');

  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
