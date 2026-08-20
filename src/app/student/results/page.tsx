'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Search, 
  Trophy, 
  Clock, 
  Award, 
  CheckSquare, 
  List, 
  LayoutGrid, 
  FileText
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface Submission {
  id: string;
  studentName: string;
  assessmentTitle: string;
  score: number;
  status: string;
  date: string;
}

export default function StudentResults() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Passed' | 'Submitted' | 'Failed'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showAllResults, setShowAllResults] = useState(false);

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

  // Compute metrics
  const totalSubmissions = submissions.length;
  const evaluationsDone = submissions.filter(s => s.status === 'Passed' || s.status === 'Failed');
  const passedCount = submissions.filter(s => s.status === 'Passed').length;
  const pendingCount = submissions.filter(s => s.status === 'Submitted' || s.status === 'Pending').length;
  const avgScore = evaluationsDone.length > 0 
    ? Math.round(evaluationsDone.reduce((acc, curr) => acc + curr.score, 0) / evaluationsDone.length) 
    : 0;

  const stats = [
    { label: 'Total Assessments', value: totalSubmissions, icon: CheckSquare, color: '#3b82f6', filterKey: 'all' as const },
    { label: 'Average Score', value: `${avgScore}%`, icon: Award, color: '#8b5cf6', filterKey: 'all' as const },
    { label: 'Passed Assessments', value: passedCount, icon: Trophy, color: '#10b981', filterKey: 'Passed' as const },
    { label: 'Pending Evaluation', value: pendingCount, icon: Clock, color: '#f59e0b', filterKey: 'Submitted' as const },
  ];

  // Filter logic
  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.assessmentTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'Submitted' ? (sub.status === 'Submitted' || sub.status === 'Pending') : sub.status === statusFilter);
    return matchesSearch && matchesStatus;
  });

  const displayedSubmissions = showAllResults ? filteredSubmissions : filteredSubmissions.slice(0, 3);

  const getStatusBadgeStyle = (status: string) => {
    if (status === 'Passed') {
      return { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Passed' };
    } else if (status === 'Submitted' || status === 'Pending') {
      return { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', label: 'Awaiting Evaluation' };
    } else {
      return { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Needs Improvement' };
    }
  };

  return (
    <div className="animate-premium">
      {/* Page Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ padding: '0.25rem 0.6rem', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--student-primary)', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              STUDENT PORTAL
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>Results & Feedback</h1>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isSelected = statusFilter === stat.filterKey && stat.filterKey !== 'all';
          return (
            <div 
              key={stat.label} 
              onClick={() => {
                if (stat.filterKey !== 'all') {
                  setStatusFilter(statusFilter === stat.filterKey ? 'all' : stat.filterKey);
                }
              }}
              className="premium-card stat-hover-card" 
              style={{ 
                padding: '0.85rem 1rem',
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                border: isSelected ? `2px solid ${stat.color}` : '1px solid var(--card-border)',
                background: isSelected ? `${stat.color}08` : 'white',
                cursor: stat.filterKey !== 'all' ? 'pointer' : 'default',
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

      {/* Unified Table Container (matching User Management table format) */}
      <div className="premium-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Table Header with Title & See All Toggle */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.15rem' }}>Assessment Submissions</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Review your past test attempts, evaluation statuses, and final scores.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>
              Showing {displayedSubmissions.length} of {filteredSubmissions.length}
            </span>
            <button
              onClick={() => setShowAllResults(!showAllResults)}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', color: 'var(--student-primary)', fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' }}
            >
              {showAllResults ? 'Minimize' : 'See All'}
            </button>
          </div>
        </div>

        {/* Embedded Controls Bar (Search + View Switcher) */}
        <div style={{ padding: '0.65rem 1.25rem', background: '#f8fafc', display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input 
              placeholder="Search assessment title..." 
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
            {/* View Mode Switcher */}
            <div style={{ display: 'flex', background: 'white', padding: '0.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <button
                onClick={() => setViewMode('table')}
                title="Table View"
                style={{
                  padding: '0.35rem 0.6rem',
                  borderRadius: '0.5rem',
                  background: viewMode === 'table' ? '#f1f5f9' : 'transparent',
                  color: viewMode === 'table' ? 'var(--student-primary)' : 'var(--muted-foreground)',
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
                  color: viewMode === 'grid' ? 'var(--student-primary)' : 'var(--muted-foreground)',
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

        {/* Content Section */}
        <div style={{ padding: '0 1.25rem 1.25rem', overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading results...</div>
          ) : filteredSubmissions.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
              <CheckSquare size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>No submission records found.</p>
            </div>
          ) : viewMode === 'table' ? (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0 0.75rem' }}>Assessment Title</th>
                  <th style={{ padding: '0 0.75rem' }}>Date Submitted</th>
                  <th style={{ padding: '0 0.75rem' }}>Evaluation Status</th>
                  <th style={{ padding: '0 0.75rem', textAlign: 'right' }}>Final Score</th>
                </tr>
              </thead>
              <tbody>
                {displayedSubmissions.map((sub) => {
                  const statusInfo = getStatusBadgeStyle(sub.status);
                  return (
                    <tr 
                      key={sub.id} 
                      className="report-row-premium"
                      style={{ background: '#f8fafc', borderRadius: '0.75rem', transition: 'all 0.2s' }}
                    >
                      <td style={{ padding: '1rem 0.75rem', borderRadius: '0.75rem 0 0 0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div 
                            style={{ 
                              width: '36px', 
                              height: '36px', 
                              borderRadius: '50%', 
                              background: 'rgba(124, 58, 237, 0.1)',
                              color: '#7c3aed',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <FileText size={18} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--foreground)', margin: 0 }}>
                              {sub.assessmentTitle}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.75rem', color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={14} style={{ opacity: 0.7 }} />
                          {sub.date}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.75rem' }}>
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          padding: '0.3rem 0.75rem', 
                          borderRadius: '2rem', 
                          fontSize: '0.78rem', 
                          fontWeight: 700,
                          background: statusInfo.background,
                          color: statusInfo.color
                        }}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.75rem', borderRadius: '0 0.75rem 0.75rem 0', textAlign: 'right' }}>
                        {sub.status === 'Submitted' || sub.status === 'Pending' ? (
                          <span style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem', fontStyle: 'italic', fontWeight: 500 }}>
                            Pending
                          </span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: sub.score >= 50 ? '#10b981' : '#ef4444' }}>
                              {sub.score}%
                            </span>
                            <div style={{ height: '4px', width: '60px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${sub.score}%`, background: sub.score >= 50 ? '#10b981' : '#ef4444', borderRadius: '2px', transition: 'width 0.8s ease-out' }} />
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* Grid Card View */
            <div style={{ padding: '1rem 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
              {displayedSubmissions.map((sub) => {
                const statusInfo = getStatusBadgeStyle(sub.status);
                return (
                  <div key={sub.id} className="user-card-item" style={{ padding: '1.1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div 
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          background: 'rgba(124, 58, 237, 0.1)',
                          color: '#7c3aed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700
                        }}
                      >
                        <FileText size={20} />
                      </div>
                      <span style={{ 
                        padding: '0.25rem 0.65rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 700,
                        background: statusInfo.background,
                        color: statusInfo.color
                      }}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sub.assessmentTitle}
                    </h3>
                    
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={13} style={{ opacity: 0.7 }} /> Submitted: {sub.date}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>Final Score</span>
                      {sub.status === 'Submitted' || sub.status === 'Pending' ? (
                        <span style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--muted-foreground)' }}>Pending</span>
                      ) : (
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: sub.score >= 50 ? '#10b981' : '#ef4444' }}>
                          {sub.score}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .report-row-premium:hover {
          background-color: #f1f5f9 !important;
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
}

