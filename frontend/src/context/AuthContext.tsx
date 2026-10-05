import React, { createContext, useContext, useState, useMemo } from 'react';
import { Librarian } from '../types/models';
import { LoginRequest } from '../types/api';
import { login as apiLogin } from '../api/auth';

interface AuthContextType {
  token: string | null;
  librarian: Librarian | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read initial auth state synchronously from localStorage to prevent redirect flashing
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('shelflife_token');
  });

  const [librarian, setLibrarian] = useState<Librarian | null>(() => {
    const saved = localStorage.getItem('shelflife_user');
    if (!saved) return null;
    try {
      return JSON.parse(saved) as Librarian;
    } catch {
      return null;
    }
  });

  const login = async (credentials: LoginRequest) => {
    const res = await apiLogin(credentials);
    setToken(res.token);
    setLibrarian(res.librarian);
    localStorage.setItem('shelflife_token', res.token);
    localStorage.setItem('shelflife_user', JSON.stringify(res.librarian));
  };

  const logout = () => {
    setToken(null);
    setLibrarian(null);
    localStorage.removeItem('shelflife_token');
    localStorage.removeItem('shelflife_user');
  };

  const isAuthenticated = Boolean(token);

  const value = useMemo(
    () => ({
      token,
      librarian,
      isAuthenticated,
      login,
      logout,
    }),
    [token, librarian, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
