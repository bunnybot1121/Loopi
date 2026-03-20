'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import NavBar from '@/components/NavBar';
import ProblemPanel from '@/components/ProblemPanel';
import CodeEditor from '@/components/CodeEditor';
import MemoryPanel from '@/components/MemoryPanel';
import FeedbackPanel from '@/components/FeedbackPanel';
import SessionReviewDrawer from '@/components/SessionReviewDrawer';
import CodeAnalysisPanel from '@/components/CodeAnalysisPanel';
import { Problem, UserProfile } from '@/types';

export default function PracticePage() {
  const { user } = useUser();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProblem, setIsLoadingProblem] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [lastCode, setLastCode] = useState('');
  const [lastLanguage, setLastLanguage] = useState('python');
  const sessionNumber = useRef(1);

  useEffect(() => { fetchChallenge(); }, []);

  async function fetchChallenge() {
    setIsLoadingProblem(true);
    setFeedback(null);
    setTestResults([]);
    try {
      const defaultDiff = localStorage.getItem('pm_default_difficulty');
      const payload: any = { session_number: sessionNumber.current };
      if (defaultDiff && defaultDiff !== 'all') {
        payload.target_difficulty = defaultDiff;
      }

      const res = await fetch('/api/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setProblem(data.problem);
        setProfile(data.profile);
        sessionNumber.current = (data.profile?.total_sessions || 0) + 1;
      }
    } catch (e) { console.error(e); }
    setIsLoadingProblem(false);
  }

  async function handleRun(code: string, language: string, quick?: boolean) {
    if (!problem) return;
    setIsRunning(true);
    setLastCode(code);
    setLastLanguage(language);
    try {
      const testCases = quick ? problem.test_cases.slice(0, 2) : problem.test_cases;
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, problem: { ...problem, test_cases: testCases }, session_number: sessionNumber.current, timed_mode: false, time_taken_secs: 0 }),
      });
      if (res.ok) {
        const data = await res.json();
        const results = data.test_results || [];
        setTestResults(results);
        // Auto-open analysis panel if any test failed
        if (results.some((r: { passed: boolean }) => !r.passed)) {
          setAnalysisOpen(true);
        } else {
          setAnalysisOpen(false);
        }
      }
    } catch (e) { console.error(e); }
    setIsRunning(false);
  }

  async function handleSubmit(code: string, language: string) {
    if (!problem) return;
    setIsSubmitting(true);
    setJustSubmitted(false);
    setLastCode(code);
    setLastLanguage(language);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, problem, session_number: sessionNumber.current, timed_mode: false, time_taken_secs: 0 }),
      });
      if (res.ok) {
        const data = await res.json();
        const results = data.test_results || [];
        setTestResults(results);
        setFeedback(data);
        setJustSubmitted(true);
        setDrawerOpen(true);
        // Auto-open analysis if tests failed
        if (results.some((r: { passed: boolean }) => !r.passed)) {
          setAnalysisOpen(true);
        } else {
          setAnalysisOpen(false);
        }
        setTimeout(() => setJustSubmitted(false), 100);
      }
    } catch (e) { console.error(e); }
    setIsSubmitting(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#E8E4D9' }}>
      <NavBar readinessScore={profile?.readiness_score} />

      <div style={{ display: 'flex', flex: 1, minHeight: 0, paddingTop: '52px' }}>
        {/* Problem Panel */}
        <div style={{ width: '280px', flexShrink: 0, borderRight: '3px solid #0D0D0D', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#F5F0E5' }}>
          <ProblemPanel problem={problem} isLoading={isLoadingProblem} />
        </div>

        {/* Center: Editor + console + feedback */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, minHeight: 0 }}>
            <CodeEditor
              onRun={handleRun}
              onSubmit={handleSubmit}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
              testResults={testResults}
            />
          </div>
          {feedback && (
            <FeedbackPanel
              status={feedback.status}
              testCasesPassed={feedback.test_cases_passed}
              testCasesTotal={feedback.test_cases_total}
              errorType={feedback.error_type}
              thinkingPattern={feedback.thinking_pattern}
              patternOccurrenceCount={feedback.pattern_occurrence_count}
              aiFeedback={feedback.ai_feedback}
              isImprovement={feedback.is_improvement}
              topic={problem?.topic}
            />
          )}
          {feedback?.solved && (
            <div style={{ borderTop: '2px solid #0D0D0D', padding: '10px 16px', background: '#E8E4D9', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={fetchChallenge} className="btn btn-cyan" style={{ fontSize: '12px' }}>
                Next Challenge →
              </button>
            </div>
          )}
        </div>

        {/* Inline Code Analysis Panel — appears when tests fail */}
        {analysisOpen && testResults.length > 0 && (
          <CodeAnalysisPanel
            code={lastCode}
            language={lastLanguage}
            testResults={testResults}
            problemTitle={problem?.title || 'Coding Challenge'}
            isOpen={analysisOpen}
            onClose={() => setAnalysisOpen(false)}
          />
        )}

        {/* Memory Panel */}
        <div style={{ width: '220px', flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <MemoryPanel profile={profile} sessionNumber={sessionNumber.current} justSubmitted={justSubmitted} />
        </div>
      </div>

      {/* Session Review Drawer */}
      <SessionReviewDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sessionNumber={sessionNumber.current}
        data={feedback ? {
          status: feedback.status ?? 'wrong-answer',
          solved: feedback.solved ?? false,
          testCasesPassed: feedback.test_cases_passed ?? 0,
          testCasesTotal: feedback.test_cases_total ?? 0,
          errorType: feedback.error_type ?? null,
          thinkingPattern: feedback.thinking_pattern ?? null,
          patternOccurrenceCount: feedback.pattern_occurrence_count ?? 0,
          aiFeedback: feedback.ai_feedback ?? '',
          isImprovement: feedback.is_improvement ?? false,
        } : null}
      />
    </div>
  );
}
