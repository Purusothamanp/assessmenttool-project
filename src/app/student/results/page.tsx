'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Search, Trophy, XCircle, Clock, Award, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';

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

  const fetchSubmissions = useCallback(async () => {
    try {
      if (!user) return;
      const response = await fetch(`http://localhost:3001/submissions?studentName=${encodeURIComponent(user.name)}`);
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

  const completed = submissions.filter(s => s.status !== 'Pending');
  const filtered = completed.filter(s => s.assessmentTitle.toLowerCase().includes(searchTerm.toLowerCase()));

  const evaluationsDone = completed.filter(s => s.status === 'Passed' || s.status === 'Failed');
  const avgScore = evaluationsDone.length > 0 
    ? Math.round(evaluationsDone.reduce((acc, curr) => acc + curr.score, 0) / evaluationsDone.length) 
    : 0;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Results & Feedback</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>Review your past performance and educator feedback.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ background: 'var(--accent)', padding: '1rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckSquare size={28} color="#4b5563" /></div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Assessments Taken</p>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{completed.length}</h3>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Award size={28} color="#8b5cf6" /></div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Average Score</p>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#8b5cf6', marginTop: '0.25rem' }}>{avgScore}%</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ background: 'rgba(16,185,129,0.1)', padding: '1rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trophy size={28} color="#10b981" /></div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Assessments Passed</p>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>{completed.filter(s => s.status === 'Passed').length}</h3>
          </div>
        </motion.div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--card-border)', display: 'flex', gap: '1rem', background: 'var(--card)' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input 
              placeholder="Search completed assessments..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', background: 'var(--accent)', border: '1px solid transparent', borderRadius: '0.75rem', fontSize: '0.95rem', transition: 'all 0.2s' }}
              className="search-input-premium"
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
             <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading results...</div>
          ) : filtered.length === 0 ? (
             <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
               <CheckSquare size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
               <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No results found.</p>
               <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.25rem' }}>Complete some assessments to view them here.</p>
             </div>
          ) : (
             <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
               <thead style={{ background: 'var(--accent)', fontSize: '0.85rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                 <tr>
                   <th style={{ padding: '1.5rem', fontWeight: 600 }}>Assessment Title</th>
                   <th style={{ padding: '1.5rem', fontWeight: 600 }}>Date Submitted</th>
                   <th style={{ padding: '1.5rem', fontWeight: 600 }}>Evaluation Status</th>
                   <th style={{ padding: '1.5rem', fontWeight: 600, textAlign: 'right' }}>Final Score</th>
                 </tr>
               </thead>
               <tbody>
                 {filtered.map(sub => (
                   <tr key={sub.id} style={{ borderBottom: '1px solid var(--card-border)', transition: 'background-color 0.2s', cursor: 'default' }} className="table-row-hover">
                     <td style={{ padding: '1.5rem', fontWeight: 600, color: 'var(--foreground)', fontSize: '1rem' }}>
                       {sub.assessmentTitle}
                     </td>
                     <td style={{ padding: '1.5rem', fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={16} />{sub.date}
                        </div>
                     </td>
                     <td style={{ padding: '1.5rem' }}>
                        <span style={{ 
                          display: 'inline-flex', alignItems: 'center', padding: '0.4rem 0.85rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 700,
                          background: sub.status === 'Passed' ? 'rgba(16, 185, 129, 0.1)' : sub.status === 'Submitted' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: sub.status === 'Passed' ? '#10b981' : sub.status === 'Submitted' ? '#3b82f6' : '#ef4444'
                        }}>
                          {sub.status === 'Submitted' ? 'Awaiting Evaluation' : sub.status}
                        </span>
                     </td>
                     <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                        {sub.status === 'Submitted' ? (
                          <span style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', fontStyle: 'italic', fontWeight: 500 }}>Pending</span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: sub.score >= 50 ? '#10b981' : '#ef4444' }}>
                               {sub.score}%
                            </span>
                            <div style={{ height: '4px', width: '60px', background: 'var(--accent)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${sub.score}%`, background: sub.score >= 50 ? '#10b981' : '#ef4444', borderRadius: '2px', transition: 'width 1s ease-out' }} />
                            </div>
                          </div>
                        )}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          )}
        </div>
      </div>
      <style jsx>{`
        .table-row-hover:hover {
          background-color: var(--accent);
        }
        .search-input-premium:focus {
          outline: none;
          border-color: var(--primary);
          background-color: var(--background);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
      `}</style>
    </div>
  );
}
