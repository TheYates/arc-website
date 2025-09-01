#!/usr/bin/env node

// Simple script to test database connection
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query test successful:', result);
    
    // Test user table access
    const userCount = await prisma.user.count();
    console.log(`✅ User table accessible, found ${userCount} users`);
    
    console.log('🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    if (error.code === 'P1001') {
      console.log('💡 Suggestion: Check if your DATABASE_URL is correct');
      console.log('💡 Suggestion: Verify Supabase project is running');
    } else if (error.code === 'P2024') {
      console.log('💡 Suggestion: Connection pool exhausted, restart your app');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
