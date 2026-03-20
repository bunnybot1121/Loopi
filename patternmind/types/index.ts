export type ErrorType =
  | 'off-by-one'
  | 'null-undefined-access'
  | 'missing-base-case'
  | 'wrong-complexity'
  | 'edge-case-missed'
  | 'logic-error'
  | 'syntax-error'
  | 'async-misuse'
  | 'time-limit-exceeded';

export type ThinkingPattern =
  | 'brute_force_first'
  | 'skips_edge_cases'
  | 'over_engineers'
  | 'recursion_avoidance'
  | 'off_by_one_tendency';

export type Language = 'python' | 'javascript' | 'java' | 'cpp' | 'go' | 'rust' | 'typescript';

export type Topic = 'arrays' | 'trees' | 'dp' | 'graphs' | 'strings' | 'recursion' | 'hash-maps' | 'sorting' | 'linked-lists';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface HindsightMemory {
  user_id: string;
  error_type: ErrorType;
  thinking_pattern: ThinkingPattern;
  language: Language;
  topic: Topic;
  difficulty: Difficulty;
  solved: boolean;
  hint_used: boolean;
  timed_mode: boolean;
  time_taken_secs: number;
  session_number: number;
  timestamp: string;
}

export interface UserProfile {
  dominant_thinking_pattern: ThinkingPattern;
  top_3_error_types: ErrorType[];
  weakest_topic: Topic;
  preferred_language: Language;
  last_3_solve_rates: number[];
  total_sessions: number;
  overall_solve_rate: number;
  readiness_score: number;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  topic: Topic;
  description: string;
  examples: { input: string; output: string }[];
  test_cases: { input: string; expected: string }[];
  hint: string;
  generated_reason?: string;
  is_ai_generated?: boolean;
  is_weak_area_match?: boolean;
}

export interface SubmissionResult {
  status: 'accepted' | 'wrong-answer' | 'time-limit-exceeded' | 'runtime-error' | 'compile-error';
  stdout: string;
  stderr: string;
  runtime_ms: number;
  memory_kb: number;
  test_cases_passed: number;
  test_cases_total: number;
  error_type?: ErrorType;
  thinking_pattern?: ThinkingPattern;
  ai_feedback: string;
  is_improvement: boolean;
  pattern_occurrence_count: number;
}

export interface TestCaseResult {
  passed: boolean;
  stdout: string;
  stderr: string;
  expected: string;
  status: string;
  time: string;
  memory: number;
}

// ── Mistake DNA Profile ───────────────────────────────────────────────────────

export interface DNACell {
  errorType: ErrorType;
  language: Language;
  count: number;
  lastSession: number;
  lastProblemTitle: string;
}

export interface MistakeDNAProfile {
  userId: string;
  cells: DNACell[];
  dominantErrorType: ErrorType | null;
  dominantLanguage: Language | null;
  totalErrors: number;
  lastUpdated: string;
}

