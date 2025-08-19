import { User } from "@/lib/auth";

/**
 * Utility function to create authentication headers for API requests
 * This ensures consistent authentication across all API calls
 */
export function createAuthHeaders(user: User | null, additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...additionalHeaders,
  };

  if (user?.id) {
    headers["x-user-id"] = user.id;
    headers["x-session-user"] = encodeURIComponent(JSON.stringify(user));
  }

  return headers;
}

/**
 * Wrapper for fetch that automatically includes authentication headers
 */
export async function authenticatedFetch(
  url: string,
  user: User | null,
  options: RequestInit = {}
): Promise<Response> {
  const authHeaders = createAuthHeaders(user);
  
  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...authHeaders,
      ...(options.headers || {}),
    },
  };

  return fetch(url, mergedOptions);
}

/**
 * Helper for GET requests with authentication
 */
export async function authenticatedGet(url: string, user: User | null): Promise<Response> {
  return authenticatedFetch(url, user, { method: "GET" });
}

/**
 * Helper for POST requests with authentication
 */
export async function authenticatedPost(
  url: string,
  user: User | null,
  body?: any
): Promise<Response> {
  return authenticatedFetch(url, user, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Helper for PUT requests with authentication
 */
export async function authenticatedPut(
  url: string,
  user: User | null,
  body?: any
): Promise<Response> {
  return authenticatedFetch(url, user, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Helper for PATCH requests with authentication
 */
export async function authenticatedPatch(
  url: string,
  user: User | null,
  body?: any
): Promise<Response> {
  return authenticatedFetch(url, user, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Helper for DELETE requests with authentication
 */
export async function authenticatedDelete(url: string, user: User | null): Promise<Response> {
  return authenticatedFetch(url, user, { method: "DELETE" });
}
