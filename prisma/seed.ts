import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Creating admin user only...");

  // Create admin user only
  const hashedPassword = await bcrypt.hash("password", 10);

  try {
    // First, try to find if there's already a user with username "admin"
    const existingUserWithUsername = await prisma.user.findUnique({
      where: { username: "admin" },
    });

    if (
      existingUserWithUsername &&
      existingUserWithUsername.email !== "admin@arc.com"
    ) {
      console.log(
        "🔄 Found existing user with username 'admin', updating their username..."
      );
      // Update the existing user's username to avoid conflict
      await prisma.user.update({
        where: { id: existingUserWithUsername.id },
        data: { username: `${existingUserWithUsername.username}_old` },
      });
    }

    const admin = await prisma.user.upsert({
      where: { email: "admin@arc.com" },
      update: {
        passwordHash: hashedPassword,
        username: "admin",
        firstName: "System",
        lastName: "Administrator",
        role: "ADMIN",
        isEmailVerified: true,
        profileComplete: true,
        mustChangePassword: false,
      },
      create: {
        email: "admin@arc.com",
        username: "admin",
        passwordHash: hashedPassword,
        firstName: "System",
        lastName: "Administrator",
        role: "ADMIN",
        isEmailVerified: true,
        profileComplete: true,
        mustChangePassword: false,
      },
    });

    console.log("✅ Admin user created/updated successfully!");
    console.log("📧 Email: admin@arc.com");
    console.log("🔑 Password: password");
    console.log("👤 User ID:", admin.id);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
