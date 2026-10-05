/**
 * Simple Authentication Service with SQLite Backend & Local Storage Sync
 * Organization: Himalayan Guardian Nepal
 * Platform: HGN Marketing Hub
 */

export interface SimpleUser {
  id: string;
  name: string;
  email: string;
  password?: string;
}

const STORAGE_KEY_USERS = 'hgn_registered_users';
const STORAGE_KEY_SESSION = 'hgn_logged_in_user';

// Initial default user if no users registered yet
const DEFAULT_USER: SimpleUser = {
  id: 'hgn-default-1',
  name: 'HGN Marketing Specialist',
  email: 'marketing@himalayanguardian.org.np',
  password: 'password123',
};

export const authService = {
  /**
   * Get all registered accounts from local storage
   */
  getRegisteredUsers(): SimpleUser[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_USERS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading registered users', e);
    }
    // Seed default user if empty
    const initial = [
      DEFAULT_USER,
      {
        id: 'hgn-default-2',
        name: 'Himalayan Guardian',
        email: 'himalayanguardian@gmail.com',
        password: 'password123',
      }
    ];
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(initial));
    return initial;
  },

  /**
   * Create account (Register) - Persisted to SQLite backend + LocalStorage
   */
  async createAccount(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<{ success: boolean; user?: SimpleUser; error?: string }> {
    // 1. Check that all fields are filled
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      return { success: false, error: 'Please fill in all fields.' };
    }

    // 2. Check that password and confirm password match
    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 3. Try to register with SQLite backend
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: trimmedEmail,
          password: password.trim(),
          confirmPassword: confirmPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Registration failed.' };
      }

      const sessionData: SimpleUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
      };

      // Save locally for fast re-entry
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));
      const users = this.getRegisteredUsers();
      users.push({ ...sessionData, password: password.trim() });
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

      return { success: true, user: sessionData };
    } catch (err) {
      console.warn('[authService] Server register failed, falling back to local storage:', err);
      // Offline fallback
      const users = this.getRegisteredUsers();
      const existing = users.find(u => u.email.toLowerCase() === trimmedEmail);
      if (existing) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      const newUser: SimpleUser = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: trimmedEmail,
        password: password.trim(),
      };

      users.push(newUser);
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      const sessionData: SimpleUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      };
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));
      return { success: true, user: sessionData };
    }
  },

  /**
   * Log In - Authenticated with SQLite backend + LocalStorage
   */
  async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: SimpleUser; error?: string }> {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // 1. Try to log in with SQLite backend
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const sessionData: SimpleUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
        };
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));
        return { success: true, user: sessionData };
      }
    } catch (err) {
      console.warn('[authService] Server login unreachable, trying local credentials:', err);
    }

    // 2. Check local accounts fallback
    const users = this.getRegisteredUsers();
    const matched = users.find(
      u => u.email.toLowerCase() === trimmedEmail && u.password === trimmedPassword
    );

    if (matched) {
      const sessionData: SimpleUser = {
        id: matched.id,
        name: matched.name,
        email: matched.email,
      };
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));
      return { success: true, user: sessionData };
    }

    return { success: false, error: 'Invalid email or password.' };
  },

  /**
   * Get current logged-in user from local storage
   */
  getCurrentUser(): SimpleUser | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SESSION);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading current user session', e);
    }
    return null;
  },

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  /**
   * Logout
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  },
};
