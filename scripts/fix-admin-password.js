const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function fixAdminPassword() {
  console.log("🔧 Fixing admin password...");

  try {
    // Find the admin user with temp-hash
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: "admin@arccare.com" }, { passwordHash: "temp-hash" }],
      },
    });

    if (adminUser) {
      // Hash the proper password
      const properPasswordHash = await bcrypt.hash("admin123", 10);

      // Update the admin user
      const updatedAdmin = await prisma.user.update({
        where: { id: adminUser.id },
        data: {
          passwordHash: properPasswordHash,
          email: "admin@arccare.com",
          username: "admin",
          firstName: "Admin",
          lastName: "User",
          role: "ADMIN",
          isActive: true,
          isEmailVerified: true,
          mustChangePassword: false,
        },
      });

      console.log("✅ Admin password fixed for:", updatedAdmin.email);
    } else {
      console.log("❌ Admin user not found");
    }

    // Also ensure super admin exists with proper password
    const superAdminExists = await prisma.user.findUnique({
      where: { email: "superadmin@arccare.com" },
    });

    if (!superAdminExists) {
      const superAdminPasswordHash = await bcrypt.hash("superadmin123", 10);

      const superAdmin = await prisma.user.create({
        data: {
          email: "superadmin@arccare.com",
          username: "superadmin",
          passwordHash: superAdminPasswordHash,
          firstName: "Super",
          lastName: "Admin",
          role: "SUPER_ADMIN",
          isActive: true,
          isEmailVerified: true,
          mustChangePassword: false,
        },
      });

      console.log("✅ Super Admin created:", superAdmin.email);
    } else {
      console.log("ℹ️  Super Admin already exists:", superAdminExists.email);
    }

    console.log("\n🎉 Admin passwords fixed!");
    console.log("\n📋 Login Credentials:");
    console.log("Super Admin:");
    console.log("  Email: superadmin@arccare.com");
    console.log("  Password: superadmin123");
    console.log("\nAdmin:");
    console.log("  Email: admin@arccare.com");
    console.log("  Password: admin123");
  } catch (error) {
    console.error("❌ Error fixing admin password:", error);
    throw error;
  }
}

fixAdminPassword()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
