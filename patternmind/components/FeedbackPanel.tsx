'use client';

import { ErrorType, ThinkingPattern } from '@/types';

interface FeedbackPanelProps {
  status: 'accepted' | 'wrong-answer' | 'time-limit-exceeded' | 'runtime-error' | 'compile-error' | null;
  testCasesPassed: number;
  testCasesTotal: number;
  errorType?: ErrorType | null;
  thinkingPattern?: ThinkingPattern | null;
  patternOccurrenceCount?: number;
  aiFeedback?: string;
  isImprovement?: boolean;
  topic?: string;
}

const PATTERN_LABELS: Record<string, string> = {
  brute_force_first: 'Brute Force First',
  skips_edge_cases: 'Skips Edge Cases',
  over_engineers: 'Over-Engineers',
  recursion_avoidance: 'Recursion Avoidance',
  off_by_one_tendency: 'Off-by-One Tendency',
};

export default function FeedbackPanel({
  status, testCasesPassed, testCasesTotal,
  errorType, thinkingPattern, patternOccurrenceCount,
  aiFeedback, isImprovement, topic,
}: FeedbackPanelProps) {
  if (!status) return null;

  const isAccepted = status === 'accepted';
  const statusBg = isAccepted ? '#00E8C6' : '#FF5252';

  return (
    <div style={{ borderTop: '3px solid #0D0D0D', background: '#E8E4D9' }}>
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Status row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ background: statusBg, border: '2px solid #0D0D0D', padding: '5px 14px', boxShadow: '2px 2px 0 #0D0D0D' }}>
            <span className="font-mono" style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {isAccepted ? '✓ Accepted' : `✗ ${status.split('-').map((w: string) => w[0].toUpperCase() + w.slice(1)).join(' ')}`}
            </span>
          </div>
          <span className="font-mono" style={{ fontSize: '12px' }}>{testCasesPassed} / {testCasesTotal} test cases passed</span>
          {isImprovement && (
            <div style={{ background: '#00E8C6', border: '2px solid #0D0D0D', padding: '3px 10px' }}>
              <span className="font-mono" style={{ fontSize: '10px', fontWeight: 700 }}>📈 IMPROVEMENT DETECTED</span>
            </div>
          )}
        </div>

        {/* Pattern / error badges */}
        {!isAccepted && (errorType || thinkingPattern) && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {errorType && (
              <span className="badge badge-white" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                error: {errorType.replace(/-/g, ' ')}
              </span>
            )}
            {thinkingPattern && (
              <span className="badge" style={{ background: '#FF4EB8', fontSize: '10px', textTransform: 'uppercase' }}>
                pattern: {PATTERN_LABELS[thinkingPattern] || thinkingPattern}
              </span>
            )}
            {patternOccurrenceCount && patternOccurrenceCount > 1 && (
              <span className="badge badge-yellow" style={{ fontSize: '10px' }}>
                THIS IS THE {patternOccurrenceCount}{patternOccurrenceCount === 2 ? 'ND' : patternOccurrenceCount === 3 ? 'RD' : 'TH'} TIME
              </span>
            )}
          </div>
        )}

        {/* AI Feedback */}
        {aiFeedback && (
          <div style={{ background: 'white', border: '2px solid #0D0D0D', padding: '12px 14px', boxShadow: '3px 3px 0 #0D0D0D' }}>
            <p className="font-mono" style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px', opacity: 0.5 }}>
              BugHunt says
            </p>
            <p className="font-mono" style={{ fontSize: '12px', lineHeight: 1.55, color: '#222' }}>{aiFeedback}</p>
          </div>
        )}

        {/* Memory updated status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00E8C6', border: '2px solid #0D0D0D' }} />
          <span className="font-mono" style={{ fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Memory updated — Hindsight has recorded this session
          </span>
        </div>
      </div>
    </div>
  );
}
