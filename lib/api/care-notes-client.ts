import { CareNote, CreateCareNoteRequest, UpdateCareNoteRequest } from "@/lib/types/care-notes";

// Cache for care notes
const CACHE_DURATION = 30000; // 30 seconds
const cache = new Map<string, { data: CareNote[]; timestamp: number }>();

function getCachedNotes(cacheKey: string): CareNote[] | null {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedNotes(cacheKey: string, data: CareNote[]): void {
  cache.set(cacheKey, { data, timestamp: Date.now() });
}

function clearCache(): void {
  cache.clear();
}

// Get care notes for a patient with optional filtering by author role
export async function getCareNotes(
  patientId: string,
  authorRole?: "caregiver" | "reviewer"
): Promise<CareNote[]> {
  const cacheKey = `notes-${patientId}-${authorRole || 'all'}`;
  const cached = getCachedNotes(cacheKey);
  if (cached) {
    return cached;
  }

  const start = performance.now();
  const params = new URLSearchParams();
  params.append('patientId', patientId);
  if (authorRole) params.append('authorRole', authorRole);

  const response = await fetch(`/api/care-notes?${params.toString()}`, {
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch care notes: ${response.statusText}`);
  }

  const result = await response.json();
  const notes = result.notes || [];
  
  setCachedNotes(cacheKey, notes);
  
  const end = performance.now();
  console.log(`📝 Care notes fetched in ${(end - start).toFixed(2)}ms`);
  
  return notes;
}

// Create a new care note
export async function createCareNote(noteData: CreateCareNoteRequest): Promise<CareNote> {
  const start = performance.now();
  
  const response = await fetch('/api/care-notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(noteData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create care note: ${response.statusText}`);
  }

  const result = await response.json();
  const note = result.note;
  
  // Clear cache to ensure fresh data
  clearCache();
  
  const end = performance.now();
  console.log(`📝 Care note created in ${(end - start).toFixed(2)}ms`);
  
  return note;
}

// Update an existing care note
export async function updateCareNote(
  noteId: string, 
  updateData: UpdateCareNoteRequest
): Promise<CareNote> {
  const start = performance.now();
  
  const response = await fetch(`/api/care-notes/${noteId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error(`Failed to update care note: ${response.statusText}`);
  }

  const result = await response.json();
  const note = result.note;
  
  // Clear cache to ensure fresh data
  clearCache();
  
  const end = performance.now();
  console.log(`📝 Care note updated in ${(end - start).toFixed(2)}ms`);
  
  return note;
}

// Delete a care note
export async function deleteCareNote(noteId: string): Promise<void> {
  const start = performance.now();
  
  const response = await fetch(`/api/care-notes/${noteId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete care note: ${response.statusText}`);
  }
  
  // Clear cache to ensure fresh data
  clearCache();
  
  const end = performance.now();
  console.log(`📝 Care note deleted in ${(end - start).toFixed(2)}ms`);
}

// Get a specific care note by ID
export async function getCareNoteById(noteId: string): Promise<CareNote | null> {
  const start = performance.now();
  
  const response = await fetch(`/api/care-notes/${noteId}`, {
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch care note: ${response.statusText}`);
  }

  const result = await response.json();
  const note = result.note;
  
  const end = performance.now();
  console.log(`📝 Care note fetched by ID in ${(end - start).toFixed(2)}ms`);
  
  return note;
}
