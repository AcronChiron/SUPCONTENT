import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, setToken, initToken } from '../services/api';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  avatarUrl: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initToken().then(() =>
      api<User>('/users/me')
        .then(setUser)
        .catch(() => setToken(null))
        .finally(() => setLoading(false))
    );
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api<{ user: User; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await setToken(res.accessToken);
    setUser(res.user);
  };

  const register = async (email: string, username: string, password: string) => {
    const res = await api<{ user: User; accessToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
    await setToken(res.accessToken);
    setUser(res.user);
  };

  const logout = async () => {
    try { await api('/auth/logout', { method: 'POST' }); } catch {}
    await setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
