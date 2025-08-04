#!/usr/bin/env node

/**
 * Fix Complete Service Pricing Data
 * 
 * This script ensures all services have complete pricing data
 * for hourly, daily, and monthly rates.
 */

const fs = require('fs');
const path = require('path');

console.log('💰 Fixing complete service pricing data...\n');

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
  // Get all services
  console.log('🔍 Getting all services...');
  const services = db.prepare(`
    SELECT id, name, slug, display_name, 
           base_price_hourly, base_price_daily, base_price_monthly
    FROM services 
    ORDER BY name
  `).all();

  console.log(`Found ${services.length} services to update:`);
  services.forEach(service => {
    console.log(`   - ${service.display_name || service.name} (${service.slug})`);
  });

  // Define complete pricing for each service
  const completePricing = {
    'adamfo-pa': { hourly: 15.00, daily: 120.00, monthly: 3200.00 },
    'ahenefie': { hourly: 25.00, daily: 200.00, monthly: 5500.00 },
    'fie-ne-fie': { hourly: 20.00, daily: 150.00, monthly: 4200.00 },
    'yonko-pa': { hourly: 18.00, daily: 140.00, monthly: 3800.00 },
  };

  console.log('\n🔧 Updating all services with complete pricing...');
  
  const updateStmt = db.prepare(`
    UPDATE services 
    SET base_price_hourly = ?, base_price_daily = ?, base_price_monthly = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  db.transaction(() => {
    services.forEach(service => {
      const pricing = completePricing[service.slug];
      
      if (pricing) {
        updateStmt.run(pricing.hourly, pricing.daily, pricing.monthly, service.id);
        console.log(`   ✅ Updated ${service.display_name || service.name}:`);
        console.log(`      Hourly: GHS ${pricing.hourly.toFixed(2)}`);
        console.log(`      Daily: GHS ${pricing.daily.toFixed(2)}`);
        console.log(`      Monthly: GHS ${pricing.monthly.toFixed(2)}`);
      } else {
        // Default pricing for unknown services
        const defaultPricing = { hourly: 20.00, daily: 150.00, monthly: 4000.00 };
        updateStmt.run(defaultPricing.hourly, defaultPricing.daily, defaultPricing.monthly, service.id);
        console.log(`   ✅ Updated ${service.display_name || service.name} (default pricing):`);
        console.log(`      Hourly: GHS ${defaultPricing.hourly.toFixed(2)}`);
        console.log(`      Daily: GHS ${defaultPricing.daily.toFixed(2)}`);
        console.log(`      Monthly: GHS ${defaultPricing.monthly.toFixed(2)}`);
      }
    });
  })();

  // Verify the updates
  console.log('\n🔍 Verifying updated services...');
  const updatedServices = db.prepare(`
    SELECT id, name, slug, display_name, 
           base_price_hourly, base_price_daily, base_price_monthly
    FROM services 
    ORDER BY name
  `).all();

  console.log('📊 Final complete service pricing:');
  updatedServices.forEach(service => {
    console.log(`   - ${service.display_name || service.name}`);
    console.log(`     Hourly: GHS ${service.base_price_hourly.toFixed(2)}`);
    console.log(`     Daily: GHS ${service.base_price_daily.toFixed(2)}`);
    console.log(`     Monthly: GHS ${service.base_price_monthly.toFixed(2)}`);
  });

  // Test API call
  console.log('\n🧪 Testing API response...');
  const testService = updatedServices.find(s => s.slug === 'ahenefie');
  if (testService) {
    console.log(`Test service: ${testService.display_name}`);
    console.log(`API would return:`);
    console.log(`  basePriceHourly: ${testService.base_price_hourly}`);
    console.log(`  basePriceDaily: ${testService.base_price_daily}`);
    console.log(`  basePriceMonthly: ${testService.base_price_monthly}`);
  }

  console.log('\n🎉 Complete service pricing fix completed successfully!');
  console.log('✨ All services now have complete pricing data for all periods!');

} catch (error) {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
