import { Patient, User } from "@/lib/types";
import { getDatabase, generateId } from "@/lib/database/sqlite";

// Get database instance
function getDb() {
  return getDatabase();
}

// Patients API functions
export function getAllPatients(): Patient[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      p.*,
      u.first_name,
      u.last_name,
      u.email,
      u.phone,
      ca.caregiver_id,
      ca.assigned_at,
      cu.first_name as caregiver_first_name,
      cu.last_name as caregiver_last_name
    FROM patients p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN caregiver_assignments ca ON p.id = ca.patient_id AND ca.is_active = 1
    LEFT JOIN users cu ON ca.caregiver_id = cu.id
    ORDER BY p.created_at DESC
  `);
  
  const rows = stmt.all() as any[];
  
  return rows.map(row => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    bloodType: row.blood_type,
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    careLevel: row.care_level,
    status: row.status,
    assignedDate: row.assigned_date,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactRelationship: row.emergency_contact_relationship,
    emergencyContactPhone: row.emergency_contact_phone,
    medicalRecordNumber: row.medical_record_number,
    insuranceProvider: row.insurance_provider,
    insurancePolicyNumber: row.insurance_policy_number,
    assignedCaregiver: row.caregiver_id ? {
      id: row.caregiver_id,
      name: `${row.caregiver_first_name} ${row.caregiver_last_name}`,
      assignedAt: row.assigned_at,
    } : undefined,
  }));
}

export function getPatientById(patientId: string): Patient | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      p.*,
      u.first_name,
      u.last_name,
      u.email,
      u.phone,
      ca.caregiver_id,
      ca.assigned_at,
      cu.first_name as caregiver_first_name,
      cu.last_name as caregiver_last_name
    FROM patients p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN caregiver_assignments ca ON p.id = ca.patient_id AND ca.is_active = 1
    LEFT JOIN users cu ON ca.caregiver_id = cu.id
    WHERE p.id = ?
  `);
  
  const row = stmt.get(patientId) as any;
  
  if (!row) return null;
  
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    bloodType: row.blood_type,
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    careLevel: row.care_level,
    status: row.status,
    assignedDate: row.assigned_date,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactRelationship: row.emergency_contact_relationship,
    emergencyContactPhone: row.emergency_contact_phone,
    medicalRecordNumber: row.medical_record_number,
    insuranceProvider: row.insurance_provider,
    insurancePolicyNumber: row.insurance_policy_number,
    assignedCaregiver: row.caregiver_id ? {
      id: row.caregiver_id,
      name: `${row.caregiver_first_name} ${row.caregiver_last_name}`,
      assignedAt: row.assigned_at,
    } : undefined,
  };
}

export function getPatientsByCaregiver(caregiverId: string): Patient[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      p.*,
      u.first_name,
      u.last_name,
      u.email,
      u.phone,
      ca.assigned_at
    FROM patients p
    JOIN users u ON p.user_id = u.id
    JOIN caregiver_assignments ca ON p.id = ca.patient_id
    WHERE ca.caregiver_id = ? AND ca.is_active = 1
    ORDER BY p.created_at DESC
  `);
  
  const rows = stmt.all(caregiverId) as any[];
  
  return rows.map(row => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    bloodType: row.blood_type,
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    careLevel: row.care_level,
    status: row.status,
    assignedDate: row.assigned_date,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactRelationship: row.emergency_contact_relationship,
    emergencyContactPhone: row.emergency_contact_phone,
    medicalRecordNumber: row.medical_record_number,
    insuranceProvider: row.insurance_provider,
    insurancePolicyNumber: row.insurance_policy_number,
    assignedCaregiver: {
      id: caregiverId,
      name: "Assigned Caregiver",
      assignedAt: row.assigned_at,
    },
  }));
}

export function addPatient(patientData: Omit<Patient, "id">): Patient {
  const db = getDb();
  
  // First create user record
  const userId = generateId();
  const userStmt = db.prepare(`
    INSERT INTO users (
      id, email, username, password_hash, first_name, last_name, 
      phone, role, is_active, profile_complete
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  userStmt.run(
    userId,
    patientData.email,
    patientData.email, // Use email as username
    'temp_password_hash', // This should be properly hashed in real implementation
    patientData.firstName,
    patientData.lastName,
    patientData.phone || null,
    'patient',
    1,
    1
  );
  
  // Then create patient record
  const patientId = generateId();
  const patientStmt = db.prepare(`
    INSERT INTO patients (
      id, user_id, date_of_birth, gender, blood_type, height_cm, weight_kg,
      care_level, status, emergency_contact_name, emergency_contact_relationship,
      emergency_contact_phone, medical_record_number, insurance_provider, insurance_policy_number
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  patientStmt.run(
    patientId,
    userId,
    patientData.dateOfBirth || null,
    patientData.gender || null,
    patientData.bloodType || null,
    patientData.heightCm || null,
    patientData.weightKg || null,
    patientData.careLevel || 'medium',
    patientData.status || 'stable',
    patientData.emergencyContactName || null,
    patientData.emergencyContactRelationship || null,
    patientData.emergencyContactPhone || null,
    patientData.medicalRecordNumber || null,
    patientData.insuranceProvider || null,
    patientData.insurancePolicyNumber || null
  );
  
  return { id: patientId, ...patientData };
}

export function updatePatient(patientId: string, updates: Partial<Patient>): boolean {
  const db = getDb();
  
  // Update user information if provided
  if (updates.firstName || updates.lastName || updates.email || updates.phone) {
    const userFields = [];
    const userValues = [];
    
    if (updates.firstName !== undefined) {
      userFields.push('first_name = ?');
      userValues.push(updates.firstName);
    }
    if (updates.lastName !== undefined) {
      userFields.push('last_name = ?');
      userValues.push(updates.lastName);
    }
    if (updates.email !== undefined) {
      userFields.push('email = ?');
      userValues.push(updates.email);
    }
    if (updates.phone !== undefined) {
      userFields.push('phone = ?');
      userValues.push(updates.phone);
    }
    
    if (userFields.length > 0) {
      userFields.push('updated_at = CURRENT_TIMESTAMP');
      userValues.push(patientId);
      
      const userStmt = db.prepare(`
        UPDATE users 
        SET ${userFields.join(', ')}
        WHERE id = (SELECT user_id FROM patients WHERE id = ?)
      `);
      
      userStmt.run(...userValues);
    }
  }
  
  // Update patient information
  const patientFields = [];
  const patientValues = [];
  
  if (updates.dateOfBirth !== undefined) {
    patientFields.push('date_of_birth = ?');
    patientValues.push(updates.dateOfBirth);
  }
  if (updates.gender !== undefined) {
    patientFields.push('gender = ?');
    patientValues.push(updates.gender);
  }
  if (updates.bloodType !== undefined) {
    patientFields.push('blood_type = ?');
    patientValues.push(updates.bloodType);
  }
  if (updates.careLevel !== undefined) {
    patientFields.push('care_level = ?');
    patientValues.push(updates.careLevel);
  }
  if (updates.status !== undefined) {
    patientFields.push('status = ?');
    patientValues.push(updates.status);
  }
  
  if (patientFields.length > 0) {
    patientFields.push('updated_at = CURRENT_TIMESTAMP');
    patientValues.push(patientId);
    
    const patientStmt = db.prepare(`
      UPDATE patients 
      SET ${patientFields.join(', ')}
      WHERE id = ?
    `);
    
    const result = patientStmt.run(...patientValues);
    return result.changes > 0;
  }
  
  return true;
}

export function assignCaregiverToPatient(patientId: string, caregiverId: string, assignedBy: string): boolean {
  const db = getDb();
  
  // First deactivate any existing assignments
  const deactivateStmt = db.prepare(`
    UPDATE caregiver_assignments 
    SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE patient_id = ? AND is_active = 1
  `);
  
  deactivateStmt.run(patientId);
  
  // Then create new assignment
  const assignmentId = generateId();
  const assignStmt = db.prepare(`
    INSERT INTO caregiver_assignments (id, patient_id, caregiver_id, assigned_by, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);
  
  const result = assignStmt.run(assignmentId, patientId, caregiverId, assignedBy);
  return result.changes > 0;
}

// Utility functions
export function getPatientsCount(): number {
  const db = getDb();
  const stmt = db.prepare('SELECT COUNT(*) as count FROM patients');
  const result = stmt.get() as { count: number };
  return result.count;
}

export function getPatientsByCareLevel(careLevel: string): Patient[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      p.*,
      u.first_name,
      u.last_name,
      u.email,
      u.phone
    FROM patients p
    JOIN users u ON p.user_id = u.id
    WHERE p.care_level = ?
    ORDER BY p.created_at DESC
  `);
  
  const rows = stmt.all(careLevel) as any[];
  
  return rows.map(row => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    bloodType: row.blood_type,
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    careLevel: row.care_level,
    status: row.status,
    assignedDate: row.assigned_date,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactRelationship: row.emergency_contact_relationship,
    emergencyContactPhone: row.emergency_contact_phone,
    medicalRecordNumber: row.medical_record_number,
    insuranceProvider: row.insurance_provider,
    insurancePolicyNumber: row.insurance_policy_number,
  }));
}
