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

/** Parses a local `yyyy-mm-dd` string into a local Date set to midday (12:00:00) to avoid timezone/DST drift */
export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, m - 1, d, 12, 0, 0, 0)
}

/** Returns the start of day (00:00:00.000) for a given local date */
export function startOfDay(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
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

export interface HealthMilestone {
  day: number
  title: string
  description: string
  category: "physical" | "mental" | "financial"
}

export const HEALTH_RECOVERY_MILESTONES: HealthMilestone[] = [
  {
    day: 1,
    title: "Primeiras 24 Horas",
    description: "Seu corpo inicia a desintoxicação primária; a ansiedade atinge o primeiro pico e começa a se estabilizar.",
    category: "physical",
  },
  {
    day: 3,
    title: "Pico de Abstinência Físico Superado",
    description: "A maior parte das toxinas físicas foi metabolizada; a clareza mental e a percepção sensorial começam a melhorar.",
    category: "physical",
  },
  {
    day: 7,
    title: "1 Semana: Equilíbrio Químico",
    description: "Os níveis basais de dopamina e ritmo circadiano começam a se reequilibrar. Sono mais profundo e reparador.",
    category: "mental",
  },
  {
    day: 14,
    title: "2 Semanas: Neuroplasticidade Ativa",
    description: "Novos caminhos neurais saudáveis estão se formando. O autocontrole consciente e a energia aumentam substancialmente.",
    category: "mental",
  },
  {
    day: 30,
    title: "1 Mês: Estabilização da Dopamina",
    description: "Redução drástica na intensidade dos impulsos compulsivos. Maior foco, disposição e estabilidade emocional.",
    category: "mental",
  },
  {
    day: 60,
    title: "2 Meses: Consolidação de Hábito",
    description: "O novo comportamento saudável torna-se a resposta padrão do cérebro para momentos de tédio ou estresse.",
    category: "mental",
  },
  {
    day: 90,
    title: "3 Meses: Reboot Neural Completo",
    description: "Restauração profunda do córtex pré-frontal e da sensibilidade dos receptores de recompensa cerebral.",
    category: "physical",
  },
  {
    day: 180,
    title: "6 Meses: Transformação de Identidade",
    description: "Você não se define mais pelo hábito antigo. Alta resiliência psicológica e sensação genuína de liberdade.",
    category: "mental",
  },
  {
    day: 365,
    title: "1 Ano: Liberdade Plena e Saúde Restaurada",
    description: "Recorde de 1 ano. Os riscos de recaída caem a níveis mínimos e sua vitalidade e autoestima estão no ápice.",
    category: "physical",
  },
]

/** Computes total money saved based on elapsed fractional days and daily cost. */
export function calculateSavings(
  streakStart: string,
  dailyCost: number = 0,
  now: number = Date.now(),
): number {
  if (!dailyCost || dailyCost <= 0) return 0
  const fractional = getFractionalDays(streakStart, now)
  return Math.round(fractional * dailyCost * 100) / 100
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

export function getMoodFrequency(state: TrackerState) {
  const counts: Record<string, number> = {
    great: 0,
    good: 0,
    neutral: 0,
    stressed: 0,
    bad: 0,
  }

  if (state.dayLogs) {
    for (const log of Object.values(state.dayLogs)) {
      if (log.mood && counts[log.mood] !== undefined) {
        counts[log.mood]++
      }
    }
  }

  return [
    { label: "😃 Radiante", mood: "great", count: counts.great, fill: "#10b981" },
    { label: "😊 Bem", mood: "good", count: counts.good, fill: "#3b82f6" },
    { label: "😐 Neutro", mood: "neutral", count: counts.neutral, fill: "#94a3b8" },
    { label: "😫 Estressado", mood: "stressed", count: counts.stressed, fill: "#f59e0b" },
    { label: "😔 Difícil", mood: "bad", count: counts.bad, fill: "#f43f5e" },
  ]
}

export interface DiaryEntry {
  date: string
  dateKey: string
  status: "clean" | "crisis" | "relapse"
  mood?: "great" | "good" | "neutral" | "stressed" | "bad"
  urgeLevel?: number
  note: string
  trigger?: string
}

export function getDiaryEntries(state: TrackerState): DiaryEntry[] {
  const list: DiaryEntry[] = []

  // Day logs with notes
  if (state.dayLogs) {
    for (const [key, log] of Object.entries(state.dayLogs)) {
      if (log.note && log.note.trim()) {
        list.push({
          date: log.date || `${key}T12:00:00.000Z`,
          dateKey: key,
          status: log.status,
          mood: log.mood,
          urgeLevel: log.urgeLevel,
          note: log.note,
        })
      }
    }
  }

  // Relapses with reflections
  for (const r of state.relapses) {
    if (r.reflection && r.reflection.trim()) {
      const dateKey = r.date.split("T")[0]
      const triggerLabel = state.habit?.triggers.find(t => t.id === r.trigger)?.label || r.trigger
      list.push({
        date: r.date,
        dateKey,
        status: "relapse",
        note: r.reflection,
        trigger: triggerLabel,
      })
    }
  }

  // Sort descending by date
  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return list
}

export interface UserRank {
  level: number
  title: string
  subtitle: string
  color: string
  bg: string
  border: string
  nextLevelDays: number
  progress: number
}

export const USER_RANKS = [
  { level: 1, minDays: 0, title: "Iniciante da Jornada", subtitle: "Primeiros passos rumo à liberdade", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { level: 2, minDays: 4, title: "Em Construção", subtitle: "Ganhando tração e consistência", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { level: 3, minDays: 7, title: "Guerreiro Determinado", subtitle: "1 semana de vitórias consecutivas", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { level: 4, minDays: 14, title: "Guardião do Foco", subtitle: "Neuroplasticidade positiva ativa", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { level: 5, minDays: 30, title: "Escudo de Ferro", subtitle: "1 mês intacto e mente protegida", color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  { level: 6, minDays: 60, title: "Mente Inabalável", subtitle: "Hábito saudável consolidado", color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  { level: 7, minDays: 90, title: "Reboot Completo", subtitle: "Circuitos cerebrais restaurados", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { level: 8, minDays: 180, title: "Centurião Resiliente", subtitle: "Meio ano de transformação total", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  { level: 9, minDays: 365, title: "Lenda Viva", subtitle: "Liberdade plena e inspiração", color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/40" },
]

export function getUserRank(days: number): UserRank {
  let currentRank = USER_RANKS[0]
  let nextRank = USER_RANKS[1]

  for (let i = 0; i < USER_RANKS.length; i++) {
    if (days >= USER_RANKS[i].minDays) {
      currentRank = USER_RANKS[i]
      nextRank = USER_RANKS[i + 1] || USER_RANKS[i]
    }
  }

  const isMax = currentRank.level === USER_RANKS[USER_RANKS.length - 1].level
  const span = nextRank.minDays - currentRank.minDays
  const progress = isMax ? 1 : Math.min(1, Math.max(0, (days - currentRank.minDays) / (span || 1)))

  return {
    level: currentRank.level,
    title: currentRank.title,
    subtitle: currentRank.subtitle,
    color: currentRank.color,
    bg: currentRank.bg,
    border: currentRank.border,
    nextLevelDays: nextRank.minDays,
    progress,
  }
}

export interface HeatmapDay {
  date: Date
  dateKey: string
  status: "clean" | "crisis" | "relapse" | "empty"
  month: number
  dayOfMonth: number
  isToday: boolean
}

export function getYearlyHeatmapData(
  history: TrackerState["history"],
  now: number = Date.now()
): { weeks: HeatmapDay[][]; totalClean: number; totalCrisis: number; totalRelapse: number; consistencyPercent: number } {
  const today = new Date(now)
  const todayK = dayKey(today)
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0, 0)
  
  // 52 weeks back
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - (52 * 7 + startDate.getDay()))

  const weeks: HeatmapDay[][] = []
  let currentWeek: HeatmapDay[] = []

  let totalClean = 0
  let totalCrisis = 0
  let totalRelapse = 0
  let totalTracked = 0

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const k = dayKey(d)
    const rawStatus = history[k]
    const status = rawStatus || "empty"

    if (rawStatus === "clean") totalClean++
    if (rawStatus === "crisis") totalCrisis++
    if (rawStatus === "relapse") totalRelapse++
    if (rawStatus) totalTracked++
    
    currentWeek.push({
      date: new Date(d),
      dateKey: k,
      status,
      month: d.getMonth(),
      dayOfMonth: d.getDate(),
      isToday: k === todayK,
    })

    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  const consistencyPercent = totalTracked > 0 ? Math.round(((totalClean + totalCrisis) / totalTracked) * 100) : 100

  return { weeks, totalClean, totalCrisis, totalRelapse, consistencyPercent }
}


