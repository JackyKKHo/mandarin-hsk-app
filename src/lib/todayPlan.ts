// The Today screen's daily plan: which new words to learn today and whether
// the speaking rep is done. Stored per device; SRS progress itself syncs via useSRS.

const PLAN_KEY = 'hsk-today-plan'
const LEVEL_KEY = 'hsk-level'

export const NEW_WORDS_PER_DAY = 8

export interface TodayPlan {
  date: string
  newIds: string[]
  spoken: boolean
}

// Same UTC day key that useSRS and useDailyGoal use, so "today" agrees across the app
export function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function loadPlan(): TodayPlan | null {
  try {
    const raw = localStorage.getItem(PLAN_KEY)
    const plan: TodayPlan | null = raw ? JSON.parse(raw) : null
    return plan && plan.date === todayKey() ? plan : null
  } catch {
    return null
  }
}

export function savePlan(plan: TodayPlan) {
  try { localStorage.setItem(PLAN_KEY, JSON.stringify(plan)) } catch { /* storage unavailable */ }
}

export function markSpokenToday() {
  const plan = loadPlan() ?? { date: todayKey(), newIds: [], spoken: false }
  savePlan({ ...plan, spoken: true })
}

export function getSavedLevel(): number {
  try {
    const n = Number(localStorage.getItem(LEVEL_KEY))
    return n >= 1 && n <= 9 ? n : 1
  } catch {
    return 1
  }
}

export function saveLevel(level: number) {
  try { localStorage.setItem(LEVEL_KEY, String(level)) } catch { /* storage unavailable */ }
}
