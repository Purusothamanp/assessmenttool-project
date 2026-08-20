'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Edit, 
  Trash2, 
  CheckCircle2,
  HelpCircle,
  FileText,
  Send,
  List,
  LayoutGrid,
  Layers,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/api';

interface Assessment {
  id: string;
  title: string;
  type: string;
  category: string;
  topic: string;
  questionFormats: string[];
  questions?: { 
    id: number; 
    text: string; 
    type: 'MCQ' | 'ShortAnswer' | 'TrueFalse' | 'Essay';
    options?: string[]; 
    correctAnswer?: number 
  }[];
  creatorId: string;
  date: string;
}

export default function AdminAssessments() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  
  // Assignment specific states
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState('All');

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Quiz');
  const [category, setCategory] = useState('');
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<{ id: number; text: string; type: 'MCQ' | 'ShortAnswer' | 'TrueFalse' | 'Essay'; options?: string[]; correctAnswer?: number }[]>([]);
  const [formats, setFormats] = useState({
    multipleChoice: true,
    trueFalse: false,
    shortAnswer: false,
    essay: false
  });

  const fetchAssessments = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/assessments`);
      const data = await response.json();
      setAssessments(data.reverse());
    } catch (err) {
      console.error('Error fetching assessments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessments();
    
    const getStudents = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users?role=student`);
        const data = await res.json();
        setStudentsList(data);
      } catch (e) {
        console.error('Failed to load students for assignment:', e);
      }
    };
    getStudents();
  }, [fetchAssessments]);

  const handleSave = async () => {
    if (!title) {
      alert('Please enter a title');
      return;
    }

    const selectedFormats = Object.entries(formats)
      .filter(([, checked]) => checked)
      .map(([name]) => name);

    const assessmentData = {
      id: editingAssessment ? editingAssessment.id : Math.random().toString(36).substring(2, 15),
      title,
      type,
      category,
      topic,
      questionFormats: selectedFormats,
      questions,
      date: new Date().toLocaleDateString('en-CA'),
      creatorId: user?.id || 'admin_1'
    };

    try {
      if (editingAssessment) {
        await fetch(`${API_BASE_URL}/assessments/${editingAssessment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assessmentData)
        });
      } else {
        await fetch(`${API_BASE_URL}/assessments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assessmentData)
        });
      }
      fetchAssessments();
      closeModal();
    } catch (err) {
      console.error('Error saving assessment:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this assessment?')) {
      try {
        await fetch(`${API_BASE_URL}/assessments/${id}`, { method: 'DELETE' });
        fetchAssessments();
      } catch (err) {
        console.error('Error deleting assessment:', err);
      }
    }
  };

  const openEdit = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    setTitle(assessment.title);
    setType(assessment.type);
    setCategory(assessment.category);
    setTopic(assessment.topic);
    setQuestions(assessment.questions || []);
    
    const newFormats = {
      multipleChoice: assessment.questionFormats.includes('multipleChoice'),
      trueFalse: assessment.questionFormats.includes('trueFalse'),
      shortAnswer: assessment.questionFormats.includes('shortAnswer'),
      essay: assessment.questionFormats.includes('essay')
    };
    setFormats(newFormats);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAssessment(null);
    setTitle('');
    setType('Quiz');
    setCategory('');
    setTopic('');
    setQuestions([]);
    setFormats({
      multipleChoice: true,
      trueFalse: false,
      shortAnswer: false,
      essay: false
    });
  };

  // Stats calculation
  const totalAssessments = assessments.length;
  const quizCount = assessments.filter(a => a.type === 'Quiz').length;
  const testCount = assessments.filter(a => a.type === 'Test' || a.type === 'Exam').length;
  const surveyCount = assessments.filter(a => a.type === 'Survey').length;

  const stats = [
    { label: 'Total Repository', value: totalAssessments, icon: BookOpen, color: '#3b82f6', filterKey: 'all' },
    { label: 'Quizzes', value: quizCount, icon: Layers, color: '#10b981', filterKey: 'Quiz' },
    { label: 'Tests & Exams', value: testCount, icon: Award, color: '#8b5cf6', filterKey: 'Test' },
    { label: 'Surveys', value: surveyCount, icon: FileText, color: '#f59e0b', filterKey: 'Survey' },
  ];

  const filtered = assessments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || 
                        (typeFilter === 'Test' ? (a.type === 'Test' || a.type === 'Exam') : a.type === typeFilter);
    return matchesSearch && matchesType;
  });

  const displayedAssessments = showAll ? filtered : filtered.slice(0, 3);

  return (
    <div className="animate-premium">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ padding: '0.25rem 0.6rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--admin-primary)', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              ADMIN DASHBOARD
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>Manage Assessment</h1>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.55rem 1.1rem',
            fontSize: '0.85rem',
            background: 'var(--admin-primary)',
            boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)'
          }}
        >
          <Plus size={18} />
          Create Assessments
        </button>
      </div>

      {/* Summary Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isSelected = typeFilter === stat.filterKey;
          return (
            <div 
              key={stat.label} 
              onClick={() => setTypeFilter(typeFilter === stat.filterKey ? 'all' : stat.filterKey)}
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

      {/* Unified Table Container (matching User Management table format) */}
      <div className="premium-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.15rem' }}>Global Assessments</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Create, manage and assign assessments.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>Showing {displayedAssessments.length} of {filtered.length}</span>
            <button
              onClick={() => setShowAll(!showAll)}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', color: 'var(--admin-primary)', fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' }}
            >
              {showAll ? 'Minimize' : 'See All'}
            </button>
          </div>
        </div>

        {/* Embedded Controls Bar (Search + View Switcher) */}
        <div style={{ padding: '0.65rem 1.25rem', background: '#f8fafc', display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              placeholder="Search all global assessments by title, category or topic..."
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
                  color: viewMode === 'table' ? 'var(--admin-primary)' : 'var(--muted-foreground)',
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
                  color: viewMode === 'grid' ? 'var(--admin-primary)' : 'var(--muted-foreground)',
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
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading global repository...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <BookOpen size={40} style={{ color: 'var(--muted)', marginBottom: '1rem', opacity: 0.3 }} />
              <p style={{ color: 'var(--muted-foreground)', marginBottom: '1rem' }}>No records found in global repository.</p>
              <button onClick={() => setShowModal(true)} className="btn-secondary" style={{ border: 'none', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--admin-primary)', fontWeight: 700 }}>
                Create First Assessment
              </button>
            </div>
          ) : viewMode === 'table' ? (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0 0.75rem' }}>Title</th>
                  <th style={{ padding: '0 0.75rem' }}>Type</th>
                  <th style={{ padding: '0 0.75rem' }}>Question Formats</th>
                  <th style={{ padding: '0 0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedAssessments.map((a) => (
                  <tr
                    key={a.id}
                    className="report-row-premium"
                    style={{ background: '#f8fafc', borderRadius: '0.75rem', transition: 'all 0.2s' }}
                  >
                    <td style={{ padding: '1rem 0.75rem', borderRadius: '0.75rem 0 0 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', flexShrink: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-primary)' }}>
                          <FileText size={18} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{a.title}</p>
                          <p style={{ fontSize: '0.7rem', color: 'var(--muted)', margin: 0 }}>{a.topic || 'General Topic'} • Created: {a.date}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', fontWeight: 600, color: 'var(--secondary)' }}>{a.type}</span>
                    </td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {a.questionFormats.slice(0, 3).map(f => (
                          <span key={f} style={{
                            fontSize: '0.7rem', padding: '0.2rem 0.6rem', background: 'white',
                            borderRadius: '2rem', border: '1px solid var(--card-border)', fontWeight: 600, color: 'var(--secondary)'
                          }}>
                            {f.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', borderRadius: '0 0.75rem 0.75rem 0', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => { setSelectedAssessment(a); setShowAssignModal(true); }}
                          style={{
                            width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)',
                            color: 'var(--admin-primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                          }}
                          title="Assign Assessment"
                        >
                          <Send size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openEdit(a)}
                          style={{
                            width: '36px', height: '36px', borderRadius: '10px', background: 'white',
                            color: 'var(--secondary)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                          }}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1, background: '#fee2e2' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(a.id)}
                          style={{
                            width: '36px', height: '36px', borderRadius: '10px', background: '#fff1f2',
                            color: 'var(--destructive)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                          }}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* Grid Card View */
            <div style={{ padding: '1rem 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {displayedAssessments.map((a) => (
                <div key={a.id} className="user-card-item" style={{ padding: '1.1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={20} />
                    </div>
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', fontWeight: 600, color: 'var(--secondary)' }}>
                      {a.type}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', marginBottom: '0.85rem' }}>{a.topic || 'General Topic'}</p>

                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                    {a.questionFormats.slice(0, 3).map(f => (
                      <span key={f} style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', fontWeight: 600 }}>
                        {f.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{a.date}</span>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button 
                        onClick={() => { setSelectedAssessment(a); setShowAssignModal(true); }}
                        className="user-action-btn edit"
                        title="Assign"
                      >
                        <Send size={16} />
                      </button>
                      <button 
                        onClick={() => openEdit(a)}
                        className="user-action-btn edit"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(a.id)}
                        className="user-action-btn delete"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(2, 6, 23, 0.5)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem'
          }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="premium-card" 
              style={{ width: '100%', maxWidth: '440px', padding: '3rem' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div className="vibrant-gradient-admin" style={{ 
                  width: '64px', height: '64px', 
                  color: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.5rem', boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)'
                }}>
                  <Send size={30} />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '0.5rem' }}>Assign Assessment</h2>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '1rem', fontWeight: 500 }}>{selectedAssessment?.title}</p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Target Recipient(s)
                </label>
                <select 
                  className="premium-input"
                  value={selectedAssignee}
                  onChange={e => setSelectedAssignee(e.target.value)}
                  style={{ width: '100%', padding: '1rem', borderRadius: '1rem', border: '1px solid #e2e8f0', fontSize: '1rem', fontWeight: 500 }}
                >
                  <option value="All">All Registered Students</option>
                  {studentsList.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setShowAssignModal(false)} className="btn-secondary" style={{ flex: 1, border: 'none', background: '#f8fafc', fontWeight: 700 }}>Cancel</button>
                <button 
                  onClick={async () => {
                    try {
                      const targets = selectedAssignee === 'All' 
                        ? studentsList 
                        : studentsList.filter(s => s.id === selectedAssignee);
                      
                      const dateStr = new Date().toLocaleDateString('en-CA');
                      for (const student of targets) {
                        await fetch(`${API_BASE_URL}/submissions`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            id: Math.random().toString(36).substring(2, 10),
                            studentName: student.name,
                            assessmentId: selectedAssessment?.id || '',
                            assessmentTitle: selectedAssessment?.title || '',
                            score: 0,
                            status: 'Pending',
                            date: dateStr
                          })
                        });
                      }
                      alert(`Protocol successful! Assigned to ${targets.length} candidates.`);
                      setShowAssignModal(false);
                      setSelectedAssignee('All');
                    } catch (err) {
                      console.error(err);
                      alert('Error assigning assessment');
                    }
                  }} 
                  className="btn-primary" 
                  style={{ flex: 2, background: 'var(--admin-primary)', fontWeight: 800 }}
                >
                  Assign Assessment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(2, 6, 23, 0.6)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem'
          }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="premium-card" 
              style={{ width: '100%', maxWidth: '840px', maxHeight: '90vh', overflowY: 'auto', padding: '3.5rem' }}
            >
              <div style={{ marginBottom: '3rem' }}>
                 <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.8px', marginBottom: '0.5rem' }}>{editingAssessment ? 'Update Assessment' : 'Create Assessment'}</h2>
                 <p style={{ color: 'var(--muted-foreground)', fontSize: '1rem' }}>Configure assessment details and content.</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.75rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Title</label>
                  <input style={{ padding: '1rem', width: '100%', borderRadius: '1rem', border: '1px solid #e2e8f0' }} value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex. Final Semester Coding Exam" />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.75rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Assessment Type</label>
                  <select style={{ padding: '1rem', width: '100%', borderRadius: '1rem', border: '1px solid #e2e8f0', background: 'white' }} value={type} onChange={e => setType(e.target.value)}>
                    <option>Quiz</option>
                    <option>Test</option>
                    <option>Exam</option>
                    <option>Survey</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.75rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Academic Category</label>
                  <input style={{ padding: '1rem', width: '100%', borderRadius: '1rem', border: '1px solid #e2e8f0' }} value={category} onChange={e => setCategory(e.target.value)} placeholder="Ex. Computer Science" />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.75rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Primary Subject Topic</label>
                  <input style={{ padding: '1rem', width: '100%', borderRadius: '1rem', border: '1px solid #e2e8f0' }} value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ex. Algorithms and Data Structures" />
                </div>
              </div>

              <div style={{ marginBottom: '3rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '1.25rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Allowed Question Formats</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  {[
                    { id: 'multipleChoice', label: 'Multiple Choice', icon: CheckCircle2 },
                    { id: 'trueFalse', label: 'True / False', icon: HelpCircle },
                    { id: 'shortAnswer', label: 'Short Answer', icon: FileText },
                    { id: 'essay', label: 'Essay Question', icon: BookOpen },
                  ].map((f) => {
                    const Icon = f.icon;
                    const isChecked = formats[f.id as keyof typeof formats];
                    return (
                      <label key={f.id} style={{ 
                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem',
                        background: isChecked ? 'rgba(59, 130, 246, 0.05)' : '#f8fafc',
                        border: `2px solid ${isChecked ? 'var(--admin-primary)' : 'transparent'}`,
                        borderRadius: '1.25rem', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isChecked ? '0 8px 16px -4px rgba(59, 130, 246, 0.2)' : 'none'
                      }}>
                        <input 
                          type="checkbox" 
                          style={{ width: '20px', height: '20px', accentColor: 'var(--admin-primary)' }} 
                          checked={isChecked}
                          onChange={e => setFormats({...formats, [f.id]: e.target.checked})}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                          <Icon size={20} color={isChecked ? 'var(--admin-primary)' : 'var(--muted)'} />
                          <span style={{ fontSize: '1rem', fontWeight: 600, color: isChecked ? 'var(--admin-primary)' : 'var(--foreground)' }}>{f.label}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: '3rem', borderTop: '1px solid #f1f5f9', paddingTop: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Question Types</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', marginTop: '0.2rem' }}>Add questions for this assessment.</p>
                  </div>
                  <button 
                    onClick={() => setQuestions([...questions, { id: Date.now(), text: '', type: 'MCQ', options: ['', '', '', ''], correctAnswer: 0 }])}
                    className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--admin-primary)', padding: '0.75rem 1.25rem' }}
                  >
                    <Plus size={20} /> Create Questions
                  </button>
                </div>

                {questions.length === 0 ? (
                  <div style={{ padding: '4rem', textAlign: 'center', background: '#f8fafc', borderRadius: '1.5rem', color: 'var(--muted)', border: '2px dashed #e2e8f0' }}>
                    <Plus size={40} style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
                    <p style={{ fontWeight: 600 }}>No active questions. Begin by adding a challenge above.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {questions.map((q, qIndex) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={q.id} 
                        style={{ padding: '2rem', background: 'white', borderRadius: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ width: '30px', height: '30px', background: 'var(--foreground)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>{qIndex + 1}</span>
                            <select 
                              value={q.type || 'MCQ'} 
                              onChange={e => {
                                 const newQ = [...questions];
                                 const type = e.target.value as 'MCQ' | 'ShortAnswer' | 'TrueFalse' | 'Essay';
                                 newQ[qIndex].type = type;
                                 if (type === 'ShortAnswer' || type === 'Essay') {
                                   newQ[qIndex].options = [];
                                   newQ[qIndex].correctAnswer = undefined;
                                 } else if (type === 'TrueFalse') {
                                   newQ[qIndex].options = ['True', 'False'];
                                   newQ[qIndex].correctAnswer = 0;
                                 } else {
                                   newQ[qIndex].options = ['', '', '', ''];
                                   newQ[qIndex].correctAnswer = 0;
                                 }
                                 setQuestions(newQ);
                              }}
                              style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', borderRadius: '0.75rem', fontWeight: 600, border: '1px solid #cbd5e1', background: '#f8fafc' }}
                            >
                              <option value="MCQ">Multiple Choice</option>
                              <option value="TrueFalse">True / False</option>
                              <option value="ShortAnswer">Short Answer</option>
                              <option value="Essay">Essay Question</option>
                            </select>
                          </div>
                          <button onClick={() => setQuestions(questions.filter((_, i) => i !== qIndex))} style={{ color: 'var(--destructive)', background: '#fff1f2', border: 'none', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <textarea 
                          value={q.text} 
                          onChange={e => { const newQ = [...questions]; newQ[qIndex].text = e.target.value; setQuestions(newQ); }}
                          placeholder="State the problem or question..."
                          rows={2}
                          style={{ width: '100%', marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0', fontSize: '1rem', fontWeight: 500 }}
                        />

                        {q.type === 'ShortAnswer' || q.type === 'Essay' ? (
                          <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.04)', borderRadius: '1rem', border: '2px dashed #bfdbfe', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <HelpCircle size={24} style={{ opacity: 0.5 }} />
                            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{q.type === 'Essay' ? 'Reflective Essay - Requires manual scoring.' : 'Direct Short Answer - Requires manual scoring.'}</p>
                          </div>
                        ) : q.type === 'TrueFalse' ? (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            {['True', 'False'].map((opt, optIndex) => (
                              <label key={optIndex} style={{ 
                                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', 
                                background: q.correctAnswer === optIndex ? 'rgba(59, 130, 246, 0.05)' : '#f8fafc', 
                                borderRadius: '1rem', border: `2px solid ${q.correctAnswer === optIndex ? 'var(--admin-primary)' : 'transparent'}`, 
                                cursor: 'pointer', transition: 'all 0.2s'
                              }}>
                                <input 
                                  type="radio" 
                                  name={`correct-${q.id}`} 
                                  checked={q.correctAnswer === optIndex} 
                                  onChange={() => { const newQ = [...questions]; newQ[qIndex].correctAnswer = optIndex; setQuestions(newQ); }}
                                  style={{ width: '20px', height: '20px', accentColor: 'var(--admin-primary)' }}
                                />
                                <span style={{ fontSize: '1rem', fontWeight: 600 }}>{opt}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            {(q.options || []).map((opt, optIndex) => (
                              <div key={optIndex} style={{ 
                                display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1.25rem', 
                                background: '#f8fafc', borderRadius: '1.25rem', border: q.correctAnswer === optIndex ? '2px solid var(--admin-primary)' : '1px solid #e2e8f0',
                                boxShadow: q.correctAnswer === optIndex ? '0 4px 12px rgba(59, 130, 246, 0.1)' : 'none'
                              }}>
                                <input 
                                  type="radio" 
                                  name={`correct-${q.id}`} 
                                  checked={q.correctAnswer === optIndex} 
                                  onChange={() => { const newQ = [...questions]; newQ[qIndex].correctAnswer = optIndex; setQuestions(newQ); }}
                                  style={{ width: '20px', height: '20px', accentColor: 'var(--admin-primary)' }}
                                />
                                <input 
                                  value={opt}
                                  onChange={e => { const newQ = [...questions]; newQ[qIndex].options![optIndex] = e.target.value; setQuestions(newQ); }}
                                  placeholder={`Conceptual Choice ${optIndex + 1}`}
                                  style={{ width: '100%', padding: '0.4rem', background: 'transparent', border: 'none', boxShadow: 'none', fontWeight: 600 }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '3rem' }}>
                <button onClick={closeModal} className="btn-secondary" style={{ padding: '0.85rem 2rem', fontWeight: 700, border: 'none', background: '#f1f5f9' }}>Close</button>
                <button 
                  onClick={handleSave} 
                  className="btn-primary" 
                  style={{ padding: '0.85rem 3rem', background: 'var(--admin-primary)', fontWeight: 800, boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)' }}
                >
                  {editingAssessment ? 'Update Assessment' : 'Create Assessment'}
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
