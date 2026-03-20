import type { DNACell, ErrorType, Language, MistakeDNAProfile } from '@/types';

type RawMemory = {
  error_type: ErrorType;
  language: Language;
  session_number: number;
  problem_title: string;
  solved: boolean;
};

export function buildDNAProfile(userId: string, memories: RawMemory[]): MistakeDNAProfile {
  const failures = (memories ?? []).filter(m => !m.solved);

  if (failures.length === 0) {
    return {
      userId,
      cells: [],
      dominantErrorType: null,
      dominantLanguage: null,
      totalErrors: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  const cellMap = new Map<string, DNACell>();
  for (const m of failures) {
    const key = `${m.error_type}::${m.language}`;
    const ex = cellMap.get(key);
    if (ex) {
      ex.count++;
      if (m.session_number > ex.lastSession) {
        ex.lastSession = m.session_number;
        ex.lastProblemTitle = m.problem_title;
      }
    } else {
      cellMap.set(key, {
        errorType: m.error_type,
        language: m.language,
        count: 1,
        lastSession: m.session_number,
        lastProblemTitle: m.problem_title,
      });
    }
  }

  const cells = Array.from(cellMap.values());

  const errTotals = new Map<string, number>();
  for (const c of cells) errTotals.set(c.errorType, (errTotals.get(c.errorType) ?? 0) + c.count);
  const dominantErrorType = (
    [...errTotals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  ) as ErrorType | null;

  const langTotals = new Map<string, number>();
  for (const c of cells) langTotals.set(c.language, (langTotals.get(c.language) ?? 0) + c.count);
  const dominantLanguage = (
    [...langTotals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  ) as Language | null;

  return {
    userId,
    cells,
    dominantErrorType,
    dominantLanguage,
    totalErrors: failures.length,
    lastUpdated: new Date().toISOString(),
  };
}
