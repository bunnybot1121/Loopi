'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { UserProfile, HindsightMemory } from '@/types';

const PATTERN_LABELS: Record<string, string> = {
  brute_force_first: 'Brute Force First',
  skips_edge_cases: 'Skips Edge Cases',
  over_engineers: 'Over-Engineers',
  recursion_avoidance: 'Recursion Avoidance',
  off_by_one_tendency: 'Off-by-One Tendency',
};

const PATTERN_DESCRIPTIONS: Record<string, string> = {
  brute_force_first: "You favor building small working blocks before optimizing. Great for Medium problems, but Hard sessions need architectural foresight.",
  skips_edge_cases: "Your solutions pass happy-path tests but miss edge cases like empty inputs, duplicates, or negatives.",
  over_engineers: "Your solutions tend to be more complex than necessary — handling hypothetical cases the problem doesn't require.",
  recursion_avoidance: "You rewrite recursive solutions iteratively even when recursion would be cleaner and more elegant.",
  off_by_one_tendency: "Index boundary errors appear repeatedly — particularly in loops and binary search implementations.",
};

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [memories, setMemories] = useState<HindsightMemory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jdText, setJdText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jdResult, setJdResult] = useState<any>(null);
  const [focusLangs, setFocusLangs] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    fetch('/api/memory', { signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.profile) setProfile(d.profile); if (d?.memories) setMemories(d.memories); })
      .catch(() => {})
      .finally(() => { clearTimeout(timeout); setIsLoading(false); });

    const saved = localStorage.getItem('pm_preferred_languages');
    if (saved) { try { setFocusLangs(JSON.parse(saved)); } catch {} }
    else { setFocusLangs(['Python', 'JavaScript', 'TypeScript']); }
  }, []);

  async function analyzeJD() {
    if (!jdText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/jd-analyzer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jd: jdText }) });
      if (res.ok) setJdResult(await res.json());
    } catch {}
    setIsAnalyzing(false);
  }

  // ── All computed from real data ──────────────────────
  const score = profile?.readiness_score || 0;
  const totalSessions = profile?.total_sessions || 0;
  const solveRate = profile?.overall_solve_rate || 0;

  const errorCounts: Record<string, number> = {};
  memories.forEach(m => { const et = m.error_type || 'unknown'; errorCounts[et] = (errorCounts[et] || 0) + 1; });
  const totalErrorCount = Object.values(errorCounts).reduce((a, b) => a + b, 0) || 1;
  const errorFingerprint = Object.entries(errorCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([label, count], i) => ({ label: label.replace(/-/g, ' '), pct: Math.round((count / totalErrorCount) * 100), color: ['#FF4EB8', '#F5C518', '#00E8C6', '#FF5252', '#7C3AED'][i] || '#ccc' }));

  const recentChallenges = memories.slice(-5).reverse().map(m => ({
    label: `Session #${m.session_number} — ${(m.topic || 'general').replace(/-/g, ' ')}`,
    diff: m.difficulty || 'medium', status: m.solved ? 'pass' : 'fail',
    sub: m.solved ? `✓ Solved in ${m.time_taken_secs}s · ${m.language}` : `✗ ${(m.error_type || 'failed').replace(/-/g, ' ')} · ${m.language}`,
  }));
  const displayChallenges = recentChallenges.length > 0 ? recentChallenges : [{ label: 'No challenges yet', diff: 'easy', status: 'pending', sub: 'Start practicing!' }];
  const displayErrors = errorFingerprint.length > 0 ? errorFingerprint : [{ label: 'No errors yet', pct: 0, color: '#ccc' }];

  const diffTrend = (() => {
    if (memories.length < 4) return 'Warming Up';
    const dm: Record<string, number> = { easy: 1, medium: 2, hard: 3 };
    const r = memories.slice(-5).map(m => dm[m.difficulty] || 1);
    const o = memories.slice(-10, -5).map(m => dm[m.difficulty] || 1);
    if (!o.length) return 'Warming Up';
    return r.reduce((a, b) => a + b, 0) / r.length >= o.reduce((a, b) => a + b, 0) / o.length ? 'Rising' : 'Steady';
  })();

  const recurringErrors = profile?.top_3_error_types?.length || 0;
  const streak = (() => { let c = 0; for (let i = memories.length - 1; i >= 0; i--) { if (memories[i].solved) c++; else break; } return c; })();

  const usedLangs = [...new Set(memories.map(m => m.language))].slice(0, 5);
  const heatmapRows = usedLangs.map(lang => {
    const vals = ['easy', 'medium', 'hard'].map(diff => {
      const m = memories.filter(x => x.language === lang && x.difficulty === diff);
      return m.length === 0 ? 0 : m.filter(x => !x.solved).length / m.length;
    });
    return { lang: lang.charAt(0).toUpperCase() + lang.slice(1), vals };
  });

  function heatColor(v: number) {
    if (v < 0.15) return '#F5F0E8'; if (v < 0.35) return '#FDECD0';
    if (v < 0.55) return '#F9C275'; if (v < 0.75) return '#F59340'; return '#E24B4A';
  }

  if (isLoading) return (
    <div style={{ minHeight: '100vh', background: '#E8E4D9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ border: '3px solid #0D0D0D', padding: '20px 32px', background: 'white', boxShadow: '4px 4px 0 #0D0D0D' }}>
        <p className="font-mono" style={{ fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>⟳ Loading profile…</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#E8E4D9' }}>
      <NavBar readinessScore={profile?.readiness_score} />

      <main style={{ maxWidth: '1200px', margin: '52px auto 0', padding: '20px 24px 40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ═══ ROW 1: Hero Banner ═══ */}
        <div style={{ background: 'linear-gradient(135deg, #0D0D0D 0%, #1a1a2e 100%)', border: '3px solid #0D0D0D', padding: '28px 32px', display: 'flex', alignItems: 'center', gap: '32px', boxShadow: '6px 6px 0 #0D0D0D' }}>
          {/* Score Circle */}
          <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={score >= 70 ? '#00E8C6' : score >= 40 ? '#F5C518' : '#FF5252'} strokeWidth="8" strokeDasharray={`${score * 2.64} 264`} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span className="font-display" style={{ fontSize: '42px', color: 'white', lineHeight: 1 }}>{score}</span>
              <span className="font-mono" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>READY</span>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {[
              { label: 'Sessions', value: totalSessions, accent: '#00E8C6', sub: streak > 0 ? `${streak} streak` : '—' },
              { label: 'Solve Rate', value: `${solveRate}%`, accent: '#FF4EB8', sub: solveRate >= 70 ? 'Great!' : 'Growing' },
              { label: 'Trend', value: diffTrend, accent: '#F5C518', sub: diffTrend === 'Rising' ? '↑ Hard+' : '→ steady' },
              { label: 'Errors', value: String(recurringErrors).padStart(2, '0'), accent: '#FF5252', sub: recurringErrors > 2 ? 'Attention!' : 'Good' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <p className="font-mono" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>{s.label}</p>
                <p className="font-display" style={{ fontSize: '32px', color: s.accent, lineHeight: 1 }}>{s.value}</p>
                <p className="font-mono" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginTop: '2px', textTransform: 'uppercase' }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ ROW 2: Core Vitals + Dominant Pattern ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Core Vitals */}
          <div className="brut-card" style={{ padding: '20px 24px', boxShadow: '4px 4px 0 #0D0D0D' }}>
            <p className="font-mono" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', background: '#00E8C6', border: '1.5px solid #0D0D0D', display: 'inline-block' }} /> Core Vitals
            </p>
            {[
              { label: 'Solve Rate', pct: solveRate, color: '#FF4EB8' },
              { label: 'Consistency', pct: Math.min(totalSessions * 10, 100), color: '#00E8C6' },
              { label: 'Difficulty', pct: diffTrend === 'Rising' ? 75 : 45, color: '#F5C518', suffix: diffTrend },
              { label: 'Error Rate', pct: Math.max(0, 100 - solveRate), color: '#FF5252' },
            ].map(v => (
              <div key={v.label} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span className="font-mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.6 }}>{v.label}</span>
                  <span className="font-mono" style={{ fontSize: '10px', fontWeight: 700 }}>{v.suffix || `${v.pct}%`}</span>
                </div>
                <div style={{ height: '8px', background: '#F0EDE4', border: '2px solid #0D0D0D', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${v.pct}%`, background: v.color, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Dominant Pattern */}
          <div style={{ background: '#7C3AED', border: '3px solid #0D0D0D', padding: '20px 24px', boxShadow: '4px 4px 0 #0D0D0D', display: 'flex', flexDirection: 'column' }}>
            <span className="badge badge-white" style={{ fontSize: '9px', alignSelf: 'flex-start', marginBottom: '12px' }}>Dominant Pattern</span>
            <h2 className="font-display" style={{ fontSize: '36px', color: 'white', lineHeight: 1.0, textTransform: 'uppercase', marginBottom: '10px' }}>
              {PATTERN_LABELS[profile?.dominant_thinking_pattern || 'brute_force_first']}
            </h2>
            <p className="font-mono" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, flex: 1 }}>
              {PATTERN_DESCRIPTIONS[profile?.dominant_thinking_pattern || 'brute_force_first']}
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              <button className="btn btn-white" style={{ fontSize: '10px', padding: '6px 14px', boxShadow: '2px 2px 0 rgba(0,0,0,0.3)' }} onClick={() => router.push('/practice')}>Practice Now →</button>
              <button className="btn" style={{ fontSize: '10px', padding: '6px 14px', background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.4)', boxShadow: 'none' }} onClick={() => router.push('/dna')}>View DNA</button>
            </div>
          </div>
        </div>

        {/* ═══ ROW 3: Error Fingerprint + Recent Challenges ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }}>
          {/* Error Fingerprint */}
          <div className="brut-card" style={{ padding: '20px 24px', boxShadow: '4px 4px 0 #0D0D0D' }}>
            <p className="font-mono" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', background: '#FF4EB8', border: '1.5px solid #0D0D0D', display: 'inline-block' }} /> Error Fingerprint
            </p>
            {displayErrors.map(e => (
              <div key={e.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span className="font-mono" style={{ width: '130px', fontSize: '10px', textTransform: 'capitalize', flexShrink: 0, opacity: 0.7 }}>{e.label}</span>
                <div style={{ flex: 1, height: '16px', background: '#F0EDE4', border: '2px solid #0D0D0D', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${e.pct}%`, background: e.color, transition: 'width 0.8s ease' }} />
                </div>
                <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700, width: '36px', textAlign: 'right' }}>{e.pct}%</span>
              </div>
            ))}
          </div>

          {/* Recent Challenges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p className="font-mono" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', background: '#F5C518', border: '1.5px solid #0D0D0D', display: 'inline-block' }} /> Recent Sessions
            </p>
            {displayChallenges.map((ch, idx) => (
              <div key={idx} onClick={() => router.push('/problems')} style={{ background: 'white', border: '2px solid #0D0D0D', padding: '10px 12px', boxShadow: '2px 2px 0 #0D0D0D', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'transform 80ms ease' }}>
                <div style={{ width: '6px', alignSelf: 'stretch', background: ch.status === 'pass' ? '#00E8C6' : ch.status === 'fail' ? '#FF5252' : '#ccc', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '3px' }}>
                    <span className="badge" style={{ background: ch.diff === 'hard' ? '#FF5252' : ch.diff === 'medium' ? '#F5C518' : '#00E8C6', fontSize: '8px', padding: '1px 6px' }}>{ch.diff}</span>
                  </div>
                  <p className="font-mono" style={{ fontSize: '10px', fontWeight: 700, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ch.label}</p>
                  <p className="font-mono" style={{ fontSize: '9px', opacity: 0.4, textTransform: 'uppercase', marginTop: '1px' }}>{ch.sub}</p>
                </div>
              </div>
            ))}

            {/* Focus Languages */}
            <div style={{ background: '#0D0D0D', border: '2px solid #0D0D0D', padding: '10px 12px', cursor: 'pointer', marginTop: '2px' }} onClick={() => router.push('/settings')}>
              <p className="font-mono" style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px', color: 'rgba(255,255,255,0.5)' }}>Focus Languages</p>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {focusLangs.map(lang => (
                  <span key={lang} style={{ background: '#7C3AED', color: 'white', fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, padding: '2px 8px', border: '1px solid rgba(255,255,255,0.2)', letterSpacing: '0.04em' }}>{lang}</span>
                ))}
              </div>
              <p className="font-mono" style={{ fontSize: '8px', opacity: 0.3, marginTop: '4px', color: 'white' }}>⚙ Edit in Settings</p>
            </div>
          </div>
        </div>

        {/* ═══ ROW 4: Topic Distribution + Solve Rate Graph ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Topic Distribution */}
          <div className="brut-card" style={{ padding: '20px 24px', boxShadow: '4px 4px 0 #0D0D0D' }}>
            <p className="font-mono" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', background: '#7C3AED', border: '1.5px solid #0D0D0D', display: 'inline-block' }} /> Topic Breakdown
            </p>
            {(() => {
              const tc: Record<string, { total: number; solved: number }> = {};
              memories.forEach(m => { const t = (m.topic || 'general').replace(/-/g, ' '); if (!tc[t]) tc[t] = { total: 0, solved: 0 }; tc[t].total++; if (m.solved) tc[t].solved++; });
              const topics = Object.entries(tc).sort((a, b) => b[1].total - a[1].total);
              const mx = Math.max(...topics.map(([, v]) => v.total), 1);
              if (!topics.length) return <p className="font-mono" style={{ fontSize: '11px', opacity: 0.4 }}>No data yet — start practicing!</p>;
              return topics.map(([topic, stats]) => (
                <div key={topic} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span className="font-mono" style={{ fontSize: '10px', textTransform: 'capitalize', opacity: 0.7 }}>{topic}</span>
                    <span className="font-mono" style={{ fontSize: '9px', opacity: 0.4 }}>{stats.solved}/{stats.total}</span>
                  </div>
                  <div style={{ height: '12px', background: '#F0EDE4', border: '2px solid #0D0D0D', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ height: '100%', width: `${(stats.total / mx) * 100}%`, background: '#7C3AED', opacity: 0.3, transition: 'width 0.6s ease' }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${(stats.solved / mx) * 100}%`, background: '#00E8C6', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ));
            })()}
            <div style={{ display: 'flex', gap: '14px', marginTop: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', background: '#7C3AED', opacity: 0.3, border: '1px solid #0D0D0D' }} /><span className="font-mono" style={{ fontSize: '8px', opacity: 0.5 }}>Attempted</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', background: '#00E8C6', border: '1px solid #0D0D0D' }} /><span className="font-mono" style={{ fontSize: '8px', opacity: 0.5 }}>Solved</span></div>
            </div>
          </div>

          {/* Solve Rate Over Time */}
          <div className="brut-card" style={{ padding: '20px 24px', boxShadow: '4px 4px 0 #0D0D0D' }}>
            <p className="font-mono" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', background: '#F5C518', border: '1.5px solid #0D0D0D', display: 'inline-block' }} /> Solve Rate Over Time
            </p>
            {(() => {
              if (!memories.length) return <p className="font-mono" style={{ fontSize: '11px', opacity: 0.4 }}>No data yet</p>;
              const sorted = [...memories].sort((a, b) => a.session_number - b.session_number);
              const pts: { s: number; r: number }[] = [];
              let ts = 0, ta = 0;
              sorted.forEach(m => { ta++; if (m.solved) ts++; const rate = Math.round((ts / ta) * 100); if (!pts.length || pts[pts.length - 1].s !== m.session_number) pts.push({ s: m.session_number, r: rate }); else pts[pts.length - 1].r = rate; });
              const cW = 100, cH = 60, ms = Math.max(...pts.map(p => p.s), 1);
              const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${(p.s / ms) * cW},${cH - (p.r / 100) * cH}`).join(' ');
              const area = path + ` L${cW},${cH} L0,${cH} Z`;
              return (
                <svg viewBox={`-8 -4 ${cW + 16} ${cH + 16}`} style={{ width: '100%', height: '180px' }}>
                  {[0, 25, 50, 75, 100].map(pct => (
                    <g key={pct}>
                      <line x1="0" y1={cH - (pct / 100) * cH} x2={cW} y2={cH - (pct / 100) * cH} stroke="#eee" strokeWidth="0.3" />
                      <text x="-3" y={cH - (pct / 100) * cH + 1} fontSize="3" fill="#bbb" textAnchor="end">{pct}%</text>
                    </g>
                  ))}
                  <path d={area} fill="rgba(124,58,237,0.08)" />
                  <path d={path} fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeLinejoin="round" />
                  {pts.map((p, i) => (
                    <circle key={i} cx={(p.s / ms) * cW} cy={cH - (p.r / 100) * cH} r="1.8" fill="#F5C518" stroke="#0D0D0D" strokeWidth="0.4" />
                  ))}
                  <text x={cW / 2} y={cH + 8} fontSize="3" fill="#bbb" textAnchor="middle" style={{ fontFamily: 'var(--font-mono)' }}>Sessions →</text>
                </svg>
              );
            })()}
          </div>
        </div>

        {/* ═══ ROW 5: Error Heatmap ═══ */}
        {heatmapRows.length > 0 && (
          <div className="brut-card" style={{ padding: '20px 24px', boxShadow: '4px 4px 0 #0D0D0D' }}>
            <p className="font-mono" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', background: '#FF5252', border: '1.5px solid #0D0D0D', display: 'inline-block' }} /> Error Heatmap
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '100px' }} />
                  {['Easy', 'Medium', 'Hard'].map(h => (
                    <th key={h} style={{ padding: '4px 8px', textAlign: 'center' }}>
                      <span className="font-mono" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.5 }}>{h}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapRows.map(row => (
                  <tr key={row.lang}>
                    <td><span className="font-mono" style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.6 }}>{row.lang}</span></td>
                    {row.vals.map((v, i) => (
                      <td key={i} style={{ padding: '3px 6px', textAlign: 'center' }}>
                        <div style={{ width: '100%', height: '24px', background: heatColor(v), border: '2px solid #0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {v > 0.1 && <span className="font-mono" style={{ fontSize: '9px', fontWeight: 700 }}>{Math.round(v * 100)}%</span>}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px', justifyContent: 'flex-end' }}>
              <span className="font-mono" style={{ fontSize: '9px', opacity: 0.3 }}>Low</span>
              {['#F5F0E8', '#FDECD0', '#F9C275', '#F59340', '#E24B4A'].map((c, i) => (
                <div key={i} style={{ width: '14px', height: '14px', background: c, border: '1.5px solid #0D0D0D' }} />
              ))}
              <span className="font-mono" style={{ fontSize: '9px', opacity: 0.3 }}>High</span>
            </div>
          </div>
        )}

        {/* ═══ ROW 6: Skill Gap Analyzer ═══ */}
        <div className="brut-card-yellow" style={{ padding: '20px 24px', boxShadow: '4px 4px 0 #0D0D0D' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
            <div>
              <p className="font-mono" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🎯 Skill Gap Analyzer
              </p>
              <p className="font-mono" style={{ fontSize: '11px', lineHeight: 1.5, opacity: 0.6, marginBottom: '12px' }}>
                Paste a Job Description to see how your performance matches the role requirements.
              </p>
              {jdResult && (
                <div style={{ background: 'white', border: '2px solid #0D0D0D', padding: '10px', boxShadow: '2px 2px 0 #0D0D0D' }}>
                  <p className="font-mono" style={{ fontSize: '11px', lineHeight: 1.5 }}>{jdResult.summary}</p>
                  {jdResult.gap_topics?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                      {jdResult.gap_topics.map((t: string) => (<span key={t} className="badge badge-pink" style={{ fontSize: '8px' }}>{t}</span>))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div>
              <p className="font-mono" style={{ fontSize: '9px', fontWeight: 700, opacity: 0.5, textTransform: 'uppercase', marginBottom: '6px' }}>Job Description</p>
              <textarea value={jdText} onChange={e => setJdText(e.target.value)} placeholder="Paste requirements here…"
                style={{ width: '100%', minHeight: '100px', background: 'rgba(255,255,255,0.7)', border: '2px solid #0D0D0D', padding: '10px 12px', fontFamily: 'Space Mono, monospace', fontSize: '11px', lineHeight: 1.5, resize: 'none', outline: 'none' }} />
              <button onClick={analyzeJD} disabled={isAnalyzing || !jdText.trim()} className="btn btn-black"
                style={{ width: '100%', fontSize: '11px', marginTop: '8px', opacity: (isAnalyzing || !jdText.trim()) ? 0.5 : 1 }}>
                {isAnalyzing ? '⟳ Analyzing…' : 'Analyze My Gaps'}
              </button>
            </div>
          </div>
        </div>

        {/* 14-day prep plan */}
        {jdResult?.prep_plan?.length > 0 && (
          <div className="brut-card" style={{ padding: '20px 24px', boxShadow: '4px 4px 0 #0D0D0D' }}>
            <p className="font-mono" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>14-Day Prep Plan</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
              {jdResult.prep_plan.slice(0, 14).map((item: any) => (
                <div key={item.day} style={{ background: 'white', border: '2px solid #0D0D0D', padding: '10px', display: 'flex', gap: '10px', boxShadow: '2px 2px 0 #0D0D0D' }}>
                  <div style={{ width: '24px', height: '24px', background: '#F5C518', border: '2px solid #0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="font-mono" style={{ fontSize: '10px', fontWeight: 700 }}>{item.day}</span>
                  </div>
                  <div>
                    <p className="font-mono" style={{ fontSize: '10px', fontWeight: 700, lineHeight: 1.3 }}>{item.task}</p>
                    <p className="font-mono" style={{ fontSize: '9px', opacity: 0.4, textTransform: 'uppercase', marginTop: '2px' }}>{item.topic}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
