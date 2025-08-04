#!/usr/bin/env node

/**
 * Fix Service Categories and Items
 * 
 * This script fixes the service categories and items issues:
 * 1. Adds more categories to AHENEFIE
 * 2. Cleans up broken hierarchy and test data
 * 3. Adds proper pricing to optional items
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing service categories and items...\n');

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

// Helper function to generate UUID
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

try {
  // Get AHENEFIE service ID
  const ahenefieService = db.prepare(`
    SELECT id FROM services WHERE slug = 'ahenefie'
  `).get();

  if (!ahenefieService) {
    console.log('❌ AHENEFIE service not found');
    process.exit(1);
  }

  console.log(`✅ Found AHENEFIE service: ${ahenefieService.id}`);

  // 1. Clean up test items from AHENEFIE
  console.log('\n🧹 Cleaning up test items...');
  const testItems = ['adfdsf', 'asad', 'dsdf', 'sd'];
  
  testItems.forEach(itemName => {
    const result = db.prepare(`
      DELETE FROM service_items 
      WHERE name = ? AND category_id IN (
        SELECT id FROM service_categories WHERE service_id = ?
      )
    `).run(itemName, ahenefieService.id);
    
    if (result.changes > 0) {
      console.log(`   ✅ Removed test item: ${itemName}`);
    }
  });

  // 2. Add more categories to AHENEFIE
  console.log('\n📂 Adding more categories to AHENEFIE...');
  
  const newCategories = [
    {
      name: 'Emergency Response',
      description: 'Emergency medical response and management services',
      sortOrder: 2
    },
    {
      name: 'Additional Services',
      description: 'Optional add-on services for enhanced care',
      sortOrder: 3
    }
  ];

  const insertCategoryStmt = db.prepare(`
    INSERT INTO service_categories (id, service_id, name, description, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);

  const newCategoryIds = [];
  
  newCategories.forEach(category => {
    const categoryId = generateId();
    insertCategoryStmt.run(
      categoryId,
      ahenefieService.id,
      category.name,
      category.description,
      category.sortOrder
    );
    newCategoryIds.push({ id: categoryId, name: category.name });
    console.log(`   ✅ Added category: ${category.name}`);
  });

  // 3. Add items to new categories
  console.log('\n📦 Adding items to new categories...');
  
  const emergencyResponseId = newCategoryIds.find(c => c.name === 'Emergency Response').id;
  const additionalServicesId = newCategoryIds.find(c => c.name === 'Additional Services').id;

  const emergencyItems = [
    { name: '24/7 Emergency Response', isOptional: false, itemLevel: 1, sortOrder: 1 },
    { name: 'First Aid & BLS', isOptional: false, itemLevel: 1, sortOrder: 2 },
    { name: 'Emergency Transportation', isOptional: true, itemLevel: 1, sortOrder: 3, priceHourly: 50, priceDaily: 200, priceMonthly: 4000 },
    { name: 'Hospital Coordination', isOptional: true, itemLevel: 1, sortOrder: 4, priceHourly: 30, priceDaily: 120, priceMonthly: 2500 }
  ];

  const additionalItems = [
    { name: 'Grocery Shopping', isOptional: true, itemLevel: 1, sortOrder: 1, priceHourly: 20, priceDaily: 80, priceMonthly: 1800 },
    { name: 'Pet Care', isOptional: true, itemLevel: 1, sortOrder: 2, priceHourly: 15, priceDaily: 60, priceMonthly: 1200 },
    { name: 'Light Housekeeping', isOptional: true, itemLevel: 1, sortOrder: 3, priceHourly: 18, priceDaily: 70, priceMonthly: 1500 },
    { name: 'Meal Preparation', isOptional: true, itemLevel: 1, sortOrder: 4, priceHourly: 25, priceDaily: 100, priceMonthly: 2200 }
  ];

  const insertItemStmt = db.prepare(`
    INSERT INTO service_items (
      id, category_id, name, is_optional, item_level, sort_order,
      price_hourly, price_daily, price_monthly,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);

  // Add emergency items
  emergencyItems.forEach(item => {
    const itemId = generateId();
    insertItemStmt.run(
      itemId,
      emergencyResponseId,
      item.name,
      item.isOptional ? 1 : 0,
      item.itemLevel,
      item.sortOrder,
      item.priceHourly || 0,
      item.priceDaily || 0,
      item.priceMonthly || 0
    );
    console.log(`   ✅ Added emergency item: ${item.name}${item.isOptional ? ' (Optional)' : ''}`);
  });

  // Add additional service items
  additionalItems.forEach(item => {
    const itemId = generateId();
    insertItemStmt.run(
      itemId,
      additionalServicesId,
      item.name,
      item.isOptional ? 1 : 0,
      item.itemLevel,
      item.sortOrder,
      item.priceHourly || 0,
      item.priceDaily || 0,
      item.priceMonthly || 0
    );
    console.log(`   ✅ Added additional item: ${item.name}${item.isOptional ? ' (Optional)' : ''}`);
  });

  // 4. Fix existing optional items pricing
  console.log('\n💰 Adding pricing to existing optional items...');
  
  const existingOptionalItems = db.prepare(`
    SELECT si.id, si.name, si.price_hourly, si.price_daily, si.price_monthly
    FROM service_items si
    JOIN service_categories sc ON si.category_id = sc.id
    WHERE sc.service_id = ? AND si.is_optional = 1
  `).all(ahenefieService.id);

  const updatePricingStmt = db.prepare(`
    UPDATE service_items 
    SET price_hourly = ?, price_daily = ?, price_monthly = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  existingOptionalItems.forEach(item => {
    // Only update if no pricing is set
    if (item.price_hourly === 0 && item.price_daily === 0 && item.price_monthly === 0) {
      let pricing = { hourly: 20, daily: 80, monthly: 1800 }; // Default pricing
      
      // Custom pricing for specific items
      if (item.name.toLowerCase().includes('laundry')) {
        pricing = { hourly: 15, daily: 60, monthly: 1200 };
      } else if (item.name.toLowerCase().includes('facility')) {
        pricing = { hourly: 35, daily: 140, monthly: 3000 };
      } else if (item.name.toLowerCase().includes('transportation')) {
        pricing = { hourly: 40, daily: 160, monthly: 3500 };
      }
      
      updatePricingStmt.run(pricing.hourly, pricing.daily, pricing.monthly, item.id);
      console.log(`   ✅ Added pricing to: ${item.name}`);
    }
  });

  // 5. Verify the results
  console.log('\n📊 Verification...');
  
  const finalCategories = db.prepare(`
    SELECT name FROM service_categories 
    WHERE service_id = ?
    ORDER BY sort_order
  `).all(ahenefieService.id);

  console.log(`AHENEFIE now has ${finalCategories.length} categories:`);
  finalCategories.forEach(cat => {
    console.log(`   - ${cat.name}`);
  });

  const finalOptionalItems = db.prepare(`
    SELECT COUNT(*) as count FROM service_items si
    JOIN service_categories sc ON si.category_id = sc.id
    WHERE sc.service_id = ? AND si.is_optional = 1
  `).get(ahenefieService.id);

  console.log(`AHENEFIE now has ${finalOptionalItems.count} optional items with pricing`);

  console.log('\n🎉 Service categories and items fixed successfully!');
  console.log('✨ AHENEFIE now has multiple categories and properly priced optional items!');

} catch (error) {
  console.error('❌ Fix failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
