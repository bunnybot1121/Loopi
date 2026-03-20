import { HindsightClient } from '@vectorize-io/hindsight-client';
import { HindsightMemory, UserProfile, ErrorType, ThinkingPattern, Topic, Language } from '@/types';

const HINDSIGHT_BASE_URL = process.env.HINDSIGHT_BASE_URL || 'https://api.hindsight.vectorize.io';

const client = new HindsightClient({
  baseUrl: HINDSIGHT_BASE_URL,
  apiKey: process.env.HINDSIGHT_API_KEY,
});

// Cache bank existence — avoids calling createBank on every single request
const knownBanks = new Set<string>();

// Each user gets their own memory bank — bankId = userId
function getBankId(userId: string): string {
  return `pm-${userId.replace(/[^a-zA-Z0-9-]/g, '-').substring(0, 55).toLowerCase()}`;
}

// Ensure the user's memory bank exists (cached after first call)
async function ensureBank(userId: string): Promise<string> {
  const bankId = getBankId(userId);
  if (knownBanks.has(bankId)) return bankId;
  try {
    await client.createBank(bankId, {
      reflectMission: 'You are BugHunt, a coding mentor that remembers how a user thinks. Store and recall their error patterns, thinking tendencies, and coding behavior across sessions.',
      retainMission: 'Extract coding session data: error types, thinking patterns, topics, difficulty, solve status, and timestamps.',
      enableObservations: true,
    });
  } catch {
    // Bank may already exist — ignore
  }
  knownBanks.add(bankId);
  return bankId;
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITE — called after every submission
// All structured fields are encoded as tags (Hindsight transforms text but
// preserves tags intact). This is the key insight: tags are our data store.
// ─────────────────────────────────────────────────────────────────────────────
export async function writeMemory(memory: HindsightMemory): Promise<void> {
  const bankId = await ensureBank(memory.user_id);

  // Natural language content for Hindsight's AI to reason about
  const content = `Coding session #${memory.session_number}: ${memory.solved ? 'Solved' : 'Failed'} a ${memory.difficulty} ${memory.topic} problem in ${memory.language}. Error type: ${memory.error_type}. Thinking pattern: ${memory.thinking_pattern}. Time: ${memory.time_taken_secs}s. Hint used: ${memory.hint_used}.`;

  // ALL structured fields encoded as tags for reliable reconstruction
  const tags = [
    `error:${memory.error_type}`,
    `pattern:${memory.thinking_pattern}`,
    `topic:${memory.topic}`,
    `lang:${memory.language}`,
    `diff:${memory.difficulty}`,
    `session:${memory.session_number}`,
    `solved:${memory.solved}`,
    `hint:${memory.hint_used}`,
    `timed:${memory.timed_mode}`,
    `time:${memory.time_taken_secs}`,
    `ts:${memory.timestamp}`,
    `uid:${memory.user_id}`,
  ];

  await client.retain(bankId, content, { tags });
}

// ─────────────────────────────────────────────────────────────────────────────
// PARSE — reconstruct HindsightMemory from tags (not text, since Hindsight
// transforms text content through its AI layer)
// ─────────────────────────────────────────────────────────────────────────────
function parseMemoryItem(item: Record<string, unknown>): HindsightMemory | null {
  try {
    const tags = (item.tags || []) as string[];
    if (tags.length === 0) return null;

    function tagValue(prefix: string): string {
      const found = tags.find(t => t.startsWith(prefix + ':'));
      return found ? found.substring(prefix.length + 1) : '';
    }

    const error_type = tagValue('error') as ErrorType;
    const thinking_pattern = tagValue('pattern') as ThinkingPattern;

    // Must have at least error_type and thinking_pattern to be valid
    if (!error_type || !thinking_pattern) return null;

    return {
      user_id: tagValue('uid') || 'unknown',
      error_type,
      thinking_pattern,
      language: (tagValue('lang') || 'python') as Language,
      topic: (tagValue('topic') || 'arrays') as Topic,
      difficulty: (tagValue('diff') || 'medium') as 'easy' | 'medium' | 'hard',
      solved: tagValue('solved') === 'true',
      hint_used: tagValue('hint') === 'true',
      timed_mode: tagValue('timed') === 'true',
      time_taken_secs: parseInt(tagValue('time') || '0', 10),
      session_number: parseInt(tagValue('session') || '1', 10),
      timestamp: tagValue('ts') || new Date().toISOString(),
    };
  } catch { return null; }
}

// ─────────────────────────────────────────────────────────────────────────────
// READ — called before generating a challenge
// ─────────────────────────────────────────────────────────────────────────────
export async function recallUserProfile(userId: string): Promise<UserProfile> {
  const bankId = await ensureBank(userId);

  let items: Record<string, unknown>[] = [];
  try {
    const result = await client.listMemories(bankId, { limit: 100 });
    items = (result.items || []) as Record<string, unknown>[];
  } catch {
    return getDefaultProfile();
  }

  const parsed: HindsightMemory[] = items.map(parseMemoryItem).filter(Boolean) as HindsightMemory[];

  if (parsed.length === 0) {
    return getDefaultProfile();
  }

  // Calculate dominant thinking pattern
  const patternCounts: Record<string, number> = {};
  parsed.forEach(m => {
    patternCounts[m.thinking_pattern] = (patternCounts[m.thinking_pattern] || 0) + 1;
  });
  const dominant_thinking_pattern = Object.entries(patternCounts)
    .sort((a, b) => b[1] - a[1])[0][0] as ThinkingPattern;

  // Top 3 error types
  const errorCounts: Record<string, number> = {};
  parsed.forEach(m => {
    errorCounts[m.error_type] = (errorCounts[m.error_type] || 0) + 1;
  });
  const top_3_error_types = Object.entries(errorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type) as ErrorType[];

  // Weakest topic (lowest solve rate)
  const topicStats: Record<string, { solved: number; total: number }> = {};
  parsed.forEach(m => {
    if (!topicStats[m.topic]) topicStats[m.topic] = { solved: 0, total: 0 };
    topicStats[m.topic].total++;
    if (m.solved) topicStats[m.topic].solved++;
  });
  const weakestEntry = Object.entries(topicStats)
    .filter(([_, s]) => s.total >= 1)
    .sort((a, b) => (a[1].solved / a[1].total) - (b[1].solved / b[1].total));
  const weakest_topic: Topic = (weakestEntry[0]?.[0] as Topic) || 'trees';

  // Preferred language
  const langCounts: Record<string, number> = {};
  parsed.forEach(m => { langCounts[m.language] = (langCounts[m.language] || 0) + 1; });
  const preferred_language = (Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] as Language) || 'python';

  // Last 3 session solve rates
  const sessions: Record<number, { solved: number; total: number }> = {};
  parsed.forEach(m => {
    if (!sessions[m.session_number]) sessions[m.session_number] = { solved: 0, total: 0 };
    sessions[m.session_number].total++;
    if (m.solved) sessions[m.session_number].solved++;
  });
  const last_3_solve_rates = Object.entries(sessions)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .slice(0, 3)
    .map(([_, s]) => Math.round((s.solved / s.total) * 100));

  const total_sessions = Math.max(...parsed.map(m => m.session_number), 0);
  const solved = parsed.filter(m => m.solved).length;
  const overall_solve_rate = Math.round((solved / parsed.length) * 100);

  // Readiness score formula
  const solveRateScore = overall_solve_rate * 0.40;
  const consistency = Math.min(total_sessions * 10, 100) * 0.25;
  const difficultyTrend = calculateDifficultyTrend(parsed) * 0.20;
  const errorFreq = calculateErrorFrequencyScore(parsed) * 0.15;
  const readiness_score = Math.round(solveRateScore + consistency + difficultyTrend + errorFreq);

  return {
    dominant_thinking_pattern,
    top_3_error_types,
    weakest_topic,
    preferred_language,
    last_3_solve_rates,
    total_sessions,
    overall_solve_rate,
    readiness_score,
  };
}

// Get count of a specific pattern for a user — used in feedback
export async function getPatternCount(userId: string, pattern: ThinkingPattern): Promise<number> {
  const bankId = await ensureBank(userId);
  try {
    const result = await client.listMemories(bankId, { limit: 100 });
    const items = (result.items || []) as Record<string, unknown>[];
    return items.filter(item => {
      const parsed = parseMemoryItem(item);
      return parsed?.thinking_pattern === pattern;
    }).length;
  } catch { return 0; }
}

// Get error count for feedback — "this is the Nth time"
export async function getErrorCount(userId: string, errorType: ErrorType): Promise<number> {
  const bankId = await ensureBank(userId);
  try {
    const result = await client.listMemories(bankId, { limit: 100 });
    const items = (result.items || []) as Record<string, unknown>[];
    return items.filter(item => {
      const parsed = parseMemoryItem(item);
      return parsed?.error_type === errorType;
    }).length;
  } catch { return 0; }
}

// Check if user improved in a topic
export async function checkImprovement(userId: string, topic: string): Promise<boolean> {
  const bankId = await ensureBank(userId);
  try {
    const result = await client.listMemories(bankId, { limit: 30 });
    const items = (result.items || []) as Record<string, unknown>[];
    const parsed = items
      .map(parseMemoryItem)
      .filter((m): m is HindsightMemory => m !== null && m.topic === topic)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (parsed.length < 2) return false;
    const recent = parsed.slice(0, 3);
    const older = parsed.slice(3, 6);
    if (older.length === 0) return false;
    const recentRate = recent.filter(m => m.solved).length / recent.length;
    const olderRate = older.filter(m => m.solved).length / older.length;
    return recentRate > olderRate;
  } catch { return false; }
}

// Get full memory list for dashboard
export async function getRawMemories(userId: string): Promise<HindsightMemory[]> {
  const bankId = await ensureBank(userId);
  try {
    const result = await client.listMemories(bankId, { limit: 100 });
    const items = (result.items || []) as Record<string, unknown>[];
    return items.map(parseMemoryItem).filter((m): m is HindsightMemory => m !== null);
  } catch { return []; }
}

function calculateDifficultyTrend(memories: HindsightMemory[]): number {
  const diffMap: Record<string, number> = { easy: 1, medium: 2, hard: 3 };
  const recent = memories.slice(-10).map(m => diffMap[m.difficulty] || 1);
  const older = memories.slice(-20, -10).map(m => diffMap[m.difficulty] || 1);
  if (!older.length) return 50;
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  return recentAvg >= olderAvg ? 80 : 40;
}

function calculateErrorFrequencyScore(memories: HindsightMemory[]): number {
  const recent10 = memories.slice(-10);
  const older10 = memories.slice(-20, -10);
  if (!older10.length) return 60;
  const recentErrors = recent10.filter(m => !m.solved).length;
  const olderErrors = older10.filter(m => !m.solved).length;
  return recentErrors <= olderErrors ? 80 : 40;
}

export function getDefaultProfile(): UserProfile {
  return {
    dominant_thinking_pattern: 'brute_force_first',
    top_3_error_types: [],
    weakest_topic: 'trees',
    preferred_language: 'python',
    last_3_solve_rates: [],
    total_sessions: 0,
    overall_solve_rate: 0,
    readiness_score: 0,
  };
}
