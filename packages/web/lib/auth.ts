/**
 * Authentication utility functions
 * Handles user session management with localStorage
 */

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

const USER_STORAGE_KEY = 'user';

/**
 * Get the currently logged-in user from localStorage
 */
export function getUser(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    if (!userJson) {
      return null;
    }

    const user = JSON.parse(userJson);
    return user;
  } catch (error) {
    console.error('Error reading user from localStorage:', error);
    return null;
  }
}

/**
 * Set the current user in localStorage
 */
export function setUser(user: User): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
}

/**
 * Check if a user is currently logged in
 */
export function isLoggedIn(): boolean {
  return getUser() !== null;
}

/**
 * Log out the current user by clearing localStorage
 */
export function logout(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(USER_STORAGE_KEY);
    // Clear any other session-related data
    // In the future, this could also revoke tokens on the server
  } catch (error) {
    console.error('Error during logout:', error);
  }
}

/**
 * Redirect to login page if not authenticated
 * Use this in protected pages
 */
export function requireAuth(router: { push: (path: string) => void }): User | null {
  const user = getUser();

  if (!user) {
    router.push('/login');
    return null;
  }

  return user;
}
