const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testApiResponse() {
  try {
    console.log('🔍 Testing API response transformation...');

    // Simulate the same query that the API uses
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: {
        serviceItems: {
          orderBy: [
            { level: 'asc' },
            { sortOrder: 'asc' }
          ]
        }
      }
    });

    console.log(`Found ${services.length} active services\n`);

    // Test the transformation logic from the API
    const transformToPublicServices = (services) => {
      return services.map((service) => {
        // Helper function to build hierarchical structure
        const buildHierarchy = (items, parentId = null) => {
          return items
            .filter((item) => item.parentId === parentId)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .map((item) => ({
              id: item.id,
              name: item.name,
              description: item.description || undefined,
              level: item.level,
              isOptional: !item.isRequired,
              basePrice: Number(item.basePrice || 0), // ⚠️ This is the critical line
              children: buildHierarchy(items, item.id), // Recursively build children
            }));
        };

        // Build hierarchical structure starting with top-level items (parentId = null)
        const items = buildHierarchy(service.serviceItems, null);

        return {
          id: service.id,
          name: service.name,
          description: service.description || undefined,
          basePrice: Number(service.basePrice || 0),
          items,
        };
      });
    };

    const publicServices = transformToPublicServices(services);

    // Test specifically for AHENEFIE service
    const ahenefieService = publicServices.find(s => s.name.toLowerCase().includes('ahenefie'));
    
    if (ahenefieService) {
      console.log('📋 AHENEFIE Service API Response:');
      console.log(`Service Base Price: ${ahenefieService.basePrice}`);
      console.log('Items:');
      
      const printItems = (items, indent = '') => {
        items.forEach(item => {
          const priceDisplay = item.basePrice > 0 ? `GHS ${item.basePrice}` : 'NO PRICE';
          const optionalStatus = item.isOptional ? 'OPTIONAL' : 'REQUIRED';
          
          console.log(`${indent}├─ ${item.name}`);
          console.log(`${indent}   └─ ${optionalStatus} | ${priceDisplay} | Level ${item.level}`);
          console.log(`${indent}      Raw basePrice value: ${item.basePrice} (type: ${typeof item.basePrice})`);
          
          if (item.children && item.children.length > 0) {
            printItems(item.children, indent + '  ');
          }
        });
      };
      
      printItems(ahenefieService.items);
      
      // Check specifically for optional items with pricing issues
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
      
      const allItems = flattenItems(ahenefieService.items);
      const optionalItems = allItems.filter(item => item.isOptional);
      const optionalItemsWithoutPrice = optionalItems.filter(item => !item.basePrice || item.basePrice <= 0);
      
      console.log('\n📊 AHENEFIE Analysis:');
      console.log(`Total items: ${allItems.length}`);
      console.log(`Optional items: ${optionalItems.length}`);
      console.log(`Optional items without price: ${optionalItemsWithoutPrice.length}`);
      
      if (optionalItemsWithoutPrice.length > 0) {
        console.log('\n❌ Optional items with pricing issues:');
        optionalItemsWithoutPrice.forEach(item => {
          console.log(`  - ${item.name}: basePrice = ${item.basePrice} (${typeof item.basePrice})`);
        });
      } else {
        console.log('\n✅ All optional items have proper pricing in API response');
      }
    }

  } catch (error) {
    console.error('❌ Error testing API response:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testApiResponse();
