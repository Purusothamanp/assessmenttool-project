'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Search, 
  BookOpen, 
  Clock, 
  ArrowRight,
  List,
  LayoutGrid,
  CheckCircle,
  Award,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';

interface Submission {
  id: string;
  studentName: string;
  assessmentTitle: string;
  score: number;
  status: string;
  date: string;
}

export default function StudentAssessments() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchSubmissions = useCallback(async () => {
    try {
      if (!user) return;
      const response = await fetch(`${API_BASE_URL}/submissions?studentName=${encodeURIComponent(user.name)}`);
      const data = await response.json();
      setSubmissions(data.reverse());
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Compute stats
  const totalAssigned = submissions.length;
  const pendingCount = submissions.filter(s => s.status === 'Pending').length;
  const completedCount = submissions.filter(s => s.status === 'Passed' || s.status === 'Evaluated' || s.score > 0).length;
  const avgScore = completedCount > 0 
    ? Math.round(submissions.filter(s => s.score > 0).reduce((acc, curr) => acc + curr.score, 0) / completedCount) 
    : 0;

  const stats = [
    { label: 'Assigned Workspace', value: totalAssigned.toString(), icon: BookOpen, color: '#8b5cf6', filterKey: 'all' },
    { label: 'Pending Tests', value: pendingCount.toString(), icon: Clock, color: '#f59e0b', filterKey: 'Pending' },
    { label: 'Completed', value: completedCount.toString(), icon: CheckCircle, color: '#10b981', filterKey: 'Passed' },
    { label: 'Average Score', value: `${avgScore}%`, icon: Award, color: '#3b82f6', filterKey: 'all' },
  ];

  const filtered = submissions.filter(s => {
    const matchesSearch = s.assessmentTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'Pending' ? s.status === 'Pending' : (s.status === 'Passed' || s.status === 'Evaluated' || s.score > 0));
    return matchesSearch && matchesStatus;
  });

  const displayedSubmissions = showAll ? filtered : filtered.slice(0, 3);

  return (
    <div className="animate-premium">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ padding: '0.25rem 0.6rem', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              STUDENT PORTAL
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>My Assessments</h1>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isSelected = statusFilter === stat.filterKey;
          return (
            <div 
              key={stat.label} 
              onClick={() => setStatusFilter(statusFilter === stat.filterKey ? 'all' : stat.filterKey)}
              className="premium-card stat-hover-card" 
              style={{ 
                padding: '0.85rem 1rem',
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                border: isSelected ? `2px solid ${stat.color}` : '1px solid var(--card-border)',
                background: isSelected ? `${stat.color}08` : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div 
                style={{ 
                  background: `${stat.color}15`, 
                  color: stat.color, 
                  padding: '0.65rem', 
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon size={20} />
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', marginBottom: '0.1rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stat.label}</p>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.2 }}>{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unified Table Container (matching User Management format) */}
      <div className="premium-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.15rem' }}>Assigned Work</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>View and complete your assigned quizzes, exams and surveys.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>Showing {displayedSubmissions.length} of {filtered.length}</span>
            <button
              onClick={() => setShowAll(!showAll)}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', color: '#8b5cf6', fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' }}
            >
              {showAll ? 'Minimize' : 'See All'}
            </button>
          </div>
        </div>

        {/* Embedded Controls Bar (Search + Filter Pills + View Switcher) */}
        <div style={{ padding: '0.65rem 1.25rem', background: '#f8fafc', display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              placeholder="Search assigned assessments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.75rem',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                background: 'white',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Status Filter Pills */}
            <div style={{ display: 'flex', gap: '0.35rem', background: 'white', padding: '0.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              {['all', 'Pending', 'Passed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: 'none',
                    background: statusFilter === st ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                    color: statusFilter === st ? '#8b5cf6' : 'var(--muted-foreground)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textTransform: 'capitalize'
                  }}
                >
                  {st === 'Passed' ? 'Completed' : st}
                </button>
              ))}
            </div>

            {/* View Mode Switcher */}
            <div style={{ display: 'flex', background: 'white', padding: '0.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <button
                onClick={() => setViewMode('table')}
                title="Table View"
                style={{
                  padding: '0.35rem 0.6rem',
                  borderRadius: '0.5rem',
                  background: viewMode === 'table' ? '#f1f5f9' : 'transparent',
                  color: viewMode === 'table' ? '#8b5cf6' : 'var(--muted-foreground)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid Card View"
                style={{
                  padding: '0.35rem 0.6rem',
                  borderRadius: '0.5rem',
                  background: viewMode === 'grid' ? '#f1f5f9' : 'transparent',
                  color: viewMode === 'grid' ? '#8b5cf6' : 'var(--muted-foreground)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 1.5rem 1.5rem', overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading assessments...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <BookOpen size={40} style={{ color: 'var(--muted)', marginBottom: '1rem', opacity: 0.3 }} />
              <p style={{ color: 'var(--muted-foreground)' }}>No assigned assessments found matching your filter.</p>
            </div>
          ) : viewMode === 'table' ? (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0 0.75rem' }}>Assessment Title</th>
                  <th style={{ padding: '0 0.75rem' }}>Assigned Date</th>
                  <th style={{ padding: '0 0.75rem' }}>Status</th>
                  <th style={{ padding: '0 0.75rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedSubmissions.map((sub) => (
                  <tr 
                    key={sub.id} 
                    className="report-row-premium"
                    style={{ background: '#f8fafc', borderRadius: '0.75rem', transition: 'all 0.2s' }}
                  >
                    <td style={{ padding: '1rem 0.75rem', borderRadius: '0.75rem 0 0 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', flexShrink: 0, background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={18} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{sub.assessmentTitle}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--muted-foreground)', fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={14} />
                        {sub.date}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <span style={{ 
                        fontSize: '0.75rem', padding: '0.2rem 0.65rem', borderRadius: '1rem', fontWeight: 700,
                        background: sub.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: sub.status === 'Pending' ? '#d97706' : '#10b981'
                      }}>
                        {sub.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', borderRadius: '0 0.75rem 0.75rem 0', textAlign: 'right' }}>
                      {sub.status === 'Pending' ? (
                        <Link href={`/student/assessments/${sub.id}`} style={{ textDecoration: 'none' }}>
                          <button 
                            className="btn-primary" 
                            style={{ 
                              padding: '0.45rem 0.95rem', fontSize: '0.8rem', background: '#8b5cf6', 
                              display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '0.5rem'
                            }}
                          >
                            Start Assessment <ArrowRight size={14} />
                          </button>
                        </Link>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* Grid Card View */
            <div style={{ padding: '1rem 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {displayedSubmissions.map((sub) => (
                <div key={sub.id} className="user-card-item" style={{ padding: '1.1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={20} />
                    </div>
                    <span style={{ 
                      fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 700,
                      background: sub.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: sub.status === 'Pending' ? '#d97706' : '#10b981'
                    }}>
                      {sub.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.4rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.assessmentTitle}</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                    <Clock size={14} /> Assigned: {sub.date}
                  </p>

                  <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                    {sub.status === 'Pending' ? (
                      <Link href={`/student/assessments/${sub.id}`} style={{ textDecoration: 'none' }}>
                        <button className="btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', borderRadius: '0.5rem' }}>
                          Start Assessment <ArrowRight size={14} />
                        </button>
                      </Link>
                    ) : (
                      <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--muted-foreground)', fontWeight: 600, padding: '0.4rem' }}>
                        Submitted
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

