const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testHierarchyFix() {
  try {
    console.log('🔍 Testing the fixed transformServiceToHierarchical function...');

    // Import the functions we need
    const { getServiceBySlugWithDetails } = require('../lib/api/services-prisma');
    const { transformServiceToHierarchical } = require('../lib/utils/service-hierarchy');

    // Test services that were having issues
    const testServices = ['adamfo-pa', 'fie-ne-fie', 'yonko-pa'];

    for (const serviceSlug of testServices) {
      console.log(`\n📋 Testing ${serviceSlug.toUpperCase()}:`);
      
      // Get service from database (same as API)
      const service = await getServiceBySlugWithDetails(serviceSlug);
      
      if (!service) {
        console.log(`❌ Service ${serviceSlug} not found`);
        continue;
      }

      // Transform using the fixed function
      const serviceData = transformServiceToHierarchical(service);
      
      console.log(`Service Name: ${serviceData.name}`);
      console.log(`Service Base Price: ${serviceData.basePrice}`);
      console.log(`Total Items: ${serviceData.items.length}`);
      
      // Flatten and check optional items
      const flattenItems = (items) => {
        let result = [];
        items.forEach(item => {
          result.push(item);
          if (item.children) {
            result = result.concat(flattenItems(item.children));
          }
        });
        return result;
      };
      
      const allItems = flattenItems(serviceData.items);
      const optionalItems = allItems.filter(item => item.isOptional);
      const optionalItemsWithPrice = optionalItems.filter(item => item.basePrice && item.basePrice > 0);
      
      console.log(`Optional items: ${optionalItems.length}`);
      console.log(`Optional items with price: ${optionalItemsWithPrice.length}`);
      
      if (optionalItems.length > 0) {
        console.log('Optional items pricing:');
        optionalItems.forEach(item => {
          const priceDisplay = item.basePrice > 0 ? `GHS ${item.basePrice}` : 'NO PRICE';
          const willShow = item.basePrice && item.basePrice > 0 ? '✅ WILL SHOW' : '❌ WON\'T SHOW';
          console.log(`  ├─ ${item.name}: ${priceDisplay} ${willShow}`);
        });
      }
      
      if (optionalItems.length > 0 && optionalItemsWithPrice.length === optionalItems.length) {
        console.log('✅ All optional items have pricing - FIXED!');
      } else if (optionalItems.length > 0) {
        console.log('❌ Some optional items still missing pricing');
      } else {
        console.log('ℹ️  No optional items in this service');
      }
    }

  } catch (error) {
    console.error('❌ Error testing hierarchy fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testHierarchyFix();
