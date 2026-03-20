'use client';

import { useState, useEffect } from 'react';
import type { ErrorType, ThinkingPattern } from '@/types';

const PATTERN_LABELS: Record<string, string> = {
  brute_force_first: 'Brute Force First',
  skips_edge_cases: 'Skips Edge Cases',
  over_engineers: 'Over-Engineers',
  recursion_avoidance: 'Recursion Avoidance',
  off_by_one_tendency: 'Off-by-One Tendency',
};

const PATTERN_TIPS: Record<string, string> = {
  brute_force_first: 'Try sketching the optimal approach before coding. Ask: "Can I do better than O(n²)?"',
  skips_edge_cases: 'Before writing code, list 3 edge cases: empty input, single element, duplicates.',
  over_engineers: 'Solve the simplest version first. Only add complexity when tests demand it.',
  recursion_avoidance: 'Practice writing recursive solutions first, then convert to iterative if needed.',
  off_by_one_tendency: 'Use inclusive/exclusive notation. Write boundary conditions BEFORE the loop body.',
};

interface SessionReviewData {
  status: string;
  solved: boolean;
  testCasesPassed: number;
  testCasesTotal: number;
  errorType: ErrorType | null;
  thinkingPattern: ThinkingPattern | null;
  patternOccurrenceCount: number;
  aiFeedback: string;
  isImprovement: boolean;
}

interface SessionReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: SessionReviewData | null;
  sessionNumber: number;
}

function ordinalSuffix(n: number): string {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

export default function SessionReviewDrawer({ isOpen, onClose, data, sessionNumber }: SessionReviewDrawerProps) {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimateIn(true));
      });
    } else {
      setAnimateIn(false);
      const t = setTimeout(() => setVisible(false), 350);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!visible || !data) return null;

  const solved = data.solved;
  const headerBg = solved ? '#00E8C6' : '#FF5252';
  const percentage = data.testCasesTotal > 0
    ? Math.round((data.testCasesPassed / data.testCasesTotal) * 100)
    : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(13,13,13,0.4)',
          zIndex: 998,
          opacity: animateIn ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '380px', maxWidth: '90vw',
        background: '#F5F0E5',
        borderLeft: '3px solid #0D0D0D',
        zIndex: 999,
        transform: animateIn ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>

        {/* ── Header ── */}
        <div style={{ background: headerBg, border: '0', borderBottom: '3px solid #0D0D0D', padding: '20px 20px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{
                fontFamily: 'monospace', fontSize: '9px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.12em',
                opacity: 0.7, marginBottom: '4px',
              }}>
                Session #{sessionNumber} Review
              </p>
              <h2 style={{
                fontFamily: "'Impact','Arial Narrow',sans-serif",
                fontSize: '32px', lineHeight: 1.0, color: '#0D0D0D',
              }}>
                {solved ? 'SOLVED ✓' : 'NOT YET'}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '32px', height: '32px',
                background: 'white', border: '2px solid #0D0D0D',
                boxShadow: '2px 2px 0 #0D0D0D',
                cursor: 'pointer', fontWeight: 700, fontSize: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>

          {/* Test case progress bar */}
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '10px', fontWeight: 700 }}>
                TEST CASES
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: '10px', fontWeight: 700 }}>
                {data.testCasesPassed}/{data.testCasesTotal} ({percentage}%)
              </span>
            </div>
            <div style={{ height: '8px', background: 'rgba(0,0,0,0.15)', border: '2px solid #0D0D0D' }}>
              <div style={{
                height: '100%', width: `${percentage}%`,
                background: solved ? '#0D0D0D' : '#F5C518',
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
        </div>

        {/* ── Content sections ── */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>

          {/* Improvement badge */}
          {data.isImprovement && (
            <div style={{
              background: '#00E8C6', border: '2px solid #0D0D0D',
              boxShadow: '3px 3px 0 #0D0D0D',
              padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span style={{ fontSize: '20px' }}>📈</span>
              <div>
                <p style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700 }}>
                  IMPROVEMENT DETECTED
                </p>
                <p style={{ fontFamily: 'monospace', fontSize: '10px', opacity: 0.7 }}>
                  You're doing better than your previous attempts on this topic!
                </p>
              </div>
            </div>
          )}

          {/* Error Analysis */}
          {!solved && data.errorType && (
            <div style={{ background: 'white', border: '2px solid #0D0D0D', boxShadow: '3px 3px 0 #0D0D0D' }}>
              <div style={{
                background: '#FF5252', padding: '8px 14px',
                borderBottom: '2px solid #0D0D0D',
              }}>
                <p style={{ fontFamily: 'monospace', fontSize: '10px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  🔍 Error Analysis
                </p>
              </div>
              <div style={{ padding: '12px 14px' }}>
                <p style={{
                  fontFamily: "'Impact','Arial Narrow',sans-serif",
                  fontSize: '20px', textTransform: 'uppercase', marginBottom: '4px',
                }}>
                  {data.errorType.replace(/-/g, ' ')}
                </p>
                <p style={{ fontFamily: 'monospace', fontSize: '10px', color: '#888' }}>
                  This is the {ordinalSuffix(data.patternOccurrenceCount)} time BugHunt has seen this pattern
                </p>
              </div>
            </div>
          )}

          {/* Thinking Pattern */}
          {data.thinkingPattern && (
            <div style={{ background: 'white', border: '2px solid #0D0D0D', boxShadow: '3px 3px 0 #0D0D0D' }}>
              <div style={{
                background: '#FF4EB8', padding: '8px 14px',
                borderBottom: '2px solid #0D0D0D',
              }}>
                <p style={{ fontFamily: 'monospace', fontSize: '10px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  🧠 Thinking Pattern
                </p>
              </div>
              <div style={{ padding: '12px 14px' }}>
                <p style={{
                  fontFamily: "'Impact','Arial Narrow',sans-serif",
                  fontSize: '18px', textTransform: 'uppercase', marginBottom: '6px',
                }}>
                  {PATTERN_LABELS[data.thinkingPattern] ?? data.thinkingPattern.replace(/_/g, ' ')}
                </p>
                <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#555', lineHeight: 1.5 }}>
                  {PATTERN_TIPS[data.thinkingPattern] ?? 'Focus on understanding the root cause before implementing a fix.'}
                </p>
              </div>
            </div>
          )}

          {/* AI Coaching */}
          {data.aiFeedback && (
            <div style={{ background: '#F5C518', border: '2px solid #0D0D0D', boxShadow: '3px 3px 0 #0D0D0D' }}>
              <div style={{ padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '18px' }}>🤖</span>
                  <p style={{ fontFamily: 'monospace', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    BugHunt Says
                  </p>
                </div>
                <p style={{ fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.6, color: '#222' }}>
                  {data.aiFeedback}
                </p>
              </div>
            </div>
          )}

          {/* What to do next */}
          <div style={{ background: 'white', border: '2px solid #0D0D0D', boxShadow: '3px 3px 0 #0D0D0D', padding: '14px' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
              ⚡ What to do next
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {solved ? (
                <>
                  <Tip emoji="🎯" text="Try solving it in a different language" />
                  <Tip emoji="⏱" text="Re-attempt under timed mode for speed training" />
                  <Tip emoji="📈" text="Move to a harder difficulty to push your limits" />
                </>
              ) : (
                <>
                  {data.errorType === 'off-by-one' && <Tip emoji="📏" text="Draw the array indices on paper — mark start, end, and mid" />}
                  {data.errorType === 'missing-base-case' && <Tip emoji="🌳" text="Write the base case FIRST, before any recursive calls" />}
                  {data.errorType === 'null-undefined-access' && <Tip emoji="🔒" text="Add a null check at line 1 — what if the input is empty?" />}
                  {data.errorType === 'edge-case-missed' && <Tip emoji="📋" text="List 3 edge cases before writing any code" />}
                  <Tip emoji="🔄" text="Re-read the problem statement — what constraint did you miss?" />
                  <Tip emoji="🤔" text="Walk through your code with the failing test case by hand" />
                </>
              )}
            </div>
          </div>

          {/* Memory sync status */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 0', marginTop: 'auto',
          }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: '#00E8C6', border: '2px solid #0D0D0D',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ fontFamily: 'monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888' }}>
              Session recorded to Hindsight Memory
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}

function Tip({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
      <span style={{ fontSize: '14px', flexShrink: 0 }}>{emoji}</span>
      <p style={{ fontFamily: 'monospace', fontSize: '11px', lineHeight: 1.4, color: '#444' }}>{text}</p>
    </div>
  );
}
