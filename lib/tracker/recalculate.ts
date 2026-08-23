import type { TrackerState, DayStatus, TriggerId } from "./types"
import { dayKey, getElapsed, parseDayKey, startOfDay } from "./utils"

export function recalculateState(state: TrackerState): TrackerState {
  const historyDates = Object.keys(state.history).sort()
  if (historyDates.length === 0) return state

  // 1. Sync relapses array with history
  const validRelapses = state.relapses.filter((r) => {
    const k = dayKey(new Date(r.date))
    return state.history[k] === "relapse"
  })

  const relapseKeysInArray = new Set(validRelapses.map((r) => dayKey(new Date(r.date))))
  
  for (const dateStr of historyDates) {
    if (state.history[dateStr] === "relapse" && !relapseKeysInArray.has(dateStr)) {
      // Adicionado manualmente via calendário
      const localMidday = parseDayKey(dateStr)
      validRelapses.push({
        date: localMidday.toISOString(),
        trigger: "stress", // default
        reflection: "Adicionado manualmente via calendário.",
      })
    }
  }

  validRelapses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // 2. Recalculate streakStart
  let expectedStartMs: number
  if (validRelapses.length > 0) {
    const lastRelapseDate = new Date(validRelapses[validRelapses.length - 1].date)
    expectedStartMs = lastRelapseDate.getTime()
  } else {
    const [y, m, d] = historyDates[0].split("-").map(Number)
    expectedStartMs = new Date(y, m - 1, d, 0, 0, 0, 0).getTime()
  }

  const currentStartMs = new Date(state.streakStart).getTime()
  
  let newStreakStart = state.streakStart
  
  if (validRelapses.length > 0) {
     const lastRelapse = validRelapses[validRelapses.length - 1]
     if (currentStartMs <= new Date(lastRelapse.date).getTime()) {
         newStreakStart = lastRelapse.date
     } else if (validRelapses.length < state.relapses.length) {
         newStreakStart = lastRelapse.date
     }
  } else {
     if (state.relapses.length > 0) {
         const [y, m, d] = historyDates[0].split("-").map(Number)
         newStreakStart = new Date(y, m - 1, d, 0, 0, 0, 0).toISOString()
     }
  }

  // 3. Recalculate bestStreakDays
  let bestStreak = 0
  let currentStreak = 0
  
  const firstDate = parseDayKey(historyDates[0])
  const today = new Date()
  
  for (let d = new Date(firstDate); d <= today; d.setDate(d.getDate() + 1)) {
    const k = dayKey(d)
    if (state.history[k] === "relapse") {
      if (currentStreak > bestStreak) bestStreak = currentStreak
      currentStreak = 0
    } else {
      currentStreak++
    }
  }
  if (currentStreak > bestStreak) bestStreak = currentStreak

  return {
    ...state,
    streakStart: newStreakStart,
    bestStreakDays: Math.max(state.bestStreakDays, bestStreak),
    relapses: validRelapses,
  }
}
