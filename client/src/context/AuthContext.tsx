"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { API_BASE } from '@/lib/api-config';

export type UserSession = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  whatsapp: string | null;
  preferences: string[];
  notifyDaily: boolean;
};

type AuthContextType = {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUser: (data: Partial<UserSession>) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = 'agromonitor_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserSession;
        setUser(parsed);
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSession = (userData: UserSession) => {
    setUser(userData);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        saveSession(data.data);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Login gagal' };
      }
    } catch {
      return { success: false, message: 'Tidak dapat terhubung ke server' };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        saveSession(data.data);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Registrasi gagal' };
      }
    } catch {
      return { success: false, message: 'Tidak dapat terhubung ke server' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    // Also remove legacy key
    localStorage.removeItem('agromonitor_user_email');
  }, []);

  const updateUser = useCallback((data: Partial<UserSession>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
