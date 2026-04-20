'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/apiConfig';
import { BookOpen, CheckSquare, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Submission {
  id: string;
  studentName: string;
  assessmentTitle: string;
  score: number;
  status: string;
  date: string;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

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

  const pending = submissions.filter(s => s.status === 'Pending');
  const completed = submissions.filter(s => s.status === 'Passed' || s.status === 'Failed');

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Welcome back, {user?.name.split(' ')[0]}!</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>Here is an overview of your learning progress and upcoming tasks.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '0.75rem', borderRadius: '1rem' }}>
            <Clock size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>To Do / Pending</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{pending.length}</h3>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.75rem', borderRadius: '1rem' }}>
            <CheckSquare size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Completed</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{completed.length}</h3>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Due Soon</h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {pending.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            <div style={{ background: 'var(--accent)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckSquare size={30} style={{ color: 'var(--muted)' }} />
            </div>
            <h3>You are all caught up!</h3>
            <p>No pending assessments at the moment.</p>
          </div>
        ) : (
          pending.slice(0, 3).map((sub, i) => (
            <div key={sub.id} style={{ padding: '1.5rem', borderBottom: i !== pending.length - 1 ? '1px solid var(--card-border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', width: '48px', height: '48px', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{sub.assessmentTitle}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={14} /> Assigned: {sub.date}
                  </p>
                </div>
              </div>
              <Link href={`/student/assessments/${sub.id}`} style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '2rem', background: '#8b5cf6' }}>
                  Start <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
