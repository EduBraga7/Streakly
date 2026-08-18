import type { TrackerState, DayStatus, TriggerId } from "./types"
import { dayKey, getElapsed } from "./utils"

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
      validRelapses.push({
        date: new Date(`${dateStr}T12:00:00Z`).toISOString(),
        trigger: "stress", // default
        reflection: "Adicionado manualmente via calendário.",
      })
    }
  }

  validRelapses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // 2. Recalculate streakStart
  // Se não houver recaídas, o streak começou no primeiro dia registrado.
  // Caso contrário, começou no dia seguinte à última recaída.
  // Contudo, se a data do streakStart atual for VÁLIDA (depois da última recaída),
  // e for a mesma data que a gente calcularia, mantemos o horário exato original.
  
  let expectedStartMs: number
  if (validRelapses.length > 0) {
    const lastRelapseDate = new Date(validRelapses[validRelapses.length - 1].date)
    // Para simplificar, o novo streak começa no momento exato do registro da recaída.
    // Assim getElapsed contará os dias a partir daquele instante.
    expectedStartMs = lastRelapseDate.getTime()
  } else {
    expectedStartMs = new Date(`${historyDates[0]}T00:00:00Z`).getTime()
  }

  const currentStartMs = new Date(state.streakStart).getTime()
  
  let newStreakStart = state.streakStart
  
  // Se o streakStart atual é ANTES da última recaída (o que é impossível num estado correto), 
  // ou se ele é muito diferente da expectativa (ex: apagamos a última recaída), atualizamos.
  // Para ser seguro e simples:
  if (validRelapses.length > 0) {
     const lastRelapse = validRelapses[validRelapses.length - 1]
     if (currentStartMs <= new Date(lastRelapse.date).getTime()) {
         // Current streak start is invalid, reset to last relapse time
         newStreakStart = lastRelapse.date
     } else if (validRelapses.length < state.relapses.length) {
         // We might have deleted the most recent relapse, so we need to push the streak start back
         newStreakStart = lastRelapse.date
     }
  } else {
     // No relapses at all. If we deleted the only relapse, start from the beginning.
     if (state.relapses.length > 0) {
         newStreakStart = new Date(`${historyDates[0]}T00:00:00Z`).toISOString()
     }
  }

  // 3. Recalculate bestStreakDays
  let bestStreak = 0
  let currentStreak = 0
  
  const firstDate = new Date(`${historyDates[0]}T12:00:00Z`)
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
