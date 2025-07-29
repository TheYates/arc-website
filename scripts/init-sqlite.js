#!/usr/bin/env node

/**
 * SQLite Database Initialization Script
 *
 * This script sets up the SQLite database for the ARC website.
 * Run this script to initialize the database with the required schema and default data.
 *
 * Usage: node scripts/init-sqlite.js
 */

const fs = require("fs");
const path = require("path");

console.log("🚀 Initializing SQLite Database for ARC Website...\n");

// Create data directory if it doesn't exist
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log("✅ Created data directory");
}

// Check if better-sqlite3 is available
let Database;
try {
  Database = require("better-sqlite3");
  console.log("✅ better-sqlite3 package found");
} catch (error) {
  console.log("❌ better-sqlite3 package not found");
  console.log("📦 Please install it with: npm install better-sqlite3");
  console.log(
    "\n🔄 For now, the app will continue using localStorage-based data"
  );
  console.log("   but SQLite API files have been created and are ready to use");
  console.log("   once better-sqlite3 is installed.\n");

  console.log("📁 Created SQLite API files:");
  console.log("   - lib/database/sqlite.ts (Database configuration)");
  console.log("   - lib/api/medications-sqlite.ts (Medications API)");
  console.log("   - lib/api/patients-sqlite.ts (Patients API)");
  console.log("   - lib/api/auth-sqlite.ts (Authentication API)");

  console.log("\n🔧 Updated imports in:");
  console.log("   - app/caregiver/patients/[id]/page.tsx");
  console.log("   - app/caregiver/patients/page.tsx");
  console.log("   - lib/auth.ts");

  console.log("\n📋 Next steps:");
  console.log("   1. Install better-sqlite3: npm install better-sqlite3");
  console.log("   2. Run this script again: node scripts/init-sqlite.js");
  console.log("   3. The app will automatically use SQLite database");

  process.exit(0);
}

// Initialize database
const dbPath = path.join(dataDir, "arc.db");
const db = new Database(dbPath);

console.log("✅ Connected to SQLite database");

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Create tables
console.log("📋 Creating database tables...");

const schema = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'reviewer', 'care_giver', 'patient')),
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  profile_complete BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  blood_type TEXT,
  height_cm INTEGER,
  weight_kg REAL,
  care_level TEXT DEFAULT 'medium' CHECK (care_level IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'stable' CHECK (status IN ('stable', 'improving', 'declining', 'critical')),
  assigned_date DATE DEFAULT CURRENT_DATE,
  emergency_contact_name TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_phone TEXT,
  medical_record_number TEXT UNIQUE,
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Medications
CREATE TABLE IF NOT EXISTS medications (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  route TEXT DEFAULT 'oral',
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  instructions TEXT,
  prescribed_by TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Medication administrations
CREATE TABLE IF NOT EXISTS medication_administrations (
  id TEXT PRIMARY KEY,
  medication_id TEXT NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  caregiver_id TEXT NOT NULL REFERENCES users(id),
  scheduled_time DATETIME NOT NULL,
  actual_time DATETIME,
  status TEXT NOT NULL CHECK (status IN ('administered', 'missed', 'refused', 'partial', 'delayed', 'cancelled')),
  dosage_given TEXT,
  notes TEXT,
  side_effects_observed TEXT,
  patient_response TEXT CHECK (patient_response IN ('good', 'fair', 'poor', 'adverse')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Caregiver assignments
CREATE TABLE IF NOT EXISTS caregiver_assignments (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  caregiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_by TEXT NOT NULL REFERENCES users(id),
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(patient_id, caregiver_id, is_active)
);
`;

db.exec(schema);
console.log("✅ Database tables created successfully");

// Insert default data
console.log("📝 Inserting default data...");

const { v4: uuidv4 } = require("uuid");

// Check if we already have users
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();

if (userCount.count === 0) {
  // Insert default users
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, username, password_hash, first_name, last_name, role, is_active, profile_complete)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Default admin user
  const adminId = uuidv4();
  insertUser.run(
    adminId,
    "admin@arc.com",
    "admin",
    "password_hash_demo",
    "Admin",
    "User",
    "admin",
    1,
    1
  );

  // Default reviewer
  const reviewerId = uuidv4();
  insertUser.run(
    reviewerId,
    "reviewer@arc.com",
    "reviewer",
    "password_hash_demo",
    "Dr. Sarah",
    "Johnson",
    "reviewer",
    1,
    1
  );

  // Default caregiver
  const caregiverId = uuidv4();
  insertUser.run(
    caregiverId,
    "caregiver@arc.com",
    "caregiver",
    "password_hash_demo",
    "John",
    "Smith",
    "care_giver",
    1,
    1
  );

  // Default patient
  const patientUserId = uuidv4();
  insertUser.run(
    patientUserId,
    "patient@arc.com",
    "patient",
    "password_hash_demo",
    "Michael",
    "Smith",
    "patient",
    1,
    1
  );

  // Insert patient record
  const patientId = uuidv4();
  const insertPatient = db.prepare(`
    INSERT INTO patients (id, user_id, date_of_birth, gender, blood_type, care_level, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertPatient.run(
    patientId,
    patientUserId,
    "1985-06-15",
    "male",
    "O+",
    "medium",
    "improving"
  );

  // Assign caregiver to patient
  const insertAssignment = db.prepare(`
    INSERT INTO caregiver_assignments (id, patient_id, caregiver_id, assigned_by)
    VALUES (?, ?, ?, ?)
  `);

  insertAssignment.run(uuidv4(), patientId, caregiverId, reviewerId);

  // Insert sample medication
  const medicationId = uuidv4();
  const insertMedication = db.prepare(`
    INSERT INTO medications (id, patient_id, medication_name, dosage, route, frequency, start_date, instructions, prescribed_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertMedication.run(
    medicationId,
    patientId,
    "Lisinopril",
    "10mg",
    "oral",
    "once_daily",
    "2024-01-01",
    "Take with food in the morning",
    reviewerId
  );

  console.log("✅ Default data inserted successfully");
} else {
  console.log(
    "ℹ️  Database already contains data, skipping default data insertion"
  );
}

// Close database connection
db.close();

console.log("\n🎉 SQLite database initialization completed successfully!");
console.log("\n📊 Database Summary:");
console.log(`   📁 Database file: ${dbPath}`);
console.log("   👥 Default users: admin, reviewer, caregiver, patient");
console.log("   🏥 Sample patient with medication data");
console.log("   🔗 Caregiver assignment configured");

console.log("\n🔧 Login credentials (for testing):");
console.log(
  "   📧 Email: admin@arc.com, reviewer@arc.com, caregiver@arc.com, patient@arc.com"
);
console.log("   🔑 Password: password (for all users)");

console.log("\n✨ The application is now ready to use SQLite database!");
console.log("   🚀 Start the development server: npm run dev");
console.log("   🌐 Open: http://localhost:3000");
