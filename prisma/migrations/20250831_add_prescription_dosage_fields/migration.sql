-- Add dosage, frequency, and route columns to prescriptions table
-- Migration: 20250831_add_prescription_dosage_fields

-- Add new columns to prescriptions table
ALTER TABLE "public"."prescriptions" 
ADD COLUMN "dosage" TEXT NOT NULL DEFAULT '',
ADD COLUMN "frequency" TEXT NOT NULL DEFAULT '',
ADD COLUMN "route" TEXT NOT NULL DEFAULT '';

-- Update existing prescriptions to have meaningful default values
UPDATE "public"."prescriptions" 
SET "dosage" = 'Not specified',
    "frequency" = 'Not specified', 
    "route" = 'Not specified'
WHERE "dosage" = '' OR "frequency" = '' OR "route" = '';

-- Remove default constraints after updating existing data
ALTER TABLE "public"."prescriptions" 
ALTER COLUMN "dosage" DROP DEFAULT,
ALTER COLUMN "frequency" DROP DEFAULT,
ALTER COLUMN "route" DROP DEFAULT;
