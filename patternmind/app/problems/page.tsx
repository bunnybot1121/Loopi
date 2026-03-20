'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import ProblemCard from '@/components/ProblemCard';
import { STATIC_PROBLEMS } from '@/lib/problems';
import { Problem, UserProfile } from '@/types';

const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'];
const TOPICS = ['all', 'arrays', 'trees', 'dp', 'graphs', 'strings', 'recursion', 'hash-maps'];
const STATUSES = ['all', 'completed', 'unattempted'];

export default function ProblemsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [problems, setProblems] = useState<Problem[]>(STATIC_PROBLEMS);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [memories, setMemories] = useState<any[]>([]);

  useEffect(() => {
    const savedDiff = localStorage.getItem('pm_default_difficulty');
    if (savedDiff) setSelectedDifficulty(savedDiff);

    fetch('/api/memory')
      .then(r => r.ok ? r.json() : null)
      .then(d => { 
        if (d?.profile) setProfile(d.profile); 
        if (d?.memories) setMemories(d.memories);
      })
      .catch(() => {});
  }, []);

  async function generateAIProblem() {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          session_number: (profile?.total_sessions || 0) + 1,
          target_difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
          target_topic: selectedTopic !== 'all' ? selectedTopic : undefined
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.problem) setProblems(prev => [data.problem, ...prev]);
      }
    } catch { /* silent */ }
    setIsGenerating(false);
  }

  const displayed = problems.filter(p => {
    if (selectedDifficulty !== 'all' && p.difficulty !== selectedDifficulty) return false;
    if (selectedTopic !== 'all' && p.topic !== selectedTopic) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedStatus !== 'all') {
      const isCompleted = memories.some(m => m.problem_title === p.title && m.solved);
      if (selectedStatus === 'completed' && !isCompleted) return false;
      if (selectedStatus === 'unattempted' && isCompleted) return false;
    }
    return true;
  });

  const activeFilters = (selectedDifficulty !== 'all' ? 1 : 0) + (selectedTopic !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);

  return (
    <div style={{ minHeight: '100vh', background: '#E8E4D9' }}>
      <NavBar readinessScore={profile?.readiness_score} />

      <div style={{ display: 'flex', height: 'calc(100vh - 52px)', marginTop: '52px' }}>
        {/* Sidebar */}
        <aside style={{ width: '220px', flexShrink: 0, borderRight: '3px solid #0D0D0D', padding: '16px', overflowY: 'auto', background: '#F0ECE2', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p className="font-mono" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Filters</p>
            {activeFilters > 0 && (
              <span className="badge badge-pink" style={{ fontSize: '9px' }}>{activeFilters} active</span>
            )}
          </div>

          {/* Difficulty */}
          <div style={{ marginBottom: '16px' }}>
            <p className="font-mono" style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.5, marginBottom: '8px' }}>Difficulty</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {DIFFICULTIES.map(opt => {
                const isSelected = selectedDifficulty === opt;
                const colors: Record<string, string> = { easy: '#00E8C6', medium: '#F5C518', hard: '#FF5252', all: '#0D0D0D' };
                return (
                  <button key={opt} onClick={() => setSelectedDifficulty(opt)}
                    style={{
                      padding: '4px 12px', border: '2px solid #0D0D0D', borderRadius: '2px',
                      background: isSelected ? (colors[opt] || '#0D0D0D') : 'white',
                      color: isSelected && opt === 'all' ? '#fff' : '#0D0D0D',
                      fontFamily: 'Space Mono, monospace', fontSize: '10px', fontWeight: isSelected ? 700 : 400,
                      textTransform: 'capitalize', cursor: 'pointer', letterSpacing: '0.04em',
                      boxShadow: isSelected ? '2px 2px 0 #0D0D0D' : 'none',
                      transform: isSelected ? 'translate(-1px, -1px)' : 'none',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    {opt === 'all' ? 'All' : opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic */}
          <div style={{ marginBottom: '16px' }}>
            <p className="font-mono" style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.5, marginBottom: '8px' }}>Topic</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {TOPICS.map(opt => {
                const isSelected = selectedTopic === opt;
                const isWeak = profile?.weakest_topic === opt;
                return (
                  <button key={opt} onClick={() => setSelectedTopic(opt)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '5px 10px', border: 'none', borderRadius: '2px',
                      background: isSelected ? '#7C3AED' : 'transparent',
                      color: isSelected ? '#fff' : '#555',
                      fontFamily: 'Space Mono, monospace', fontSize: '10px', fontWeight: isSelected ? 700 : 400,
                      textTransform: 'capitalize', cursor: 'pointer', letterSpacing: '0.04em', textAlign: 'left',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    {opt === 'all' ? 'All Topics' : opt.replace('-', ' ')}
                    {isWeak && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FF5252', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div style={{ marginBottom: '16px' }}>
            <p className="font-mono" style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.5, marginBottom: '8px' }}>Status</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {STATUSES.map(opt => {
                const isSelected = selectedStatus === opt;
                return (
                  <button key={opt} onClick={() => setSelectedStatus(opt)}
                    style={{
                      padding: '4px 12px', border: '2px solid #0D0D0D', borderRadius: '2px',
                      background: isSelected ? '#FF4EB8' : 'white',
                      color: isSelected ? '#fff' : '#0D0D0D',
                      fontFamily: 'Space Mono, monospace', fontSize: '10px', fontWeight: isSelected ? 700 : 400,
                      textTransform: 'capitalize', cursor: 'pointer', letterSpacing: '0.04em',
                      boxShadow: isSelected ? '2px 2px 0 #0D0D0D' : 'none',
                      transform: isSelected ? 'translate(-1px, -1px)' : 'none',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    {opt === 'all' ? 'All' : opt}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ flex: 1 }} />

          <button
            onClick={() => { setSelectedDifficulty('all'); setSelectedTopic('all'); setSelectedStatus('all'); setSearchQuery(''); }}
            className="btn btn-white"
            style={{ width: '100%', fontSize: '10px', padding: '8px', marginTop: '8px' }}
          >
            ↻ Reset All Filters
          </button>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '16px' }}>
            <div>
              <h1 className="font-display" style={{ fontSize: '44px', lineHeight: 1.0, textTransform: 'uppercase' }}>Problem Bank</h1>
              <p className="font-mono" style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                {displayed.length} problem{displayed.length !== 1 ? 's' : ''} available
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, fontSize: '12px' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="brut-input"
                  style={{ paddingLeft: '30px', width: '200px', fontSize: '11px', letterSpacing: '0.04em' }}
                />
              </div>
            </div>
          </div>

          {/* Grid of problem cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            {displayed.map(p => (
              <ProblemCard key={p.id} problem={p} onClick={() => router.push('/practice')} />
            ))}
            {displayed.length === 0 && (
              <div className="brut-card" style={{ padding: '40px', textAlign: 'center', gridColumn: '1/-1' }}>
                <p className="font-mono" style={{ fontSize: '12px', opacity: 0.4, textTransform: 'uppercase' }}>No problems match your filters</p>
              </div>
            )}
          </div>

          {/* Synthesize button */}
          <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
            <button
              onClick={generateAIProblem}
              disabled={isGenerating}
              className="btn btn-yellow"
              style={{ fontSize: '13px', padding: '12px 36px', opacity: isGenerating ? 0.6 : 1 }}
            >
              {isGenerating ? '⟳ Synthesizing...' : '⚡ Synthesize More Problems'}
            </button>
          </div>
        </main>
      </div>

      {/* Floating + button */}
      <button
        onClick={generateAIProblem}
        className="btn btn-cyan"
        style={{ position: 'fixed', bottom: '24px', right: '24px', width: '48px', height: '48px', padding: 0, fontSize: '24px', borderRadius: '4px', zIndex: 50 }}
      >
        +
      </button>
    </div>
  );
}
