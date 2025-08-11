-- Alpha Rescue Consult (ARC) Database Schema
-- Healthcare Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (authentication and basic info)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'admin', 'reviewer', 'caregiver', 'patient')),
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    profile_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Patients table (extended patient information)
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    blood_type VARCHAR(5),
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    care_level VARCHAR(20) DEFAULT 'medium' CHECK (care_level IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'stable' CHECK (status IN ('stable', 'improving', 'declining', 'critical')),
    assigned_date DATE DEFAULT CURRENT_DATE,
    emergency_contact_name VARCHAR(200),
    emergency_contact_relationship VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    medical_record_number VARCHAR(50) UNIQUE,
    insurance_provider VARCHAR(200),
    insurance_policy_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Medical conditions
CREATE TABLE medical_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    icd_10_code VARCHAR(10),
    description TEXT,
    severity VARCHAR(20) CHECK (severity IN ('mild', 'moderate', 'severe', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Patient conditions (many-to-many relationship)
CREATE TABLE patient_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    condition_id UUID REFERENCES medical_conditions(id) ON DELETE CASCADE,
    diagnosed_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'chronic', 'managed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(patient_id, condition_id)
);

-- Allergies
CREATE TABLE allergies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    allergen VARCHAR(200) NOT NULL,
    allergy_type VARCHAR(50) CHECK (allergy_type IN ('drug', 'food', 'environmental', 'other')),
    severity VARCHAR(20) CHECK (severity IN ('mild', 'moderate', 'severe', 'life_threatening')),
    reaction TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Care assignments (caregiver to patient relationships)
CREATE TABLE care_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caregiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    assigned_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    is_primary BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(caregiver_id, patient_id, assigned_date)
);

-- Medications
CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    brand_names TEXT[], -- Array of brand names
    drug_class VARCHAR(100),
    dosage_forms TEXT[], -- Array of available forms (tablet, capsule, liquid, etc.)
    strength_options TEXT[], -- Array of available strengths
    route_of_administration VARCHAR(50),
    contraindications TEXT[],
    side_effects TEXT[],
    drug_interactions TEXT[],
    pregnancy_category VARCHAR(5),
    controlled_substance_schedule VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_number VARCHAR(50) UNIQUE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    prescriber_id UUID REFERENCES users(id) ON DELETE SET NULL,
    medication_id UUID REFERENCES medications(id) ON DELETE RESTRICT,
    medication_name VARCHAR(200) NOT NULL, -- Denormalized for historical records
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100),
    quantity INTEGER,
    refills INTEGER DEFAULT 0,
    instructions TEXT,
    indication TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'dispensed', 'completed', 'cancelled')),
    prescribed_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    start_date DATE,
    end_date DATE,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_date TIMESTAMP WITH TIME ZONE,
    dispensed_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    reviewer_notes TEXT,
    pharmacy_notes TEXT,
    monitoring_required BOOLEAN DEFAULT FALSE,
    monitoring_instructions TEXT,
    cost_estimate DECIMAL(10,2),
    insurance_covered BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Medication administration records
CREATE TABLE medication_administrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    administered_by UUID REFERENCES users(id) ON DELETE SET NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    administered_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'administered', 'missed', 'refused', 'delayed')),
    dosage_given VARCHAR(100),
    notes TEXT,
    side_effects_observed TEXT,
    vital_signs JSONB, -- Store vital signs as JSON
    next_dose_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vital signs
CREATE TABLE vital_signs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    recorded_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    heart_rate INTEGER,
    temperature DECIMAL(4,1),
    temperature_unit VARCHAR(1) DEFAULT 'C' CHECK (temperature_unit IN ('C', 'F')),
    oxygen_saturation INTEGER,
    respiratory_rate INTEGER,
    weight_kg DECIMAL(5,2),
    height_cm INTEGER,
    blood_sugar DECIMAL(5,1),
    blood_sugar_type VARCHAR(20) CHECK (blood_sugar_type IN ('fasting', 'random', 'post_meal')),
    pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
    notes TEXT,
    alert_flags TEXT[], -- Array of alert conditions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Care notes
CREATE TABLE care_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    note_type VARCHAR(50) DEFAULT 'general' CHECK (note_type IN ('general', 'medication', 'vitals', 'behavior', 'incident', 'care_plan', 'communication')),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed', 'archived')),
    tags TEXT[], -- Array of tags
    is_private BOOLEAN DEFAULT FALSE,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_date TIMESTAMP WITH TIME ZONE,
    reviewer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Medical orders
CREATE TABLE medical_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    ordered_by UUID REFERENCES users(id) ON DELETE SET NULL,
    order_type VARCHAR(50) NOT NULL CHECK (order_type IN ('medical_supplies', 'equipment', 'medication', 'laboratory', 'imaging', 'therapy')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'ordered', 'delivered', 'completed')),
    total_cost DECIMAL(10,2),
    approval_threshold DECIMAL(10,2) DEFAULT 200.00,
    requires_approval BOOLEAN DEFAULT TRUE,
    justification TEXT,
    medical_necessity TEXT,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    reviewer_notes TEXT,
    vendor VARCHAR(200),
    delivery_date DATE,
    insurance_covered BOOLEAN DEFAULT TRUE,
    patient_responsibility DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES medical_orders(id) ON DELETE CASCADE,
    item_name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    specifications TEXT,
    medical_code VARCHAR(20), -- CPT, HCPCS, etc.
    urgency_flag BOOLEAN DEFAULT FALSE,
    prescription_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Service packages (admin-configurable care packages)
CREATE TABLE service_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- 'home_care', 'nanny', 'emergency', etc.
    base_price_daily DECIMAL(10,2),
    base_price_monthly DECIMAL(10,2),
    base_price_hourly DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Individual services that can be included in packages
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    base_cost DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Package services (linking packages to services with pricing configuration)
CREATE TABLE package_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID REFERENCES service_packages(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    inclusion_type VARCHAR(20) NOT NULL CHECK (inclusion_type IN ('standard', 'optional')),
    additional_price_daily DECIMAL(10,2) DEFAULT 0,
    additional_price_monthly DECIMAL(10,2) DEFAULT 0,
    additional_price_hourly DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(package_id, service_id)
);

-- Package pricing tiers (for different pricing models)
CREATE TABLE package_pricing_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID REFERENCES service_packages(id) ON DELETE CASCADE,
    tier_name VARCHAR(100) NOT NULL,
    tier_description TEXT,
    price_daily DECIMAL(10,2),
    price_monthly DECIMAL(10,2),
    price_hourly DECIMAL(10,2),
    min_duration_days INTEGER,
    max_duration_days INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Medical recommendations
CREATE TABLE medical_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    recommendation_type VARCHAR(50) NOT NULL CHECK (recommendation_type IN ('medication', 'treatment', 'lifestyle', 'referral', 'monitoring')),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'implemented', 'rejected')),
    implementation_date DATE,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_date TIMESTAMP WITH TIME ZONE,
    implemented_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    reviewer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activity reviews
CREATE TABLE activity_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    caregiver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    activity_type VARCHAR(100) NOT NULL,
    activity_date DATE NOT NULL,
    submitted_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'requires_changes', 'rejected')),
    activity_data JSONB NOT NULL, -- Store activity details as JSON
    notes TEXT,
    reviewer_notes TEXT,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_date TIMESTAMP WITH TIME ZONE,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    action_text VARCHAR(100),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sessions (for authentication)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email verification tokens
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_care_assignments_caregiver ON care_assignments(caregiver_id);
CREATE INDEX idx_care_assignments_patient ON care_assignments(patient_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_prescriber ON prescriptions(prescriber_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_medication_administrations_patient ON medication_administrations(patient_id);
CREATE INDEX idx_medication_administrations_scheduled ON medication_administrations(scheduled_time);
CREATE INDEX idx_vital_signs_patient ON vital_signs(patient_id);
CREATE INDEX idx_vital_signs_recorded_date ON vital_signs(recorded_date);
CREATE INDEX idx_care_notes_patient ON care_notes(patient_id);
CREATE INDEX idx_care_notes_author ON care_notes(author_id);
CREATE INDEX idx_medical_orders_patient ON medical_orders(patient_id);
CREATE INDEX idx_medical_orders_status ON medical_orders(status);
CREATE INDEX idx_activity_reviews_patient ON activity_reviews(patient_id);
CREATE INDEX idx_activity_reviews_caregiver ON activity_reviews(caregiver_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_care_notes_updated_at BEFORE UPDATE ON care_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_orders_updated_at BEFORE UPDATE ON medical_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_recommendations_updated_at BEFORE UPDATE ON medical_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE VIEW patient_summary AS
SELECT 
    p.id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    p.date_of_birth,
    p.gender,
    p.care_level,
    p.status,
    p.emergency_contact_name,
    p.emergency_contact_phone,
    COUNT(DISTINCT pc.condition_id) as condition_count,
    COUNT(DISTINCT ca.caregiver_id) as caregiver_count,
    MAX(vs.recorded_date) as last_vitals_date
FROM patients p
JOIN users u ON p.user_id = u.id
LEFT JOIN patient_conditions pc ON p.id = pc.patient_id
LEFT JOIN care_assignments ca ON p.id = ca.patient_id AND ca.end_date IS NULL
LEFT JOIN vital_signs vs ON p.id = vs.patient_id
GROUP BY p.id, u.first_name, u.last_name, u.email, u.phone, p.date_of_birth, p.gender, p.care_level, p.status, p.emergency_contact_name, p.emergency_contact_phone;

CREATE VIEW active_prescriptions AS
SELECT 
    pr.id,
    pr.prescription_number,
    u.first_name || ' ' || u.last_name as patient_name,
    pr.medication_name,
    pr.dosage,
    pr.frequency,
    pr.status,
    pr.prescribed_date,
    pr.start_date,
    pr.end_date,
    prescriber.first_name || ' ' || prescriber.last_name as prescriber_name
FROM prescriptions pr
JOIN patients p ON pr.patient_id = p.id
JOIN users u ON p.user_id = u.id
LEFT JOIN users prescriber ON pr.prescriber_id = prescriber.id
WHERE pr.status IN ('approved', 'dispensed') 
AND (pr.end_date IS NULL OR pr.end_date >= CURRENT_DATE);

-- Sample data insertion
INSERT INTO users (email, username, password_hash, first_name, last_name, phone, address, role, is_email_verified, profile_complete) VALUES
('superadmin@arc.com', 'superadmin', '$2b$10$hash', 'Super', 'Admin', '+233 24 000 0001', 'ARC Headquarters, Accra', 'super_admin', true, true),
('admin@arc.com', 'admin', '$2b$10$hash', 'John', 'Administrator', '+233 24 000 0002', 'East Legon, Accra', 'admin', true, true),
('dr.mensah@arc.com', 'drmensah', '$2b$10$hash', 'Dr. Kwame', 'Mensah', '+233 24 000 0003', 'Airport Residential, Accra', 'reviewer', true, true),
('nurse.ama@arc.com', 'nurseama', '$2b$10$hash', 'Ama', 'Osei', '+233 24 000 0004', 'Tema, Greater Accra', 'caregiver', true, true),
('patient@example.com', 'patient1', '$2b$10$hash', 'Akosua', 'Asante', '+233 24 000 0005', 'Kumasi, Ashanti Region', 'patient', true, true);

-- Insert sample medical conditions
INSERT INTO medical_conditions (name, icd_10_code, description, severity) VALUES
('Hypertension', 'I10', 'High blood pressure', 'moderate'),
('Type 2 Diabetes', 'E11', 'Non-insulin dependent diabetes mellitus', 'moderate'),
('Obesity', 'E66', 'Excessive body weight', 'mild'),
('Diabetic Neuropathy', 'E11.4', 'Nerve damage due to diabetes', 'moderate'),
('Stroke', 'I64', 'Cerebrovascular accident', 'severe');

-- Insert sample medications
INSERT INTO medications (name, generic_name, drug_class, dosage_forms, strength_options, contraindications, side_effects) VALUES
('Lisinopril', 'Lisinopril', 'ACE Inhibitor', ARRAY['tablet'], ARRAY['5mg', '10mg', '20mg'], ARRAY['Pregnancy', 'Angioedema history'], ARRAY['Dry cough', 'Dizziness', 'Hyperkalemia']),
('Metformin', 'Metformin hydrochloride', 'Biguanide', ARRAY['tablet', 'extended-release tablet'], ARRAY['500mg', '850mg', '1000mg'], ARRAY['Severe kidney disease', 'Metabolic acidosis'], ARRAY['Nausea', 'Diarrhea', 'Metallic taste']),
('Amlodipine', 'Amlodipine besylate', 'Calcium Channel Blocker', ARRAY['tablet'], ARRAY['2.5mg', '5mg', '10mg'], ARRAY['Severe aortic stenosis'], ARRAY['Ankle swelling', 'Flushing', 'Fatigue']);
