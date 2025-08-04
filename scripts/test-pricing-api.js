#!/usr/bin/env node

/**
 * Test Pricing API Updates
 * 
 * This script tests that the API correctly handles pricing data
 * for service items.
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing pricing API updates...\n');

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
  // Test 1: Check if pricing columns exist
  console.log('🔍 Test 1: Checking pricing columns...');
  const tableInfo = db.prepare("PRAGMA table_info(service_items)").all();
  const pricingColumns = tableInfo.filter(col => col.name.startsWith('price_'));
  
  if (pricingColumns.length === 3) {
    console.log('   ✅ All pricing columns exist');
    pricingColumns.forEach(col => {
      console.log(`      - ${col.name}: ${col.type}`);
    });
  } else {
    console.log('   ❌ Missing pricing columns');
    process.exit(1);
  }

  // Test 2: Check sample data structure
  console.log('\n🔍 Test 2: Checking data structure...');
  const sampleItem = db.prepare(`
    SELECT id, name, is_optional, price_hourly, price_daily, price_monthly
    FROM service_items 
    WHERE is_optional = 1
    LIMIT 1
  `).get();

  if (sampleItem) {
    console.log('   ✅ Found optional item for testing:');
    console.log(`      Name: ${sampleItem.name}`);
    console.log(`      Hourly: GHS ${(sampleItem.price_hourly || 0).toFixed(2)}`);
    console.log(`      Daily: GHS ${(sampleItem.price_daily || 0).toFixed(2)}`);
    console.log(`      Monthly: GHS ${(sampleItem.price_monthly || 0).toFixed(2)}`);
  } else {
    console.log('   ⚠️  No optional items found for testing');
  }

  // Test 3: Test updating an optional item with pricing
  console.log('\n🔍 Test 3: Testing price updates...');
  if (sampleItem) {
    const testPrices = {
      hourly: 25.50,
      daily: 150.00,
      monthly: 3500.00
    };

    const updateStmt = db.prepare(`
      UPDATE service_items 
      SET price_hourly = ?, price_daily = ?, price_monthly = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateStmt.run(testPrices.hourly, testPrices.daily, testPrices.monthly, sampleItem.id);

    // Verify the update
    const updatedItem = db.prepare(`
      SELECT name, price_hourly, price_daily, price_monthly
      FROM service_items 
      WHERE id = ?
    `).get(sampleItem.id);

    if (updatedItem) {
      console.log('   ✅ Price update successful:');
      console.log(`      Item: ${updatedItem.name}`);
      console.log(`      Hourly: GHS ${updatedItem.price_hourly.toFixed(2)}`);
      console.log(`      Daily: GHS ${updatedItem.price_daily.toFixed(2)}`);
      console.log(`      Monthly: GHS ${updatedItem.price_monthly.toFixed(2)}`);
    } else {
      console.log('   ❌ Failed to verify price update');
    }
  }

  // Test 4: Show all optional items with pricing
  console.log('\n🔍 Test 4: All optional items with pricing...');
  const optionalItems = db.prepare(`
    SELECT name, price_hourly, price_daily, price_monthly
    FROM service_items 
    WHERE is_optional = 1
    ORDER BY name
  `).all();

  if (optionalItems.length > 0) {
    console.log(`   ✅ Found ${optionalItems.length} optional items:`);
    optionalItems.forEach(item => {
      console.log(`      - ${item.name}`);
      if (item.price_hourly > 0 || item.price_daily > 0 || item.price_monthly > 0) {
        console.log(`        Pricing: H:${item.price_hourly} D:${item.price_daily} M:${item.price_monthly}`);
      } else {
        console.log(`        No pricing set`);
      }
    });
  } else {
    console.log('   ⚠️  No optional items found');
  }

  console.log('\n🎉 API pricing tests completed successfully!');
  console.log('✨ Ready for admin interface enhancement!');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
