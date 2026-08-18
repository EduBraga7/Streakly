import type { TrackerState } from "./types"

export const MILESTONES = [1, 3, 7, 14, 30, 60, 90, 180, 365] as const

const MS_PER_DAY = 1000 * 60 * 60 * 24

/** Local `yyyy-mm-dd` key for a given date. */
export function dayKey(date: Date): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, "0")
  const d = `${date.getDate()}`.padStart(2, "0")
  return `${y}-${m}-${d}`
}

export interface Elapsed {
  totalMs: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function getElapsed(streakStart: string, now: number = Date.now()): Elapsed {
  const start = new Date(streakStart).getTime()
  const totalMs = Math.max(0, now - start)
  const totalSeconds = Math.floor(totalMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { totalMs, days, hours, minutes, seconds }
}

/** Fractional days elapsed, used to compute progress toward a milestone. */
export function getFractionalDays(streakStart: string, now: number = Date.now()): number {
  const start = new Date(streakStart).getTime()
  return Math.max(0, (now - start) / MS_PER_DAY)
}

export interface MilestoneProgress {
  target: number
  previous: number
  progress: number // 0..1 within the current milestone segment
  daysToGo: number
  reached: boolean // all milestones cleared
}

export function getMilestoneProgress(fractionalDays: number): MilestoneProgress {
  let previous = 0
  for (const target of MILESTONES) {
    if (fractionalDays < target) {
      const span = target - previous
      const progress = span > 0 ? (fractionalDays - previous) / span : 1
      return {
        target,
        previous,
        progress: Math.min(1, Math.max(0, progress)),
        daysToGo: Math.ceil(target - fractionalDays),
        reached: false,
      }
    }
    previous = target
  }
  const last = MILESTONES[MILESTONES.length - 1]
  return { target: last, previous: last, progress: 1, daysToGo: 0, reached: true }
}

/** Compact, humane label like "14 dias, 06h 32m 08s". */
export function formatElapsed(e: Elapsed): string {
  const dLabel = e.days === 1 ? "dia" : "dias"
  const hh = `${e.hours}`.padStart(2, "0")
  const mm = `${e.minutes}`.padStart(2, "0")
  const ss = `${e.seconds}`.padStart(2, "0")
  return `${e.days} ${dLabel}, ${hh}h ${mm}m ${ss}s`
}

/** The last `count` days (oldest first) with their recorded status. */
export function getRecentDays(
  history: TrackerState["history"],
  count = 7,
  now: number = Date.now(),
) {
  const out: { date: Date; key: string; status: TrackerState["history"][string] | null }[] = []
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now - i * MS_PER_DAY)
    const key = dayKey(date)
    out.push({ date, key, status: history[key] ?? null })
  }
  return out
}

/** Count of clean days logged in the current calendar month. */
export function cleanDaysThisMonth(
  history: TrackerState["history"],
  now: number = Date.now(),
): number {
  const ref = new Date(now)
  const prefix = `${ref.getFullYear()}-${`${ref.getMonth() + 1}`.padStart(2, "0")}`
  return Object.entries(history).filter(
    ([key, status]) => key.startsWith(prefix) && status === "clean",
  ).length
}

/** Most frequent relapse trigger id, or null when there are no relapses. */
export function mostFrequentTrigger(state: TrackerState): string | null {
  if (state.relapses.length === 0) return null
  const counts = new Map<string, number>()
  for (const r of state.relapses) {
    counts.set(r.trigger, (counts.get(r.trigger) ?? 0) + 1)
  }
  let best: string | null = null
  let max = -1
  for (const [trigger, n] of counts) {
    if (n > max) {
      max = n
      best = trigger
    }
  }
  return best
}

export function getTriggersFrequency(state: TrackerState) {
  if (state.relapses.length === 0) return []

  const counts = new Map<string, number>()
  for (const r of state.relapses) {
    counts.set(r.trigger, (counts.get(r.trigger) ?? 0) + 1)
  }

  const out = Array.from(counts.entries()).map(([id, count]) => {
    const label = state.habit?.triggers.find(t => t.id === id)?.label || id
    return { id, label, count }
  })

  // Sort descending
  out.sort((a, b) => b.count - a.count)
  return out
}

export function getRelapsesByDayOfWeek(state: TrackerState) {
  const weekDays = [
    { day: "Dom", fullDay: "Domingo", count: 0 },
    { day: "Seg", fullDay: "Segunda-feira", count: 0 },
    { day: "Ter", fullDay: "Terça-feira", count: 0 },
    { day: "Qua", fullDay: "Quarta-feira", count: 0 },
    { day: "Qui", fullDay: "Quinta-feira", count: 0 },
    { day: "Sex", fullDay: "Sexta-feira", count: 0 },
    { day: "Sáb", fullDay: "Sábado", count: 0 },
  ]

  for (const r of state.relapses) {
    const d = new Date(r.date)
    const dayIndex = d.getDay() // 0 = Sunday, 1 = Monday...
    weekDays[dayIndex].count++
  }

  return weekDays
}
