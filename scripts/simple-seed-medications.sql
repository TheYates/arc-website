-- Simple SQL script to seed common medications
INSERT INTO medication_catalog (id, name, generic_name, drug_class, category, is_common, is_active, created_at, updated_at) VALUES
  ('med_001', 'Lisinopril', 'Lisinopril', 'Cardiovascular', 'ACE Inhibitor', true, true, NOW(), NOW()),
  ('med_002', 'Metformin', 'Metformin', 'Antidiabetic', 'Biguanide', true, true, NOW(), NOW()),
  ('med_003', 'Amlodipine', 'Amlodipine', 'Cardiovascular', 'Calcium Channel Blocker', true, true, NOW(), NOW()),
  ('med_004', 'Metoprolol', 'Metoprolol', 'Cardiovascular', 'Beta Blocker', true, true, NOW(), NOW()),
  ('med_005', 'Omeprazole', 'Omeprazole', 'Gastrointestinal', 'PPI', true, true, NOW(), NOW()),
  ('med_006', 'Simvastatin', 'Simvastatin', 'Cardiovascular', 'Statin', true, true, NOW(), NOW()),
  ('med_007', 'Losartan', 'Losartan', 'Cardiovascular', 'ARB', true, true, NOW(), NOW()),
  ('med_008', 'Albuterol', 'Albuterol', 'Respiratory', 'Bronchodilator', true, true, NOW(), NOW()),
  ('med_009', 'Gabapentin', 'Gabapentin', 'Neurological', 'Anticonvulsant', true, true, NOW(), NOW()),
  ('med_010', 'Sertraline', 'Sertraline', 'Antidepressant', 'SSRI', true, true, NOW(), NOW()),
  ('med_011', 'Ibuprofen', 'Ibuprofen', 'Pain Relief', 'NSAID', true, true, NOW(), NOW()),
  ('med_012', 'Acetaminophen', 'Acetaminophen', 'Pain Relief', 'Analgesic', true, true, NOW(), NOW()),
  ('med_013', 'Aspirin', 'Aspirin', 'Pain Relief', 'NSAID', true, true, NOW(), NOW()),
  ('med_014', 'Hydrochlorothiazide', 'Hydrochlorothiazide', 'Cardiovascular', 'Diuretic', true, true, NOW(), NOW()),
  ('med_015', 'Atorvastatin', 'Atorvastatin', 'Cardiovascular', 'Statin', true, true, NOW(), NOW()),
  ('med_016', 'Amoxicillin', 'Amoxicillin', 'Antibiotic', 'Penicillin', true, true, NOW(), NOW()),
  ('med_017', 'Azithromycin', 'Azithromycin', 'Antibiotic', 'Macrolide', true, true, NOW(), NOW()),
  ('med_018', 'Furosemide', 'Furosemide', 'Cardiovascular', 'Loop Diuretic', true, true, NOW(), NOW()),
  ('med_019', 'Levothyroxine', 'Levothyroxine', 'Endocrine', 'Thyroid Hormone', true, true, NOW(), NOW()),
  ('med_020', 'Prednisone', 'Prednisone', 'Anti-inflammatory', 'Corticosteroid', true, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
