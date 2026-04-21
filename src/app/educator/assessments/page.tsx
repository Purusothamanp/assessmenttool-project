'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle2,
  HelpCircle,
  FileText,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
// API calls now route through the internal /api proxy

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

export default function ManageAssessments() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
      const response = await fetch('/api/assessments');
      const data = await response.json();
      // Filter only assessments created by this educator
      const myData = data.filter((a: Assessment) => a.creatorId === user?.id);
      setAssessments(myData.reverse());
    } catch (err) {
      console.error('Error fetching assessments:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchAssessments();
    
    // Fetch students for assign dropdown
    const getStudents = async () => {
      try {
        const res = await fetch('/api/users?role=student');
        const data = await res.json();
        setStudentsList(data);
      } catch (e) {
        console.error('Failed to load students for assignment:', e);
      }
    };
    getStudents();
  }, [user, fetchAssessments]);

  const handleSave = async () => {
    if (!title) {
      alert('Please enter a title');
      return;
    }

    const selectedFormats = Object.entries(formats)
      .filter(([, checked]) => checked)
      .map(([name]) => name);

    const assessmentData = {
      id: Math.random().toString(36).substring(2, 15),
      title,
      type,
      category,
      topic,
      questionFormats: selectedFormats,
      questions,
      date: new Date().toLocaleDateString('en-CA'),
      creatorId: user?.id || 'educator_1'
    };

    try {
      if (editingAssessment) {
        await fetch(`${API_BASE_URL}/assessments/${editingAssessment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...editingAssessment, title, type, category, topic, questionFormats: selectedFormats, questions })
        });
      } else {
        await fetch('/api/assessments', {
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

  const filtered = assessments.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-premium">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ padding: '0.4rem 0.8rem', background: 'var(--educator-accent)', color: 'var(--educator-primary)', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              ASSESSMENT STUDIO
            </span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '0.5rem' }}>Manage Content</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem' }}>Create, organize and assign premium assessments.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            background: 'var(--educator-primary)',
            boxShadow: '0 10px 20px -5px rgba(5, 150, 105, 0.4)'
          }}
        >
          <Plus size={20} />
          Create New
        </button>
      </div>

      <div className="premium-card" style={{ padding: '1.25rem', marginBottom: '2.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', background: '#f8fafc' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input 
            placeholder="Search by assessment title, category or topic..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%',
              padding: '0.85rem 1rem 0.85rem 3.5rem', 
              borderRadius: '1rem',
              border: '1px solid #e2e8f0',
              background: 'white',
              fontSize: '0.95rem'
            }}
          />
        </div>
        <div style={{ height: '30px', width: '1px', background: '#e2e8f0' }} />
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--muted-foreground)' }}>
          <Filter size={18} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Showing {filtered.length} Assessments</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.25rem' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading your studio...</div>
        ) : filtered.length === 0 ? (
          <div className="premium-card" style={{ padding: '5rem', textAlign: 'center' }}>
             <BookOpen size={64} style={{ color: 'var(--muted)', marginBottom: '1.5rem', opacity: 0.2 }} />
             <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Assessments Found</h3>
             <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>Start by creating your first interactive assessment.</p>
             <button onClick={() => setShowModal(true)} className="btn-secondary" style={{ border: 'none', background: 'var(--educator-accent)', color: 'var(--educator-primary)', fontWeight: 700 }}>
                Get Started
             </button>
          </div>
        ) : (
          filtered.map((a, idx) => (
            <motion.div 
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="premium-card" 
              style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.75rem 2rem' }}
            >
              <div style={{ 
                width: '60px', height: '60px', 
                background: 'var(--educator-accent)', 
                color: 'var(--educator-primary)', 
                borderRadius: '1.25rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <FileText size={28} />
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.3px' }}>{a.title}</h3>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: '#f1f5f9', borderRadius: '1rem', fontWeight: 600, color: 'var(--secondary)' }}>{a.type}</span>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', fontWeight: 500 }}>{a.topic}</p>
                  <div style={{ height: '4px', width: '4px', borderRadius: '50%', background: '#cbd5e1' }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 500 }}>Created on {a.date}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {a.questionFormats.slice(0, 3).map(f => (
                  <span key={f} style={{ 
                    fontSize: '0.7rem', padding: '0.3rem 0.75rem', background: 'white', 
                    borderRadius: '2rem', border: '1px solid var(--card-border)', fontWeight: 600, color: 'var(--secondary)'
                  }}>
                    {f.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                ))}
                {a.questionFormats.length > 3 && <span style={{ fontSize: '0.7rem', padding: '0.3rem', color: 'var(--muted)' }}>+{a.questionFormats.length - 3} more</span>}
              </div>

              <div style={{ width: '1px', height: '40px', background: '#f1f5f9', margin: '0 0.5rem' }} />

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setSelectedAssessment(a); setShowAssignModal(true); }}
                  style={{ 
                    width: '44px', height: '44px', borderRadius: '12px', background: 'var(--educator-accent)', 
                    color: 'var(--educator-primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}
                  title="Assign Assessment"
                >
                  <Send size={18} />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => openEdit(a)} 
                  style={{ 
                    width: '44px', height: '44px', borderRadius: '12px', background: '#f8fafc', 
                    color: 'var(--secondary)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}
                >
                  <Edit size={18} />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1, background: '#fee2e2' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(a.id)} 
                  style={{ 
                    width: '44px', height: '44px', borderRadius: '12px', background: '#fff1f2', 
                    color: 'var(--destructive)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}
                >
                  <Trash2 size={18} />
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
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
                <div className="vibrant-gradient-educator" style={{ 
                  width: '64px', height: '64px', 
                  color: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.5rem', boxShadow: '0 8px 16px -4px rgba(5, 150, 105, 0.4)'
                }}>
                  <Send size={30} />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '0.5rem' }}>Publish Content</h2>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '1rem', fontWeight: 500 }}>{selectedAssessment?.title}</p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Target Audience
                </label>
                <select 
                  className="premium-input"
                  value={selectedAssignee}
                  onChange={e => setSelectedAssignee(e.target.value)}
                  style={{ width: '100%', padding: '1rem', borderRadius: '1rem', border: '1px solid #e2e8f0', fontSize: '1rem', fontWeight: 500 }}
                >
                  <option value="All">All Active Students</option>
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
                      
                      for (const student of targets) {
                        await fetch('/api/submissions', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            id: Math.random().toString(36).substring(2, 10),
                            studentName: student.name,
                            assessmentId: selectedAssessment?.id || '',
                            assessmentTitle: selectedAssessment?.title || '',
                            score: 0,
                            status: 'Pending',
                            date: new Date().toLocaleDateString('en-CA')
                          })
                        });
                      }
                      alert(`Published to ${targets.length} student(s) successfully!`);
                      setShowAssignModal(false);
                      setSelectedAssignee('All');
                    } catch (err) {
                      console.error(err);
                      alert('Error assigning assessment');
                    }
                  }} 
                  className="btn-primary" 
                  style={{ flex: 2, background: 'var(--educator-primary)', fontWeight: 800 }}
                >
                  Publish Now
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
                 <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.8px', marginBottom: '0.5rem' }}>{editingAssessment ? 'Update Masterpiece' : 'Design Assessment'}</h2>
                 <p style={{ color: 'var(--muted-foreground)', fontSize: '1rem' }}>Configure the structural details and content of your assessment.</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.75rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Conceptual Title</label>
                  <input style={{ padding: '1rem', width: '100%', borderRadius: '1rem', border: '1px solid #e2e8f0' }} value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex. Advanced Algorithmic Complexity" />
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
                  <input style={{ padding: '1rem', width: '100%', borderRadius: '1rem', border: '1px solid #e2e8f0' }} value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ex. Big O Notation & Runtime Analysis" />
                </div>
              </div>

              <div style={{ marginBottom: '3rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '1.25rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Supported Question Architecture</label>
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
                        background: isChecked ? 'var(--educator-accent)' : '#f8fafc',
                        border: `2px solid ${isChecked ? 'var(--educator-primary)' : 'transparent'}`,
                        borderRadius: '1.25rem', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isChecked ? '0 8px 16px -4px rgba(5, 150, 105, 0.2)' : 'none'
                      }}>
                        <input 
                          type="checkbox" 
                          style={{ width: '20px', height: '20px', accentColor: 'var(--educator-primary)' }} 
                          checked={isChecked}
                          onChange={e => setFormats({...formats, [f.id]: e.target.checked})}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                          <Icon size={20} color={isChecked ? 'var(--educator-primary)' : 'var(--muted)'} />
                          <span style={{ fontSize: '1rem', fontWeight: 600, color: isChecked ? 'var(--educator-primary)' : 'var(--foreground)' }}>{f.label}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: '3rem', borderTop: '1px solid #f1f5f9', paddingTop: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Question Architecture</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', marginTop: '0.2rem' }}>Define individual challenges for your students.</p>
                  </div>
                  <button 
                    onClick={() => setQuestions([...questions, { id: Date.now(), text: '', type: 'MCQ', options: ['', '', '', ''], correctAnswer: 0 } as any])}
                    className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--educator-primary)', padding: '0.75rem 1.25rem' }}
                  >
                    <Plus size={20} /> Add Challenge
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
                                 setQuestions(newQ as any);
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
                          onChange={e => { const newQ = [...questions]; newQ[qIndex].text = e.target.value; setQuestions(newQ as any); }}
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
                                background: q.correctAnswer === optIndex ? 'var(--educator-accent)' : '#f8fafc', 
                                borderRadius: '1rem', border: `2px solid ${q.correctAnswer === optIndex ? 'var(--educator-primary)' : 'transparent'}`, 
                                cursor: 'pointer', transition: 'all 0.2s'
                              }}>
                                <input 
                                  type="radio" 
                                  name={`correct-${q.id}`} 
                                  checked={q.correctAnswer === optIndex} 
                                  onChange={() => { const newQ = [...questions]; newQ[qIndex].correctAnswer = optIndex; setQuestions(newQ as any); }}
                                  style={{ width: '20px', height: '20px', accentColor: 'var(--educator-primary)' }}
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
                                background: '#f8fafc', borderRadius: '1.25rem', border: q.correctAnswer === optIndex ? '2px solid var(--educator-primary)' : '1px solid #e2e8f0',
                                boxShadow: q.correctAnswer === optIndex ? '0 4px 12px rgba(5, 150, 105, 0.1)' : 'none'
                              }}>
                                <input 
                                  type="radio" 
                                  name={`correct-${q.id}`} 
                                  checked={q.correctAnswer === optIndex} 
                                  onChange={() => { const newQ = [...questions]; newQ[qIndex].correctAnswer = optIndex; setQuestions(newQ as any); }}
                                  style={{ width: '20px', height: '20px', accentColor: 'var(--educator-primary)' }}
                                />
                                <input 
                                  value={opt}
                                  onChange={e => { const newQ = [...questions]; newQ[qIndex].options![optIndex] = e.target.value; setQuestions(newQ as any); }}
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
                <button onClick={closeModal} className="btn-secondary" style={{ padding: '0.85rem 2rem', fontWeight: 700, border: 'none', background: '#f1f5f9' }}>Close Studio</button>
                <button 
                  onClick={handleSave} 
                  className="btn-primary" 
                  style={{ padding: '0.85rem 3rem', background: 'var(--educator-primary)', fontWeight: 800, boxShadow: '0 10px 20px -5px rgba(5, 150, 105, 0.4)' }}
                >
                  {editingAssessment ? 'Confirm Structural Update' : 'Initialize Final Protocol'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
