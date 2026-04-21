'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  CheckCircle, 
  Search, 
  Download,
  TrendingUp,
  Edit3,
  X,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
// API calls now route through the internal /api proxy

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
  const [stats, setStats] = useState([
    { label: 'Total Submissions', value: '0', icon: Users, color: '#3b82f6' },
    { label: 'Avg. Score', value: '0%', icon: TrendingUp, color: '#10b981' },
  ]);
  
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
      const aRes = await fetch(`${API_BASE_URL}/assessments`);
      const allAssessments = await aRes.json();
      const myAssessmentTitles = allAssessments
        .filter((a: Assessment) => a.creatorId === user?.id)
        .map((a: Assessment) => a.title);

      const response = await fetch('/api/submissions');
      const allSubmissions = await response.json();
      
      const mySubmissions = allSubmissions.filter((s: Submission) => 
        myAssessmentTitles.includes(s.assessmentTitle)
      );
      
      setSubmissions(mySubmissions.reverse());

      // Calculate Stats
      const avgScore = mySubmissions.length > 0
        ? Math.round(mySubmissions.reduce((acc: number, curr: Submission) => acc + curr.score, 0) / mySubmissions.length)
        : 0;

      setStats([
        { label: 'Total Submissions', value: mySubmissions.length.toString(), icon: Users, color: '#3b82f6' },
        { label: 'Avg. Score', value: `${avgScore}%`, icon: TrendingUp, color: '#10b981' },
      ]);
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
        response = await fetch(`${API_BASE_URL}/assessments/${submission.assessmentId}`);
        const data = await response.json();
        if (data) {
          setEvaluatingAssessment(data);
          // Pre-populate manual marks for MCQs based on auto-correct if needed
          const initialMarks: Record<string, boolean> = {};
          data.questions?.forEach((q: any) => {
            if (q.type === 'MCQ') {
               initialMarks[q.id] = (submission.answers?.[q.id] === q.correctAnswer);
            }
          });
          setManualMarks(initialMarks);
        }
      } else {
        response = await fetch(`/api/assessments?title=${encodeURIComponent(submission.assessmentTitle)}`);
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
      await fetch(`${API_BASE_URL}/submissions/${evaluatingSubmission.id}`, {
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user) fetchResults();
  }, [user, fetchResults]);

  const filtered = submissions.filter(s => 
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.assessmentTitle.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    // Priority 1: Submitted ones come first
    if (a.status === 'Submitted' && b.status !== 'Submitted') return -1;
    if (a.status !== 'Submitted' && b.status === 'Submitted') return 1;
    // Priority 2: Newest date first
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  if (!hasMounted) return null;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Student Progress</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Review assessment performance and provide student feedback.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card" 
              style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}
            >
              <div style={{ background: `${stat.color}15`, color: stat.color, padding: '0.75rem', borderRadius: '1rem' }}>
                <Icon size={24} />
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>{stat.label}</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--card-border)', display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input 
              placeholder="Search by student name or assessment..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.75rem', background: 'var(--accent)', border: 'none', borderRadius: '0.75rem' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'var(--accent)', fontSize: '0.85rem', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem' }}>Student</th>
                <th style={{ padding: '1rem 1.5rem' }}>Assessment</th>
                <th style={{ padding: '1rem 1.5rem' }}>Score</th>
                <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem' }}>Date</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ 
                        width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.7rem' 
                      }}>
                        {s.studentName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontWeight: 600 }}>{s.studentName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>{s.assessmentTitle}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '60px', height: '6px', background: 'var(--accent)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${s.score}%`, height: '100%', background: s.score >= 70 ? '#10b981' : '#f59e0b' }} />
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{s.score}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600,
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
                  <td style={{ padding: '1.25rem 1.5rem', color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>{s.date}</td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleEvaluate(s)}
                      style={{ 
                        background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', 
                        borderRadius: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        fontSize: '0.8rem', fontWeight: 600
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
                            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>Student's Answer:</p>
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
