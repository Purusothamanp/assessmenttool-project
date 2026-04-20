'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  CheckSquare, 
  LogOut,
  User as UserIcon,
  Bell
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && mounted) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'student') {
        router.push(user.role === 'admin' ? '/admin' : '/educator');
      }
    }
  }, [user, isLoading, router, mounted]);

  if (!mounted || isLoading || !user || user.role !== 'student') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted-foreground)' }}>Loading portal...</p>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { name: 'My Assessments', href: '/student/assessments', icon: BookOpen },
    { name: 'Results & Feedback', href: '/student/results', icon: CheckSquare },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      {/* Sidebar */}
      <aside 
        className="glass-panel"
        style={{ 
          width: '280px', 
          padding: '2rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          border: 'none',
          boxShadow: '10px 0 30px -15px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ padding: '0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
          <div className="vibrant-gradient-student" style={{ color: 'white', padding: '0.6rem', borderRadius: '1rem', boxShadow: '0 8px 16px -4px rgba(124, 58, 237, 0.3)' }}>
            <GraduationCap size={24} />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Learn<span style={{ color: 'var(--student-primary)' }}>Labs</span>
          </span>
        </div>

        <div style={{ padding: '0 0.75rem', flex: 1 }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>
            Main Menu
          </p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} style={{ textDecoration: 'none' }}>
                  <motion.div 
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem',
                      borderRadius: '1rem', color: isActive ? 'var(--student-primary)' : 'var(--muted-foreground)',
                      background: isActive ? 'var(--student-accent)' : 'transparent',
                      fontWeight: isActive ? 700 : 500, transition: 'all 0.3s ease',
                    }}
                  >
                    <Icon size={20} />
                    {item.name}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div style={{ padding: '1.25rem' }}>
          <button 
            onClick={logout}
            style={{ 
              width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', 
              borderRadius: '1rem', color: 'var(--destructive)', background: 'rgba(239, 68, 68, 0.05)', 
              fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)')}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column' }}>
        {/* Top Header */}
        <header style={{ 
          height: '80px', 
          background: 'rgba(255, 255, 255, 0.5)', 
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--card-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 3rem',
          position: 'sticky', top: 0, zIndex: 40
        }}>
          <div style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', fontWeight: 500 }}>
             Dashboard / <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{pathname === '/student' ? 'Overview' : pathname.split('/').pop()?.replace(/^\w/, c => c.toUpperCase())}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground)' }}>{user.name}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>{user.role}</p>
              </div>
              <div 
                className="vibrant-gradient-student"
                style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '14px', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  boxShadow: '0 8px 16px -4px rgba(124, 58, 237, 0.2)'
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '3rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
