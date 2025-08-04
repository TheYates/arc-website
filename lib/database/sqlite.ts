import Database from "better-sqlite3";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Database connection
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), "data", "arc.db");
    db = new Database(dbPath);

    // Enable foreign keys
    db.pragma("foreign_keys = ON");

    // Initialize database schema
    initializeDatabase();
  }
  return db;
}

function initializeDatabase() {
  if (!db) return;

  // Create tables
  db.exec(`
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

    -- Medical conditions
    CREATE TABLE IF NOT EXISTS medical_conditions (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      condition_name TEXT NOT NULL,
      diagnosis_date DATE,
      severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe', 'critical')),
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'chronic', 'managed')),
      notes TEXT,
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

    -- Vital signs
    CREATE TABLE IF NOT EXISTS vital_signs (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      recorded_by TEXT NOT NULL REFERENCES users(id),
      recorded_at DATETIME NOT NULL,
      systolic_bp INTEGER,
      diastolic_bp INTEGER,
      heart_rate INTEGER,
      temperature REAL,
      respiratory_rate INTEGER,
      oxygen_saturation INTEGER,
      blood_glucose REAL,
      weight_kg REAL,
      height_cm INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Medical reviews
    CREATE TABLE IF NOT EXISTS medical_reviews (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      reviewer_id TEXT NOT NULL REFERENCES users(id),
      review_date DATE NOT NULL,
      review_type TEXT NOT NULL,
      findings TEXT,
      recommendations TEXT,
      follow_up_required BOOLEAN DEFAULT FALSE,
      follow_up_date DATE,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
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

    -- Symptom reports
    CREATE TABLE IF NOT EXISTS symptom_reports (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      reported_by TEXT NOT NULL REFERENCES users(id),
      medication_id TEXT REFERENCES medications(id),
      symptoms TEXT NOT NULL,
      severity INTEGER CHECK (severity BETWEEN 1 AND 5),
      description TEXT,
      started_at DATETIME,
      reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'monitoring')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

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
      parent_item_id TEXT REFERENCES service_items(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      is_optional BOOLEAN DEFAULT FALSE,
      item_level INTEGER DEFAULT 1 CHECK (item_level BETWEEN 1 AND 4),
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

  // Insert default data if tables are empty
  insertDefaultData();
}

function insertDefaultData() {
  if (!db) return;

  // Check if we already have users
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as {
    count: number;
  };

  if (userCount.count === 0) {
    // Insert default users
    const insertUser = db.prepare(`
      INSERT INTO users (id, email, username, password_hash, first_name, last_name, role, is_active, profile_complete)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Default admin user
    insertUser.run(
      uuidv4(),
      "admin@arc.com",
      "admin",
      "hashed_password_here", // In real app, this would be properly hashed
      "Admin",
      "User",
      "admin",
      true,
      true
    );

    // Default reviewer
    const reviewerId = uuidv4();
    insertUser.run(
      reviewerId,
      "reviewer@arc.com",
      "reviewer",
      "hashed_password_here",
      "Dr. Sarah",
      "Johnson",
      "reviewer",
      true,
      true
    );

    // Default caregiver
    const caregiverId = uuidv4();
    insertUser.run(
      caregiverId,
      "caregiver@arc.com",
      "caregiver",
      "hashed_password_here",
      "John",
      "Smith",
      "care_giver",
      true,
      true
    );

    // Default patient
    const patientUserId = uuidv4();
    insertUser.run(
      patientUserId,
      "patient@arc.com",
      "patient",
      "hashed_password_here",
      "Michael",
      "Smith",
      "patient",
      true,
      true
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

    console.log("Default data inserted into SQLite database");
  }
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// Utility function to generate UUID
export function generateId(): string {
  return uuidv4();
}
