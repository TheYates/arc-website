-- CreateIndex
CREATE INDEX "caregiver_assignments_caregiver_id_idx" ON "caregiver_assignments"("caregiver_id");

-- CreateIndex
CREATE INDEX "caregiver_assignments_patient_id_idx" ON "caregiver_assignments"("patient_id");

-- CreateIndex
CREATE INDEX "caregiver_assignments_is_active_idx" ON "caregiver_assignments"("is_active");

-- CreateIndex
CREATE INDEX "caregiver_assignments_caregiver_id_is_active_idx" ON "caregiver_assignments"("caregiver_id", "is_active");

-- CreateIndex
CREATE INDEX "caregiver_assignments_patient_id_is_active_idx" ON "caregiver_assignments"("patient_id", "is_active");

-- CreateIndex
CREATE INDEX "reviewer_assignments_reviewer_id_idx" ON "reviewer_assignments"("reviewer_id");

-- CreateIndex
CREATE INDEX "reviewer_assignments_patient_id_idx" ON "reviewer_assignments"("patient_id");

-- CreateIndex
CREATE INDEX "reviewer_assignments_is_active_idx" ON "reviewer_assignments"("is_active");

-- CreateIndex
CREATE INDEX "reviewer_assignments_reviewer_id_is_active_idx" ON "reviewer_assignments"("reviewer_id", "is_active");

-- CreateIndex
CREATE INDEX "reviewer_assignments_patient_id_is_active_idx" ON "reviewer_assignments"("patient_id", "is_active");

-- CreateIndex
CREATE INDEX "vital_signs_patient_id_idx" ON "vital_signs"("patient_id");

-- CreateIndex
CREATE INDEX "vital_signs_recorded_date_idx" ON "vital_signs"("recorded_date");

-- CreateIndex
CREATE INDEX "vital_signs_patient_id_recorded_date_idx" ON "vital_signs"("patient_id", "recorded_date");
