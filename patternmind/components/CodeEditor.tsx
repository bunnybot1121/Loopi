'use client';

import { useEffect, useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

const STARTER_CODE: Record<string, string> = {
  python:     'class Solution:\n    def solve(self):\n        # write your solution here\n        pass\n',
  javascript: 'function solution() {\n  // write your solution here\n}\n',
  typescript: 'function solution(): void {\n  // write your solution here\n}\n',
  java:       'class Solution {\n    public void solve() {\n        // write your solution here\n    }\n}\n',
  cpp:        '#include <iostream>\nusing namespace std;\n\nint main() {\n    // write your solution here\n    return 0;\n}\n',
  go:         'package main\n\nfunc main() {\n    // write your solution here\n}\n',
  rust:       'fn main() {\n    // write your solution here\n}\n',
};

const LANGUAGES = [
  { value: 'python',     label: 'Python 3.11' },
  { value: 'javascript', label: 'JavaScript'   },
  { value: 'typescript', label: 'TypeScript'   },
  { value: 'java',       label: 'Java'         },
  { value: 'cpp',        label: 'C++'          },
  { value: 'go',         label: 'Go'           },
  { value: 'rust',       label: 'Rust'         },
];

interface CodeEditorProps {
  onRun: (code: string, language: string, quick?: boolean) => void;
  onSubmit: (code: string, language: string) => void;
  isRunning?: boolean;
  isSubmitting?: boolean;
  testResults?: { passed: boolean; stdout: string; stderr: string; expected: string; status: string }[];
  consoleLines?: string[];
}

export default function CodeEditor({ onRun, onSubmit, isRunning, isSubmitting, testResults, consoleLines }: CodeEditorProps) {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(STARTER_CODE['python']);
  const [availableLanguages, setAvailableLanguages] = useState(LANGUAGES);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('pm_preferred_languages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as string[];
        if (parsed.length > 0) {
          const filtered = LANGUAGES.filter(l => parsed.includes(l.value));
          setAvailableLanguages(filtered);
          if (!parsed.includes(language)) {
            setLanguage(filtered[0].value);
            setCode(STARTER_CODE[filtered[0].value] || '');
          }
        }
      } catch {}
    }
  }, []);

  const handleMount: OnMount = (editor) => { editorRef.current = editor; };

  const handleLangChange = (lang: string) => {
    setLanguage(lang);
    setCode(STARTER_CODE[lang] || '');
  };

  const allPassed = testResults && testResults.length > 0 && testResults.every(r => r.passed);
  const filename = `solution.${language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0D0D0D' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: '40px', borderBottom: '2px solid #2a2a2a', background: '#111' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5252' }} />
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F5C518' }} />
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00E8C6' }} />
        </div>
        <span className="font-mono" style={{ fontSize: '11px', color: '#fff', marginLeft: '12px', letterSpacing: '0.06em' }}>
          📄 {filename.toUpperCase()}
        </span>
        <select
          value={language}
          onChange={e => handleLangChange(e.target.value)}
          style={{
            marginLeft: 'auto',
            background: '#1a1a1a', border: '1px solid #333', color: '#ccc',
            fontFamily: 'Space Mono, monospace', fontSize: '11px',
            padding: '3px 8px', cursor: 'pointer', letterSpacing: '0.04em',
          }}
        >
          {availableLanguages.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </div>

      {/* Monaco */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Editor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language}
          value={code}
          onChange={val => setCode(val || '')}
          onMount={handleMount}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "'Space Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbersMinChars: 3,
            padding: { top: 12, bottom: 12 },
            wordWrap: 'on',
            renderLineHighlight: 'gutter',
            smoothScrolling: true,
            cursorSmoothCaretAnimation: 'on',
          }}
        />
      </div>

      {/* Run / Submit bar */}
      <div style={{ borderTop: '2px solid #0D0D0D', background: '#E8E4D9', display: 'flex', alignItems: 'center', padding: '10px 14px', gap: '10px' }}>
        <button
          onClick={() => onRun(code, language, true)}
          disabled={isRunning || isSubmitting}
          className="btn btn-cyan"
          style={{ minWidth: '90px', fontSize: '12px', opacity: (isRunning || isSubmitting) ? 0.5 : 1 }}
        >
          ▶ {isRunning ? 'Running...' : 'Run'}
        </button>
        <button
          onClick={() => onSubmit(code, language)}
          disabled={isRunning || isSubmitting}
          className="btn btn-pink"
          style={{ minWidth: '100px', fontSize: '12px', opacity: (isRunning || isSubmitting) ? 0.5 : 1 }}
        >
          ⚡ {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <span style={{ fontSize: '16px', cursor: 'pointer', opacity: 0.4 }}>⚙</span>
          <span style={{ fontSize: '16px', cursor: 'pointer', opacity: 0.4 }}>⛶</span>
        </div>
      </div>

      {/* Console */}
      <div style={{ borderTop: '2px solid #0D0D0D', background: '#0d0d0d', maxHeight: '160px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '6px 14px', borderBottom: '1px solid #222', gap: '8px' }}>
          <span className="font-mono" style={{ fontSize: '10px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Console Output</span>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: allPassed ? '#00E8C6' : '#F5C518', marginLeft: 'auto' }} />
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F5C518' }} />
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: allPassed ? '#0D0D0D' : '#FF5252' }} />
        </div>
        <div style={{ overflowY: 'auto', padding: '8px 14px', flex: 1 }}>
          {testResults && testResults.length > 0 ? (
            testResults.map((r, i) => (
              <p key={i} className="font-mono" style={{ fontSize: '11px', color: r.passed ? '#00E8C6' : '#FF5252', lineHeight: 1.6 }}>
                [{new Date().toLocaleTimeString()}] Test Case {i + 1}: Root=[...] ...{' '}
                <strong>{r.passed ? 'PASSED' : `FAILED — got: ${r.stdout || r.stderr || 'no output'} expected: ${r.expected}`}</strong>
              </p>
            ))
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#222', border: '2px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>🤖</div>
              <div>
                <p className="font-mono" style={{ fontSize: '11px', color: '#555', letterSpacing: '0.06em' }}>AI DIAGNOSIS PENDING</p>
                <p className="font-mono" style={{ fontSize: '10px', color: '#444' }}>Submit code to update your cognitive profile.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
