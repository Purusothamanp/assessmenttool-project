'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, Shield, BookOpen, GraduationCap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type UserRole = 'admin' | 'educator' | 'student';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    const normalizedEmail = email.trim().toLowerCase();
    
    setIsLoading(true);
    setError('');

    try {
      // 1. Check if user already exists
      const checkResponse = await fetch(`http://localhost:3001/users?email=${encodeURIComponent(normalizedEmail)}`);
      const existingUsers = await checkResponse.json();
      
      if (existingUsers && existingUsers.length > 0) {
        setError('This email is already registered. Please sign in.');
        setIsLoading(false);
        return;
      }

      // 2. Logic to save to db.json via our backend
      const response = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: normalizedEmail,
          password,
          role,
          status: 'active',
          lastLogin: 'Never'
        })
      });

      if (response.ok) {
        // Success! Redirect to login
        router.push('/login?registered=true');
      } else {
        throw new Error('Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
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
      {/* Ethereal Aurora Background (Shared Light Theme) */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0 }}>
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, 80, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          style={{ 
            position: 'absolute', top: '-10%', left: '-5%', width: '60%', height: '60%', 
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
            position: 'absolute', bottom: '-10%', right: '-5%', width: '60%', height: '60%', 
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
          width: '100%', maxWidth: '540px', padding: '3.5rem', zIndex: 1,
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 25px 80px -15px rgba(0, 0, 0, 0.08), 0 10px 30px -10px rgba(0, 0, 0, 0.04)',
          borderRadius: '2.5rem'
        }}
      >
        <Link 
          href="/login" 
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
            color: '#64748b', fontSize: '0.9rem', 
            textDecoration: 'none', marginBottom: '2rem', fontWeight: 700, transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#3b82f6')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
        >
          <ArrowLeft size={16} />
          Return to Login
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem', color: 'white', 
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            boxShadow: '0 15px 30px -5px rgba(59, 130, 246, 0.4)'
          }}>
            <UserPlus size={40} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-1.5px', marginBottom: '0.75rem' }}>AssessmentTool</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>Create Your Account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '1.25rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Choose Designation</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <motion.button
                    key={r.id}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setRole(r.id as UserRole)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.25rem 0.5rem',
                      border: `2px solid ${isSelected ? r.color : '#f1f5f9'}`,
                      background: isSelected ? `${r.color}08` : 'white',
                      borderRadius: '1.5rem', gap: '0.75rem', transition: 'all 0.3s', cursor: 'pointer',
                      boxShadow: isSelected ? `0 10px 15px -5px ${r.color}20` : 'none'
                    }}
                  >
                    <Icon size={24} color={isSelected ? r.color : '#cbd5e1'} />
                    <span style={{ 
                      fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em',
                      color: isSelected ? r.color : '#64748b'
                    }}>{r.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} />
              <input
                type="text"
                placeholder="Designate Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Email Address</label>
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
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Security Key</label>
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

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              style={{ 
                color: '#ef4444', fontSize: '0.95rem', marginBottom: '2rem', textAlign: 'center',
                padding: '1rem', background: '#fef2f2',
                borderRadius: '1rem', border: '1px solid #fee2e2', fontWeight: 600
              }}
            >
              {error}
            </motion.div>
          )}

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
            {isLoading ? 'Registering...' : 'Register'}
          </motion.button>

          <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>
            Existing Identity? <Link href="/login" style={{ color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}>Sign-in</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
