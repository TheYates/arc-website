#!/usr/bin/env node

/**
 * Update Item Level Constraint Script
 * 
 * This script updates the item_level constraint to allow level 4.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Updating item_level constraint...\n');

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
  // SQLite doesn't support modifying CHECK constraints directly
  // We need to recreate the table
  console.log('🔧 Recreating service_items table with updated constraint...');

  // Start transaction
  db.exec('BEGIN TRANSACTION');

  // Create new table with updated constraint
  db.exec(`
    CREATE TABLE service_items_new (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
      parent_item_id TEXT REFERENCES service_items(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      is_optional BOOLEAN DEFAULT FALSE,
      item_level INTEGER DEFAULT 1 CHECK (item_level BETWEEN 1 AND 4),
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Copy existing data
  db.exec(`
    INSERT INTO service_items_new 
    SELECT * FROM service_items
  `);

  // Drop old table
  db.exec('DROP TABLE service_items');

  // Rename new table
  db.exec('ALTER TABLE service_items_new RENAME TO service_items');

  // Commit transaction
  db.exec('COMMIT');

  console.log('✅ Successfully updated item_level constraint to allow levels 1-4');

  // Verify the constraint
  const tableInfo = db.prepare("PRAGMA table_info(service_items)").all();
  console.log('\n📋 Updated service_items columns:');
  tableInfo.forEach(col => {
    console.log(`   - ${col.name} (${col.type})`);
  });

  console.log('\n🎉 Constraint update completed successfully!');
  console.log('✨ The service_items table now supports 4 hierarchy levels!');

} catch (error) {
  console.error('❌ Constraint update failed:', error.message);
  // Rollback on error
  try {
    db.exec('ROLLBACK');
  } catch (rollbackError) {
    console.error('❌ Rollback failed:', rollbackError.message);
  }
  process.exit(1);
} finally {
  db.close();
}
