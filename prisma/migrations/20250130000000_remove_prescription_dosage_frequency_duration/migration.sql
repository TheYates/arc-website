-- Remove dosage, frequency, and duration columns from prescriptions table
-- This migration was applied manually via Supabase SQL Editor due to permission restrictions

-- AlterTable
ALTER TABLE "prescriptions" DROP COLUMN "dosage";
ALTER TABLE "prescriptions" DROP COLUMN "frequency";
ALTER TABLE "prescriptions" DROP COLUMN "duration";
