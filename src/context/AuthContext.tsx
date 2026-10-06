import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, SimpleUser, UNAUTHORIZED_EVENT } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: SimpleUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  createAccount: (name: string, email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<SimpleUser | null>(() => {
    return authService.getCurrentUser();
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return authService.isAuthenticated();
  });

  // Confirm the cached profile against the server's session cookie, and sign out on any 401.
  useEffect(() => {
    let cancelled = false;
    authService.restoreSession().then(user => {
      if (cancelled) return;
      setCurrentUser(user);
      setIsAuthenticated(user !== null);
    });

    const onUnauthorized = () => {
      authService.logout();
      setCurrentUser(null);
      setIsAuthenticated(false);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => {
      cancelled = true;
      window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: result.error || 'Invalid email or password.' };
  };

  const createAccount = async (name: string, email: string, password: string, confirmPassword: string) => {
    const result = await authService.createAccount(name, email, password, confirmPassword);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: result.error || 'Failed to create account.' };
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        createAccount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
