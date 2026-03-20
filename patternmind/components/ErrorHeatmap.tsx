'use client';
import React, { useCallback } from 'react';
import type { MistakeDNAProfile, DNACell, ErrorType, Language } from '@/types';

const ERROR_TYPES: ErrorType[] = [
  'off-by-one', 'null-undefined-access', 'missing-base-case',
  'wrong-complexity', 'edge-case-missed', 'logic-error',
  'syntax-error', 'async-misuse', 'time-limit-exceeded',
];
const LANGUAGES: Language[] = ['python', 'javascript', 'java', 'cpp', 'go', 'rust', 'typescript'];
const LANG_DISPLAY: Record<Language, string> = {
  python: 'Python', javascript: 'JS', java: 'Java',
  cpp: 'C++', go: 'Go', rust: 'Rust', typescript: 'TS',
};

function fmt(e: ErrorType): string {
  return e.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());
}

function cellColor(n: number): { bg: string; fg: string } {
  if (n === 0) return { bg: '#F0EDE5', fg: '#B4B2A9' };
  if (n <= 2)  return { bg: '#FFD6D6', fg: '#7A1F1F' };
  if (n <= 5)  return { bg: '#F09595', fg: '#7A1F1F' };
  if (n <= 9)  return { bg: '#E24B4A', fg: '#FFFFFF' };
  return              { bg: '#A32D2D', fg: '#FFFFFF' };
}

interface Props {
  profile: MistakeDNAProfile;
  onCellClick?: (cell: DNACell | null, et: ErrorType, lang: Language) => void;
}

export default function ErrorHeatmap({ profile, onCellClick }: Props) {
  if (!profile?.cells) return (
    <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#888', padding: '16px' }}>No data yet.</p>
  );

  const getCell = useCallback(
    (et: ErrorType, lang: Language): DNACell =>
      profile.cells.find(c => c.errorType === et && c.language === lang) ??
      { errorType: et, language: lang, count: 0, lastSession: 0, lastProblemTitle: '' },
    [profile.cells],
  );

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '160px repeat(7, 1fr)',
        gap: '3px',
        minWidth: '560px',
      }}>
        {/* Column headers */}
        <div />
        {LANGUAGES.map(l => (
          <div key={l} style={{
            fontFamily: 'monospace', fontSize: '10px', fontWeight: 700,
            textAlign: 'center', color: '#888', paddingBottom: '6px',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            {LANG_DISPLAY[l]}
          </div>
        ))}

        {/* Rows */}
        {ERROR_TYPES.map(et => (
          <React.Fragment key={et}>
            {/* Row label */}
            <div style={{
              fontFamily: 'monospace', fontSize: '11px', color: '#666',
              textAlign: 'right', paddingRight: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              {fmt(et)}
            </div>

            {/* Cells */}
            {LANGUAGES.map(lang => {
              const cell = getCell(et, lang);
              const { bg, fg } = cellColor(cell.count);
              return (
                <div
                  key={lang}
                  onClick={() => onCellClick?.(cell.count > 0 ? cell : null, et, lang)}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = '0.72'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = '1'; }}
                  style={{
                    background: bg, color: fg,
                    border: '2px solid #0D0D0D',
                    height: '34px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontFamily: 'monospace', fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'opacity 0.15s',
                    userSelect: 'none',
                  }}
                >
                  {cell.count === 0 ? '—' : cell.count}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
