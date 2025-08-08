#!/usr/bin/env node

/**
 * Migration script to consolidate pricing columns into a single basePrice column
 * This script:
 * 1. Adds new base_price columns to services and service_items tables
 * 2. Migrates existing pricing data (prioritizing daily, then monthly, then hourly)
 * 3. Removes old pricing columns
 */

const Database = require('better-sqlite3');
const path = require('path');

// Database path
const dbPath = path.join(process.cwd(), 'database.sqlite');

console.log('🔄 Starting migration to single price structure...');

try {
  // Connect to database
  const db = new Database(dbPath);
  console.log('✅ Connected to SQLite database');

  // Start transaction
  const transaction = db.transaction(() => {
    console.log('\n📋 Step 1: Adding new base_price columns...');
    
    // Add new base_price column to services table
    try {
      db.exec(`ALTER TABLE services ADD COLUMN base_price REAL`);
      console.log('   ✅ Added base_price column to services table');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log('   ℹ️  base_price column already exists in services table');
      } else {
        throw error;
      }
    }

    // Add new base_price column to service_items table
    try {
      db.exec(`ALTER TABLE service_items ADD COLUMN base_price REAL`);
      console.log('   ✅ Added base_price column to service_items table');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log('   ℹ️  base_price column already exists in service_items table');
      } else {
        throw error;
      }
    }

    console.log('\n📊 Step 2: Migrating existing pricing data...');
    
    // Migrate services pricing data
    const services = db.prepare(`
      SELECT id, name, base_price_daily, base_price_monthly, base_price_hourly, base_price
      FROM services
    `).all();

    console.log(`   Found ${services.length} services to migrate`);
    
    const updateServicePrice = db.prepare(`
      UPDATE services 
      SET base_price = ? 
      WHERE id = ?
    `);

    services.forEach(service => {
      // Skip if base_price is already set
      if (service.base_price !== null && service.base_price !== undefined) {
        console.log(`   ⏭️  ${service.name}: base_price already set (${service.base_price})`);
        return;
      }

      // Prioritize daily, then monthly, then hourly
      let newPrice = service.base_price_daily || service.base_price_monthly || service.base_price_hourly || 0;
      
      updateServicePrice.run(newPrice, service.id);
      console.log(`   ✅ ${service.name}: migrated to ${newPrice}`);
    });

    // Migrate service_items pricing data
    const serviceItems = db.prepare(`
      SELECT id, name, price_daily, price_monthly, price_hourly, base_price
      FROM service_items
    `).all();

    console.log(`   Found ${serviceItems.length} service items to migrate`);
    
    const updateItemPrice = db.prepare(`
      UPDATE service_items 
      SET base_price = ? 
      WHERE id = ?
    `);

    serviceItems.forEach(item => {
      // Skip if base_price is already set
      if (item.base_price !== null && item.base_price !== undefined) {
        console.log(`   ⏭️  ${item.name}: base_price already set (${item.base_price})`);
        return;
      }

      // Prioritize daily, then monthly, then hourly
      let newPrice = item.price_daily || item.price_monthly || item.price_hourly || 0;
      
      updateItemPrice.run(newPrice, item.id);
      console.log(`   ✅ ${item.name}: migrated to ${newPrice}`);
    });

    console.log('\n🗑️  Step 3: Removing old pricing columns...');
    
    // Note: SQLite doesn't support DROP COLUMN directly
    // We'll need to recreate the tables without the old columns
    
    console.log('   ⚠️  SQLite limitation: Cannot drop columns directly');
    console.log('   ℹ️  Old pricing columns will remain but should not be used');
    console.log('   ℹ️  Consider running VACUUM to reclaim space after confirming migration');
  });

  // Execute transaction
  transaction();

  console.log('\n🎉 Migration completed successfully!');
  
  // Verify migration
  console.log('\n🔍 Verification: Checking migrated data...');
  
  const verifyServices = db.prepare(`
    SELECT name, base_price, base_price_daily, base_price_monthly, base_price_hourly
    FROM services
    ORDER BY name
  `).all();

  console.log('\n📊 Services pricing after migration:');
  verifyServices.forEach(service => {
    console.log(`   - ${service.name}: base_price=${service.base_price} (was daily=${service.base_price_daily}, monthly=${service.base_price_monthly}, hourly=${service.base_price_hourly})`);
  });

  const verifyItems = db.prepare(`
    SELECT name, base_price, price_daily, price_monthly, price_hourly
    FROM service_items
    WHERE base_price > 0
    ORDER BY name
    LIMIT 10
  `).all();

  console.log('\n📊 Sample service items pricing after migration:');
  verifyItems.forEach(item => {
    console.log(`   - ${item.name}: base_price=${item.base_price} (was daily=${item.price_daily}, monthly=${item.price_monthly}, hourly=${item.price_hourly})`);
  });

  db.close();
  console.log('\n✅ Database connection closed');
  console.log('\n🎯 Next steps:');
  console.log('   1. Test the application to ensure pricing displays correctly');
  console.log('   2. Run Prisma migration: npx prisma db push');
  console.log('   3. Consider running VACUUM to reclaim space from unused columns');

} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}
