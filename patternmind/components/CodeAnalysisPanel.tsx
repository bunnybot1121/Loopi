'use client';

import { useState, useEffect } from 'react';

interface CodeAnalysis {
  bugLocation: { description: string; lineHint: string };
  whyItFailed: string;
  whatWentWrong: string;
  betterApproach: string;
  keyInsight: string;
}

interface TestResult {
  passed: boolean;
  stdout: string;
  stderr: string;
  expected: string;
  status: string;
}

interface CodeAnalysisPanelProps {
  code: string;
  language: string;
  testResults: TestResult[];
  problemTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CodeAnalysisPanel({
  code, language, testResults, problemTitle, isOpen, onClose,
}: CodeAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('whyItFailed');

  const hasFailed = testResults.some(r => !r.passed);

  useEffect(() => {
    if (isOpen && hasFailed && !analysis) {
      fetchAnalysis();
    }
  }, [isOpen, hasFailed]);

  async function fetchAnalysis() {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, testResults, problemTitle }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      }
    } catch (e) {
      console.error('Analysis error:', e);
    }
    setLoading(false);
  }

  // Reset analysis when new results come in
  useEffect(() => {
    setAnalysis(null);
    setExpandedSection('whyItFailed');
  }, [code, testResults.length]);

  if (!isOpen) return null;

  const failedCount = testResults.filter(r => !r.passed).length;
  const passedCount = testResults.filter(r => r.passed).length;

  return (
    <div style={{
      width: '320px', minWidth: '320px',
      background: '#1a1a1a',
      borderLeft: '3px solid #F5C518',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      animation: 'slideInRight 0.25s ease-out',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '2px solid #333',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#222',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🔍</span>
          <span style={{
            fontFamily: 'monospace', fontSize: '10px', fontWeight: 700,
            color: '#F5C518', textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            Bug Analysis
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: '1px solid #555', color: '#888',
            width: '24px', height: '24px', cursor: 'pointer',
            fontFamily: 'monospace', fontSize: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>
      </div>

      {/* Test Summary Bar */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #333', background: '#1e1e1e' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {testResults.map((r, i) => (
            <div key={i} style={{
              width: '24px', height: '24px',
              background: r.passed ? '#00E8C6' : '#FF5252',
              border: '2px solid #0D0D0D',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'monospace', fontSize: '10px', fontWeight: 700,
            }}>
              {i + 1}
            </div>
          ))}
          <span style={{
            fontFamily: 'monospace', fontSize: '10px', color: '#888',
            marginLeft: '8px',
          }}>
            {passedCount} passed · {failedCount} failed
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
        {loading ? (
          <div style={{
            padding: '40px 20px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: '32px', height: '32px', border: '3px solid #333',
              borderTopColor: '#F5C518', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#888' }}>
              Analyzing your code...
            </p>
            <p style={{ fontFamily: 'monospace', fontSize: '9px', color: '#555' }}>
              BugHunt is tracing through your logic
            </p>
          </div>
        ) : analysis ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Bug Location */}
            <div style={{
              padding: '12px 14px', borderBottom: '1px solid #333',
              background: '#2a1a1a',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px' }}>📍</span>
                <span style={{
                  fontFamily: 'monospace', fontSize: '9px', fontWeight: 700,
                  color: '#FF5252', textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>Bug Location</span>
              </div>
              <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#eee', lineHeight: 1.5 }}>
                {analysis.bugLocation.description}
              </p>
              {analysis.bugLocation.lineHint && (
                <span style={{
                  fontFamily: 'monospace', fontSize: '9px',
                  color: '#F5C518', marginTop: '4px', display: 'inline-block',
                }}>
                  → {analysis.bugLocation.lineHint}
                </span>
              )}
            </div>

            {/* Expandable Sections */}
            <AnalysisSection
              emoji="❓"
              title="Why It Failed"
              content={analysis.whyItFailed}
              sectionKey="whyItFailed"
              expanded={expandedSection}
              onToggle={setExpandedSection}
              accentColor="#FF5252"
            />

            <AnalysisSection
              emoji="🔎"
              title="What Went Wrong"
              content={analysis.whatWentWrong}
              sectionKey="whatWentWrong"
              expanded={expandedSection}
              onToggle={setExpandedSection}
              accentColor="#F5C518"
            />

            <AnalysisSection
              emoji="💡"
              title="Better Approach"
              content={analysis.betterApproach}
              sectionKey="betterApproach"
              expanded={expandedSection}
              onToggle={setExpandedSection}
              accentColor="#00E8C6"
            />

            {/* Key Insight - always visible */}
            <div style={{
              padding: '14px', margin: '12px 14px',
              background: '#F5C518', border: '2px solid #0D0D0D',
              boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px' }}>🧠</span>
                <span style={{
                  fontFamily: 'monospace', fontSize: '9px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>Key Insight</span>
              </div>
              <p style={{
                fontFamily: 'monospace', fontSize: '12px',
                color: '#222', lineHeight: 1.5, fontWeight: 500,
              }}>
                {analysis.keyInsight}
              </p>
            </div>

            {/* Re-analyze button */}
            <div style={{ padding: '12px 14px' }}>
              <button
                onClick={() => { setAnalysis(null); fetchAnalysis(); }}
                style={{
                  width: '100%', padding: '8px',
                  background: '#333', border: '2px solid #555',
                  color: '#ccc', fontFamily: 'monospace', fontSize: '10px',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  cursor: 'pointer',
                }}
              >
                🔄 Re-analyze
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '30px 20px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#666' }}>
              Submit code to get AI analysis
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function AnalysisSection({
  emoji, title, content, sectionKey, expanded, onToggle, accentColor,
}: {
  emoji: string;
  title: string;
  content: string;
  sectionKey: string;
  expanded: string | null;
  onToggle: (key: string | null) => void;
  accentColor: string;
}) {
  const isOpen = expanded === sectionKey;

  return (
    <div style={{ borderBottom: '1px solid #333' }}>
      <button
        onClick={() => onToggle(isOpen ? null : sectionKey)}
        style={{
          width: '100%', padding: '10px 14px',
          background: isOpen ? '#2a2a2a' : 'transparent',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = '#252525'; }}
        onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px' }}>{emoji}</span>
          <span style={{
            fontFamily: 'monospace', fontSize: '10px', fontWeight: 700,
            color: accentColor, textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {title}
          </span>
        </div>
        <span style={{
          fontFamily: 'monospace', fontSize: '10px', color: '#666',
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0)',
          transition: 'transform 0.2s',
        }}>▶</span>
      </button>

      {isOpen && (
        <div style={{
          padding: '0 14px 12px 14px',
          background: '#2a2a2a',
          animation: 'fadeIn 0.2s ease',
        }}>
          <p style={{
            fontFamily: 'monospace', fontSize: '11px',
            color: '#ccc', lineHeight: 1.6,
          }}>
            {content}
          </p>
        </div>
      )}
    </div>
  );
}
