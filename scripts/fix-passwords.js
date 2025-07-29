#!/usr/bin/env node

/**
 * Fix Password Hashes Script
 * 
 * This script updates the existing user password hashes in the database
 * to work with the authentication system.
 * 
 * Usage: node scripts/fix-passwords.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing user password hashes...\n');

// Check if better-sqlite3 is available
let Database;
try {
  Database = require('better-sqlite3');
  console.log('✅ better-sqlite3 package found');
} catch (error) {
  console.log('❌ better-sqlite3 package not found');
  console.log('📦 Please install it with: pnpm add better-sqlite3');
  process.exit(1);
}

// Initialize database
const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'arc.db');

if (!fs.existsSync(dbPath)) {
  console.log('❌ Database file not found');
  console.log('📦 Please run: npm run init-db');
  process.exit(1);
}

const db = new Database(dbPath);

console.log('✅ Connected to SQLite database');

try {
  // Update all user passwords to a consistent hash
  const updateStmt = db.prepare(`
    UPDATE users 
    SET password_hash = 'password_hash_demo', updated_at = CURRENT_TIMESTAMP
    WHERE password_hash = 'hashed_password_here'
  `);
  
  const result = updateStmt.run();
  
  console.log(`✅ Updated ${result.changes} user password hashes`);
  
  // Verify the update
  const verifyStmt = db.prepare(`
    SELECT email, first_name, last_name, role 
    FROM users 
    WHERE password_hash = 'password_hash_demo'
  `);
  
  const users = verifyStmt.all();
  
  console.log('\n📋 Updated users:');
  users.forEach(user => {
    console.log(`   ✅ ${user.email} (${user.first_name} ${user.last_name}) - ${user.role}`);
  });
  
  console.log('\n🎉 Password hashes fixed successfully!');
  console.log('\n🔑 You can now log in with:');
  console.log('   📧 Email: admin@arc.com, reviewer@arc.com, caregiver@arc.com, patient@arc.com');
  console.log('   🔑 Password: password');
  
} catch (error) {
  console.error('❌ Error updating passwords:', error.message);
  process.exit(1);
} finally {
  db.close();
}
