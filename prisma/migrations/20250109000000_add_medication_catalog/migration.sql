-- Add MedicationCatalog table for common medications
CREATE TABLE "MedicationCatalog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genericName" TEXT,
    "brandNames" TEXT[],
    "drugClass" TEXT,
    "category" TEXT,
    "dosageForms" TEXT[],
    "strengthOptions" TEXT[],
    "routeOfAdministration" TEXT,
    "contraindications" TEXT[],
    "sideEffects" TEXT[],
    "drugInteractions" TEXT[],
    "pregnancyCategory" TEXT,
    "controlledSubstanceSchedule" TEXT,
    "isCommon" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicationCatalog_pkey" PRIMARY KEY ("id")
);

-- Create index for common lookups
CREATE INDEX "MedicationCatalog_name_idx" ON "MedicationCatalog"("name");
CREATE INDEX "MedicationCatalog_isCommon_idx" ON "MedicationCatalog"("isCommon");
CREATE INDEX "MedicationCatalog_drugClass_idx" ON "MedicationCatalog"("drugClass");
