import { useState, useMemo } from 'react'

const KEY = 'hsk-milestones-v1'

export interface Milestone {
  id: string
  icon: string
  title: string
  desc: string
}

type CheckFn = (totalMastered: number, streak: number, levelPcts: number[]) => boolean

const SPECS: Array<Milestone & { check: CheckFn }> = [
  { id: 'm10',   icon: '🌱', title: 'First Steps',        desc: '10 words mastered',        check: m => m >= 10 },
  { id: 'm50',   icon: '📚', title: 'Getting Started',    desc: '50 words mastered',        check: m => m >= 50 },
  { id: 'm100',  icon: '💯', title: 'Century Club',       desc: '100 words mastered',       check: m => m >= 100 },
  { id: 'm250',  icon: '🏅', title: 'Quarter Thousand',   desc: '250 words mastered',       check: m => m >= 250 },
  { id: 'm500',  icon: '🥈', title: 'Five Hundred',       desc: '500 words mastered',       check: m => m >= 500 },
  { id: 'm1000', icon: '🥇', title: 'One Thousand',       desc: '1,000 words mastered',     check: m => m >= 1000 },
  { id: 'm2500', icon: '🏆', title: 'Road to Fluency',    desc: '2,500 words mastered',     check: m => m >= 2500 },
  { id: 's3',    icon: '🔥', title: 'On Fire',            desc: '3-day streak',              check: (_, s) => s >= 3 },
  { id: 's7',    icon: '🔥', title: 'Week Warrior',       desc: '7-day streak',              check: (_, s) => s >= 7 },
  { id: 's30',   icon: '🔥', title: 'Monthly Master',     desc: '30-day streak',             check: (_, s) => s >= 30 },
  { id: 's100',  icon: '⚡', title: 'Centurion',          desc: '100-day streak',            check: (_, s) => s >= 100 },
  { id: 's365',  icon: '🐉', title: 'Year of the Dragon', desc: '365-day streak',            check: (_, s) => s >= 365 },
  ...[1,2,3,4,5,6,7,8,9].map((l, i) => ({
    id: `hsk${l}`,
    icon: '🏮',
    title: `HSK ${l} Ready`,
    desc: `Mastered 70% of HSK ${l}`,
    check: (_: number, __: number, p: number[]) => (p[i] ?? 0) >= 70,
  })),
]

function loadClaimed(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]')) }
  catch { return new Set() }
}

export function useMilestones(totalMastered: number, streak: number, levelPcts: number[]) {
  const [claimed, setClaimed] = useState<Set<string>>(loadClaimed)
  const pctKey = levelPcts.join(',')

  const pending = useMemo(
    () => SPECS.filter(m => m.check(totalMastered, streak, levelPcts) && !claimed.has(m.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totalMastered, streak, pctKey, claimed]
  )

  function claim(id: string) {
    setClaimed(prev => {
      const next = new Set(prev)
      next.add(id)
      localStorage.setItem(KEY, JSON.stringify([...next]))
      return next
    })
  }

  return { pending, claim }
}
