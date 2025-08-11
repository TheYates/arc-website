-- Update UserRole enum to change care_giver to caregiver
ALTER TYPE "public"."UserRole" RENAME VALUE 'care_giver' TO 'caregiver';
