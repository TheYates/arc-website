// Utility functions for managing authentication cookies

export function setAuthCookie(sessionData: any, maxAgeHours: number = 8): void {
  if (typeof document === 'undefined') return;
  
  const maxAge = maxAgeHours * 60 * 60; // Convert hours to seconds
  document.cookie = `auth_session=${encodeURIComponent(JSON.stringify(sessionData))}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearAuthCookie(): void {
  if (typeof document === 'undefined') return;
  
  document.cookie = "auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export function getAuthCookie(): any | null {
  if (typeof document === 'undefined') return null;
  
  try {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => 
      cookie.trim().startsWith('auth_session=')
    );
    
    if (!authCookie) return null;
    
    const value = authCookie.split('=')[1];
    return JSON.parse(decodeURIComponent(value));
  } catch (error) {
    console.error('Error parsing auth cookie:', error);
    clearAuthCookie();
    return null;
  }
}
