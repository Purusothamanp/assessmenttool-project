'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/apiConfig';

export type UserRole = 'admin' | 'educator' | 'student' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for persisted session
    const storedUser = localStorage.getItem('assessment_user');
    if (storedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const navigateBasedOnRole = (role: UserRole) => {
    if (role === 'admin') router.push('/admin');
    else if (role === 'educator') router.push('/educator');
    else if (role === 'student') router.push('/student');
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const loggedInUser = data;
      localStorage.setItem('assessment_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setIsLoading(false);

      navigateBasedOnRole(loggedInUser.role);
      
    } catch (err: any) {
      console.error('Login error:', err);
      setIsLoading(false);
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Auto-login after successful registration
      const newUser = data.user;
      localStorage.setItem('assessment_user', JSON.stringify(newUser));
      setUser(newUser);
      setIsLoading(false);

      navigateBasedOnRole(newUser.role);
    } catch (err: any) {
      console.error('Registration error:', err);
      setIsLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('assessment_user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
