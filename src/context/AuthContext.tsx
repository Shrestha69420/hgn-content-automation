import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, SimpleUser } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: SimpleUser | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  createAccount: (name: string, email: string, password: string, confirmPassword: string) => { success: boolean; error?: string };
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

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    } else {
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const login = (email: string, password: string) => {
    const result = authService.login(email, password);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: result.error || 'Invalid email or password.' };
  };

  const createAccount = (name: string, email: string, password: string, confirmPassword: string) => {
    const result = authService.createAccount(name, email, password, confirmPassword);
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
