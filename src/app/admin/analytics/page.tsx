'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AssessmentReport } from '@/lib/mockData';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Download, 
  Plus, 
  ChevronRight, 
  Search,
  CheckCircle2,
  HelpCircle,
  FileText,
  BookOpen,
  Trash2,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<AssessmentReport[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllReports, setShowAllReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState<AssessmentReport | null>(null);

  const calculateAnalysis = () => {
    if (reports.length === 0) return [
      { label: 'Exceeded Expectations', value: 0, color: '#10b981' },
      { label: 'Met Expectations', value: 0, color: '#3b82f6' },
      { label: 'Below Average', value: 0, color: '#f59e0b' },
      { label: 'Requires Attention', value: 0, color: '#ef4444' },
    ];

    const counts = { exceeded: 0, met: 0, below: 0, attention: 0 };
    reports.forEach(r => {
      if (r.passingRate >= 90) counts.exceeded++;
      else if (r.passingRate >= 75) counts.met++;
      else if (r.passingRate >= 60) counts.below++;
      else counts.attention++;
    });

    const total = reports.length;
    return [
      { label: 'Exceeded Expectations', value: Math.round((counts.exceeded / total) * 100), color: '#10b981' },
      { label: 'Met Expectations', value: Math.round((counts.met / total) * 100), color: '#3b82f6' },
      { label: 'Below Average', value: Math.round((counts.below / total) * 100), color: '#f59e0b' },
      { label: 'Requires Attention', value: Math.round((counts.attention / total) * 100), color: '#ef4444' },
    ];
  };

  const performanceData = calculateAnalysis();

  const fetchReports = useCallback(async () => {
    try {
      const [reportsRes, assessmentsRes, submissionsRes] = await Promise.all([
        fetch('http://localhost:3001/reports'),
        fetch('http://localhost:3001/assessments'),
        fetch('http://localhost:3001/submissions')
      ]);

      const assessmentsData = await assessmentsRes.json();
      const submissionsData = await submissionsRes.json();

      // Dynamically compute comprehensive performance reports based on actual submissions
      const computedReports = assessmentsData.map((assessment: any) => {
        const relSubmissions = submissionsData.filter((s: any) => s.assessmentId === assessment.id && s.status !== 'Pending');
        const participants = relSubmissions.length;

        const passingCount = relSubmissions.filter((s: any) => s.status === 'Passed' || s.score >= 50).length;
        const passingRate = participants > 0 ? Math.round((passingCount / participants) * 100) : 0;
        const averageScore = participants > 0 ? Math.round(relSubmissions.reduce((acc: number, s: any) => acc + s.score, 0) / participants) : 0;
        const topScore = participants > 0 ? Math.max(...relSubmissions.map((s: any) => s.score)) : 0;

        return {
          id: assessment.id,
          title: assessment.title,
          participants,
          date: assessment.date,
          passingRate,
          averageScore,
          topScore
        };
      }).filter(Boolean);

      setReports(computedReports.reverse());    
      setAssessments(assessmentsData);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedReports = showAllReports ? filteredReports : filteredReports.slice(0, 3);

  const handleGenerateReport = () => {
    // Generate CSV from reports
    const headers = ['ID', 'Title', 'Participants', 'Date', 'Passing Rate', 'Average Score', 'Top Score'];
    const csvContent = [
      headers.join(','),
      ...reports.map(r => `${r.id},"${r.title}",${r.participants},"${r.date}",${r.passingRate}%,${r.averageScore},${r.topScore}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'assessment_performance_reports.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalParticipationsNum = reports.reduce((acc, r) => acc + r.participants, 0);
  const passedCount = reports.reduce((acc, r) => acc + Math.round((r.passingRate / 100) * r.participants), 0);
  const averageSuccessRate = totalParticipationsNum > 0 
    ? Math.round((passedCount / totalParticipationsNum) * 100)
    : 0;

  const stats = [
    { label: 'Total Assessments', value: assessments.length.toString(), icon: Target, color: '#3b82f6', trend: '+12%' },
    { label: 'Total Participations', value: totalParticipationsNum.toLocaleString(), icon: Users, color: '#10b981', trend: '+5%' },
    { label: 'Avg. Success Rate', value: `${averageSuccessRate}%`, icon: TrendingUp, color: '#8b5cf6', trend: '+2%' },
  ];

  // Removing previous handleCreateAssessment implementation as it was moved.

  return (
    <div className="animate-premium">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '0.5rem' }}>Performance Analysis</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem' }}>Comprehensive breakdown of institutional assessment health.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={handleGenerateReport}
            className="btn-primary" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              background: 'var(--admin-primary)',
              boxShadow: '0 10px 20px -5px rgba(30, 64, 175, 0.4)'
            }}
          >
            <Download size={20} />
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="premium-card" 
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ 
                  background: `${stat.color}15`, 
                  color: stat.color, 
                  padding: '0.8rem', 
                  borderRadius: '1rem',
                  boxShadow: `0 8px 16px -4px ${stat.color}20`
                }}>
                  <Icon size={28} />
                </div>
                <div style={{ textAlign: 'right' }}>
                   <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    color: 'var(--success)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '2rem',
                  }}>
                    {stat.trend}
                  </span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem', fontWeight: 500 }}>vs last month</p>
                </div>
              </div>
              <div>
                <p style={{ fontSize: '1rem', color: 'var(--muted-foreground)', fontWeight: 500, marginBottom: '0.25rem' }}>{stat.label}</p>
                <h3 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>{stat.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '2rem' }}>
        {/* Reports Table */}
        <div className="premium-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '2rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Assessment Reports</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Detailed history of individual test outcomes.</p>
            </div>
            <button 
              onClick={() => setShowAllReports(!showAllReports)}
              className="btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'var(--admin-primary)', fontWeight: 700, whiteSpace: 'nowrap' }}
            >
              {showAllReports ? 'Collapse' : 'See All'}
            </button>
          </div>
          
          {/* Search Bar */}
          <div style={{ padding: '1rem 1.5rem', background: '#f8fafc' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input 
                placeholder="Find a report..." 
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
          </div>

          <div style={{ padding: '0 1.5rem 1.5rem', overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading report data...</div>
            ) : reports.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <FileText size={40} style={{ color: 'var(--muted)', marginBottom: '1rem', opacity: 0.3 }} />
                <p style={{ color: 'var(--muted-foreground)' }}>No reports available.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem', minWidth: '600px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0 0.75rem' }}>Title</th>
                    <th style={{ padding: '0 0.75rem' }}>Participants</th>
                    <th style={{ padding: '0 0.75rem' }}>Success</th>
                    <th style={{ padding: '0 0.75rem' }}>Avg</th>
                    <th style={{ padding: '0 0.75rem' }}>Top</th>
                    <th style={{ padding: '0 0.75rem' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {displayedReports.map((report) => (
                    <tr 
                      key={report.id} 
                      className="report-row-premium"
                      style={{ background: '#f8fafc', borderRadius: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => setSelectedReport(report)}
                    >
                      <td style={{ padding: '1rem 0.75rem', borderRadius: '0.75rem 0 0 0.75rem' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                           <div style={{ width: '32px', height: '32px', flexShrink: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-primary)' }}>
                             <BookOpen size={16} />
                           </div>
                           <div style={{ minWidth: 0 }}>
                             <p style={{ fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{report.title}</p>
                             <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{report.date}</p>
                           </div>
                         </div>
                      </td>
                      <td style={{ padding: '1rem 0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                          <Users size={14} /> {report.participants}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.75rem' }}>
                        <span style={{ 
                          padding: '0.3rem 0.6rem', 
                          borderRadius: '2rem', 
                          fontSize: '0.8rem', 
                          fontWeight: 700,
                          background: report.passingRate >= 75 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: report.passingRate >= 75 ? 'var(--success)' : 'var(--destructive)'
                        }}>
                          {report.passingRate}%
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.75rem', fontWeight: 800, fontSize: '0.9rem' }}>{report.averageScore}</td>
                      <td style={{ padding: '1rem 0.75rem', fontWeight: 800, fontSize: '0.9rem', color: '#f59e0b' }}>{report.topScore}</td>
                      <td style={{ padding: '1rem 0.75rem', borderRadius: '0 0.75rem 0.75rem 0' }}>
                        <div style={{ color: 'var(--admin-primary)' }}>
                          <ChevronRight size={18} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Visual Achievement Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="premium-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem' }}>Institutional Health</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {performanceData.map((item) => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{item.label}</span>
                    <span style={{ fontWeight: 800, color: item.color }}>{item.value}%</span>
                  </div>
                  <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                      style={{ 
                        height: '100%', 
                        background: `linear-gradient(90deg, ${item.color}cc, ${item.color})`,
                        boxShadow: `0 0 10px ${item.color}40`,
                        borderRadius: '6px'
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      

      {/* Selected Report Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div style={{ 
            position: 'fixed', 
            top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(2, 6, 23, 0.6)', 
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="premium-card" 
              style={{ width: '100%', maxWidth: '540px', padding: '3rem' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{ width: '64px', height: '64px', background: 'var(--admin-accent)', color: 'var(--admin-primary)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <FileText size={32} />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Intelligence Report</h2>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '1rem', fontWeight: 500 }}>{selectedReport.title}</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Participants</p>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--admin-primary)' }}>{selectedReport.participants}</h3>
                </div>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Pass Rate</p>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>{selectedReport.passingRate}%</h3>
                </div>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Avg. Points</p>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{selectedReport.averageScore}</h3>
                </div>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Top Score</p>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b' }}>{selectedReport.topScore}</h3>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '1rem', fontWeight: 800, background: 'var(--admin-primary)' }}
                >
                  Confirm & Export Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .report-row-premium:hover {
          background-color: #f8fafc;
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
}
