import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-001';

function cleanJSON(text: string): string {
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const match = text.match(/(\{[\s\S]*\})/);
  return match ? match[1] : text;
}

export async function POST(req: NextRequest) {
  try {
    const { code, language, testResults, problemTitle } = await req.json();

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Build the failed test cases summary
    const failures = (testResults || [])
      .map((r: { passed: boolean; stdout: string; stderr: string; expected: string; status: string }, i: number) => {
        if (r.passed) return null;
        return `Test ${i + 1}: Got "${r.stdout || r.stderr || 'no output'}" but expected "${r.expected}" [status: ${r.status}]`;
      })
      .filter(Boolean)
      .join('\n');

    const prompt = `You are BugHunt, an expert AI coding mentor. A student submitted code that FAILED some test cases. Analyze their code and explain what went wrong.

PROBLEM: ${problemTitle || 'Coding Challenge'}
LANGUAGE: ${language}

STUDENT'S CODE:
\`\`\`${language}
${code.substring(0, 3000)}
\`\`\`

FAILED TEST CASES:
${failures || 'All tests failed'}

Analyze the code and return ONLY valid JSON (no markdown, no explanation outside JSON):
{
  "bugLocation": {
    "description": "Which specific part of the code has the bug",
    "lineHint": "Approximate line or function where the issue is"
  },
  "whyItFailed": "Clear, concise explanation of WHY this code produces wrong output. Be specific about the logic error — don't just say 'it has a bug'. Explain the exact flaw in their reasoning.",
  "whatWentWrong": "Describe what the code actually does step-by-step for the failing test case, so the student can see WHERE their logic diverges from the correct behavior.",
  "betterApproach": "Explain what the student should do differently. Don't give the full solution — give a HINT that guides them to fix it themselves. Use Socratic questioning if possible.",
  "keyInsight": "One sentence that captures the core lesson from this mistake. Something memorable they can carry to future problems."
}`;

    // Use OpenRouter (Gemini) if available, else Groq
    const isOpenRouter = !!process.env.OPENROUTER_API_KEY;
    const url = isOpenRouter ? OPENROUTER_URL : 'https://api.groq.com/openai/v1/chat/completions';
    const model = isOpenRouter ? MODEL : 'qwen/qwen3-32b';

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...(isOpenRouter ? { 'HTTP-Referer': 'https://bughunt.dev', 'X-Title': 'BugHunt' } : {}),
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `AI API error: ${errText}` }, { status: 500 });
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '{}';
    const analysis = JSON.parse(cleanJSON(text));

    return NextResponse.json(analysis);
  } catch (err) {
    console.error('Analyze error:', err);
    return NextResponse.json({
      bugLocation: { description: 'Could not determine', lineHint: 'Unknown' },
      whyItFailed: 'Analysis failed — try submitting again.',
      whatWentWrong: '',
      betterApproach: 'Review the failing test cases and trace through your code manually.',
      keyInsight: 'When in doubt, trace your code step by step with the failing input.',
    });
  }
}
