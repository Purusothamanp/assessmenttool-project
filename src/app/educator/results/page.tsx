'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search, 
  TrendingUp,
  Edit3,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  List,
  LayoutGrid
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

interface Submission {
  id: string;
  studentName: string;
  assessmentTitle: string;
  score: number;
  status: string;
  date: string;
  assessmentId?: string;
  feedbackGiven: boolean;
  answers?: Record<string, number>;
}

interface Assessment {
  id: string;
  title: string;
  creatorId: string;
}

export default function StudentResults() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Valuation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [evaluatingSubmission, setEvaluatingSubmission] = useState<Submission | null>(null);
  const [evaluatingAssessment, setEvaluatingAssessment] = useState<any>(null);
  const [valuationScore, setValuationScore] = useState<number>(0);
  const [valuationStatus, setValuationStatus] = useState<string>('Passed');
  const [manualMarks, setManualMarks] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const fetchResults = useCallback(async () => {
    try {
      const aRes = await fetch('http://localhost:3001/assessments');
      const allAssessments = await aRes.json();
      const myAssessmentTitles = allAssessments
        .filter((a: Assessment) => a.creatorId === user?.id)
        .map((a: Assessment) => a.title);

      const response = await fetch('http://localhost:3001/submissions');
      const allSubmissions = await response.json();
      
      const mySubmissions = allSubmissions.filter((s: Submission) => 
        myAssessmentTitles.includes(s.assessmentTitle)
      );
      
      setSubmissions(mySubmissions.reverse());
    } catch (err) {
      console.error('Error fetching results:', err);
    }
  }, [user]);

  const handleEvaluate = async (submission: Submission) => {
    setEvaluatingSubmission(submission);
    setValuationScore(submission.score);
    setValuationStatus(submission.status);
    setIsModalOpen(true);

    try {
      let response;
      if (submission.assessmentId) {
        response = await fetch(`http://localhost:3001/assessments/${submission.assessmentId}`);
        const data = await response.json();
        if (data) {
          setEvaluatingAssessment(data);
          const initialMarks: Record<string, boolean> = {};
          data.questions?.forEach((q: any) => {
            if (q.type === 'MCQ') {
               initialMarks[q.id] = (submission.answers?.[q.id] === q.correctAnswer);
            }
          });
          setManualMarks(initialMarks);
        }
      } else {
        response = await fetch(`http://localhost:3001/assessments?title=${encodeURIComponent(submission.assessmentTitle)}`);
        const data = await response.json();
        if (data.length > 0) {
          setEvaluatingAssessment(data[0]);
          const initialMarks: Record<string, boolean> = {};
          data[0].questions?.forEach((q: any) => {
            if (q.type === 'MCQ') {
               initialMarks[q.id] = (submission.answers?.[q.id] === q.correctAnswer);
            }
          });
          setManualMarks(initialMarks);
        }
      }
    } catch (err) {
      console.error('Error fetching assessment details:', err);
    }
  };

  const handleSaveValuation = async () => {
    if (!evaluatingSubmission) return;
    setIsSaving(true);

    try {
      await fetch(`http://localhost:3001/submissions/${evaluatingSubmission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: valuationScore,
          status: valuationStatus
        })
      });
      setIsModalOpen(false);
      fetchResults();
    } catch (err) {
      console.error('Error saving valuation:', err);
      alert('Failed to save valuation.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (user) fetchResults();
  }, [user, fetchResults]);

  // Compute stats dynamically
  const totalCount = submissions.length;
  const avgScore = totalCount > 0
    ? Math.round(submissions.reduce((acc, curr) => acc + curr.score, 0) / totalCount)
    : 0;
  const passedCount = submissions.filter(s => s.status === 'Passed' || s.score >= 50).length;
  const pendingCount = submissions.filter(s => s.status === 'Pending' || s.status === 'Submitted').length;

  const stats = [
    { label: 'Total Submissions', value: totalCount.toString(), icon: Users, color: '#059669', filterKey: 'all' },
    { label: 'Average Score', value: `${avgScore}%`, icon: TrendingUp, color: '#10b981', filterKey: 'all' },
    { label: 'Passed Evaluations', value: passedCount.toString(), icon: CheckCircle2, color: '#8b5cf6', filterKey: 'Passed' },
    { label: 'Pending Evaluations', value: pendingCount.toString(), icon: Clock, color: '#f59e0b', filterKey: 'Pending' },
  ];

  const filtered = submissions.filter(s => {
    const matchesSearch = s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.assessmentTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
                          (statusFilter === 'Pending' ? (s.status === 'Pending' || s.status === 'Submitted') : s.status === statusFilter);
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (a.status === 'Submitted' && b.status !== 'Submitted') return -1;
    if (a.status !== 'Submitted' && b.status === 'Submitted') return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const displayedSubmissions = showAll ? filtered : filtered.slice(0, 3);

  if (!hasMounted) return null;

  return (
    <div className="animate-premium">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ padding: '0.25rem 0.6rem', background: 'var(--educator-accent)', color: 'var(--educator-primary)', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              EVALUATION DASHBOARD
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>Student Progress</h1>
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
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.15rem' }}>Evaluation Records</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Review assessment performance and provide student feedback.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>Showing {displayedSubmissions.length} of {filtered.length}</span>
            <button
              onClick={() => setShowAll(!showAll)}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', color: 'var(--educator-primary)', fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' }}
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
              placeholder="Search by candidate name or assessment title..."
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
              {['all', 'Passed', 'Pending'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: 'none',
                    background: statusFilter === st ? 'var(--educator-accent)' : 'transparent',
                    color: statusFilter === st ? 'var(--educator-primary)' : 'var(--muted-foreground)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textTransform: 'capitalize'
                  }}
                >
                  {st}
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
                  color: viewMode === 'table' ? 'var(--educator-primary)' : 'var(--muted-foreground)',
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
                  color: viewMode === 'grid' ? 'var(--educator-primary)' : 'var(--muted-foreground)',
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
          {filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <Users size={40} style={{ color: 'var(--muted)', marginBottom: '1rem', opacity: 0.3 }} />
              <p style={{ color: 'var(--muted-foreground)' }}>No evaluation records found matching your query.</p>
            </div>
          ) : viewMode === 'table' ? (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0 0.75rem' }}>Student</th>
                  <th style={{ padding: '0 0.75rem' }}>Assessment</th>
                  <th style={{ padding: '0 0.75rem' }}>Score</th>
                  <th style={{ padding: '0 0.75rem' }}>Status</th>
                  <th style={{ padding: '0 0.75rem' }}>Date</th>
                  <th style={{ padding: '0 0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedSubmissions.map((s) => (
                  <tr 
                    key={s.id} 
                    className="report-row-premium"
                    style={{ background: '#f8fafc', borderRadius: '0.75rem', transition: 'all 0.2s' }}
                  >
                    <td style={{ padding: '1rem 0.75rem', borderRadius: '0.75rem 0 0 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                          width: '36px', height: '36px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'var(--educator-primary)'
                        }}>
                          {s.studentName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.studentName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: 600, fontSize: '0.88rem' }}>{s.assessmentTitle}</td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${s.score}%`, height: '100%', background: s.score >= 70 ? '#10b981' : '#f59e0b' }} />
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{s.score}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.65rem', borderRadius: '1rem', fontSize: '0.72rem', fontWeight: 700,
                        background: 
                          s.status === 'Passed' ? 'rgba(16, 185, 129, 0.1)' : 
                          s.status === 'Submitted' ? 'rgba(59, 130, 246, 0.1)' :
                          'rgba(245, 158, 11, 0.1)',
                        color: 
                          s.status === 'Passed' ? '#10b981' : 
                          s.status === 'Submitted' ? '#3b82f6' :
                          '#d97706'
                      }}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--muted-foreground)', fontSize: '0.8rem' }}>{s.date}</td>
                    <td style={{ padding: '1rem 0.75rem', borderRadius: '0 0.75rem 0.75rem 0', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleEvaluate(s)}
                        style={{ 
                          background: 'var(--educator-primary)', color: 'white', padding: '0.45rem 0.85rem', 
                          borderRadius: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                          fontSize: '0.8rem', fontWeight: 700, border: 'none', cursor: 'pointer'
                        }}
                      >
                        <Edit3 size={14} />
                        Evaluate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* Grid Card View */
            <div style={{ padding: '1rem 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {displayedSubmissions.map((s) => (
                <div key={s.id} className="user-card-item" style={{ padding: '1.1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'var(--educator-primary)' }}>
                        {s.studentName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>{s.studentName}</h3>
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{s.date}</span>
                      </div>
                    </div>
                    <span style={{ 
                      padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 700,
                      background: s.status === 'Passed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: s.status === 'Passed' ? '#10b981' : '#d97706'
                    }}>
                      {s.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.assessmentTitle}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${s.score}%`, height: '100%', background: s.score >= 70 ? '#10b981' : '#f59e0b' }} />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{s.score}%</span>
                  </div>

                  <button 
                    onClick={() => handleEvaluate(s)}
                    style={{ 
                      width: '100%', background: 'var(--educator-primary)', color: 'white', padding: '0.5rem', 
                      borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                      fontSize: '0.8rem', fontWeight: 700, border: 'none', cursor: 'pointer'
                    }}
                  >
                    <Edit3 size={14} />
                    Evaluate Submission
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Valuation Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: 'white', width: '90%', maxWidth: '700px', maxHeight: '90vh',
              borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Valuation & Review</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>{evaluatingSubmission?.studentName} - {evaluatingSubmission?.assessmentTitle}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--muted)', background: 'transparent' }}><X size={24} /></button>
            </div>

            {/* Modal Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {evaluatingSubmission?.status === 'Pending' ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '1rem', color: '#d97706', border: '1px dashed #f59e0b' }}>
                  <Clock size={40} style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Assessment Still Pending</h3>
                  <p style={{ fontSize: '0.85rem' }}>The student has not yet submitted this assessment. Answers will be visible here once they complete the test.</p>
                </div>
              ) : !evaluatingSubmission?.answers ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', background: 'var(--accent)', borderRadius: '1rem', color: 'var(--muted-foreground)' }}>
                  <AlertCircle size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Detailed Answers</h3>
                  <p style={{ fontSize: '0.85rem' }}>Detailed individual answer tracking was not available for this session.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Answers Review</h3>
                  {evaluatingAssessment?.questions.map((q: any, i: number) => {
                    const studentAnswer = evaluatingSubmission.answers?.[q.id];
                    const isMCQ = q.type === 'MCQ' || (q.options && q.options.length > 0);
                    const isCorrect = manualMarks[q.id];

                    return (
                      <div key={q.id || i} style={{ padding: '1rem', background: 'white', borderRadius: '0.75rem', border: '1px solid var(--card-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{i + 1}. {q.text}</p>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                             <button 
                               onClick={() => {
                                 const nextMarks = { ...manualMarks, [q.id]: true };
                                 setManualMarks(nextMarks);
                                 // Auto update score
                                 const correctCount = Object.values(nextMarks).filter(Boolean).length;
                                 setValuationScore(Math.round((correctCount / evaluatingAssessment.questions.length) * 100));
                               }}
                               style={{ 
                                 padding: '0.2rem 0.5rem', borderRadius: '0.4rem', fontSize: '0.7rem',
                                 background: isCorrect ? '#ef4444' : '#10b981', color: 'white'
                               }}
                             >
                               {isCorrect ? 'Correct ✓' : 'Mark Correct'}
                             </button>
                             <button 
                               onClick={() => {
                                 const nextMarks = { ...manualMarks, [q.id]: false };
                                 setManualMarks(nextMarks);
                                 const correctCount = Object.values(nextMarks).filter(Boolean).length;
                                 setValuationScore(Math.round((correctCount / evaluatingAssessment.questions.length) * 100));
                               }}
                               style={{ 
                                 padding: '0.2rem 0.5rem', borderRadius: '0.4rem', fontSize: '0.7rem',
                                 background: isCorrect === false ? '#64748b' : '#ef4444', color: 'white'
                               }}
                             >
                               {isCorrect === false ? 'Incorrect ✗' : 'Mark Incorrect'}
                             </button>
                          </div>
                        </div>
                        
                        {isMCQ ? (
                          <div style={{ fontSize: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem' }}>
                            <div>
                              <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>Student Answer:</p>
                              <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>
                                {studentAnswer !== undefined ? q.options[studentAnswer] : 'No Answer'}
                              </span>
                            </div>
                            <div>
                              <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>Reference Answer:</p>
                              <span style={{ color: '#10b981', fontWeight: 600 }}>
                                {q.options[q.correctAnswer]}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.85rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>Student&apos;s Answer:</p>
                            <p style={{ fontWeight: 600, whiteSpace: 'pre-wrap' }}>{studentAnswer || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>No answer provided</span>}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Valuation Inputs */}
              <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '2px dashed var(--card-border)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Set Final Valuation</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>Numeric Score (%)</label>
                      <input 
                        type="number" 
                        min="0" max="100" 
                        value={valuationScore}
                        onChange={(e) => setValuationScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                        style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'var(--accent)', border: 'none' }}
                      />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>Review Status</label>
                    <select 
                      value={valuationStatus}
                      onChange={(e) => setValuationStatus(e.target.value)}
                      style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'var(--accent)', border: 'none', width: '100%' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Passed">Passed</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--card-border)', background: 'var(--accent)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'white', color: 'var(--foreground)', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600, border: '1px solid var(--card-border)' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveValuation}
                disabled={isSaving}
                style={{ 
                  background: 'var(--primary)', color: 'white', padding: '0.75rem 2rem', 
                  borderRadius: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' 
                }}
              >
                {isSaving ? 'Saving...' : (
                  <>
                    <CheckCircle2 size={18} />
                    Complete Valuation
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
