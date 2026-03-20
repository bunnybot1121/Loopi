'use client';

import { HindsightMemory } from '@/types';

interface SessionTimelineProps {
  memories: HindsightMemory[];
}

const ERROR_LABELS: Record<string, string> = {
  'off-by-one': 'Off-by-one', 'null-undefined-access': 'Null Access',
  'missing-base-case': 'Missing Base Case', 'wrong-complexity': 'Wrong Complexity',
  'edge-case-missed': 'Edge Case Missed', 'logic-error': 'Logic Error',
  'syntax-error': 'Syntax', 'async-misuse': 'Async Misuse', 'time-limit-exceeded': 'TLE',
};

export default function SessionTimeline({ memories }: SessionTimelineProps) {
  if (!memories || memories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 text-sm">
        No sessions yet — start practicing!
      </div>
    );
  }

  // Group by session
  const sessions: Record<number, HindsightMemory[]> = {};
  memories.forEach(m => {
    if (!sessions[m.session_number]) sessions[m.session_number] = [];
    sessions[m.session_number].push(m);
  });

  const sessionList = Object.entries(sessions)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .slice(0, 10);

  return (
    <div className="space-y-3">
      {sessionList.map(([sessionNum, mems]) => {
        const solved = mems.filter(m => m.solved).length;
        const rate = Math.round((solved / mems.length) * 100);
        const topError = mems
          .filter(m => !m.solved)
          .reduce((acc: Record<string, number>, m) => {
            acc[m.error_type] = (acc[m.error_type] || 0) + 1;
            return acc;
          }, {});
        const keyError = Object.entries(topError).sort((a, b) => b[1] - a[1])[0]?.[0];
        const lastTimestamp = mems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]?.timestamp;
        const date = lastTimestamp ? new Date(lastTimestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

        return (
          <div key={sessionNum} className="flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/5 hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#534AB7]/20 flex items-center justify-center text-[#857cf0] text-xs font-bold shrink-0">
              {sessionNum}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white text-xs font-medium">Session {sessionNum}</span>
                <span className="text-gray-600 text-[10px]">{date}</span>
                {keyError && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E24B4A]/10 text-[#E24B4A] border border-[#E24B4A]/20">
                    {ERROR_LABELS[keyError] || keyError}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#534AB7] to-[#1D9E75]"
                    style={{ width: `${rate}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-10 text-right">{rate}%</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-gray-500">{solved}/{mems.length}</div>
              <div className="text-[10px] text-gray-700">solved</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
