'use client';

import { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import { useRouter } from 'next/navigation';

const LANGUAGES = [
  { value: 'python',     label: 'Python 3.11' },
  { value: 'javascript', label: 'JavaScript'   },
  { value: 'typescript', label: 'TypeScript'   },
  { value: 'java',       label: 'Java'         },
  { value: 'cpp',        label: 'C++'          },
  { value: 'go',         label: 'Go'           },
  { value: 'rust',       label: 'Rust'         },
];

const DIFFICULTIES = [
  { value: 'easy',   label: 'Easy Mode' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard',   label: 'Hard' },
  { value: 'all',    label: 'Dynamic AI' }, // AI chooses based on readiness score
];

export default function SettingsPage() {
  const router = useRouter();

  // Settings State
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['python', 'javascript', 'typescript', 'java', 'cpp', 'go', 'rust']);
  const [defaultDiff, setDefaultDiff] = useState<string>('all');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load existing settings
    const savedLangs = localStorage.getItem('pm_preferred_languages');
    if (savedLangs) {
      try { setSelectedLangs(JSON.parse(savedLangs)); } catch {}
    }

    const savedDiff = localStorage.getItem('pm_default_difficulty');
    if (savedDiff) {
      setDefaultDiff(savedDiff);
    }
  }, []);

  const toggleLanguage = (lang: string) => {
    setSelectedLangs(prev => {
      const isSelected = prev.includes(lang);
      if (isSelected && prev.length === 1) return prev; // prevent zero languages
      return isSelected ? prev.filter(l => l !== lang) : [...prev, lang];
    });
    setIsSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem('pm_preferred_languages', JSON.stringify(selectedLangs));
    localStorage.setItem('pm_default_difficulty', defaultDiff);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000); // Visual feedback
  };



  return (
    <div style={{ minHeight: '100vh', background: '#E8E4D9', display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      
      <main style={{ flex: 1, padding: '40px 24px', marginTop: '52px', maxWidth: '600px', margin: '52px auto 0 auto', width: '100%' }}>
        <h1 className="font-display" style={{ fontSize: '48px', color: '#0D0D0D', marginBottom: '8px' }}>SETTINGS</h1>
        <p className="font-mono" style={{ fontSize: '13px', color: '#555', marginBottom: '32px' }}>Personalise your PatternMind experience.</p>
        
        {/* Preferred Languages Section */}
        <section className="brut-card" style={{ padding: '24px', boxShadow: '4px 4px 0 #0D0D0D', marginBottom: '24px' }}>
          <h2 className="font-mono" style={{ fontSize: '16px', fontWeight: 700, color: '#0D0D0D', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Preferred Languages
          </h2>
          <p className="font-mono" style={{ fontSize: '12px', color: '#444', marginBottom: '16px', lineHeight: 1.5 }}>
            Select the languages you want to work on. These will be available in your Code Editor to choose from while synthesizing solutions.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {LANGUAGES.map(lang => {
              const active = selectedLangs.includes(lang.value);
              return (
                <div
                  key={lang.value}
                  onClick={() => toggleLanguage(lang.value)}
                  style={{
                    padding: '8px 16px',
                    border: '2px solid #0D0D0D',
                    borderRadius: '2px',
                    background: active ? '#00E8C6' : '#fff',
                    color: '#0D0D0D',
                    cursor: 'pointer',
                    boxShadow: active ? '2px 2px 0 #0D0D0D' : 'none',
                    transform: active ? 'translate(-2px, -2px)' : 'none',
                    transition: 'all 0.1s ease',
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span className="font-mono" style={{ fontSize: '12px', fontWeight: active ? 700 : 400 }}>{lang.label}</span>
                  {active && <span style={{ fontSize: '14px', lineHeight: 1 }}>✓</span>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Default Difficulty Section */}
        <section className="brut-card" style={{ padding: '24px', boxShadow: '4px 4px 0 #0D0D0D', marginBottom: '32px' }}>
          <h2 className="font-mono" style={{ fontSize: '16px', fontWeight: 700, color: '#0D0D0D', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Base Difficulty
          </h2>
          <p className="font-mono" style={{ fontSize: '12px', color: '#444', marginBottom: '16px', lineHeight: 1.5 }}>
            Select the default difficulty level when you start your practice sessions. If set to &quot;Dynamic AI&quot;, the Hindsight AI will choose automatically based on your Readiness Score.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {DIFFICULTIES.map(diff => {
              const active = defaultDiff === diff.value;
              return (
                <div
                  key={diff.value}
                  onClick={() => { setDefaultDiff(diff.value); setIsSaved(false); }}
                  style={{
                    padding: '8px 16px',
                    border: '2px solid #0D0D0D',
                    borderRadius: '2px',
                    background: active ? '#F5C518' : '#fff',
                    color: '#0D0D0D',
                    cursor: 'pointer',
                    boxShadow: active ? '2px 2px 0 #0D0D0D' : 'none',
                    transform: active ? 'translate(-2px, -2px)' : 'none',
                    transition: 'all 0.1s ease',
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span className="font-mono" style={{ fontSize: '12px', fontWeight: active ? 700 : 400 }}>{diff.label}</span>
                  {active && <span style={{ fontSize: '14px', lineHeight: 1 }}>•</span>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Save Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={saveSettings}
            className="btn btn-pink"
            style={{ fontSize: '14px', padding: '12px 32px' }}
          >
            {isSaved ? '✓ Saved Successfully' : '💾 Save Settings'}
          </button>
          
          <button
            onClick={() => router.push('/practice')}
            className="btn btn-white"
            style={{ fontSize: '14px', padding: '12px 32px' }}
          >
            Next Challenge → 
          </button>
        </div>

      </main>
    </div>
  );
}
