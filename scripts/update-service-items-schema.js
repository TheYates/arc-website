#!/usr/bin/env node

/**
 * Update Service Items Schema Script
 * 
 * This script adds the new hierarchical columns to the service_items table.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Updating service_items table schema...\n');

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
  // Check current schema
  const tableInfo = db.prepare("PRAGMA table_info(service_items)").all();
  console.log('\n📋 Current service_items columns:');
  tableInfo.forEach(col => {
    console.log(`   - ${col.name} (${col.type})`);
  });

  // Check if new columns already exist
  const hasParentItemId = tableInfo.some(col => col.name === 'parent_item_id');
  const hasItemLevel = tableInfo.some(col => col.name === 'item_level');

  if (hasParentItemId && hasItemLevel) {
    console.log('\n✅ Schema is already up to date!');
    process.exit(0);
  }

  console.log('\n🔧 Adding new columns...');

  // Add parent_item_id column if it doesn't exist
  if (!hasParentItemId) {
    db.exec(`
      ALTER TABLE service_items 
      ADD COLUMN parent_item_id TEXT REFERENCES service_items(id) ON DELETE CASCADE
    `);
    console.log('   ✅ Added parent_item_id column');
  }

  // Add item_level column if it doesn't exist
  if (!hasItemLevel) {
    db.exec(`
      ALTER TABLE service_items 
      ADD COLUMN item_level INTEGER DEFAULT 1 CHECK (item_level BETWEEN 1 AND 3)
    `);
    console.log('   ✅ Added item_level column');
  }

  // Update existing items to have item_level = 1
  const updateResult = db.prepare(`
    UPDATE service_items 
    SET item_level = 1 
    WHERE item_level IS NULL
  `).run();

  console.log(`   ✅ Updated ${updateResult.changes} existing items with item_level = 1`);

  // Verify the updates
  const updatedTableInfo = db.prepare("PRAGMA table_info(service_items)").all();
  console.log('\n📋 Updated service_items columns:');
  updatedTableInfo.forEach(col => {
    console.log(`   - ${col.name} (${col.type})`);
  });

  console.log('\n🎉 Schema update completed successfully!');
  console.log('✨ The service_items table now supports hierarchical structure!');

} catch (error) {
  console.error('❌ Schema update failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
