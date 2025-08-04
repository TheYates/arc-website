#!/usr/bin/env node

/**
 * Clear Services Script
 * 
 * This script clears all services data to allow re-migration.
 */

const fs = require('fs');
const path = require('path');

console.log('🗑️  Clearing services data...\n');

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
  // Clear services data in correct order (due to foreign key constraints)
  console.log('🗑️  Clearing service items...');
  const itemsResult = db.prepare('DELETE FROM service_items').run();
  console.log(`   ✅ Deleted ${itemsResult.changes} service items`);

  console.log('🗑️  Clearing service pricing...');
  const pricingResult = db.prepare('DELETE FROM service_pricing').run();
  console.log(`   ✅ Deleted ${pricingResult.changes} pricing entries`);

  console.log('🗑️  Clearing service categories...');
  const categoriesResult = db.prepare('DELETE FROM service_categories').run();
  console.log(`   ✅ Deleted ${categoriesResult.changes} categories`);

  console.log('🗑️  Clearing services...');
  const servicesResult = db.prepare('DELETE FROM services').run();
  console.log(`   ✅ Deleted ${servicesResult.changes} services`);

  console.log('\n🎉 Services data cleared successfully!');
  console.log('✨ Ready for re-migration with hierarchical structure!');

} catch (error) {
  console.error('❌ Clear failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
