'use client';

import { useEffect, useState, useCallback } from 'react';
import { UserProfile } from '@/types';

interface MemoryPanelProps {
  profile: UserProfile | null;
  sessionNumber?: number;
  justSubmitted?: boolean;
}

const PATTERN_LABELS: Record<string, string> = {
  brute_force_first: 'Brute Force First',
  skips_edge_cases: 'Skips Edge Cases',
  over_engineers: 'Over-Engineers',
  recursion_avoidance: 'Recursion Avoidance',
  off_by_one_tendency: 'Off-by-One Tendency',
};

const PATTERN_COLORS: Record<string, string> = {
  brute_force_first: '#FF4EB8',
  skips_edge_cases: '#FF4EB8',
  over_engineers: '#C084FC',
  recursion_avoidance: '#F5C518',
  off_by_one_tendency: '#FF5252',
};

const TOPIC_ABBR: Record<string, string> = {
  arrays: 'ARR', trees: 'TREE', dp: 'DP', graphs: 'GFX',
  strings: 'STR', recursion: 'REC', 'hash-maps': 'HASH',
  sorting: 'SORT', 'linked-lists': 'LL', heaps: 'HEAP',
};

export default function MemoryPanel({ profile: initialProfile, sessionNumber, justSubmitted }: MemoryPanelProps) {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [memoryFlash, setMemoryFlash] = useState(false);

  useEffect(() => { setProfile(initialProfile); }, [initialProfile]);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/memory');
      if (res.ok) { const d = await res.json(); setProfile(d.profile); }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (justSubmitted) {
      fetchProfile();
      setMemoryFlash(true);
      const t = setTimeout(() => setMemoryFlash(false), 3000);
      return () => clearTimeout(t);
    }
  }, [justSubmitted, fetchProfile]);

  const patternColor = profile ? PATTERN_COLORS[profile.dominant_thinking_pattern] || '#FF4EB8' : '#FF4EB8';
  const errorColors = ['#FF5252', '#F5C518', '#00E8C6'];

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#E8E4D9', borderLeft: '3px solid #0D0D0D', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '12px 14px', borderBottom: '2px solid #0D0D0D' }}>
        <p className="font-mono" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          What BugHunt Remembers
        </p>
      </div>

      {!profile || profile.total_sessions === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', padding: '24px', textAlign: 'center' }}>
          <span style={{ fontSize: '28px' }}>🧠</span>
          <p className="font-mono" style={{ fontSize: '10px', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Submit to build profile</p>
        </div>
      ) : (
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Dominant Pattern */}
          <div>
            <p className="label" style={{ marginBottom: '6px' }}>Dominant Pattern</p>
            <div style={{ background: patternColor, border: '2px solid #0D0D0D', padding: '8px 10px', boxShadow: '2px 2px 0 #0D0D0D' }}>
              <p className="font-mono" style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {PATTERN_LABELS[profile.dominant_thinking_pattern]}
              </p>
              <p className="font-mono" style={{ fontSize: '10px', marginTop: '3px', opacity: 0.7 }}>
                You often ignore null root checks in recursion.
              </p>
            </div>
          </div>

          {/* Recurring Errors */}
          {profile.top_3_error_types.length > 0 && (
            <div>
              <p className="label" style={{ marginBottom: '6px' }}>Recurring Errors</p>
              {profile.top_3_error_types.map((e, i) => (
                <div key={e} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="font-mono" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                    {e.replace(/-/g, ' ')}
                  </span>
                  <div style={{ background: errorColors[i] || '#ccc', border: '2px solid #0D0D0D', padding: '1px 7px', minWidth: '28px', textAlign: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '10px', fontWeight: 700 }}>{i + 1}x</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Weakest Links */}
          <div>
            <p className="label" style={{ marginBottom: '6px' }}>Weakest Links</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['heaps', 'dp', profile.weakest_topic].filter(Boolean).map(t => (
                <span
                  key={t}
                  className="badge"
                  style={{
                    background: t === profile.weakest_topic ? '#00E8C6' : '#E8E4D9',
                    fontSize: '10px', fontWeight: 700,
                  }}
                >
                  {TOPIC_ABBR[t] || t?.replace('-', ' ').toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          {/* Readiness */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <p className="label">Readiness</p>
              <span className="font-mono" style={{ fontSize: '12px', fontWeight: 700 }}>{profile.readiness_score}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${profile.readiness_score}%`, background: '#00E8C6' }} />
            </div>
          </div>
        </div>
      )}

      {/* Memory Live Sync footer */}
      <div style={{ marginTop: 'auto', borderTop: '2px solid #0D0D0D', padding: '10px 14px' }}>
        <p className="font-mono" style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px', opacity: 0.5 }}>
          ⚡ Memory Live Sync
        </p>
        <button
          className="btn btn-black"
          style={{ width: '100%', fontSize: '11px', padding: '8px', background: memoryFlash ? '#00E8C6' : '#0D0D0D', color: memoryFlash ? '#0D0D0D' : 'white', transition: 'background 300ms' }}
        >
          {memoryFlash ? '✓ SYNCED' : 'MEMORY UPDATED'}
        </button>
      </div>
    </div>
  );
}
