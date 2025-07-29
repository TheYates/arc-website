import { Medication, MedicationAdministration } from "@/lib/types";
import { getDatabase, generateId } from "@/lib/database/sqlite";

// Get database instance
function getDb() {
  return getDatabase();
}

// Medications API functions
export function getMedications(patientId: string): Medication[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM medications 
    WHERE patient_id = ? AND is_active = 1
    ORDER BY created_at DESC
  `);
  
  const rows = stmt.all(patientId) as any[];
  
  return rows.map(row => ({
    id: row.id,
    patientId: row.patient_id,
    medicationName: row.medication_name,
    dosage: row.dosage,
    route: row.route,
    frequency: row.frequency,
    startDate: row.start_date,
    endDate: row.end_date,
    instructions: row.instructions,
    prescribedBy: row.prescribed_by,
    isActive: Boolean(row.is_active),
  }));
}

export function getMedicationById(medicationId: string): Medication | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM medications WHERE id = ?
  `);
  
  const row = stmt.get(medicationId) as any;
  
  if (!row) return null;
  
  return {
    id: row.id,
    patientId: row.patient_id,
    medicationName: row.medication_name,
    dosage: row.dosage,
    route: row.route,
    frequency: row.frequency,
    startDate: row.start_date,
    endDate: row.end_date,
    instructions: row.instructions,
    prescribedBy: row.prescribed_by,
    isActive: Boolean(row.is_active),
  };
}

export function addMedication(medication: Omit<Medication, "id">): Medication {
  const db = getDb();
  const id = generateId();
  
  const stmt = db.prepare(`
    INSERT INTO medications (
      id, patient_id, medication_name, dosage, route, frequency, 
      start_date, end_date, instructions, prescribed_by, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    medication.patientId,
    medication.medicationName,
    medication.dosage,
    medication.route || 'oral',
    medication.frequency,
    medication.startDate,
    medication.endDate || null,
    medication.instructions || null,
    medication.prescribedBy || null,
    medication.isActive ? 1 : 0
  );
  
  return { id, ...medication };
}

export function updateMedication(medicationId: string, updates: Partial<Medication>): boolean {
  const db = getDb();
  
  const fields = [];
  const values = [];
  
  if (updates.medicationName !== undefined) {
    fields.push('medication_name = ?');
    values.push(updates.medicationName);
  }
  if (updates.dosage !== undefined) {
    fields.push('dosage = ?');
    values.push(updates.dosage);
  }
  if (updates.route !== undefined) {
    fields.push('route = ?');
    values.push(updates.route);
  }
  if (updates.frequency !== undefined) {
    fields.push('frequency = ?');
    values.push(updates.frequency);
  }
  if (updates.instructions !== undefined) {
    fields.push('instructions = ?');
    values.push(updates.instructions);
  }
  if (updates.isActive !== undefined) {
    fields.push('is_active = ?');
    values.push(updates.isActive ? 1 : 0);
  }
  
  if (fields.length === 0) return false;
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(medicationId);
  
  const stmt = db.prepare(`
    UPDATE medications 
    SET ${fields.join(', ')}
    WHERE id = ?
  `);
  
  const result = stmt.run(...values);
  return result.changes > 0;
}

// Medication Administrations API functions
export function getMedicationAdministrations(patientId: string): MedicationAdministration[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM medication_administrations 
    WHERE patient_id = ?
    ORDER BY scheduled_time DESC
  `);
  
  const rows = stmt.all(patientId) as any[];
  
  return rows.map(row => ({
    id: row.id,
    medicationId: row.medication_id,
    patientId: row.patient_id,
    caregiverId: row.caregiver_id,
    scheduledTime: row.scheduled_time,
    actualTime: row.actual_time,
    status: row.status,
    dosageGiven: row.dosage_given,
    notes: row.notes,
    sideEffectsObserved: row.side_effects_observed,
    patientResponse: row.patient_response,
  }));
}

export function getAdministrationsByMedication(medicationId: string): MedicationAdministration[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM medication_administrations 
    WHERE medication_id = ?
    ORDER BY scheduled_time DESC
  `);
  
  const rows = stmt.all(medicationId) as any[];
  
  return rows.map(row => ({
    id: row.id,
    medicationId: row.medication_id,
    patientId: row.patient_id,
    caregiverId: row.caregiver_id,
    scheduledTime: row.scheduled_time,
    actualTime: row.actual_time,
    status: row.status,
    dosageGiven: row.dosage_given,
    notes: row.notes,
    sideEffectsObserved: row.side_effects_observed,
    patientResponse: row.patient_response,
  }));
}

export function recordMedicationAdministration(
  administration: Omit<MedicationAdministration, "id">
): MedicationAdministration {
  const db = getDb();
  const id = generateId();
  
  const stmt = db.prepare(`
    INSERT INTO medication_administrations (
      id, medication_id, patient_id, caregiver_id, scheduled_time, 
      actual_time, status, dosage_given, notes, side_effects_observed, patient_response
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    administration.medicationId,
    administration.patientId,
    administration.caregiverId,
    administration.scheduledTime,
    administration.actualTime || null,
    administration.status,
    administration.dosageGiven || null,
    administration.notes || null,
    administration.sideEffectsObserved || null,
    administration.patientResponse || null
  );
  
  return { id, ...administration };
}

export function updateAdministration(
  administrationId: string, 
  updates: Partial<MedicationAdministration>
): boolean {
  const db = getDb();
  
  const fields = [];
  const values = [];
  
  if (updates.actualTime !== undefined) {
    fields.push('actual_time = ?');
    values.push(updates.actualTime);
  }
  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  if (updates.dosageGiven !== undefined) {
    fields.push('dosage_given = ?');
    values.push(updates.dosageGiven);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    values.push(updates.notes);
  }
  if (updates.sideEffectsObserved !== undefined) {
    fields.push('side_effects_observed = ?');
    values.push(updates.sideEffectsObserved);
  }
  if (updates.patientResponse !== undefined) {
    fields.push('patient_response = ?');
    values.push(updates.patientResponse);
  }
  
  if (fields.length === 0) return false;
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(administrationId);
  
  const stmt = db.prepare(`
    UPDATE medication_administrations 
    SET ${fields.join(', ')}
    WHERE id = ?
  `);
  
  const result = stmt.run(...values);
  return result.changes > 0;
}

// Utility functions
export function getActiveMedicationsCount(patientId: string): number {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT COUNT(*) as count FROM medications 
    WHERE patient_id = ? AND is_active = 1
  `);
  
  const result = stmt.get(patientId) as { count: number };
  return result.count;
}

export function getRecentAdministrations(patientId: string, limit: number = 10): MedicationAdministration[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM medication_administrations 
    WHERE patient_id = ?
    ORDER BY scheduled_time DESC
    LIMIT ?
  `);
  
  const rows = stmt.all(patientId, limit) as any[];
  
  return rows.map(row => ({
    id: row.id,
    medicationId: row.medication_id,
    patientId: row.patient_id,
    caregiverId: row.caregiver_id,
    scheduledTime: row.scheduled_time,
    actualTime: row.actual_time,
    status: row.status,
    dosageGiven: row.dosage_given,
    notes: row.notes,
    sideEffectsObserved: row.side_effects_observed,
    patientResponse: row.patient_response,
  }));
}
