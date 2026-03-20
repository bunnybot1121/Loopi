'use client';

import { Problem } from '@/types';

interface ProblemCardProps {
  problem: Problem;
  onClick?: () => void;
}

const DIFF_COLORS: Record<string, string> = {
  easy: '#00E8C6', medium: '#F5C518', hard: '#FF5252',
};

const TOPIC_MAP: Record<string, string> = {
  arrays: 'Arrays', trees: 'Trees', dp: 'DP', graphs: 'Graphs',
  strings: 'Strings', recursion: 'Recursion', 'hash-maps': 'Data Structures',
  sorting: 'Sorting', 'linked-lists': 'Data Structures',
};

export default function ProblemCard({ problem, onClick }: ProblemCardProps) {
  return (
    <div
      onClick={onClick}
      className="brut-card"
      style={{ padding: '20px', cursor: 'pointer', transition: 'transform 80ms, box-shadow 80ms', background: 'white' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translate(-2px,-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '6px 6px 0 #0D0D0D'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '4px 4px 0 #0D0D0D'; }}
    >
      {/* Top row: title + difficulty/topic */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
        <h3 className="font-display" style={{ fontSize: '24px', lineHeight: 1.1, textTransform: 'uppercase', flex: 1 }}>
          {problem.title}
        </h3>
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <span className="badge" style={{ background: DIFF_COLORS[problem.difficulty] || '#ccc' }}>
            {problem.difficulty}
          </span>
          <span className="badge badge-white">{TOPIC_MAP[problem.topic] || problem.topic}</span>
        </div>
      </div>

      {/* AI / Gap badges */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
        {problem.is_ai_generated && (
          <span className="badge badge-pink" style={{ fontSize: '10px' }}>⚡ AI Generated</span>
        )}
        {problem.is_weak_area_match && (
          <span className="badge badge-yellow" style={{ fontSize: '10px' }}>⚡ Targets Your Gap</span>
        )}
      </div>

      {/* Generated reason */}
      {problem.generated_reason && (
        <div style={{ borderLeft: '3px solid #00E8C6', paddingLeft: '10px', marginBottom: '14px', background: 'rgba(0,232,198,0.08)', padding: '8px 10px 8px 12px' }}>
          <span className="font-mono" style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#00A080' }}>
            Generated because:
          </span>
          {' '}
          <span className="font-mono" style={{ fontSize: '10px', textTransform: 'uppercase', color: '#333' }}>
            {problem.generated_reason}
          </span>
        </div>
      )}

      {/* Bottom row: languages + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['py', 'js', 'ts'].map((lang, i) => (
            <div
              key={lang}
              style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: ['#FF4EB8', '#F5C518', '#00E8C6'][i],
                border: '2px solid #0D0D0D',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginLeft: i > 0 ? '-6px' : 0,
              }}
            >
              <span className="font-mono" style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase' }}>{lang}</span>
            </div>
          ))}
        </div>
        <button className="btn btn-black" style={{ fontSize: '11px', padding: '7px 20px' }}>
          Solve Now
        </button>
      </div>
    </div>
  );
}
