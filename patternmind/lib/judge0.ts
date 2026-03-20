/**
 * Code Execution Engine — powered by Gemini via OpenRouter
 *
 * Uses Gemini (via OpenRouter) to evaluate code against test cases.
 * No external code execution service needed.
 *
 * Set OPENROUTER_API_KEY in .env.local
 */

export interface TestResult {
  passed: boolean;
  stdout: string;
  stderr: string;
  expected: string;
  status: string;
  time?: string;
}

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-001';

function cleanJSON(text: string): string {
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  return match ? match[1] : text;
}

async function evaluateWithGemini(
  code: string,
  language: string,
  testCases: { input: string; expected: string }[]
): Promise<TestResult[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured in .env.local');
  }

  const tcList = testCases.map((tc, i) =>
    `Test ${i + 1}: Input: ${tc.input} | Expected Output: ${tc.expected}`
  ).join('\n');

  const prompt = `You are a precise code executor. Mentally execute this ${language} code for EACH test case. Return the EXACT output the program would produce.

CODE:
\`\`\`${language}
${code.substring(0, 3000)}
\`\`\`

TEST CASES:
${tcList}

For each test case, determine:
1. What the program actually outputs to stdout
2. Any runtime errors or stderr
3. Whether the output matches the expected output EXACTLY

Return ONLY valid JSON (no markdown fences, no explanation):
{
  "results": [
    {
      "test_number": 1,
      "stdout": "actual output the code produces",
      "stderr": "",
      "status": "ok or compile-error or runtime-error",
      "passed": true
    }
  ]
}

RULES:
- Execute the code EXACTLY as written — do not fix bugs
- Compare output with expected output using exact string match (trimmed)
- If there's a syntax error, ALL tests get status "compile-error"
- If there's a runtime error for a specific input, that test gets "runtime-error"
- stdout must be the EXACT text the program would print, nothing more`;

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://bughunt.dev',
      'X-Title': 'BugHunt',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 1000,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '{}';
  const parsed = JSON.parse(cleanJSON(text));
  const results: { test_number: number; stdout: string; stderr: string; status: string; passed: boolean }[] = parsed.results || [];

  return testCases.map((tc, i) => {
    const r = results[i] || { stdout: '', stderr: 'Evaluation failed', status: 'error', passed: false };
    return {
      passed: r.passed,
      stdout: (r.stdout || '').trim(),
      stderr: (r.stderr || '').trim(),
      expected: tc.expected.trim(),
      status: r.status || 'error',
    };
  });
}

function normalizeOutput(raw: string): string {
  return raw.trim().replace(/\r\n/g, '\n').replace(/\s+$/, '');
}

export async function runAllTestCases(
  code: string,
  language: string,
  testCases: { input: string; expected: string }[]
): Promise<TestResult[]> {
  if (!testCases || testCases.length === 0) return [];

  try {
    return await evaluateWithGemini(code, language, testCases);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Execution failed';
    return testCases.map(tc => ({
      passed: false,
      stdout: '',
      stderr: message,
      expected: normalizeOutput(tc.expected),
      status: 'error',
    }));
  }
}
