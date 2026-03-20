import Groq from 'groq-sdk';
import { UserProfile, ErrorType, ThinkingPattern, Problem, Topic, Language } from '@/types';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
const MODEL = 'qwen/qwen3-32b';

function cleanJSON(text: string): string {
  // Remove <think>...</think> blocks from qwen3
  text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  // Remove markdown code fences
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  // Extract JSON object/array
  const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  return jsonMatch ? jsonMatch[1] : text;
}

// CLASSIFY error type and thinking pattern from submission
export async function classifyError(
  code: string,
  errorOutput: string,
  language: string,
  problemDescription: string
): Promise<{ error_type: ErrorType; thinking_pattern: ThinkingPattern; confidence: number; explanation: string }> {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [{
        role: 'user',
        content: `/no_think
You are an expert coding coach. Classify this coding submission.

PROBLEM: ${problemDescription.substring(0, 300)}
LANGUAGE: ${language}
CODE:
${code.substring(0, 800)}

ERROR OUTPUT:
${errorOutput.substring(0, 300)}

Return ONLY valid JSON (no markdown, no explanation outside JSON):
{
  "error_type": "one of: off-by-one, null-undefined-access, missing-base-case, wrong-complexity, edge-case-missed, logic-error, syntax-error, async-misuse, time-limit-exceeded",
  "thinking_pattern": "one of: brute_force_first, skips_edge_cases, over_engineers, recursion_avoidance, off_by_one_tendency",
  "confidence": 0.8,
  "explanation": "brief explanation"
}`
      }],
      temperature: 0.1,
      max_tokens: 400,
    });

    const text = response.choices[0].message.content || '{}';
    return JSON.parse(cleanJSON(text));
  } catch {
    return { error_type: 'logic-error', thinking_pattern: 'skips_edge_cases', confidence: 0.5, explanation: 'Could not classify' };
  }
}

export async function generateProblem(
  profile: UserProfile, 
  sessionNumber: number,
  target_difficulty?: string,
  target_topic?: string
): Promise<Problem> {
  const hasProfile = profile.total_sessions > 0;
  
  let targetDifficulty = target_difficulty || 'easy';
  if (!target_difficulty && hasProfile) {
    if (profile.readiness_score >= 75) targetDifficulty = 'hard';
    else if (profile.readiness_score >= 40) targetDifficulty = 'medium';
  }
  
  const targetTopic = target_topic || profile.weakest_topic || 'arrays';

  const memoryContext = hasProfile
    ? `The user has completed ${profile.total_sessions} sessions.
Dominant thinking pattern: ${profile.dominant_thinking_pattern.replace(/_/g, ' ')}
Top errors: ${profile.top_3_error_types.join(', ') || 'none yet'}
Weakest topic: ${profile.weakest_topic}
Preferred language: ${profile.preferred_language}
Recent solve rates: ${profile.last_3_solve_rates.map(r => `${r}%`).join(', ') || 'none yet'}`
    : "This is the user's first session. Generate a medium difficulty warm-up problem.";

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [{
        role: 'user',
        content: `/no_think
You are BugHunt, a coding mentor with persistent memory across sessions.

${memoryContext}

Generate a coding problem that:
${hasProfile
  ? `- Targets their thinking pattern: "${profile.dominant_thinking_pattern.replace(/_/g, ' ')}"
- Focuses on the topic: ${targetTopic}
- Matches their skill level with difficulty: ${targetDifficulty}`
  : `- Is a good introductory problem for a new user
- Relates to topic: ${targetTopic}
- Matches their skill level with difficulty: ${targetDifficulty}`}

Return ONLY valid JSON (no markdown, no code fences):
{
  "title": "Problem title",
  "difficulty": "${targetDifficulty}",
  "topic": "${targetTopic}",
  "description": "Full problem description with context",
  "examples": [{"input": "example input", "output": "example output"}],
  "test_cases": [
    {"input": "test1", "expected": "out1"},
    {"input": "test2", "expected": "out2"},
    {"input": "edge case", "expected": "edge out"}
  ],
  "hint": "A directional hint that does NOT give away the answer",
  "generated_reason": "One sentence explaining why this problem was chosen based on memory"
}`
      }],
      temperature: 0.7,
      max_tokens: 700,
    });

    const text = response.choices[0].message.content || '{}';
    const parsed = JSON.parse(cleanJSON(text));
    return {
      ...parsed,
      id: `ai-${Date.now()}`,
      is_ai_generated: true,
      is_weak_area_match: hasProfile,
    };
  } catch {
    return getFallbackProblem();
  }
}

// SOCRATIC coaching — never gives the answer
export async function generateCoachResponse(
  code: string,
  errorOutput: string,
  problemDescription: string,
  errorType: ErrorType,
  patternOccurrenceCount: number,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are BugHunt, a Socratic coding coach. You NEVER give the solution or corrected code directly.
You ask ONE targeted question per response that helps the user discover the bug themselves.
You reference past patterns when relevant: the user has made this type of error ${patternOccurrenceCount} time(s).
Keep responses under 4 sentences. Always end with a question.
Error type: ${errorType}. Pattern occurrence count: ${patternOccurrenceCount}. Use /no_think mode.`,
        },
        ...conversationHistory,
        {
          role: 'user',
          content: `Problem: ${problemDescription.substring(0, 300)}\n\nMy code:\n${code.substring(0, 600)}\n\nError: ${errorOutput.substring(0, 200)}`,
        },
      ],
      temperature: 0.6,
      max_tokens: 250,
    });

    return response.choices[0].message.content?.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
      || 'What happens when you trace through your code with the failing test case?';
  } catch {
    return 'What happens when you trace through your code with the failing test case?';
  }
}

// PATTERN DIAGNOSIS — the feedback shown after submission
export async function generateDiagnosis(
  code: string,
  solved: boolean,
  errorType: ErrorType | null,
  thinkingPattern: ThinkingPattern | null,
  patternCount: number,
  topic: string,
  isImprovement: boolean
): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [{
        role: 'system',
        content: `/no_think
You are BugHunt. Write a 2-3 sentence diagnosis after a code submission.
${solved
  ? `The user solved it correctly. ${isImprovement ? 'This is an improvement — they previously failed similar problems.' : 'Good solve.'}`
  : `Error: ${errorType}. Pattern: ${thinkingPattern?.replace(/_/g, ' ')}. This pattern has appeared ${patternCount} time(s).`
}
${solved ? 'Acknowledge the improvement if any. Be encouraging but specific.' : 'Name the pattern explicitly. Reference the count. Ask ONE guiding question at the end.'}
Be direct, specific, and reference the memory count. Do not give the solution.`,
      }, {
        role: 'user',
        content: `Code submitted for ${topic} problem. ${solved
          ? `Correct solution.${isImprovement ? ' User improved.' : ''}`
          : `Wrong. Error: ${errorType}. Pattern: ${thinkingPattern?.replace(/_/g, ' ')}. Occurred ${patternCount} times total.`}`,
      }],
      temperature: 0.5,
      max_tokens: 200,
    });

    return response.choices[0].message.content?.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
      || (solved ? 'Well done!' : 'Keep working through it.');
  } catch {
    return solved ? 'Great work solving this problem!' : 'Keep at it — review your edge cases carefully.';
  }
}

// JD TO SKILL GAP ANALYZER
export async function analyzeJobDescription(jd: string, profile: UserProfile): Promise<{
  required_topics: string[];
  gap_topics: string[];
  prep_plan: { day: number; task: string; topic: string; reason: string }[];
  summary: string;
}> {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [{
        role: 'user',
        content: `/no_think
You are BugHunt. Analyze this job description and cross-reference with the user's coding weakness profile.

JOB DESCRIPTION:
${jd.substring(0, 1500)}

USER WEAKNESS PROFILE:
- Weakest topic: ${profile.weakest_topic}
- Top errors: ${profile.top_3_error_types.join(', ') || 'none yet'}
- Dominant pattern: ${profile.dominant_thinking_pattern.replace(/_/g, ' ')}
- Readiness score: ${profile.readiness_score}%

Generate a targeted 2-week prep plan. Return ONLY valid JSON (no markdown):
{
  "required_topics": ["topic1", "topic2"],
  "gap_topics": ["topics overlapping JD needs and user weaknesses"],
  "prep_plan": [
    {"day": 1, "task": "What to practice", "topic": "topic", "reason": "Why this targets the gap"}
  ],
  "summary": "2-sentence summary of the gap analysis"
}`,
      }],
      temperature: 0.5,
      max_tokens: 1500,
    });

    const text = response.choices[0].message.content || '{}';
    return JSON.parse(cleanJSON(text));
  } catch {
    return { required_topics: [], gap_topics: [], prep_plan: [], summary: 'Could not analyze the job description.' };
  }
}

function getFallbackProblem(): Problem {
  return {
    id: `fallback-${Date.now()}`,
    title: 'Two Sum',
    difficulty: 'easy',
    topic: 'arrays',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' }],
    test_cases: [
      { input: '[2,7,11,15]\n9', expected: '[0,1]' },
      { input: '[3,2,4]\n6', expected: '[1,2]' },
      { input: '[3,3]\n6', expected: '[0,1]' },
    ],
    hint: 'Think about using a hash map to store values you have already seen. What information would be useful to store?',
    generated_reason: 'Warm-up problem — welcome to BugHunt! Complete this to start building your memory profile.',
    is_ai_generated: true,
    is_weak_area_match: false,
  };
}
