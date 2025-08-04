#!/usr/bin/env node

/**
 * Add Pricing Columns to Service Items
 * 
 * This script adds pricing columns to the service_items table
 * to support individual pricing for optional items.
 */

const fs = require('fs');
const path = require('path');

console.log('💰 Adding pricing columns to service_items table...\n');

// Check if better-sqlite3 is available
let Database;
try {
  Database = require('better-sqlite3');
  console.log('✅ better-sqlite3 package found');
} catch (error) {
  console.log('❌ better-sqlite3 package not found');
  process.exit(1);
}

// Initialize database
const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'arc.db');

if (!fs.existsSync(dbPath)) {
  console.log('❌ Database file not found');
  process.exit(1);
}

const db = new Database(dbPath);
console.log('✅ Connected to SQLite database');

try {
  // Check if columns already exist
  const tableInfo = db.prepare("PRAGMA table_info(service_items)").all();
  const existingColumns = tableInfo.map(col => col.name);
  
  const columnsToAdd = [
    { name: 'price_hourly', exists: existingColumns.includes('price_hourly') },
    { name: 'price_daily', exists: existingColumns.includes('price_daily') },
    { name: 'price_monthly', exists: existingColumns.includes('price_monthly') }
  ];

  console.log('📋 Checking existing columns...');
  columnsToAdd.forEach(col => {
    if (col.exists) {
      console.log(`   ✅ Column ${col.name} already exists`);
    } else {
      console.log(`   ➕ Column ${col.name} needs to be added`);
    }
  });

  // Add missing columns
  const columnsToCreate = columnsToAdd.filter(col => !col.exists);
  
  if (columnsToCreate.length === 0) {
    console.log('\n✅ All pricing columns already exist!');
    process.exit(0);
  }

  console.log('\n🔧 Adding missing pricing columns...');
  
  db.transaction(() => {
    columnsToCreate.forEach(col => {
      const sql = `ALTER TABLE service_items ADD COLUMN ${col.name} DECIMAL(10,2) DEFAULT 0.00`;
      db.prepare(sql).run();
      console.log(`   ✅ Added column: ${col.name}`);
    });
  })();

  // Verify the changes
  console.log('\n🔍 Verifying changes...');
  const updatedTableInfo = db.prepare("PRAGMA table_info(service_items)").all();
  const pricingColumns = updatedTableInfo.filter(col => 
    col.name.startsWith('price_')
  );

  console.log('📊 Pricing columns in service_items table:');
  pricingColumns.forEach(col => {
    console.log(`   - ${col.name}: ${col.type} (Default: ${col.dflt_value || 'NULL'})`);
  });

  // Show sample of existing data
  console.log('\n📋 Sample service items (first 5):');
  const sampleItems = db.prepare(`
    SELECT id, name, is_optional, price_hourly, price_daily, price_monthly
    FROM service_items 
    LIMIT 5
  `).all();

  if (sampleItems.length > 0) {
    sampleItems.forEach(item => {
      const optional = item.is_optional ? ' (Optional)' : '';
      console.log(`   - ${item.name}${optional}`);
      console.log(`     Hourly: GHS ${(item.price_hourly || 0).toFixed(2)}`);
      console.log(`     Daily: GHS ${(item.price_daily || 0).toFixed(2)}`);
      console.log(`     Monthly: GHS ${(item.price_monthly || 0).toFixed(2)}`);
    });
  } else {
    console.log('   No service items found');
  }

  console.log('\n🎉 Pricing columns added successfully!');
  console.log('✨ Optional service items can now have individual pricing!');

  // Show next steps
  console.log('\n📝 Next Steps:');
  console.log('   1. Update TypeScript interfaces to include pricing fields');
  console.log('   2. Update API endpoints to handle pricing data');
  console.log('   3. Enhance admin interface to set prices for optional items');
  console.log('   4. Create client interface for service customization');

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
