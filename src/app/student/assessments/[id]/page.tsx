'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/apiConfig';
import { AlertCircle, Clock, CheckCircle, BookOpen, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock questions for the demo
const MOCK_QUESTIONS = [
  {
    id: 1,
    text: "What is the primary purpose of React?",
    options: ["Database Management", "Building User Interfaces", "Server Routing", "Operating System Building"],
    correctAnswer: 1
  },
  {
    id: 2,
    text: "Which method is used to update state in a React class component?",
    options: ["this.updateState()", "this.changeState()", "this.setState()", "this.set()"],
    correctAnswer: 2
  },
  {
    id: 3,
    text: "True or False: React hooks can be called inside loops or conditions.",
    options: ["True", "False"],
    correctAnswer: 1
  }
];

export default function TakeAssessment() {
  const { id } = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testQuestions, setTestQuestions] = useState<any[]>(MOCK_QUESTIONS);
  
  // Test sequence state
  const [step, setStep] = useState<'instructions' | 'test' | 'submitting'>('instructions');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subRes = await fetch(`${API_BASE_URL}/submissions/${id}`);
        const subData = await subRes.json();
        setSubmission(subData);

        if (subData.assessmentId) {
          const aRes = await fetch(`${API_BASE_URL}/assessments/${subData.assessmentId}`);
          const aData = await aRes.json();
          if (aData && aData.questions) {
            setTestQuestions(aData.questions);
          }
        } else if (subData.assessmentTitle) {
          const aRes = await fetch(`${API_BASE_URL}/assessments?title=${encodeURIComponent(subData.assessmentTitle)}`);
          const acts = await aRes.json();
          if (acts.length > 0 && acts[0].questions && acts[0].questions.length > 0) {
            setTestQuestions(acts[0].questions);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'test' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && step === 'test') {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const handleOptionSelect = (qId: number, val: number | string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < testQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setStep('submitting');
    
    // Separate auto-gradable and manual review questions
    const autoGradable = testQuestions.filter((q: any) => q.type === 'MCQ' || q.type === 'TrueFalse');
    const manualReview = testQuestions.filter((q: any) => q.type === 'ShortAnswer' || q.type === 'Essay');
    const hasManualReview = manualReview.length > 0;

    // Calculate score only from auto-gradable questions
    let correct = 0;
    autoGradable.forEach((q: any) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    
    let percentage: number;
    let status: string;

    if (autoGradable.length === 0) {
      // All questions are manual review — cannot auto-grade
      percentage = 0;
      status = 'Submitted';
    } else {
      percentage = Math.round((correct / autoGradable.length) * 100);
      if (hasManualReview) {
        // Mixed assessment — auto-score fixed answers but mark as Submitted for educator to finalize
        status = 'Submitted';
      } else {
        // Purely auto-gradable
        status = percentage >= 50 ? 'Passed' : 'Failed';
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: percentage,
          status: status,
          date: new Date().toLocaleDateString('en-CA'),
          answers: answers
        })
      });

      if (!response.ok) throw new Error('Failed to update submission record');

      // Short delay for better UX and to ensure DB consistency
      setTimeout(() => {
        router.push('/student/results');
      }, 1000);
    } catch (e) {
      console.error(e);
      setStep('test'); // Return to test if failed
      alert('Error connecting to server. Please try submitting again.');
    }
  };

  if (loading) return <div>Loading assessment...</div>;
  if (!submission) return <div>Assessment not found.</div>;
  if (submission.status !== 'Pending') {
    return (
      <div className="card text-center py-12">
        <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Assessment Already Completed</h2>
        <p className="text-[var(--muted-foreground)] mb-6">You have already submitted this assessment.</p>
        <button className="btn-primary" onClick={() => router.push('/student/results')}>View Results</button>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (step === 'instructions') {
    return (
      <div className="animate-premium" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 30 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          className="premium-card" 
          style={{ width: '100%', maxWidth: '720px', padding: '4rem', textAlign: 'center' }}
        >
          <div className="vibrant-gradient-student" style={{ 
            width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', margin: '0 auto 2rem', boxShadow: '0 12px 24px -6px rgba(139, 92, 246, 0.4)'
          }}>
            <BookOpen size={40} />
          </div>
          
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '0.75rem' }}>{submission.assessmentTitle}</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem', fontWeight: 500, marginBottom: '2.5rem' }}>Academic Integrity Protocol v1.4</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginBottom: '3rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '1.5rem' }}>
             <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Time Frame</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--student-primary)', fontWeight: 700 }}>
                   <Clock size={16} /> 30 Minutes
                </div>
             </div>
             <div style={{ width: '1px', background: '#e2e8f0' }} />
             <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Challenge Count</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--student-primary)', fontWeight: 700 }}>
                   <CheckCircle size={16} /> {testQuestions.length} Elements
                </div>
             </div>
          </div>

          <div style={{ textAlign: 'left', marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1.25rem', letterSpacing: '0.05em' }}>Prerequisites & Guidelines</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                "Stable Network Required",
                "Monitored Completion",
                "Non-Interruptible Cycle",
                "Single Entry Attempt"
              ].map(guide => (
                <div key={guide} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--muted-foreground)', fontSize: '0.95rem', fontWeight: 500 }}>
                   <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--student-primary)' }} />
                   {guide}
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '1.5rem', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '1.25rem', border: '1px solid rgba(139, 92, 246, 0.2)', color: 'var(--student-primary)', marginBottom: '3rem', display: 'flex', gap: '1rem', textAlign: 'left' }}>
            <AlertCircle size={24} style={{ flexShrink: 0, opacity: 0.7 }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.5 }}>By initializing this session, you acknowledge full compliance with the institutional academic integrity code.</p>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <button className="btn-secondary" style={{ flex: 1, padding: '1rem', fontWeight: 700, background: '#f1f5f9', border: 'none' }} onClick={() => router.push('/student/assessments')}>Abort Mission</button>
            <button className="btn-primary" style={{ flex: 2, padding: '1rem', fontWeight: 800, background: 'var(--student-primary)', boxShadow: '0 10px 20px -5px rgba(139, 92, 246, 0.4)' }} onClick={() => setStep('test')}>Initialize Session</button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (step === 'submitting') {
    return (
      <div className="animate-premium" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="vibrant-gradient-student" 
          style={{ 
            width: '100px', height: '100px', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', marginBottom: '3rem', boxShadow: '0 15px 30px -5px rgba(139, 92, 246, 0.4)'
          }}
        >
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
            <CheckCircle size={50} />
          </motion.div>
        </motion.div>
        
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '1rem' }}>Finalizing Protocol</h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.2rem', fontWeight: 500, maxWidth: '400px', lineHeight: 1.6 }}>
          Syncing your challenge responses with the global content repository...
        </p>
        
        <div style={{ width: '200px', height: '6px', background: '#f1f5f9', borderRadius: '10px', marginTop: '3rem', overflow: 'hidden' }}>
           <motion.div 
             initial={{ x: '-100%' }} 
             animate={{ x: '100%' }} 
             transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
             style={{ width: '40%', height: '100%', background: 'var(--student-primary)', borderRadius: '10px' }} 
           />
        </div>
      </div>
    );
  }
  const currentQ = testQuestions[currentQuestionIdx];

  return (
    <div className="animate-premium" style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: '80px', paddingBottom: '120px' }}>
      {/* Progress Horizon (Header) */}
      <div style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0', zIndex: 100, height: '70px',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ width: '100%', maxWidth: '1000px', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.3px', color: 'var(--secondary)' }}>{submission.assessmentTitle}</h2>
            <div style={{ padding: '0.4rem 0.8rem', background: '#f1f5f9', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)' }}>
              ELEMENT {currentQuestionIdx + 1} OF {testQuestions.length}
            </div>
          </div>
          
          <div style={{ flex: 1, maxWidth: '300px', margin: '0 3rem', height: '6px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIdx + 1) / testQuestions.length) * 100}%` }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)', borderRadius: '10px' }}
            />
          </div>

          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem', 
            color: timeLeft < 300 ? '#ef4444' : 'var(--student-primary)', 
            fontWeight: 800, fontSize: '1.2rem', fontFamily: 'monospace',
            background: timeLeft < 300 ? '#fef2f2' : 'rgba(139, 92, 246, 0.05)',
            padding: '0.5rem 1rem', borderRadius: '12px',
            border: `1px solid ${timeLeft < 300 ? '#fee2e2' : 'rgba(139, 92, 246, 0.1)'}`
          }}>
            <Clock size={20} className={timeLeft < 60 ? 'animate-pulse' : ''} />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <motion.div 
          key={currentQuestionIdx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card"
          style={{ padding: '4rem', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.03)' }}
        >
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
               <span style={{ 
                 width: '36px', height: '36px', background: 'var(--student-primary)', color: 'white', 
                 borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                 fontSize: '1rem', fontWeight: 800 
               }}>
                 {currentQuestionIdx + 1}
               </span>
               <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                 Challenge Segment
               </span>
            </div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.4, letterSpacing: '-0.5px' }}>
              {currentQ.text}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '4rem' }}>
            {currentQ.type === 'ShortAnswer' || currentQ.type === 'Essay' ? (
              <div style={{ position: 'relative' }}>
                <textarea 
                  className="premium-input"
                  style={{ 
                    width: '100%', padding: '2rem', borderRadius: '1.5rem', border: '2px solid #f1f5f9', 
                    minHeight: currentQ.type === 'Essay' ? '350px' : '180px', fontSize: '1.1rem', lineHeight: 1.6,
                    background: '#f8fafc', outline: 'none', transition: 'all 0.3s'
                  }}
                  placeholder={currentQ.type === 'Essay' ? "Construct your comprehensive analysis here..." : "Input your direct response..."}
                  value={answers[currentQ.id] as string || ''}
                  onChange={(e) => handleOptionSelect(currentQ.id, e.target.value)}
                />
                <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', opacity: 0.3 }}>
                   <FileText size={24} />
                </div>
              </div>
            ) : (
              (currentQ.type === 'TrueFalse' ? ['True', 'False'] : currentQ.options).map((opt: string, idx: number) => {
                const isSelected = answers[currentQ.id] === idx;
                return (
                  <motion.label 
                    key={idx} 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.75rem 2rem', 
                      borderRadius: '1.5rem', border: `2px solid ${isSelected ? 'var(--student-primary)' : '#f1f5f9'}`,
                      cursor: 'pointer', transition: 'all 0.3s', background: isSelected ? 'rgba(139, 92, 246, 0.03)' : 'white',
                      boxShadow: isSelected ? '0 10px 20px -5px rgba(139, 92, 246, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ 
                      width: '44px', height: '44px', borderRadius: '50%', 
                      background: isSelected ? 'var(--student-primary)' : '#f1f5f9',
                      color: isSelected ? 'white' : 'var(--muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontSize: '1rem', fontWeight: 800, transition: 'all 0.3s'
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    
                    <span style={{ 
                      fontSize: '1.1rem', fontWeight: isSelected ? 700 : 500, 
                      color: isSelected ? 'var(--foreground)' : 'var(--secondary)',
                      flex: 1
                    }}>
                      {opt}
                    </span>

                    <input 
                      type="radio" 
                      name={`question-${currentQ.id}`} 
                      checked={isSelected}
                      onChange={() => handleOptionSelect(currentQ.id, idx)}
                      style={{ display: 'none' }}
                    />
                    
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ color: 'var(--student-primary)' }}>
                        <CheckCircle size={24} />
                      </motion.div>
                    )}
                  </motion.label>
                );
              })
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: isNaN(answers[currentQ.id] as any) && !answers[currentQ.id] ? '#ef4444' : '#10b981' }}>
               <AlertCircle size={20} style={{ opacity: 0.6 }} />
               <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                 {answers[currentQ.id] !== undefined ? 'Protocol Locked' : 'Selection Required'}
               </span>
            </div>

            <button 
              className="btn-primary"
              onClick={handleNext}
              disabled={answers[currentQ.id] === undefined || (typeof answers[currentQ.id] === 'string' && !(answers[currentQ.id] as string).trim())}
              style={{ 
                padding: '1.25rem 3.5rem', background: 'var(--student-primary)', 
                fontWeight: 800, fontSize: '1.1rem', borderRadius: '1rem',
                boxShadow: '0 10px 20px -5px rgba(139, 92, 246, 0.4)',
                opacity: (answers[currentQ.id] === undefined || (typeof answers[currentQ.id] === 'string' && !(answers[currentQ.id] as string).trim())) ? 0.5 : 1
              }}
            >
              {currentQuestionIdx === testQuestions.length - 1 ? 'Finalize Protocol' : 'Next Challenge'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
