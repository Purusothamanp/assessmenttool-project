'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    // Check for persisted session
    const storedUser = localStorage.getItem('assessment_user');
    if (storedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    
    try {
      // 1. Find the user in our database with email only
      const response = await fetch(`http://localhost:3001/users?email=${encodeURIComponent(normalizedEmail)}`);
      const users = await response.json();
      
      if (!users || users.length === 0) {
        throw new Error('User not found. Please register first.');
      }

      const dbUser = users[0];

      // 2. Check password
      if (dbUser.password !== password) {
        throw new Error('Invalid password. Please try again.');
      }

      // 3. Format timestamp: 2024-03-20 10:30
      const now = new Date();
      const datePart = now.toISOString().split('T')[0];
      const timePart = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const timestamp = `${datePart} ${timePart}`;
      
      // 4. Persist the last login time to the database
      await fetch(`http://localhost:3001/users/${dbUser.id}`, {
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
