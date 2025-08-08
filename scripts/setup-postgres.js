#!/usr/bin/env node

/**
 * PostgreSQL Setup Script
 * 
 * This script sets up the PostgreSQL database with Prisma for the ARC website.
 * It handles database creation, migration, and seeding.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up PostgreSQL database with Prisma...\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found');
  console.log('📝 Please create a .env file with your DATABASE_URL');
  console.log('Example: DATABASE_URL="postgresql://postgres:password@localhost:5432/arc_website?schema=public"');
  process.exit(1);
}

// Read .env file to check DATABASE_URL
const envContent = fs.readFileSync(envPath, 'utf8');
if (!envContent.includes('DATABASE_URL')) {
  console.log('❌ DATABASE_URL not found in .env file');
  console.log('📝 Please add DATABASE_URL to your .env file');
  console.log('Example: DATABASE_URL="postgresql://postgres:password@localhost:5432/arc_website?schema=public"');
  process.exit(1);
}

console.log('✅ Environment configuration found');

// Function to run command and handle errors
function runCommand(command, description) {
  try {
    console.log(`🔄 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

// Check if PostgreSQL is running
try {
  console.log('🔍 Checking PostgreSQL connection...');
  execSync('npx prisma db execute --command "SELECT 1"', { stdio: 'pipe' });
  console.log('✅ PostgreSQL connection successful\n');
} catch (error) {
  console.log('❌ Cannot connect to PostgreSQL database');
  console.log('📋 Please ensure:');
  console.log('   1. PostgreSQL is installed and running');
  console.log('   2. Database exists (create it if needed)');
  console.log('   3. DATABASE_URL in .env is correct');
  console.log('   4. User has proper permissions');
  process.exit(1);
}

// Generate Prisma client
runCommand('npx prisma generate', 'Generating Prisma client');

// Push database schema
runCommand('npx prisma db push', 'Pushing database schema');

// Install additional dependencies if needed
try {
  console.log('🔄 Installing additional dependencies...');
  execSync('npm list bcryptjs', { stdio: 'pipe' });
  console.log('✅ bcryptjs already installed');
} catch (error) {
  runCommand('npm install bcryptjs @types/bcryptjs', 'Installing bcryptjs');
}

try {
  console.log('🔄 Checking tsx...');
  execSync('npm list tsx', { stdio: 'pipe' });
  console.log('✅ tsx already installed');
} catch (error) {
  runCommand('npm install -D tsx', 'Installing tsx');
}

// Run database seed
runCommand('npx prisma db seed', 'Seeding database with initial data');

console.log('🎉 PostgreSQL setup completed successfully!');
console.log('\n📋 What was set up:');
console.log('   ✅ Prisma client generated');
console.log('   ✅ Database schema created');
console.log('   ✅ Initial data seeded');
console.log('   ✅ Dependencies installed');

console.log('\n🔧 Available commands:');
console.log('   npm run db:generate  - Generate Prisma client');
console.log('   npm run db:push      - Push schema changes');
console.log('   npm run db:seed      - Seed database');
console.log('   npm run db:studio    - Open Prisma Studio');
console.log('   npm run db:reset     - Reset database');

console.log('\n👥 Default users created:');
console.log('   📧 admin@arc.com      (password: password) - Admin');
console.log('   📧 reviewer@arc.com   (password: password) - Reviewer');
console.log('   📧 caregiver@arc.com  (password: password) - Caregiver');
console.log('   📧 patient@arc.com    (password: password) - Patient');

console.log('\n🚀 You can now start the development server:');
console.log('   npm run dev');
