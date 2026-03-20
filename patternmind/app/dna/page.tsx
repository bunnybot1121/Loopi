'use client';

import NavBar from '@/components/NavBar';
import MistakeDNASection from '@/components/MistakeDNASection';
import type { ErrorType, Language } from '@/types';

type RawMemory = {
  error_type: ErrorType;
  language: Language;
  session_number: number;
  problem_title: string;
  solved: boolean;
};

const DEMO_MEMORIES: RawMemory[] = [
  { error_type: 'off-by-one',            language: 'python',     session_number: 1, problem_title: 'Binary Search',    solved: false },
  { error_type: 'off-by-one',            language: 'python',     session_number: 2, problem_title: 'Merge Arrays',     solved: false },
  { error_type: 'off-by-one',            language: 'python',     session_number: 3, problem_title: 'Sliding Window',   solved: false },
  { error_type: 'missing-base-case',     language: 'python',     session_number: 1, problem_title: 'Fibonacci',        solved: false },
  { error_type: 'missing-base-case',     language: 'python',     session_number: 2, problem_title: 'Tree Depth',       solved: false },
  { error_type: 'null-undefined-access', language: 'javascript', session_number: 1, problem_title: 'Flatten Object',   solved: false },
  { error_type: 'null-undefined-access', language: 'javascript', session_number: 2, problem_title: 'Linked List',      solved: false },
  { error_type: 'async-misuse',          language: 'javascript', session_number: 1, problem_title: 'Fetch User',       solved: false },
  { error_type: 'wrong-complexity',      language: 'python',     session_number: 2, problem_title: 'Find Duplicates',  solved: false },
  { error_type: 'logic-error',           language: 'cpp',        session_number: 1, problem_title: 'Palindrome Check', solved: false },
];

export default function DNAPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#E8E4D9' }}>
      <NavBar />

      <div style={{ marginTop: '52px', padding: '32px 28px', maxWidth: '960px', margin: '52px auto 0' }}>

        {/* Page header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontFamily: "'Impact','Arial Narrow',sans-serif",
            fontSize: '52px', lineHeight: 0.95,
            color: '#0D0D0D', marginBottom: '8px',
          }}>
            MISTAKE<br /><em style={{ color: '#FF4EB8' }}>DNA</em> PROFILE
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <div style={{ height: '3px', flex: 1, background: '#0D0D0D' }} />
            <p style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', flexShrink: 0 }}>
              Error × Language heatmap powered by Hindsight
            </p>
          </div>
        </div>

        {/* DNA Section */}
        <MistakeDNASection rawMemories={DEMO_MEMORIES} userId="current-user" />

        {/* Legend */}
        <div style={{
          marginTop: '20px',
          background: 'white',
          border: '2px solid #0D0D0D',
          boxShadow: '3px 3px 0 #0D0D0D',
          padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
        }}>
          <span style={{ fontFamily: 'monospace', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '6px' }}>Severity:</span>
          {[
            { label: 'None',     bg: '#F0EDE5', txt: '#888' },
            { label: 'Low',      bg: '#FFD6D6', txt: '#7A1F1F' },
            { label: 'Moderate', bg: '#F09595', txt: '#7A1F1F' },
            { label: 'High',     bg: '#E24B4A', txt: '#fff'    },
            { label: 'Critical', bg: '#A32D2D', txt: '#fff'    },
          ].map(s => (
            <span key={s.label} style={{
              background: s.bg, color: s.txt,
              border: '2px solid #0D0D0D',
              fontFamily: 'monospace', fontSize: '10px', fontWeight: 700,
              padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {s.label}
            </span>
          ))}
          <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#888', marginLeft: 'auto' }}>
            Click any cell for details
          </span>
        </div>
      </div>
    </div>
  );
}
