#!/usr/bin/env node

/**
 * Test Services API Script
 * 
 * This script tests the services API functions to identify any import issues.
 */

console.log('🧪 Testing services API functions...\n');

try {
  // Test database import
  console.log('📦 Testing database import...');
  const { getDatabase, generateId } = require('../lib/database/sqlite.ts');
  console.log('✅ Database import successful');

  // Test services API import
  console.log('📦 Testing services API import...');
  const { 
    getAllServices, 
    getServiceById, 
    getServiceWithDetails 
  } = require('../lib/api/services-sqlite.ts');
  console.log('✅ Services API import successful');

  // Test database connection
  console.log('🔗 Testing database connection...');
  const db = getDatabase();
  console.log('✅ Database connection successful');

  // Test getAllServices function
  console.log('📋 Testing getAllServices function...');
  const services = getAllServices();
  console.log(`✅ Found ${services.length} services`);

  if (services.length > 0) {
    const firstService = services[0];
    console.log(`📝 First service: ${firstService.displayName} (ID: ${firstService.id})`);

    // Test getServiceWithDetails function
    console.log('🔍 Testing getServiceWithDetails function...');
    const serviceDetails = getServiceWithDetails(firstService.id);
    
    if (serviceDetails) {
      console.log(`✅ Service details loaded: ${serviceDetails.displayName}`);
      console.log(`   Categories: ${serviceDetails.categories?.length || 0}`);
      console.log(`   Pricing: ${serviceDetails.pricing?.length || 0}`);
      
      if (serviceDetails.categories && serviceDetails.categories.length > 0) {
        const firstCategory = serviceDetails.categories[0];
        console.log(`   First category: ${firstCategory.name}`);
        console.log(`   Items in category: ${firstCategory.items?.length || 0}`);
      }
    } else {
      console.log('❌ Failed to load service details');
    }
  }

  console.log('\n🎉 All API functions working correctly!');

} catch (error) {
  console.error('❌ API test failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
