#!/usr/bin/env node

/**
 * Test Database Schema Script
 * 
 * This script tests the database connection and ensures all tables are created.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing database schema...\n');

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
  // Check existing tables
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
  `).all();

  console.log('\n📋 Existing tables:');
  tables.forEach(table => {
    console.log(`   - ${table.name}`);
  });

  // Check if services tables exist
  const servicesTables = ['services', 'service_categories', 'service_items', 'service_pricing'];
  const missingTables = servicesTables.filter(tableName => 
    !tables.some(table => table.name === tableName)
  );

  if (missingTables.length > 0) {
    console.log('\n❌ Missing services tables:', missingTables.join(', '));
    console.log('🔧 Creating missing tables...');

    // Create services tables manually
    db.exec(`
      -- Services management tables
      CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        description TEXT,
        short_description TEXT,
        category TEXT NOT NULL CHECK (category IN ('home_care', 'nanny', 'emergency', 'custom')),
        base_price_daily REAL,
        base_price_monthly REAL,
        base_price_hourly REAL,
        price_display TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        is_popular BOOLEAN DEFAULT FALSE,
        sort_order INTEGER DEFAULT 0,
        color_theme TEXT DEFAULT 'teal',
        icon TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Service categories (like "Home Visitation (Daily)", "Emergency Response")
      CREATE TABLE IF NOT EXISTS service_categories (
        id TEXT PRIMARY KEY,
        service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Service items (individual checklist items within categories)
      CREATE TABLE IF NOT EXISTS service_items (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        is_optional BOOLEAN DEFAULT FALSE,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Service pricing tiers
      CREATE TABLE IF NOT EXISTS service_pricing (
        id TEXT PRIMARY KEY,
        service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        tier_name TEXT NOT NULL,
        price REAL NOT NULL,
        billing_period TEXT NOT NULL CHECK (billing_period IN ('hourly', 'daily', 'weekly', 'monthly', 'yearly')),
        description TEXT,
        is_default BOOLEAN DEFAULT FALSE,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Services tables created successfully');
  } else {
    console.log('\n✅ All services tables exist');
  }

  // Verify tables were created
  const updatedTables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name LIKE 'service%'
    ORDER BY name
  `).all();

  console.log('\n📋 Services tables:');
  updatedTables.forEach(table => {
    console.log(`   ✅ ${table.name}`);
  });

  console.log('\n🎉 Database schema verification completed!');

} catch (error) {
  console.error('❌ Schema test failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
