// Exam context for the Stats page. HSK exams are cumulative — the HSK 4 exam assumes every
// HSK 1–4 word — so "exam coverage" counts the level and everything below it.

// First official sitting on the 2026 syllabus for HSK 1–6, as announced by Chinese Testing
// International in Sep 2026 (registration closes ~16 Nov paper / ~3 Dec computer).
// Update this when the next dates are published on chinesetest.cn.
export const NEXT_EXAM = { date: '2026-12-13', name: 'first HSK 3.0 exam', maxLevel: 6 }

/** Whole days from today (UTC) until an ISO date; negative once it has passed. */
export function daysUntil(dateISO: string, now = new Date()): number {
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Math.round((Date.parse(`${dateISO}T00:00:00Z`) - start) / 86_400_000)
}

/** For each level, % of all words from HSK 1 up to that level that are mastered. */
export function cumulativeCoverage(stats: { mastered: number; total: number }[]): number[] {
  let mastered = 0
  let total = 0
  return stats.map(s => {
    mastered += s.mastered
    total += s.total
    return total > 0 ? Math.round((mastered / total) * 100) : 0
  })
}
