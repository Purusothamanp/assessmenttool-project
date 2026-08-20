'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

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
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for persisted session and verify status
    const checkUserStatus = async () => {
      const storedUser = localStorage.getItem('assessment_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const response = await fetch(`${API_BASE_URL}/users/${parsedUser.id}`);
          if (response.ok) {
            const dbUser = await response.json();
            if (dbUser.status === 'inactive') {
              localStorage.removeItem('assessment_user');
              setUser(null);
              router.push('/login');
              setIsLoading(false);
              return;
            }
          }
          setUser(parsedUser);
        } catch (err) {
          setUser(JSON.parse(storedUser));
        }
      }
      setIsLoading(false);
    };

    checkUserStatus();
  }, [router]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    
    try {
      // 1. Find the user in our database with email only
      const response = await fetch(`${API_BASE_URL}/users?email=${encodeURIComponent(normalizedEmail)}`);
      const users = await response.json();
      
      if (!users || users.length === 0) {
        throw new Error('User not found. Please register first.');
      }

      const dbUser = users[0];

      // 2. Check if account is active
      if (dbUser.status === 'inactive') {
        throw new Error('Your account is currently inactive. Please contact an administrator.');
      }

      // 3. Check password
      if (dbUser.password !== password) {
        throw new Error('Invalid password. Please try again.');
      }

      // 3. Format timestamp: 2024-03-20 10:30
      const now = new Date();
      const datePart = now.toISOString().split('T')[0];
      const timePart = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const timestamp = `${datePart} ${timePart}`;
      
      // 4. Persist the last login time to the database
      await fetch(`${API_BASE_URL}/users/${dbUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastLogin: timestamp })
      });
      
      const loggedInUser = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role
      };

      localStorage.setItem('assessment_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setIsLoading(false);

      // Redirect based on role from database
      if (dbUser.role === 'admin') router.push('/admin');
      else if (dbUser.role === 'educator') router.push('/educator');
      else if (dbUser.role === 'student') router.push('/student');
      
    } catch (err) {
      console.error('Login integration error:', err);
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
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
