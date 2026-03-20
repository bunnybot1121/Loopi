import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { runAllTestCases } from '@/lib/judge0';
import { classifyError, generateDiagnosis } from '@/lib/groq';
import { writeMemory, getPatternCount, checkImprovement } from '@/lib/hindsight';
import { ErrorType, ThinkingPattern } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { code, language, problem, session_number, timed_mode, time_taken_secs } = await req.json();

    if (!code || !language || !problem) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Step 1: Execute code via Judge0
    const testResults = await runAllTestCases(code, language, problem.test_cases || []);
    const passed = testResults.filter(r => r.passed).length;
    const total = testResults.length;
    const solved = total > 0 && passed === total;
    const stderr = testResults.find(r => r.stderr)?.stderr || '';
    const stdout = testResults.find(r => r.stdout)?.stdout || '';

    // Step 2: Classify error via Groq
    let error_type: ErrorType | null = null;
    let thinking_pattern: ThinkingPattern | null = null;
    let pattern_count = 0;

    const classification = await classifyError(
      code,
      solved ? 'Correct' : (stderr || 'Wrong answer'),
      language,
      problem.description
    );
    error_type = classification.error_type;
    thinking_pattern = classification.thinking_pattern;

    // Step 3: Get pattern count from Hindsight BEFORE writing
    pattern_count = await getPatternCount(userId, thinking_pattern);

    // Step 4: Write to Hindsight
    await writeMemory({
      user_id: userId,
      error_type: error_type || 'logic-error',
      thinking_pattern: thinking_pattern || 'skips_edge_cases',
      language: language || 'python',
      topic: problem.topic || 'arrays',
      difficulty: problem.difficulty || 'medium',
      solved,
      hint_used: false,
      timed_mode: timed_mode || false,
      time_taken_secs: time_taken_secs || 0,
      session_number: session_number || 1,
      timestamp: new Date().toISOString(),
    });

    // Step 5: Check improvement
    const is_improvement = await checkImprovement(userId, problem.topic);

    // Step 6: Generate diagnosis via Groq
    const ai_feedback = await generateDiagnosis(
      code, solved, error_type, thinking_pattern,
      pattern_count + 1, problem.topic || 'arrays', is_improvement
    );

    // Step 7: Map status
    let status: string;
    if (solved) status = 'accepted';
    else if (stderr.includes('compiler') || stderr.includes('SyntaxError')) status = 'compile-error';
    else if (stderr) status = 'runtime-error';
    else status = 'wrong-answer';

    return NextResponse.json({
      status,
      test_cases_passed: passed,
      test_cases_total: total,
      test_results: testResults,
      error_type,
      thinking_pattern,
      ai_feedback,
      is_improvement,
      pattern_occurrence_count: pattern_count + 1,
      solved,
      stdout,
      stderr,
    });
  } catch (err: any) {
    console.error('[submit] error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
