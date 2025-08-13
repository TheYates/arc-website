const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkServicePricing() {
  try {
    console.log("🔍 Checking service_items table for pricing data...");

    // Get all services with their items
    const services = await prisma.service.findMany({
      include: {
        serviceItems: {
          orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
        },
      },
      orderBy: { name: "asc" },
    });

    console.log(`\nFound ${services.length} services in database\n`);

    for (const service of services) {
      console.log(
        `📋 SERVICE: ${service.name} (${service.serviceItems.length} items)`
      );
      console.log(`   Active: ${service.isActive}`);

      if (service.serviceItems.length === 0) {
        console.log("   ⚠️  No service items found");
      } else {
        console.log("   Items:");

        for (const item of service.serviceItems) {
          const requiredStatus = item.isRequired ? "REQUIRED" : "OPTIONAL";
          const levelIndent = "  ".repeat(item.level);

          console.log(`   ${levelIndent}├─ ${item.name}`);
          console.log(
            `   ${levelIndent}   └─ ${requiredStatus} | Level ${item.level}`
          );

          if (item.description) {
            console.log(
              `   ${levelIndent}      Description: ${item.description.substring(
                0,
                60
              )}...`
            );
          }
        }
      }
      console.log(""); // Empty line between services
    }

    // Summary statistics
    const totalItems = services.reduce(
      (sum, service) => sum + service.serviceItems.length,
      0
    );
    const optionalItems = services.reduce(
      (sum, service) =>
        sum + service.serviceItems.filter((item) => !item.isRequired).length,
      0
    );
    const optionalItemsWithPrice = services.reduce(
      (sum, service) =>
        sum +
        service.serviceItems.filter(
          (item) => !item.isRequired && item.basePrice && item.basePrice > 0
        ).length,
      0
    );
    const optionalItemsWithoutPrice = optionalItems - optionalItemsWithPrice;

    console.log("📊 SUMMARY:");
    console.log(`   Total services: ${services.length}`);
    console.log(`   Total service items: ${totalItems}`);
    console.log(`   Optional items: ${optionalItems}`);
    console.log(`   Optional items WITH price: ${optionalItemsWithPrice}`);
    console.log(
      `   Optional items WITHOUT price: ${optionalItemsWithoutPrice}`
    );

    if (optionalItemsWithoutPrice > 0) {
      console.log("\n❌ ISSUE FOUND: Some optional items have no pricing set");
      console.log('   This is why they show as "0" on the frontend');
    } else {
      console.log("\n✅ All optional items have pricing set");
      console.log("   The issue might be in the frontend display logic");
    }
  } catch (error) {
    console.error("❌ Error checking service pricing:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkServicePricing();
