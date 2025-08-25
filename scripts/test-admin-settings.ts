import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testAdminSettings() {
  console.log("🧪 Testing admin settings...");

  try {
    // Check if admin settings exist in database
    const settings = await prisma.adminSettings.findMany({
      orderBy: { category: "asc" },
    });

    console.log(`📊 Found ${settings.length} admin settings in database:`);
    
    // Group by category for better display
    const grouped = settings.reduce((acc: any, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});

    Object.entries(grouped).forEach(([category, categorySettings]: [string, any]) => {
      console.log(`\n📁 Category: ${category}`);
      categorySettings.forEach((setting: any) => {
        console.log(`  ✓ ${setting.key}: ${setting.value}`);
        if (setting.description) {
          console.log(`    📝 ${setting.description}`);
        }
      });
    });

    if (settings.length === 0) {
      console.log("❌ No admin settings found! Run the seeding script first.");
    } else {
      console.log("\n✅ Admin settings are properly stored in database!");
    }

  } catch (error) {
    console.error("❌ Error testing admin settings:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test function if this file is executed directly
if (require.main === module) {
  testAdminSettings()
    .then(() => {
      console.log("\nTest completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Test failed:", error);
      process.exit(1);
    });
}

export { testAdminSettings };
