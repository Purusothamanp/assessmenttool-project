'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/apiConfig';

interface Assessment {
  id: string;
  title: string;
  type: string;
  category: string;
  topic: string;
  questionFormats: string[];
  creatorId: string;
  date: string;
}

interface Submission {
  id: string;
  studentName: string;
  assessmentTitle: string;
  score: number;
  status: string;
  date: string;
}

export default function EducatorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  
  const [stats, setStats] = useState([
    { label: 'My Assessments', value: '0', icon: BookOpen, color: '#10b981', trend: 'Live' },
    { label: 'Active Students', value: '0', icon: Users, color: '#3b82f6', trend: 'Live' },
    { label: 'Completed Tests', value: '0', icon: CheckCircle, color: '#8b5cf6', trend: 'Live' },
    { label: 'Avg. Score', value: '0%', icon: Clock, color: '#f59e0b', trend: 'Live' },
  ]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch Assessments
      const aRes = await fetch(`${API_BASE_URL}/assessments`);
      const allAssessments = await aRes.json();
      const myAssessments = allAssessments.filter((a: Assessment) => a.creatorId === user?.id);

      // Fetch Students
      const uRes = await fetch(`${API_BASE_URL}/users?role=student`);
      const students = await uRes.json();

      // Fetch Submissions
      const sRes = await fetch(`${API_BASE_URL}/submissions`);
      const allSubmissions = await sRes.json();
      
      // Filter submissions for user's assessments
      const myAssessmentTitles = myAssessments.map((a: Assessment) => a.title);
      const mySubmissions = allSubmissions.filter((s: Submission) => myAssessmentTitles.includes(s.assessmentTitle));
      setSubmissions(mySubmissions.reverse());

      // Calculate Avg Score
      const avgScore = mySubmissions.length > 0
        ? Math.round(mySubmissions.reduce((acc: number, curr: Submission) => acc + curr.score, 0) / mySubmissions.length)
        : 0;

      setStats([
        { label: 'My Assessments', value: myAssessments.length.toString(), icon: BookOpen, color: '#10b981', trend: 'Live Data' },
        { label: 'Active Students', value: students.filter((s: any) => s.status === 'active').length.toString(), icon: Users, color: '#3b82f6', trend: 'Live Data' },
        { label: 'Completed Tests', value: mySubmissions.length.toString(), icon: CheckCircle, color: '#8b5cf6', trend: 'Live Data' },
        { label: 'Avg. Score', value: `${avgScore}%`, icon: Clock, color: '#f59e0b', trend: 'Live Data' },
      ]);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [user, fetchDashboardData]);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Instructor Dashboard</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>Welcome back! Here&apos;s what&apos;s happening with your assessments today.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card" 
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ 
                  background: `${stat.color}15`, 
                  color: stat.color, 
                  padding: '0.6rem', 
                  borderRadius: '0.75rem' 
                }}>
                  <Icon size={24} />
                </div>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  color: stat.color,
                  background: `${stat.color}10`,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '1rem'
                }}>
                  {stat.trend}
                </span>
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>{stat.label}</p>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stat.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Recent Submissions */}
        <div className="card" style={{ padding: '0' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Recent Student Submissions</h3>
            <button style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600, background: 'none' }}>View All Submissions</button>
          </div>
          <div style={{ padding: '0.5rem 1.5rem' }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading data...</div>
            ) : submissions.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No recent submissions.</div>
            ) : (
              submissions.slice(0, 4).map((sub, i) => (
                <div 
                  key={i} 
                  style={{ 
                    padding: '1.25rem 0', 
                    borderBottom: i === Math.min(submissions.length, 4) - 1 ? 'none' : '1px solid var(--card-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      background: 'var(--accent)', 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '0.8rem'
                    }}>
                      {sub.studentName.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{sub.studentName}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>Completed: {sub.assessmentTitle}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: sub.score >= 70 ? '#10b981' : '#f59e0b' }}>{sub.score}%</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{sub.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
