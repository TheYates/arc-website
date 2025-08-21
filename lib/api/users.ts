import { User, UserRole } from "../auth";
import { CareerApplication } from "../types/careers";
import { v4 as uuidv4 } from "uuid";

// Storage key for user accounts
const USERS_STORAGE_KEY = "auth_users";

// Utility functions for localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

// User account with password for storage
interface UserAccount {
  user: User;
  password: string;
}

// Generate temporary password
function generateTemporaryPassword(): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Generate username from name
function generateUsername(firstName: string, lastName: string): string {
  const base = (firstName.toLowerCase() + lastName.toLowerCase()).replace(
    /[^a-z0-9]/g,
    ""
  );
  const suffix = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return base + suffix;
}

// Determine role based on job category
function determineRoleFromJobCategory(jobCategory: string): UserRole {
  const categoryRoleMap: Record<string, UserRole> = {
    Healthcare: "caregiver",
    Childcare: "caregiver",
    "Event Medical": "caregiver",
    Administrative: "reviewer",
    "Medical Review": "reviewer",
    Management: "reviewer",
  };

  return categoryRoleMap[jobCategory] || "caregiver"; // Default to caregiver
}

// Check if user already exists
export async function checkUserExists(email: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getFromStorage<UserAccount[]>(USERS_STORAGE_KEY, []);
      const exists = users.some((account) => account.user.email === email);
      resolve(exists);
    }, 200);
  });
}

// Create account from career application
export async function createAccountFromApplication(
  application: CareerApplication,
  jobCategory: string,
  createdByAdmin: string
): Promise<{
  success: boolean;
  user?: User;
  password?: string;
  error?: string;
}> {
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        // Check if user already exists
        const userExists = await checkUserExists(application.email);
        if (userExists) {
          resolve({
            success: false,
            error: "An account with this email already exists",
          });
          return;
        }

        // Generate account details
        const tempPassword = generateTemporaryPassword();
        const username = generateUsername(
          application.firstName,
          application.lastName
        );
        const role = determineRoleFromJobCategory(jobCategory);

        // Create user object
        const newUser: User = {
          id: uuidv4(),
          email: application.email,
          username: username,
          firstName: application.firstName,
          lastName: application.lastName,
          phone: application.phone || "",
          address: application.address || "",
          role: role,
          isEmailVerified: false, // They'll need to verify
          isActive: true, // New users are active by default
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: "",
          profileComplete: false, // They'll need to complete their profile
        };

        // Store user account
        const users = getFromStorage<UserAccount[]>(USERS_STORAGE_KEY, []);
        users.push({
          user: newUser,
          password: tempPassword,
        });
        saveToStorage(USERS_STORAGE_KEY, users);

        // Account creation logged for audit trail

        resolve({
          success: true,
          user: newUser,
          password: tempPassword,
        });
      } catch (error) {
        console.error("Failed to create account:", error);
        resolve({
          success: false,
          error: "Failed to create account. Please try again.",
        });
      }
    }, 500);
  });
}

// Get user account (for integration with existing auth)
export async function getUserAccount(
  emailOrUsername: string
): Promise<UserAccount | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getFromStorage<UserAccount[]>(USERS_STORAGE_KEY, []);
      const account = users.find(
        (acc) =>
          acc.user.email === emailOrUsername ||
          acc.user.username === emailOrUsername
      );
      resolve(account || null);
    }, 200);
  });
}

// Send account creation email (mock implementation)
export async function sendAccountCreationEmail(
  user: User,
  password: string
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock email sending - in production, integrate with your email service
      // Account creation email sent successfully

      resolve({ success: true });
    }, 300);
  });
}

// Update existing auth integration
export function integrateWithAuth() {
  // This function can be called to merge created accounts with the existing auth system
  if (typeof window === "undefined") return;

  const users = getFromStorage<UserAccount[]>(USERS_STORAGE_KEY, []);

  // For development, you can log the accounts that have been created
  console.log(
    "Created user accounts:",
    users.map((acc) => ({
      email: acc.user.email,
      username: acc.user.username,
      role: acc.user.role,
    }))
  );
}
