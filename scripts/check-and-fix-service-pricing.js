#!/usr/bin/env node

/**
 * Check and Fix Service Pricing Data
 * 
 * This script checks if services have pricing data and adds sample pricing
 * if missing.
 */

const fs = require('fs');
const path = require('path');

console.log('💰 Checking and fixing service pricing data...\n');

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
  // Test 1: Check if services table has pricing columns
  console.log('🔍 Test 1: Checking services table structure...');
  const tableInfo = db.prepare("PRAGMA table_info(services)").all();
  const pricingColumns = tableInfo.filter(col => 
    col.name.includes('price') || col.name.includes('base_price')
  );
  
  console.log('📊 Pricing-related columns in services table:');
  pricingColumns.forEach(col => {
    console.log(`   - ${col.name}: ${col.type} (Default: ${col.dflt_value || 'NULL'})`);
  });

  // Test 2: Check current services and their pricing
  console.log('\n🔍 Test 2: Checking existing services...');
  const services = db.prepare(`
    SELECT id, name, slug, display_name, 
           base_price_hourly, base_price_daily, base_price_monthly
    FROM services 
    ORDER BY name
  `).all();

  if (services.length > 0) {
    console.log(`✅ Found ${services.length} services:`);
    services.forEach(service => {
      console.log(`   - ${service.display_name || service.name} (${service.slug})`);
      console.log(`     Hourly: ${service.base_price_hourly || 'NULL'}`);
      console.log(`     Daily: ${service.base_price_daily || 'NULL'}`);
      console.log(`     Monthly: ${service.base_price_monthly || 'NULL'}`);
    });
  } else {
    console.log('⚠️  No services found');
  }

  // Test 3: Add sample pricing for services that don't have it
  console.log('\n🔧 Test 3: Adding sample pricing for services without pricing...');
  
  const servicesWithoutPricing = services.filter(service => 
    !service.base_price_hourly && !service.base_price_daily && !service.base_price_monthly
  );

  if (servicesWithoutPricing.length > 0) {
    console.log(`Found ${servicesWithoutPricing.length} services without pricing. Adding sample pricing...`);
    
    const updateStmt = db.prepare(`
      UPDATE services 
      SET base_price_hourly = ?, base_price_daily = ?, base_price_monthly = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    // Sample pricing based on service type
    const samplePricing = {
      'ahenefie': { hourly: 25.00, daily: 200.00, monthly: 5500.00 },
      'adamfo-pa': { hourly: 15.00, daily: 120.00, monthly: 3200.00 },
      'fie-ne-fie': { hourly: 20.00, daily: 160.00, monthly: 4200.00 },
      'yonko-pa': { hourly: 18.00, daily: 140.00, monthly: 3800.00 },
      'rally-pack': { hourly: 30.00, daily: 240.00, monthly: 6500.00 },
      'conference-option': { hourly: 35.00, daily: 280.00, monthly: 7500.00 },
      'event-medical-coverage': { hourly: 40.00, daily: 320.00, monthly: 8500.00 },
    };

    db.transaction(() => {
      servicesWithoutPricing.forEach(service => {
        const pricing = samplePricing[service.slug] || { hourly: 20.00, daily: 150.00, monthly: 4000.00 };
        
        updateStmt.run(pricing.hourly, pricing.daily, pricing.monthly, service.id);
        console.log(`   ✅ Updated ${service.display_name || service.name}:`);
        console.log(`      Hourly: GHS ${pricing.hourly.toFixed(2)}`);
        console.log(`      Daily: GHS ${pricing.daily.toFixed(2)}`);
        console.log(`      Monthly: GHS ${pricing.monthly.toFixed(2)}`);
      });
    })();
  } else {
    console.log('✅ All services already have pricing data');
  }

  // Test 4: Verify the updates
  console.log('\n🔍 Test 4: Verifying updated services...');
  const updatedServices = db.prepare(`
    SELECT id, name, slug, display_name, 
           base_price_hourly, base_price_daily, base_price_monthly
    FROM services 
    ORDER BY name
  `).all();

  console.log('📊 Final service pricing:');
  updatedServices.forEach(service => {
    console.log(`   - ${service.display_name || service.name}`);
    console.log(`     Hourly: GHS ${(service.base_price_hourly || 0).toFixed(2)}`);
    console.log(`     Daily: GHS ${(service.base_price_daily || 0).toFixed(2)}`);
    console.log(`     Monthly: GHS ${(service.base_price_monthly || 0).toFixed(2)}`);
  });

  console.log('\n🎉 Service pricing check and fix completed successfully!');
  console.log('✨ All services now have pricing data!');

} catch (error) {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
