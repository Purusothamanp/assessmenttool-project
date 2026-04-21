'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  UserPlus,
  Shield,
  BookOpen,
  GraduationCap,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

type UserRole = 'admin' | 'educator' | 'student';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth(); // ✅ use only this loading

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState('');

  // ✅ CLEAN SUBMIT HANDLER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔴 Basic validation
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Invalid email format');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    setError('');

    try {
      await register(name, normalizedEmail, password, role);
      // navigation handled in AuthContext
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Registration failed');
    }
  };

  const roles = [
    { id: 'admin', label: 'Administrator', icon: Shield, color: '#3b82f6' },
    { id: 'educator', label: 'Educator', icon: BookOpen, color: '#10b981' },
    { id: 'student', label: 'Student', icon: GraduationCap, color: '#8b5cf6' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
      background: '#f8fafc'
    }}>
      
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, 80, 0], y: [0, 40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-5%',
            width: '60%',
            height: '60%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.08), transparent)',
            filter: 'blur(100px)'
          }}
        />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '3rem',
          zIndex: 1,
          background: 'rgba(255,255,255,0.8)',
          borderRadius: '2rem',
          backdropFilter: 'blur(20px)'
        }}
      >
        {/* Back */}
        <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <ArrowLeft size={16} /> Back
        </Link>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '1rem 0' }}>
          Register
        </h1>

        {/* Role selection */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {roles.map((r) => {
            const Icon = r.icon;
            const selected = role === r.id;

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id as UserRole)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 10,
                  border: selected ? `2px solid ${r.color}` : '1px solid #ddd',
                  background: selected ? `${r.color}20` : 'white'
                }}
              >
                <Icon size={18} />
                <div>{r.label}</div>
              </button>
            );
          })}
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: 12, marginBottom: 10 }}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: 12, marginBottom: 10 }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: 12, marginBottom: 20 }}
          />

          {/* ERROR */}
          {error && (
            <div style={{ color: 'red', marginBottom: 10 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: 12,
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 10
            }}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}