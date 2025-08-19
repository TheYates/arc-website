import {
  Patient,
  Medication,
  MedicationAdministration,
  User,
} from "@/lib/types";
import { User as AuthUser } from "@/lib/auth";
import { createAuthHeaders } from "@/lib/api/auth-headers";

// Client-side API functions that call Next.js API routes

// Simple in-memory cache for API responses
const apiCache = new Map<
  string,
  { data: any; timestamp: number; ttl: number }
>();

function getCachedData(key: string): any | null {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    console.log(`💾 Cache HIT for ${key}`);
    return cached.data;
  }
  if (cached) {
    apiCache.delete(key); // Remove expired cache
  }
  return null;
}

function setCachedData(key: string, data: any, ttlMs: number = 60000): void {
  apiCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  });
  console.log(`💾 Cache SET for ${key} (TTL: ${ttlMs}ms)`);

  // Clean up old cache entries periodically
  if (apiCache.size > 100) {
    cleanupCache();
  }
}

function cleanupCache(): void {
  const now = Date.now();
  let cleaned = 0;
  for (const [key, value] of apiCache.entries()) {
    if (now - value.timestamp > value.ttl) {
      apiCache.delete(key);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`🧹 Cache cleanup: removed ${cleaned} expired entries`);
  }
}

function invalidateCache(pattern?: string): void {
  if (!pattern) {
    const size = apiCache.size;
    apiCache.clear();
    console.log(`🗑️ Cache cleared: removed ${size} entries`);
    return;
  }

  let removed = 0;
  for (const key of apiCache.keys()) {
    if (key.includes(pattern)) {
      apiCache.delete(key);
      removed++;
    }
  }
  if (removed > 0) {
    console.log(
      `🗑️ Cache invalidated: removed ${removed} entries matching "${pattern}"`
    );
  }
}

// Authentication
export async function authenticateUserClient(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  console.log("🌐 Client API authenticateUserClient called:", { email });

  try {
    console.log("📡 Making fetch request to /api/auth/login");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    console.log("📥 Response status:", response.status, response.statusText);
    const data = await response.json();
    console.log("📄 Response data:", data);

    if (!response.ok) {
      console.log("❌ Response not ok:", data.error);
      return { success: false, error: data.error || "Login failed" };
    }

    console.log("✅ Client API success, returning user:", data.user);
    return { success: true, user: data.user };
  } catch (error) {
    console.error("💥 Authentication error in client:", error);
    return { success: false, error: "Network error" };
  }
}

// Patients
export async function getPatientByIdClient(
  patientId: string,
  user: AuthUser | null = null
): Promise<Patient | null> {
  try {
    const cacheKey = `patient-${patientId}`;
    const cached = getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    const start = performance.now();
    const headers = createAuthHeaders(user);
    const response = await fetch(`/api/patients/${patientId}`, {
      headers,
      next: { revalidate: 30 }, // Cache for 30 seconds
    });
    const fetchEnd = performance.now();

    if (!response.ok) {
      console.error("Failed to fetch patient:", response.statusText);
      return null;
    }

    const data = await response.json();
    const parseEnd = performance.now();

    console.log(
      `🔍 Patient API: fetch ${(fetchEnd - start).toFixed(2)}ms, parse ${(
        parseEnd - fetchEnd
      ).toFixed(2)}ms, total ${(parseEnd - start).toFixed(2)}ms`
    );

    // Cache the result for 30 seconds
    setCachedData(cacheKey, data.patient, 30000);

    return data.patient;
  } catch (error) {
    console.error("Get patient error:", error);
    return null;
  }
}

export async function getPatientsByCaregiverClient(
  caregiverId: string,
  user: AuthUser | null = null
): Promise<Patient[]> {
  try {
    const headers = createAuthHeaders(user);
    const response = await fetch(`/api/patients/caregiver/${caregiverId}`, {
      headers,
    });

    if (!response.ok) {
      console.error("Failed to fetch patients:", response.statusText);
      return [];
    }

    const data = await response.json();
    return data.patients;
  } catch (error) {
    console.error("Get patients by caregiver error:", error);
    return [];
  }
}

// Medications
export async function getMedicationsClient(
  patientId: string,
  user: AuthUser | null = null
): Promise<Medication[]> {
  try {
    const cacheKey = `medications-${patientId}`;
    const cached = getCachedData(cacheKey);
    if (cached) {
      console.log(`💊 Medications: Using cached data (${cached.length} items)`);
      return cached;
    }

    const start = performance.now();
    const headers = createAuthHeaders(user);
    const response = await fetch(`/api/medications/${patientId}`, {
      headers,
      next: { revalidate: 120 }, // Increased cache time to 2 minutes
    });
    const fetchEnd = performance.now();

    if (!response.ok) {
      console.error("Failed to fetch medications:", response.statusText);
      return [];
    }

    const data = await response.json();
    const parseEnd = performance.now();

    console.log(
      `💊 Medications API: fetch ${(fetchEnd - start).toFixed(2)}ms, parse ${(
        parseEnd - fetchEnd
      ).toFixed(2)}ms, total ${(parseEnd - start).toFixed(2)}ms, found ${
        (data.prescriptions || []).length
      } medications`
    );

    // Cache the result for 5 minutes
    setCachedData(cacheKey, data.prescriptions || [], 300000);

    return data.prescriptions || [];
  } catch (error) {
    console.error("Get medications error:", error);
    return [];
  }
}

export async function getMedicationAdministrationsClient(
  patientId: string
): Promise<MedicationAdministration[]> {
  try {
    const cacheKey = `administrations-${patientId}`;
    const cached = getCachedData(cacheKey);
    if (cached) {
      console.log(
        `💉 Administrations: Using cached data (${cached.length} items)`
      );
      return cached;
    }

    const start = performance.now();
    const response = await fetch(
      `/api/medications/administrations/${patientId}`,
      {
        next: { revalidate: 60 }, // Increased cache time to 1 minute
      }
    );
    const fetchEnd = performance.now();

    if (!response.ok) {
      console.error("Failed to fetch administrations:", response.statusText);
      return [];
    }

    const data = await response.json();
    const parseEnd = performance.now();

    console.log(
      `💉 Administrations API: fetch ${(fetchEnd - start).toFixed(
        2
      )}ms, parse ${(parseEnd - fetchEnd).toFixed(2)}ms, total ${(
        parseEnd - start
      ).toFixed(2)}ms, found ${
        (data.administrations || []).length
      } administrations`
    );

    // Cache the result for 2 minutes
    setCachedData(cacheKey, data.administrations || [], 120000);

    return data.administrations || [];
  } catch (error) {
    console.error("Get administrations error:", error);
    return [];
  }
}

export async function recordMedicationAdministrationClient(
  administration: Omit<MedicationAdministration, "id">
): Promise<MedicationAdministration | null> {
  try {
    const response = await fetch("/api/medications/administrations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(administration),
    });

    if (!response.ok) {
      console.error("Failed to record administration:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.administration;
  } catch (error) {
    console.error("Record administration error:", error);
    return null;
  }
}
