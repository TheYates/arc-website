#!/usr/bin/env node

/**
 * Data migration script to populate the new base_price columns
 * This script connects to PostgreSQL and migrates existing pricing data
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migratePricingData() {
  console.log('🔄 Starting pricing data migration...');

  try {
    // Get all services and update their base_price
    console.log('\n📊 Step 1: Migrating services pricing...');
    
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        basePrice: true,
      }
    });

    console.log(`   Found ${services.length} services`);

    // Since we already have basePrice in the schema, let's check if any need default values
    const servicesNeedingPrice = services.filter(s => !s.basePrice);
    
    if (servicesNeedingPrice.length > 0) {
      console.log(`   ${servicesNeedingPrice.length} services need default pricing`);
      
      // Set default pricing for services without basePrice
      const defaultPricing = {
        'ahenefie': 350,
        'adamfo-pa': 370,
        'fie-ne-fie': 275,
        'yonko-pa': 225,
        'conference-option': 400,
        'event-medical-coverage': 450,
      };

      for (const service of servicesNeedingPrice) {
        // Try to determine price based on service name/slug
        let price = 300; // default fallback
        
        const serviceName = service.name.toLowerCase();
        if (serviceName.includes('ahenefie')) price = 350;
        else if (serviceName.includes('adamfo')) price = 370;
        else if (serviceName.includes('fie ne fie')) price = 275;
        else if (serviceName.includes('yonko')) price = 225;
        else if (serviceName.includes('conference')) price = 400;
        else if (serviceName.includes('event') || serviceName.includes('medical')) price = 450;

        await prisma.service.update({
          where: { id: service.id },
          data: { basePrice: price }
        });

        console.log(`   ✅ ${service.name}: set to GHS ${price}`);
      }
    } else {
      console.log('   ✅ All services already have pricing');
    }

    // Get all service items and update their base_price
    console.log('\n📊 Step 2: Migrating service items pricing...');
    
    const serviceItems = await prisma.serviceItem.findMany({
      select: {
        id: true,
        name: true,
        basePrice: true,
        isRequired: true,
      }
    });

    console.log(`   Found ${serviceItems.length} service items`);

    // Set pricing for optional items that don't have basePrice
    const itemsNeedingPrice = serviceItems.filter(item => 
      !item.isRequired && (!item.basePrice || item.basePrice === 0)
    );

    if (itemsNeedingPrice.length > 0) {
      console.log(`   ${itemsNeedingPrice.length} optional items need pricing`);

      for (const item of itemsNeedingPrice) {
        let price = 25; // default for optional items
        
        const itemName = item.name.toLowerCase();
        
        // Set pricing based on item type
        if (itemName.includes('lab')) price = 30;
        else if (itemName.includes('laundry')) price = 20;
        else if (itemName.includes('tuition')) price = 25;
        else if (itemName.includes('facility') || itemName.includes('review')) price = 18;
        else if (itemName.includes('medication')) price = 22;
        else if (itemName.includes('wound')) price = 16;
        else if (itemName.includes('transport')) price = 32;

        await prisma.serviceItem.update({
          where: { id: item.id },
          data: { basePrice: price }
        });

        console.log(`   ✅ ${item.name}: set to GHS ${price}`);
      }
    } else {
      console.log('   ✅ All optional service items already have pricing');
    }

    // Set required items to 0 price
    const requiredItems = serviceItems.filter(item => 
      item.isRequired && (!item.basePrice || item.basePrice !== 0)
    );

    if (requiredItems.length > 0) {
      console.log(`   Setting ${requiredItems.length} required items to GHS 0`);

      for (const item of requiredItems) {
        await prisma.serviceItem.update({
          where: { id: item.id },
          data: { basePrice: 0 }
        });

        console.log(`   ✅ ${item.name}: set to GHS 0 (required)`);
      }
    }

    console.log('\n🔍 Verification: Checking migrated data...');
    
    // Verify services
    const updatedServices = await prisma.service.findMany({
      select: {
        name: true,
        basePrice: true,
      },
      orderBy: { name: 'asc' }
    });

    console.log('\n📊 Services pricing after migration:');
    updatedServices.forEach(service => {
      console.log(`   - ${service.name}: GHS ${service.basePrice || 0}`);
    });

    // Verify service items (show only optional items with pricing)
    const optionalItems = await prisma.serviceItem.findMany({
      where: {
        isRequired: false,
        basePrice: { gt: 0 }
      },
      select: {
        name: true,
        basePrice: true,
      },
      orderBy: { name: 'asc' },
      take: 10
    });

    console.log('\n📊 Sample optional service items pricing:');
    optionalItems.forEach(item => {
      console.log(`   - ${item.name}: GHS ${item.basePrice || 0}`);
    });

    console.log('\n🎉 Pricing data migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migratePricingData()
  .then(() => {
    console.log('\n✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
