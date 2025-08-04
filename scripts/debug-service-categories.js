#!/usr/bin/env node

/**
 * Debug Service Categories and Items
 * 
 * This script investigates the current state of service categories
 * and items to understand why there's only one category option.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging service categories and items...\n');

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
  // Check all services
  console.log('🔍 1. Checking all services...');
  const services = db.prepare(`
    SELECT id, name, slug, display_name
    FROM services 
    ORDER BY name
  `).all();

  console.log(`Found ${services.length} services:`);
  services.forEach(service => {
    console.log(`   - ${service.display_name || service.name} (ID: ${service.id}, Slug: ${service.slug})`);
  });

  // Check service categories for each service
  console.log('\n🔍 2. Checking service categories...');
  services.forEach(service => {
    console.log(`\n📋 Categories for ${service.display_name || service.name}:`);
    
    const categories = db.prepare(`
      SELECT id, name, description, sort_order
      FROM service_categories 
      WHERE service_id = ?
      ORDER BY sort_order, name
    `).all(service.id);

    if (categories.length > 0) {
      categories.forEach(category => {
        console.log(`   - ${category.name} (ID: ${category.id})`);
        if (category.description) {
          console.log(`     Description: ${category.description}`);
        }
      });
    } else {
      console.log('   ❌ No categories found for this service');
    }
  });

  // Check service items for each category
  console.log('\n🔍 3. Checking service items...');
  services.forEach(service => {
    console.log(`\n📦 Items for ${service.display_name || service.name}:`);
    
    const categories = db.prepare(`
      SELECT id, name
      FROM service_categories 
      WHERE service_id = ?
      ORDER BY sort_order, name
    `).all(service.id);

    if (categories.length > 0) {
      categories.forEach(category => {
        console.log(`\n   📂 Category: ${category.name}`);
        
        const items = db.prepare(`
          SELECT id, name, is_optional, item_level, parent_item_id,
                 price_hourly, price_daily, price_monthly
          FROM service_items 
          WHERE category_id = ?
          ORDER BY sort_order, name
        `).all(category.id);

        if (items.length > 0) {
          items.forEach(item => {
            const optional = item.is_optional ? ' (Optional)' : '';
            const level = `Level ${item.item_level}`;
            const parent = item.parent_item_id ? ` [Parent: ${item.parent_item_id}]` : '';
            console.log(`      - ${item.name}${optional} - ${level}${parent}`);
            
            if (item.is_optional && (item.price_hourly > 0 || item.price_daily > 0 || item.price_monthly > 0)) {
              console.log(`        Pricing: H:${item.price_hourly} D:${item.price_daily} M:${item.price_monthly}`);
            }
          });
        } else {
          console.log('      ❌ No items found in this category');
        }
      });
    } else {
      console.log('   ❌ No categories found for this service');
    }
  });

  // Check if there are orphaned items
  console.log('\n🔍 4. Checking for orphaned items...');
  const orphanedItems = db.prepare(`
    SELECT si.id, si.name, si.category_id
    FROM service_items si
    LEFT JOIN service_categories sc ON si.category_id = sc.id
    WHERE sc.id IS NULL
  `).all();

  if (orphanedItems.length > 0) {
    console.log(`⚠️  Found ${orphanedItems.length} orphaned items:`);
    orphanedItems.forEach(item => {
      console.log(`   - ${item.name} (Category ID: ${item.category_id})`);
    });
  } else {
    console.log('✅ No orphaned items found');
  }

  // Summary
  console.log('\n📊 Summary:');
  const totalCategories = db.prepare('SELECT COUNT(*) as count FROM service_categories').get().count;
  const totalItems = db.prepare('SELECT COUNT(*) as count FROM service_items').get().count;
  const optionalItems = db.prepare('SELECT COUNT(*) as count FROM service_items WHERE is_optional = 1').get().count;

  console.log(`   - Total services: ${services.length}`);
  console.log(`   - Total categories: ${totalCategories}`);
  console.log(`   - Total items: ${totalItems}`);
  console.log(`   - Optional items: ${optionalItems}`);

  console.log('\n🎯 Recommendations:');
  if (totalCategories === 0) {
    console.log('   ❌ No service categories found - need to create categories first');
  } else if (totalCategories < services.length * 2) {
    console.log('   ⚠️  Few categories found - consider adding more diverse categories');
  }

  if (totalItems === 0) {
    console.log('   ❌ No service items found - need to create service items');
  }

  if (optionalItems === 0) {
    console.log('   ⚠️  No optional items found - pricing system won\'t be useful');
  }

} catch (error) {
  console.error('❌ Debug failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
