#!/usr/bin/env node

/**
 * Debug Hierarchy Data Script
 * 
 * This script shows the actual data in the database to debug the hierarchy issue.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging hierarchy data...\n');

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
  // Get AHENEFIE service data
  const ahenefieService = db.prepare(`
    SELECT id, name FROM services WHERE name = 'AHENEFIE'
  `).get();

  if (!ahenefieService) {
    console.log('❌ AHENEFIE service not found');
    process.exit(1);
  }

  console.log(`📦 Found AHENEFIE service: ${ahenefieService.id}`);

  // Get categories for AHENEFIE
  const categories = db.prepare(`
    SELECT id, name FROM service_categories 
    WHERE service_id = ?
    ORDER BY sort_order
  `).all(ahenefieService.id);

  console.log(`\n📂 Categories (${categories.length}):`);
  categories.forEach(category => {
    console.log(`   - ${category.name} (${category.id})`);
  });

  // Get items for the first category (Service Components)
  if (categories.length > 0) {
    const firstCategory = categories[0];
    console.log(`\n📋 Items in "${firstCategory.name}":`);
    
    const items = db.prepare(`
      SELECT id, name, item_level, parent_item_id, is_optional, sort_order
      FROM service_items 
      WHERE category_id = ?
      ORDER BY sort_order
    `).all(firstCategory.id);

    console.log(`Found ${items.length} items:`);
    items.forEach(item => {
      const indent = '  '.repeat(item.item_level - 1);
      const optional = item.is_optional ? ' (Optional)' : '';
      const parent = item.parent_item_id ? ` [Parent: ${item.parent_item_id.substring(0, 8)}...]` : ' [Root]';
      console.log(`${indent}Level ${item.item_level}: ${item.name}${optional}${parent}`);
    });

    // Show the raw JSON that would be sent to the frontend
    console.log('\n📤 Raw data that would be sent to frontend:');
    console.log(JSON.stringify(items.slice(0, 3), null, 2)); // Show first 3 items
  }

} catch (error) {
  console.error('❌ Debug failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
