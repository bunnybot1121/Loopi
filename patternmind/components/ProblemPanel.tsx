'use client';

import { useState } from 'react';
import { Problem } from '@/types';

interface ProblemPanelProps {
  problem: Problem | null;
  isLoading?: boolean;
}

const DIFF_COLORS: Record<string, string> = {
  easy: '#00E8C6', medium: '#F5C518', hard: '#FF5252',
};

export default function ProblemPanel({ problem, isLoading }: ProblemPanelProps) {
  const [showHint, setShowHint] = useState(false);

  if (isLoading) {
    return (
      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[80, 50, 100, 70, 90, 60].map((w, i) => (
          <div key={i} style={{ height: '14px', background: 'rgba(0,0,0,0.08)', width: `${w}%` }} />
        ))}
      </div>
    );
  }

  if (!problem) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '32px' }}>🧠</span>
      <p className="font-mono" style={{ fontSize: '11px', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>No problem loaded</p>
    </div>
  );

  return (
    <div style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* AI Recommendation banner */}
      {problem.generated_reason && (
        <div style={{ background: '#00E8C6', padding: '10px 16px', borderBottom: '2px solid #0D0D0D' }}>
          <p className="font-mono" style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0D0D0D', marginBottom: '3px' }}>
            AI Recommendation
          </p>
          <p className="font-mono" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1.3 }}>
            {problem.generated_reason}
          </p>
        </div>
      )}

      <div style={{ padding: '16px', flex: 1 }}>
        {/* Badges */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: DIFF_COLORS[problem.difficulty] || '#ccc', textTransform: 'uppercase' }}>
            {problem.difficulty}
          </span>
          <span className="badge badge-white" style={{ textTransform: 'uppercase' }}>{problem.topic.replace('-', ' ')}</span>
        </div>

        {/* Title */}
        <h2 className="font-display" style={{ fontSize: '28px', lineHeight: 1.1, marginBottom: '14px', textTransform: 'uppercase' }}>
          {problem.title}
        </h2>

        {/* Description */}
        <div className="font-mono" style={{ fontSize: '12px', lineHeight: 1.65, color: '#333', marginBottom: '16px' }}>
          {problem.description}
        </div>

        {/* Examples */}
        {problem.examples?.map((ex, i) => (
          <div key={i} style={{ background: '#F0EDE4', border: '2px solid #0D0D0D', padding: '10px 12px', marginBottom: '8px' }}>
            <div className="font-mono" style={{ fontSize: '11px' }}>
              <span style={{ opacity: 0.5 }}>Input: </span><strong>{ex.input}</strong>
            </div>
            <div className="font-mono" style={{ fontSize: '11px' }}>
              <span style={{ opacity: 0.5 }}>Output: </span><strong style={{ color: '#007A60' }}>{ex.output}</strong>
            </div>
          </div>
        ))}

        {/* Hint */}
        <div style={{ marginTop: '16px' }}>
          <button
            onClick={() => setShowHint(!showHint)}
            className="btn btn-black"
            style={{ width: '100%', fontSize: '12px', padding: '9px 16px' }}
          >
            💡 {showHint ? 'Hide hint' : 'Get a Hint'}
          </button>
          {showHint && (
            <div style={{ marginTop: '8px', background: '#F5C518', border: '2px solid #0D0D0D', padding: '12px', boxShadow: '3px 3px 0 #0D0D0D' }}>
              <p className="font-mono" style={{ fontSize: '12px', lineHeight: 1.5 }}>{problem.hint}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
