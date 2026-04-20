'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Shield, BookOpen, GraduationCap, ChevronRight, Sparkles, Zap, BarChart3 } from 'lucide-react';

export default function Home() {
  const features = [
    { title: 'Admin Studio', desc: 'Centralized protocol management & oversight.', icon: Shield, color: '#3b82f6' },
    { title: 'Educator Hub', desc: 'Architect custom assessments with precision.', icon: BookOpen, color: '#10b981' },
    { title: 'Student Arena', desc: 'High-focus environment for peak performance.', icon: GraduationCap, color: '#8b5cf6' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'var(--font-geist-sans), -apple-system, sans-serif'
    }}>
      {/* Luminous Infinity Background */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0 }}>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ 
            position: 'absolute', top: '-10%', left: '-5%', width: '70%', height: '70%', 
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)', filter: 'blur(100px)' 
          }} 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          style={{ 
            position: 'absolute', bottom: '-10%', right: '-5%', width: '70%', height: '70%', 
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)', filter: 'blur(100px)' 
          }} 
        />
      </div>

      {/* Hero Sanctum */}
      <div style={{ maxWidth: '1200px', width: '100%', zIndex: 1, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(20px)',
            borderRadius: '3rem',
            padding: '4rem 2rem',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 25px 80px -15px rgba(0, 0, 0, 0.08)',
            marginBottom: '4rem'
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', damping: 15 }}
            style={{ 
              width: '100px', height: '100px', borderRadius: '30px', margin: '0 auto 2.5rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
              boxShadow: '0 20px 40px -10px rgba(59, 130, 246, 0.5)'
            }}
          >
            <Rocket size={50} />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ 
              fontSize: 'clamp(2.5rem, 10vw, 5rem)', fontWeight: 900, color: '#0f172a', 
              letterSpacing: '-2px', lineHeight: 1, marginBottom: '1.5rem' 
            }}
          >
            AssessmentTool
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ 
              fontSize: 'clamp(1.1rem, 4vw, 1.4rem)', color: '#64748b', 
              maxWidth: '650px', margin: '0 auto 3rem', lineHeight: 1.6, fontWeight: 500 
            }}
          >
            The elite architecture for building, deploying, and analyzing world-class assessments with precision and elegance.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: '0 15px 35px -5px rgba(59, 130, 246, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '1.25rem 3.5rem', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white', border: 'none', borderRadius: '1.25rem', fontSize: '1.25rem',
                  fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                  boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)'
                }}
              >
                Launch Platform <ChevronRight size={24} />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Protocol Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {features.map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + idx * 0.1 }}
              whileHover={{ y: -10 }}
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                borderRadius: '2rem',
                padding: '2.5rem',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                textAlign: 'left',
                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '16px', 
                background: `${feat.color}15`, color: feat.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem'
              }}>
                <feat.icon size={28} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>{feat.title}</h3>
              <p style={{ color: '#64748b', lineHeight: 1.5, fontWeight: 500 }}>{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative Accents */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', top: '10%', right: '5%', color: 'rgba(59, 130, 246, 0.2)', zIndex: 0 }}
      >
        <Sparkles size={120} />
      </motion.div>
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', bottom: '15%', left: '5%', color: 'rgba(139, 92, 246, 0.2)', zIndex: 0 }}
      >
        <Zap size={80} />
      </motion.div>
    </div>
  );
}
