'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Users, 
  BarChart2, 
  LogOut, 
  ShieldCheck,
  Bell,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: 'User Management', icon: Users, path: '/admin/users' },
    { name: 'Manage Assessments', icon: BookOpen, path: '/admin/assessments' },
    { name: 'Analytics', icon: BarChart2, path: '/admin/analytics' },
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
          height: '100vh',
          zIndex: 50,
          border: 'none',
          boxShadow: '10px 0 30px -15px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', padding: '0 0.75rem' }}>
          <div className="vibrant-gradient-admin" style={{ padding: '0.6rem', borderRadius: '1rem', color: 'white', boxShadow: '0 8px 16px -4px rgba(30, 64, 175, 0.3)' }}>
            <ShieldCheck size={24} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Admin<span style={{ color: 'var(--admin-primary)' }}>Portal</span>
          </h2>
        </div>

        <nav style={{ flex: 1 }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', padding: '0 0.75rem' }}>
            General Management
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <motion.button
                key={item.name}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  width: '100%',
                  padding: '1rem 1.25rem',
                  marginBottom: '0.5rem',
                  borderRadius: '1rem',
                  background: isActive ? 'var(--admin-accent)' : 'transparent',
                  color: isActive ? 'var(--admin-primary)' : 'var(--muted-foreground)',
                  transition: 'all 0.3s ease',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Icon size={20} />
                {item.name}
              </motion.button>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              width: '100%',
              padding: '1rem 1.25rem',
              borderRadius: '1rem',
              color: 'var(--destructive)',
              background: 'rgba(239, 68, 68, 0.05)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)')}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '280px', padding: '0' }}>
        {/* Header */}
        <header style={{
          height: '80px',
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--card-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 3rem',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', fontWeight: 500 }}>
             Dashboard / <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{pathname.split('/').pop()?.replace(/^\w/, c => c.toUpperCase())}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground)' }}>{user?.name || 'Administrator'}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Super Admin</p>
              </div>
              <div 
                className="vibrant-gradient-admin"
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
                  boxShadow: '0 8px 16px -4px rgba(30, 64, 175, 0.2)'
                }}
              >
                {user?.name?.[0].toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '3rem', maxWidth: '1400px', margin: '0 auto' }}>
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
