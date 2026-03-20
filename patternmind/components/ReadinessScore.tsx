'use client';

interface ReadinessScoreProps {
  score: number;
  solveRate: number;
  totalSessions: number;
  overallSolveRate: number;
}

const BREAKDOWNS = [
  { label: 'Solve Rate', key: 'solveRate', weight: '40%', color: '#1D9E75' },
  { label: 'Consistency', key: 'consistency', weight: '25%', color: '#534AB7' },
  { label: 'Difficulty Trend', key: 'difficultyTrend', weight: '20%', color: '#857cf0' },
  { label: 'Error Frequency', key: 'errorFreq', weight: '15%', color: '#BA7517' },
];

export default function ReadinessScore({ score, solveRate, totalSessions, overallSolveRate }: ReadinessScoreProps) {
  const consistency = Math.min(totalSessions * 10, 100);
  const difficultyTrend = score > 60 ? 80 : 40;
  const errorFreq = overallSolveRate > 50 ? 75 : 40;

  const values: Record<string, number> = {
    solveRate: overallSolveRate,
    consistency,
    difficultyTrend,
    errorFreq,
  };

  const scoreColor = score >= 75 ? '#1D9E75' : score >= 50 ? '#BA7517' : '#E24B4A';

  return (
    <div className="text-center">
      {/* Big number */}
      <div className="relative inline-flex items-center justify-center mb-4">
        <svg width="160" height="160" className="-rotate-90">
          <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle
            cx="80" cy="80" r="68"
            fill="none"
            stroke={scoreColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 68 * score / 100} ${2 * Math.PI * 68}`}
            style={{ transition: 'stroke-dasharray 1.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black" style={{ color: scoreColor }}>{score}</span>
          <span className="text-gray-500 text-xs font-medium">% ready</span>
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-1">Interview Readiness Score</p>
      <p className="text-gray-600 text-xs mb-6">
        {totalSessions} session{totalSessions !== 1 ? 's' : ''} · powered by Hindsight memory
      </p>

      {/* Breakdown bars */}
      <div className="space-y-3 text-left max-w-xs mx-auto">
        {BREAKDOWNS.map(b => (
          <div key={b.key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">{b.label}</span>
              <span className="text-gray-500">{values[b.key]}% <span className="text-gray-700">× {b.weight}</span></span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${values[b.key]}%`, backgroundColor: b.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
