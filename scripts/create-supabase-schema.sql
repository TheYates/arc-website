-- Create Supabase schema manually
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE "UserRole" AS ENUM ('super_admin', 'admin', 'reviewer', 'caregiver', 'patient');
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'withdrawn');
CREATE TYPE "ServiceCategory" AS ENUM ('home_care', 'nanny', 'emergency', 'custom');

-- Create users table (main table)
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "password_hash" TEXT NOT NULL,
    "must_change_password" BOOLEAN DEFAULT true,
    "password_changed_at" TIMESTAMP,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "role" "UserRole" NOT NULL,
    "is_email_verified" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "profile_complete" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW(),
    "last_login" TIMESTAMP
);

-- Create patients table
CREATE TABLE IF NOT EXISTS "patients" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "user_id" UUID UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
    "date_of_birth" DATE,
    "gender" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "emergency_contact_relationship" TEXT,
    "medical_history" TEXT,
    "current_medications" TEXT,
    "allergies" TEXT,
    "insurance_provider" TEXT,
    "insurance_policy_number" TEXT,
    "primary_care_physician" TEXT,
    "primary_care_physician_phone" TEXT,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS "services" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "short_description" TEXT,
    "category" "ServiceCategory" NOT NULL,
    "base_price_daily" DECIMAL(10,2),
    "base_price_monthly" DECIMAL(10,2),
    "base_price_hourly" DECIMAL(10,2),
    "price_display" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "is_popular" BOOLEAN DEFAULT false,
    "sort_order" INTEGER DEFAULT 0,
    "color_theme" TEXT DEFAULT 'blue',
    "icon" TEXT,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS "applications" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
    "status" "ApplicationStatus" DEFAULT 'pending',
    "submitted_at" TIMESTAMP DEFAULT NOW(),
    "reviewed_at" TIMESTAMP,
    "approved_at" TIMESTAMP,
    "rejected_at" TIMESTAMP,
    "rejection_reason" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Insert some default services
INSERT INTO "services" (name, slug, display_name, description, category, base_price_hourly, is_active, is_popular, sort_order, color_theme) VALUES
('home-care', 'home-care', 'Home Care', 'Professional home care services', 'home_care', 25.00, true, true, 1, 'blue'),
('nanny-services', 'nanny-services', 'Nanny Services', 'Professional childcare services', 'nanny', 20.00, true, true, 2, 'green'),
('emergency-care', 'emergency-care', 'Emergency Care', '24/7 emergency care services', 'emergency', 50.00, true, false, 3, 'red')
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users"("role");
CREATE INDEX IF NOT EXISTS "idx_patients_user_id" ON "patients"("user_id");
CREATE INDEX IF NOT EXISTS "idx_applications_user_id" ON "applications"("user_id");
CREATE INDEX IF NOT EXISTS "idx_applications_status" ON "applications"("status");

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON "patients" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON "services" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON "applications" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
