'use client';
import { useState } from 'react';
import { buildDNAProfile } from '@/lib/buildDNA';
import type { DNACell, ErrorType, Language, MistakeDNAProfile } from '@/types';
import ErrorHeatmap from '@/components/ErrorHeatmap';

const LANG_DISPLAY: Record<Language, string> = {
  python: 'Python', javascript: 'JS', java: 'Java',
  cpp: 'C++', go: 'Go', rust: 'Rust', typescript: 'TS',
};

interface RawMemory {
  error_type: ErrorType;
  language: Language;
  session_number: number;
  problem_title: string;
  solved: boolean;
}

interface SelectedCell {
  cell: DNACell | null;
  et: ErrorType;
  lang: Language;
}

function fmt(e: ErrorType): string {
  return e.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());
}

function severity(n: number): { label: string; bg: string; txt: string } {
  if (n <= 2) return { label: 'Low',      bg: '#FFD6D6', txt: '#7A1F1F' };
  if (n <= 5) return { label: 'Moderate', bg: '#F09595', txt: '#7A1F1F' };
  if (n <= 9) return { label: 'High',     bg: '#E24B4A', txt: '#FFFFFF' };
  return           { label: 'Critical',  bg: '#A32D2D', txt: '#FFFFFF' };
}

export default function MistakeDNASection({
  rawMemories,
  userId,
}: {
  rawMemories: RawMemory[];
  userId: string;
}) {
  const profile: MistakeDNAProfile = buildDNAProfile(userId, rawMemories ?? []);
  const [sel, setSel] = useState<SelectedCell | null>(null);

  const stats = [
    {
      label: 'Total errors tracked',
      value: String(profile.totalErrors ?? 0),
      accentBg: '#F5C518',
    },
    {
      label: 'Most frequent mistake',
      value: profile.dominantErrorType ? fmt(profile.dominantErrorType) : '—',
      accentBg: '#FF4EB8',
    },
    {
      label: 'Weakest language',
      value: profile.dominantLanguage ? (LANG_DISPLAY[profile.dominantLanguage] ?? profile.dominantLanguage) : '—',
      accentBg: '#00E8C6',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {stats.map(({ label, value, accentBg }) => (
          <div
            key={label}
            style={{
              background: 'white',
              border: '2px solid #0D0D0D',
              boxShadow: '3px 3px 0 #0D0D0D',
              padding: '14px 16px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* colour accent strip on top */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: accentBg }} />
            <div style={{
              fontFamily: "'Impact','Arial Narrow',sans-serif",
              fontSize: '28px', lineHeight: 1.0,
              marginBottom: '4px', marginTop: '4px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {value}
            </div>
            <div style={{
              fontFamily: 'monospace', fontSize: '9px', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888',
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Heatmap card ── */}
      <div style={{
        background: '#F8F5EE',
        border: '2px solid #0D0D0D',
        boxShadow: '3px 3px 0 #0D0D0D',
        padding: '16px',
      }}>
        <p style={{
          fontFamily: 'monospace', fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888',
          marginBottom: '14px',
        }}>
          Error × Language Heatmap
        </p>
        <ErrorHeatmap
          profile={profile}
          onCellClick={(cell, et, lang) => setSel({ cell, et, lang })}
        />
      </div>

      {/* ── Cell detail panel ── */}
      {sel !== null && (
        <div style={{
          background: 'white',
          border: '2px solid #0D0D0D',
          boxShadow: '3px 3px 0 #0D0D0D',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          {sel.cell !== null ? (
            <>
              <span style={{ fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.5 }}>
                <strong>{sel.cell.count} error{sel.cell.count !== 1 ? 's' : ''}</strong>
                {' · '}Last in session <strong>{sel.cell.lastSession}</strong>
                {' · '}Problem: <em>{sel.cell.lastProblemTitle}</em>
              </span>
              <span style={{
                background: severity(sel.cell.count).bg,
                color: severity(sel.cell.count).txt,
                fontFamily: 'monospace', fontSize: '10px', fontWeight: 700,
                padding: '3px 12px',
                border: '2px solid #0D0D0D',
                letterSpacing: '0.06em', textTransform: 'uppercase',
                flexShrink: 0,
              }}>
                {severity(sel.cell.count).label}
              </span>
            </>
          ) : (
            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#888' }}>
              No <strong>{fmt(sel.et)}</strong> errors in <strong>{LANG_DISPLAY[sel.lang] ?? sel.lang}</strong> yet — keep going!
            </span>
          )}
        </div>
      )}

    </div>
  );
}
