const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateServicePricing() {
  try {
    console.log('🔧 Updating service pricing for optional items...');

    // Get all services with their items
    const services = await prisma.service.findMany({
      include: {
        serviceItems: true
      }
    });

    console.log(`Found ${services.length} services`);

    // Sample pricing for different types of optional items
    const pricingRules = {
      // Emergency and medical services
      'emergency': 50,
      'ambulance': 100,
      'medical': 30,
      'doctor': 80,
      'nurse': 60,
      'medication': 25,
      'equipment': 40,
      
      // Care services
      'personal': 20,
      'hygiene': 15,
      'bathing': 25,
      'feeding': 20,
      'mobility': 30,
      'companionship': 35,
      'housekeeping': 25,
      'laundry': 15,
      'cooking': 30,
      'shopping': 20,
      
      // Specialized services
      'therapy': 70,
      'physiotherapy': 80,
      'occupational': 75,
      'speech': 70,
      'mental': 60,
      'counseling': 55,
      
      // Technology and monitoring
      'monitoring': 45,
      'alert': 35,
      'communication': 25,
      'technology': 40,
      
      // Default pricing
      'default': 25
    };

    // Function to determine price based on item name
    const getPriceForItem = (itemName) => {
      const name = itemName.toLowerCase();
      
      for (const [keyword, price] of Object.entries(pricingRules)) {
        if (keyword !== 'default' && name.includes(keyword)) {
          return price;
        }
      }
      
      return pricingRules.default;
    };

    let updatedCount = 0;

    for (const service of services) {
      console.log(`\n📋 Processing service: ${service.name}`);
      
      for (const item of service.serviceItems) {
        // Only update optional items (not required) that don't have a price set
        if (!item.isRequired && (!item.basePrice || item.basePrice == 0)) {
          const newPrice = getPriceForItem(item.name);
          
          await prisma.serviceItem.update({
            where: { id: item.id },
            data: { basePrice: newPrice }
          });
          
          console.log(`  ✅ Updated "${item.name}": GHS ${newPrice}`);
          updatedCount++;
        } else if (item.isRequired) {
          console.log(`  ⏭️  Skipped "${item.name}" (required item)`);
        } else if (item.basePrice && item.basePrice > 0) {
          console.log(`  ⏭️  Skipped "${item.name}" (already has price: GHS ${item.basePrice})`);
        }
      }
    }

    console.log(`\n✅ Successfully updated pricing for ${updatedCount} optional service items!`);
    console.log('🚀 Optional items will now show their prices on the service pages');

  } catch (error) {
    console.error('❌ Error updating service pricing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateServicePricing();
