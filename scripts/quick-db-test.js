#!/usr/bin/env node

/**
 * Quick Database Test
 * 
 * A simple test to verify the database connection and basic operations.
 */

console.log('🔍 Quick Database Connection Test\n');

// Test if Prisma client can be imported
try {
  const { PrismaClient } = require('@prisma/client');
  console.log('✅ Prisma client imported successfully');
  
  const prisma = new PrismaClient();
  
  // Test connection
  prisma.$connect()
    .then(() => {
      console.log('✅ Database connection successful');
      
      // Test a simple query
      return prisma.user.count();
    })
    .then((userCount) => {
      console.log(`✅ Database query successful - Found ${userCount} users`);
      
      // Test if default users exist
      return prisma.user.findMany({
        select: {
          email: true,
          role: true,
        },
        take: 5,
      });
    })
    .then((users) => {
      console.log('✅ User data retrieved:');
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
      
      if (users.length === 0) {
        console.log('⚠️  No users found. You may need to run: npm run db:seed');
      }
      
      return prisma.$disconnect();
    })
    .then(() => {
      console.log('✅ Database disconnected successfully');
      console.log('\n🎉 Quick test completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('   1. Run full tests: npm run db:test');
      console.log('   2. Start dev server: npm run dev');
      console.log('   3. Test API endpoints: npm run test:api');
    })
    .catch((error) => {
      console.error('❌ Database test failed:', error.message);
      console.log('\n🔧 Troubleshooting:');
      console.log('   1. Check DATABASE_URL in .env file');
      console.log('   2. Ensure PostgreSQL is running');
      console.log('   3. Run setup: npm run setup-postgres');
      console.log('   4. Generate client: npx prisma generate');
      process.exit(1);
    });
    
} catch (error) {
  console.error('❌ Failed to import Prisma client:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('   1. Install dependencies: npm install');
  console.log('   2. Generate Prisma client: npx prisma generate');
  console.log('   3. Check if @prisma/client is installed');
  process.exit(1);
}
