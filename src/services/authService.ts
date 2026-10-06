/**
 * Authentication service.
 * Credentials are verified by the server, which issues an httpOnly session
 * cookie. Nothing secret is stored in the browser: `localStorage` only caches
 * the signed-in user's display profile, and the server is asked to confirm the
 * session (`restoreSession`) every time the app loads.
 * Organization: Himalayan Guardian Nepal
 * Platform: HGN Marketing Hub
 */

export interface SimpleUser {
  id: string;
  name: string;
  email: string;
}

const STORAGE_KEY_SESSION = 'hgn_logged_in_user';
export const UNAUTHORIZED_EVENT = 'hgn:unauthorized';

type AuthResult = { success: boolean; user?: SimpleUser; error?: string };

const toSimpleUser = (u: any): SimpleUser => ({ id: u.id, name: u.name, email: u.email });

function cacheUser(user: SimpleUser | null): void {
  try {
    if (user) localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY_SESSION);
  } catch (e) {
    console.warn('[authService] Could not update cached user', e);
  }
}

async function postAuth(url: string, body: object): Promise<AuthResult> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success || !data.user) {
      return { success: false, error: data.error || 'Request failed. Please try again.' };
    }
    const user = toSimpleUser(data.user);
    cacheUser(user);
    return { success: true, user };
  } catch {
    return { success: false, error: 'Cannot reach the server. Please check your connection and try again.' };
  }
}

export const authService = {
  async createAccount(name: string, email: string, password: string, confirmPassword: string): Promise<AuthResult> {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      return { success: false, error: 'Please fill in all fields.' };
    }
    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }
    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters.' };
    }
    return postAuth('/api/auth/register', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      confirmPassword,
    });
  },

  async login(email: string, password: string): Promise<AuthResult> {
    if (!email.trim() || !password) {
      return { success: false, error: 'Invalid email or password.' };
    }
    return postAuth('/api/auth/login', { email: email.trim().toLowerCase(), password });
  },

  /** Ask the server whether the session cookie is still valid. */
  async restoreSession(): Promise<SimpleUser | null> {
    if (!this.getCurrentUser()) return null; // never signed in on this browser: skip the request
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        const user = toSimpleUser(data.user);
        cacheUser(user);
        return user;
      }
      if (res.status === 401) cacheUser(null);
    } catch {
      // Server unreachable: keep the cached profile so the UI can render; API calls will still fail without a session.
      return this.getCurrentUser();
    }
    return null;
  },

  getCurrentUser(): SimpleUser | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  async logout(): Promise<void> {
    cacheUser(null);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      /* cookie expires on its own */
    }
  },
};
