import type { TrackerState, DayStatus, TriggerId } from "./types"
import { dayKey, getElapsed, parseDayKey } from "./utils"

export function recalculateState(state: TrackerState): TrackerState {
  const historyDates = Object.keys(state.history).filter((k) => Boolean(state.history[k])).sort()

  // 1. Sync relapses array with history
  const validRelapses = (state.relapses || []).filter((r) => {
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
        trigger: "stress",
        reflection: "Adicionado manualmente via histórico.",
      })
    }
  }

  validRelapses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // 2. Find contiguous clean run ending on today / latest date
  let newStreakStart = state.streakStart

  if (validRelapses.length > 0) {
    // Streak starts at the moment of the last relapse (or beginning of the day after)
    const lastRelapse = validRelapses[validRelapses.length - 1]
    const lastRelapseMs = new Date(lastRelapse.date).getTime()
    const currentStartMs = new Date(state.streakStart).getTime()

    // If current streakStart is before the last relapse, reset it to the last relapse
    if (currentStartMs <= lastRelapseMs) {
      newStreakStart = lastRelapse.date
    }
  } else if (historyDates.length > 0) {
    // No relapses: find the earliest clean/crisis date in history
    const earliestHistoryDate = parseDayKey(historyDates[0])
    const earliestHistoryMs = earliestHistoryDate.getTime()
    const currentStartMs = new Date(state.streakStart).getTime()

    // If streakStart is currently after the earliest recorded clean day, move it back to match history
    if (currentStartMs > earliestHistoryMs) {
      newStreakStart = earliestHistoryDate.toISOString()
    }
  }

  // 3. Recalculate bestStreakDays and current active streak
  let bestStreak = 0
  let currentStreak = 0
  
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const startDate = historyDates.length > 0 ? parseDayKey(historyDates[0]) : new Date(newStreakStart)
  const currentDaysElapsed = getElapsed(newStreakStart, Date.now()).days

  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const k = dayKey(d)
    const status = state.history[k]
    if (status === "relapse") {
      if (currentStreak > bestStreak) bestStreak = currentStreak
      currentStreak = 0
    } else if (status === "clean" || status === "crisis") {
      currentStreak++
    }
  }
  if (currentStreak > bestStreak) bestStreak = currentStreak

  return {
    ...state,
    streakStart: newStreakStart,
    bestStreakDays: Math.max(state.bestStreakDays || 0, bestStreak, currentDaysElapsed),
    relapses: validRelapses,
  }
}
