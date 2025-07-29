import { User } from "@/lib/types";
import { getDatabase, generateId } from "@/lib/database/sqlite";

// Get database instance
function getDb() {
  return getDatabase();
}

// Auth API functions
export function getUserByEmail(email: string): User | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM users WHERE email = ? AND is_active = 1
  `);

  const row = stmt.get(email) as any;

  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    username: row.username,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    address: row.address,
    role: row.role,
    isEmailVerified: Boolean(row.is_email_verified),
    isActive: Boolean(row.is_active),
    profileComplete: Boolean(row.profile_complete),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLogin: row.last_login,
  };
}

export function getUserById(userId: string): User | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM users WHERE id = ? AND is_active = 1
  `);

  const row = stmt.get(userId) as any;

  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    username: row.username,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    address: row.address,
    role: row.role,
    isEmailVerified: Boolean(row.is_email_verified),
    isActive: Boolean(row.is_active),
    profileComplete: Boolean(row.profile_complete),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLogin: row.last_login,
  };
}

export function getUsersByRole(role: string): User[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM users WHERE role = ? AND is_active = 1
    ORDER BY first_name, last_name
  `);

  const rows = stmt.all(role) as any[];

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    username: row.username,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    address: row.address,
    role: row.role,
    isEmailVerified: Boolean(row.is_email_verified),
    isActive: Boolean(row.is_active),
    profileComplete: Boolean(row.profile_complete),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLogin: row.last_login,
  }));
}

export function createUser(
  userData: Omit<User, "id" | "createdAt" | "updatedAt">
): User {
  const db = getDb();
  const id = generateId();

  const stmt = db.prepare(`
    INSERT INTO users (
      id, email, username, password_hash, first_name, last_name, 
      phone, address, role, is_email_verified, is_active, profile_complete
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    userData.email,
    userData.username,
    "temp_password_hash", // This should be properly hashed in real implementation
    userData.firstName,
    userData.lastName,
    userData.phone || null,
    userData.address || null,
    userData.role,
    userData.isEmailVerified ? 1 : 0,
    userData.isActive ? 1 : 0,
    userData.profileComplete ? 1 : 0
  );

  return {
    id,
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function updateUser(userId: string, updates: Partial<User>): boolean {
  const db = getDb();

  const fields = [];
  const values = [];

  if (updates.email !== undefined) {
    fields.push("email = ?");
    values.push(updates.email);
  }
  if (updates.username !== undefined) {
    fields.push("username = ?");
    values.push(updates.username);
  }
  if (updates.firstName !== undefined) {
    fields.push("first_name = ?");
    values.push(updates.firstName);
  }
  if (updates.lastName !== undefined) {
    fields.push("last_name = ?");
    values.push(updates.lastName);
  }
  if (updates.phone !== undefined) {
    fields.push("phone = ?");
    values.push(updates.phone);
  }
  if (updates.address !== undefined) {
    fields.push("address = ?");
    values.push(updates.address);
  }
  if (updates.role !== undefined) {
    fields.push("role = ?");
    values.push(updates.role);
  }
  if (updates.isEmailVerified !== undefined) {
    fields.push("is_email_verified = ?");
    values.push(updates.isEmailVerified ? 1 : 0);
  }
  if (updates.isActive !== undefined) {
    fields.push("is_active = ?");
    values.push(updates.isActive ? 1 : 0);
  }
  if (updates.profileComplete !== undefined) {
    fields.push("profile_complete = ?");
    values.push(updates.profileComplete ? 1 : 0);
  }

  if (fields.length === 0) return false;

  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(userId);

  const stmt = db.prepare(`
    UPDATE users 
    SET ${fields.join(", ")}
    WHERE id = ?
  `);

  const result = stmt.run(...values);
  return result.changes > 0;
}

export function updateLastLogin(userId: string): boolean {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE users 
    SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const result = stmt.run(userId);
  return result.changes > 0;
}

export function deactivateUser(userId: string): boolean {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE users 
    SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const result = stmt.run(userId);
  return result.changes > 0;
}

// Authentication functions (simplified for demo)
export function authenticateUser(
  emailOrUsername: string,
  password: string
): User | null {
  const db = getDb();

  // Get user by email or username
  const stmt = db.prepare(`
    SELECT * FROM users WHERE (email = ? OR username = ?) AND is_active = 1
  `);

  const row = stmt.get(emailOrUsername, emailOrUsername) as any;

  if (!row) return null;

  // For demo purposes, accept "password" for all users
  // In production, you would hash the input password and compare with stored hash
  if (password === "password") {
    const user = {
      id: row.id,
      email: row.email,
      username: row.username,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      address: row.address,
      role: row.role,
      isEmailVerified: Boolean(row.is_email_verified),
      isActive: Boolean(row.is_active),
      profileComplete: Boolean(row.profile_complete),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLogin: row.last_login,
    };

    updateLastLogin(user.id);
    return user;
  }

  return null;
}

// Utility functions
export function getAllUsers(): User[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM users WHERE is_active = 1
    ORDER BY role, first_name, last_name
  `);

  const rows = stmt.all() as any[];

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    username: row.username,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    address: row.address,
    role: row.role,
    isEmailVerified: Boolean(row.is_email_verified),
    isActive: Boolean(row.is_active),
    profileComplete: Boolean(row.profile_complete),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLogin: row.last_login,
  }));
}

export function getUsersCount(): number {
  const db = getDb();
  const stmt = db.prepare(
    "SELECT COUNT(*) as count FROM users WHERE is_active = 1"
  );
  const result = stmt.get() as { count: number };
  return result.count;
}

export function getUsersByRoleCount(role: string): number {
  const db = getDb();
  const stmt = db.prepare(
    "SELECT COUNT(*) as count FROM users WHERE role = ? AND is_active = 1"
  );
  const result = stmt.get(role) as { count: number };
  return result.count;
}

// Get caregivers for assignment
export function getCaregivers(): User[] {
  return getUsersByRole("care_giver");
}

// Get reviewers
export function getReviewers(): User[] {
  return getUsersByRole("reviewer");
}
