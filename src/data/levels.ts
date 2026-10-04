// HSK levels as used across the app, following the official 2026 syllabus:
// HSK 1–6, then one advanced band "HSK 7–9" (a single exam, 5,600 words), stored as level 7.

export const LEVELS = [1, 2, 3, 4, 5, 6, 7] as const
export const TOP_LEVEL = 7

/** "1" … "6", and "7–9" for the advanced band */
export function levelLabel(level: number): string {
  return level >= TOP_LEVEL ? '7–9' : String(level)
}

/** Clamp any number (including old links to HSK 8 or 9) to a valid level */
export function toLevel(n: unknown): number {
  const v = Math.floor(Number(n))
  if (!Number.isFinite(v) || v < 1) return 1
  return Math.min(v, TOP_LEVEL)
}
