'use client';

import React, { useState } from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Shield, BookOpen, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function LoginForm() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success] = useState('');
  const searchParams = useSearchParams();
  const registrationSuccess = searchParams.get('registered') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      console.error(err);
      setError('Login failed. Please check your credentials.');
    }
  };

  const roles = [
    { id: 'admin', label: 'Administrator', icon: Shield, color: '#3b82f6' },
    { id: 'educator', label: 'Educator', icon: BookOpen, color: '#10b981' },
    { id: 'student', label: 'Student', icon: GraduationCap, color: '#8b5cf6' },
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
      {/* Ethereal Aurora Background (Light) */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0 }}>
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, 80, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          style={{ 
            position: 'absolute', top: '-15%', left: '-5%', width: '60%', height: '60%', 
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)', filter: 'blur(100px)' 
          }} 
        />
        <motion.div 
          animate={{ 
            scale: [1.3, 1, 1.3],
            x: [0, -80, 0],
            y: [0, -40, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          style={{ 
            position: 'absolute', bottom: '-15%', right: '-5%', width: '60%', height: '60%', 
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)', filter: 'blur(100px)' 
          }} 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="premium-card"
        style={{ 
          width: '100%', maxWidth: '480px', padding: '4rem', zIndex: 1,
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 25px 80px -15px rgba(0, 0, 0, 0.08), 0 10px 30px -10px rgba(0, 0, 0, 0.04)',
          borderRadius: '2.5rem'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem', color: 'white', 
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            boxShadow: '0 15px 30px -5px rgba(59, 130, 246, 0.4)'
          }}>
            <LogIn size={40} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-1.5px', marginBottom: '0.75rem' }}>AssessmentTool</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>Secure Access Portal</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Access Identity</label>
            <div style={{ position: 'relative' }}>
              <Mail size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} />
              <input
                type="email"
                placeholder="identity@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ 
                  padding: '1.1rem 1.25rem 1.1rem 3.5rem', width: '100%', 
                  background: 'white', border: '1px solid #f1f5f9', 
                  borderRadius: '1.25rem', color: '#1e293b', fontSize: '1.1rem', outline: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.01) inset', transition: 'all 0.3s'
                }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Security Key</label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  padding: '1.1rem 1.25rem 1.1rem 3.5rem', width: '100%', 
                  background: 'white', border: '1px solid #f1f5f9', 
                  borderRadius: '1.25rem', color: '#1e293b', fontSize: '1.1rem', outline: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.01) inset', transition: 'all 0.3s'
                }}
                required
              />
            </div>
          </div>

          <AnimatePresence>
            {(error || registrationSuccess) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ 
                  color: error ? '#ef4444' : '#10b981', 
                  fontSize: '0.95rem', marginBottom: '1.5rem', textAlign: 'center',
                  padding: '1rem', background: error ? '#fef2f2' : '#f0fdf4',
                  borderRadius: '1rem', border: `1px solid ${error ? '#fee2e2' : '#dcfce7'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                  fontWeight: 600
                }}
              >
                {registrationSuccess ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {registrationSuccess ? 'Identity Verified. Initialize Login.' : error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button 
            whileHover={{ scale: 1.02, boxShadow: '0 15px 30px -5px rgba(59, 130, 246, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="btn-primary" 
            style={{ 
              width: '100%', padding: '1.25rem', borderRadius: '1.25rem', fontSize: '1.1rem', fontWeight: 800,
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', border: 'none',
              boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.3)'
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Login'}
          </motion.button>

          <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>
            Unregistered Identity? <Link href="/register" style={{ color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}>Register Now</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div className="animate-pulse" style={{ color: 'var(--primary)' }}>Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
