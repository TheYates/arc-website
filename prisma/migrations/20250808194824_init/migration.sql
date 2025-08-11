-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('super_admin', 'admin', 'reviewer', 'caregiver', 'patient');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "public"."CareLevel" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "public"."PatientStatus" AS ENUM ('stable', 'improving', 'declining', 'critical');

-- CreateEnum
CREATE TYPE "public"."PrescriptionStatus" AS ENUM ('draft', 'pending', 'approved', 'dispensed', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."MedicationAdministrationStatus" AS ENUM ('scheduled', 'administered', 'missed', 'refused', 'delayed');

-- CreateEnum
CREATE TYPE "public"."TemperatureUnit" AS ENUM ('C', 'F');

-- CreateEnum
CREATE TYPE "public"."BloodSugarType" AS ENUM ('fasting', 'random', 'post_meal');

-- CreateEnum
CREATE TYPE "public"."MedicalReviewType" AS ENUM ('routine', 'urgent', 'follow_up', 'consultation');

-- CreateEnum
CREATE TYPE "public"."MedicalReviewStatus" AS ENUM ('pending', 'in_review', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "public"."Severity" AS ENUM ('mild', 'moderate', 'severe');

-- CreateEnum
CREATE TYPE "public"."SymptomReportStatus" AS ENUM ('reported', 'reviewed', 'resolved', 'escalated');

-- CreateEnum
CREATE TYPE "public"."MedicalSupplyCategory" AS ENUM ('mobility_aids', 'monitoring', 'therapeutic', 'safety', 'comfort', 'medication', 'other');

-- CreateEnum
CREATE TYPE "public"."MedicalSupplyRequestStatus" AS ENUM ('pending', 'approved', 'rejected', 'ordered', 'delivered', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."ServiceCategory" AS ENUM ('home_care', 'nanny', 'emergency', 'custom');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "role" "public"."UserRole" NOT NULL,
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "profile_complete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patients" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date_of_birth" DATE,
    "gender" "public"."Gender",
    "blood_type" TEXT,
    "height_cm" INTEGER,
    "weight_kg" DECIMAL(5,2),
    "care_level" "public"."CareLevel" NOT NULL DEFAULT 'medium',
    "status" "public"."PatientStatus" NOT NULL DEFAULT 'stable',
    "assigned_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emergency_contact_name" TEXT,
    "emergency_contact_relationship" TEXT,
    "emergency_contact_phone" TEXT,
    "medical_record_number" TEXT,
    "insurance_provider" TEXT,
    "insurance_policy_number" TEXT,
    "primary_physician" TEXT,
    "allergies" TEXT[],
    "chronic_conditions" TEXT[],
    "current_medications" TEXT[],
    "medical_history" TEXT,
    "special_instructions" TEXT,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."caregiver_assignments" (
    "id" TEXT NOT NULL,
    "caregiver_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "caregiver_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medications" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "generic_name" TEXT,
    "brand_names" TEXT[],
    "drug_class" TEXT,
    "dosage_forms" TEXT[],
    "strength_options" TEXT[],
    "route_of_administration" TEXT,
    "contraindications" TEXT[],
    "side_effects" TEXT[],
    "drug_interactions" TEXT[],
    "pregnancy_category" TEXT,
    "controlled_substance_schedule" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."prescriptions" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "medication_id" TEXT NOT NULL,
    "prescribed_by_id" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT,
    "instructions" TEXT,
    "status" "public"."PrescriptionStatus" NOT NULL DEFAULT 'draft',
    "prescribed_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "start_date" DATE,
    "end_date" DATE,
    "approved_by_id" TEXT,
    "approved_date" TIMESTAMP(3),
    "dispensed_date" TIMESTAMP(3),
    "notes" TEXT,
    "reviewer_notes" TEXT,
    "pharmacy_notes" TEXT,
    "monitoring_required" BOOLEAN NOT NULL DEFAULT false,
    "monitoring_instructions" TEXT,
    "cost_estimate" DECIMAL(10,2),
    "insurance_covered" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medication_administrations" (
    "id" TEXT NOT NULL,
    "prescription_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "administered_by_id" TEXT,
    "scheduled_time" TIMESTAMP(3) NOT NULL,
    "administered_time" TIMESTAMP(3),
    "status" "public"."MedicationAdministrationStatus" NOT NULL DEFAULT 'scheduled',
    "dosage_given" TEXT,
    "notes" TEXT,
    "side_effects_observed" TEXT,
    "vital_signs" JSONB,
    "next_dose_time" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medication_administrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vital_signs" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "recorded_by_id" TEXT,
    "recorded_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "systolic_bp" INTEGER,
    "diastolic_bp" INTEGER,
    "heart_rate" INTEGER,
    "temperature" DECIMAL(4,1),
    "temperature_unit" "public"."TemperatureUnit" NOT NULL DEFAULT 'C',
    "oxygen_saturation" INTEGER,
    "respiratory_rate" INTEGER,
    "weight_kg" DECIMAL(5,2),
    "height_cm" INTEGER,
    "blood_sugar" DECIMAL(5,1),
    "blood_sugar_type" "public"."BloodSugarType",
    "pain_level" INTEGER,
    "notes" TEXT,

    CONSTRAINT "vital_signs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medical_reviews" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "reviewer_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "review_type" "public"."MedicalReviewType" NOT NULL,
    "status" "public"."MedicalReviewStatus" NOT NULL DEFAULT 'pending',
    "priority" "public"."Priority" NOT NULL DEFAULT 'medium',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "findings" TEXT,
    "recommendations" TEXT,
    "follow_up_required" BOOLEAN NOT NULL DEFAULT false,
    "follow_up_date" DATE,
    "reviewed_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."symptom_reports" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "reported_by_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "symptoms" TEXT[],
    "severity" "public"."Severity" NOT NULL DEFAULT 'mild',
    "status" "public"."SymptomReportStatus" NOT NULL DEFAULT 'reported',
    "description" TEXT NOT NULL,
    "notes" TEXT,
    "reviewed_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "symptom_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medical_supply_requests" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "requested_by_id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "category" "public"."MedicalSupplyCategory" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "urgency" "public"."Priority" NOT NULL DEFAULT 'medium',
    "status" "public"."MedicalSupplyRequestStatus" NOT NULL DEFAULT 'pending',
    "justification" TEXT NOT NULL,
    "medical_necessity" TEXT,
    "approved_by_id" TEXT,
    "approved_date" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "reviewer_notes" TEXT,
    "vendor" TEXT,
    "delivery_date" DATE,
    "insurance_covered" BOOLEAN NOT NULL DEFAULT true,
    "patient_responsibility" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_supply_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "short_description" TEXT,
    "category" "public"."ServiceCategory" NOT NULL,
    "base_price" DECIMAL(10,2),
    "price_display" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_popular" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "color_theme" TEXT NOT NULL DEFAULT 'teal',
    "icon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."service_items" (
    "id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "is_popular" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "parent_id" TEXT,
    "base_price" DECIMAL(10,2),
    "price_display" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "patients_user_id_key" ON "public"."patients"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "patients_medical_record_number_key" ON "public"."patients"("medical_record_number");

-- CreateIndex
CREATE UNIQUE INDEX "caregiver_assignments_caregiver_id_patient_id_key" ON "public"."caregiver_assignments"("caregiver_id", "patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "public"."services"("slug");

-- AddForeignKey
ALTER TABLE "public"."patients" ADD CONSTRAINT "patients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."caregiver_assignments" ADD CONSTRAINT "caregiver_assignments_caregiver_id_fkey" FOREIGN KEY ("caregiver_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."caregiver_assignments" ADD CONSTRAINT "caregiver_assignments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prescriptions" ADD CONSTRAINT "prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prescriptions" ADD CONSTRAINT "prescriptions_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "public"."medications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prescriptions" ADD CONSTRAINT "prescriptions_prescribed_by_id_fkey" FOREIGN KEY ("prescribed_by_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prescriptions" ADD CONSTRAINT "prescriptions_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medication_administrations" ADD CONSTRAINT "medication_administrations_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medication_administrations" ADD CONSTRAINT "medication_administrations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medication_administrations" ADD CONSTRAINT "medication_administrations_administered_by_id_fkey" FOREIGN KEY ("administered_by_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vital_signs" ADD CONSTRAINT "vital_signs_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vital_signs" ADD CONSTRAINT "vital_signs_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_reviews" ADD CONSTRAINT "medical_reviews_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_reviews" ADD CONSTRAINT "medical_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_reviews" ADD CONSTRAINT "medical_reviews_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."symptom_reports" ADD CONSTRAINT "symptom_reports_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."symptom_reports" ADD CONSTRAINT "symptom_reports_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."symptom_reports" ADD CONSTRAINT "symptom_reports_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_supply_requests" ADD CONSTRAINT "medical_supply_requests_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_supply_requests" ADD CONSTRAINT "medical_supply_requests_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."service_items" ADD CONSTRAINT "service_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."service_items" ADD CONSTRAINT "service_items_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."service_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
