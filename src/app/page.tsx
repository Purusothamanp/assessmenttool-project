'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Rocket, Sparkles, ShieldCheck, CheckCircle2, ArrowRight, Zap 
} from 'lucide-react';

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f8fafc',
      color: '#0f172a',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Ethereal Aurora Background (Matching Login & Register) */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <motion.div 
          animate={{ scale: [1, 1.25, 1], x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          style={{ 
            position: 'absolute', top: '-15%', left: '-5%', width: '60%', height: '60%', 
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.09) 0%, transparent 70%)', filter: 'blur(100px)' 
          }} 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], x: [0, -60, 0], y: [0, -40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          style={{ 
            position: 'absolute', bottom: '-15%', right: '-5%', width: '60%', height: '60%', 
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.09) 0%, transparent 70%)', filter: 'blur(100px)' 
          }} 
        />
      </div>

      {/* Navigation Header */}
      <header style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.5rem 2.5rem',
        maxWidth: '1280px', width: '100%', margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px -4px rgba(59, 130, 246, 0.4)'
          }}>
            <Rocket size={22} color="#ffffff" />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#0f172a' }}>
            Assessment<span style={{ color: '#3b82f6' }}>Tool</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04, backgroundColor: '#ffffff' }}
              whileTap={{ scale: 0.96 }}
              style={{
                padding: '0.6rem 1.4rem', borderRadius: '0.75rem',
                background: 'rgba(255, 255, 255, 0.8)', border: '1px solid #e2e8f0',
                color: '#1e293b', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.03)',
                transition: 'all 0.2s ease'
              }}
            >
              Log In
            </motion.button>
          </Link>
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.4)' }}
              whileTap={{ scale: 0.96 }}
              style={{
                padding: '0.6rem 1.4rem', borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', border: 'none',
                color: '#ffffff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              Sign In
            </motion.button>
          </Link>
        </div>
      </header>

      {/* Main Hero Container */}
      <main style={{
        position: 'relative', zIndex: 5, flex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1.5rem 4rem', maxWidth: '1050px', width: '100%', margin: '0 auto', textAlign: 'center'
      }}>
        {/* Glassmorphic Card (Matching Login Page) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(20px)',
            borderRadius: '2.5rem',
            padding: '4.5rem 3rem',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 25px 80px -15px rgba(0, 0, 0, 0.08), 0 10px 30px -10px rgba(0, 0, 0, 0.04)',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* Top Rocket Icon Circle */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 15 }}
            style={{ 
              width: '84px', height: '84px', borderRadius: '24px', margin: '0 auto 2.5rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
              boxShadow: '0 15px 30px -5px rgba(59, 130, 246, 0.4)'
            }}
          >
            <Rocket size={42} />
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            style={{
              fontSize: 'clamp(2.5rem, 6.5vw, 4.8rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem',
              maxWidth: '850px',
              color: '#0f172a'
            }}
          >
            Assessment<span style={{ color: '#3b82f6' }}>Tool</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            style={{
              fontSize: 'clamp(1.1rem, 2.2vw, 1.3rem)',
              color: '#64748b',
              maxWidth: '680px',
              lineHeight: 1.6,
              fontWeight: 500,
              marginBottom: '3rem'
            }}
          >
            A modern platform for creating assessments, managing students and tracking performance
          </motion.p>

          {/* Primary CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{ marginBottom: '2.5rem' }}
          >
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: '0 15px 35px -5px rgba(59, 130, 246, 0.4)' 
                }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '1.25rem 3.5rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '1.25rem',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)',
                  transition: 'all 0.25s ease'
                }}
              >
                Get Started
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ArrowRight size={24} />
                </motion.div>
              </motion.button>
            </Link>
          </motion.div>

          {/* Quick Feature Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.75rem',
              color: '#64748b', fontSize: '0.9rem', fontWeight: 600
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}>
              <CheckCircle2 size={18} color="#10b981" /> Fast Setup
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}>
              <Zap size={18} color="#3b82f6" /> Automated Evaluation
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}>
              <ShieldCheck size={18} color="#8b5cf6" /> Secure Environment
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Decorative Accent */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', top: '12%', right: '4%', color: 'rgba(59, 130, 246, 0.12)', zIndex: 1, pointerEvents: 'none' }}
      >
        <Sparkles size={140} />
      </motion.div>
    </div>
  );
}



