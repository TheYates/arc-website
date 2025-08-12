const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFrontendApi() {
  try {
    console.log('🔍 Testing the exact API endpoint that frontend calls...');
    console.log('Endpoint: /api/services/pricing?name=AHENEFIE\n');

    // Simulate the exact same logic from /api/services/pricing/route.ts
    const { getAllServicesWithItems } = require('../lib/api/services-prisma');
    
    // Get active services with items in a single optimized query
    const allServicesWithItems = await getAllServicesWithItems(false); // Only active services for public
    
    console.log(`Found ${allServicesWithItems.length} active services`);
    
    // Transform to public services format (same as API)
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
              basePrice: Number(item.basePrice || 0),
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

    const publicServices = transformToPublicServices(allServicesWithItems);
    
    // Find AHENEFIE service (same logic as API)
    const serviceName = "AHENEFIE";
    const service = publicServices.find(
      (s) =>
        s.name.toLowerCase() === serviceName?.toLowerCase() ||
        s.name.toLowerCase().includes(serviceName?.toLowerCase() || "")
    );

    if (!service) {
      console.log('❌ AHENEFIE service not found!');
      console.log('Available services:', publicServices.map(s => s.name));
      return;
    }

    console.log('\n📋 AHENEFIE Service (Frontend API Response):');
    console.log(`Service ID: ${service.id}`);
    console.log(`Service Name: ${service.name}`);
    console.log(`Service Base Price: ${service.basePrice}`);
    console.log(`Total Items: ${service.items.length}`);
    
    // Flatten and analyze items
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
    
    const allItems = flattenItems(service.items);
    const optionalItems = allItems.filter(item => item.isOptional);
    
    console.log('\n🔍 Optional Items Analysis:');
    optionalItems.forEach(item => {
      console.log(`├─ ${item.name}`);
      console.log(`   └─ basePrice: ${item.basePrice} (${typeof item.basePrice})`);
      console.log(`   └─ condition (basePrice && basePrice > 0): ${item.basePrice && item.basePrice > 0}`);
      console.log(`   └─ would show price: ${item.basePrice && item.basePrice > 0 ? 'YES' : 'NO'}`);
    });
    
    // Create the exact response that the API would return
    const apiResponse = {
      success: true,
      data: service,
    };
    
    console.log('\n📤 Complete API Response:');
    console.log(JSON.stringify(apiResponse, null, 2));

  } catch (error) {
    console.error('❌ Error testing frontend API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFrontendApi();
