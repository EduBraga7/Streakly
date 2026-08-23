export type DayStatus = "clean" | "crisis" | "relapse"

export type MoodType = "great" | "good" | "neutral" | "stressed" | "bad"

export interface DayLogEntry {
  status: DayStatus
  mood?: MoodType
  urgeLevel?: number // 1 (low) to 5 (extreme)
  note?: string
  date?: string
}

export type TriggerId = string

export interface RelapseEntry {
  /** ISO timestamp of when the relapse was registered. */
  date: string
  trigger: TriggerId
  reflection: string
}

export interface HabitData {
  id: string
  name: string
  triggers: { id: TriggerId; label: string }[]
}

export interface RewardGoal {
  id: string
  title: string
  targetAmount: number
  imageUrl?: string
  completed?: boolean
  completedAt?: string
}

export interface GuardianContact {
  name: string
  phone: string // Numbers only (e.g. 5511999999999)
}

export interface TrackerState {
  /** Unique id for this specific tracker instance (defaults to habit.id). */
  id?: string
  /** Habit configuration for this tracker. Null means the user hasn't completed onboarding. */
  habit: HabitData | null
  /** User's preferred display name */
  userName?: string
  /** Optional estimated daily cost spent on the habit (e.g. cigarettes, alcohol, delivery, etc.) */
  dailyCost?: number
  /** Optional accountability partner / guardian contact for crisis support */
  guardian?: GuardianContact
  /** ISO timestamp marking the start of the current clean streak. */
  streakStart: string
  /** Longest streak ever reached, in whole days. */
  bestStreakDays: number
  /** User-authored motivational letter shown during a crisis. */
  letterToSelf: string
  /** Map of `yyyy-mm-dd` -> status, used for the calendar/history. */
  history: Record<string, DayStatus>
  /** Detailed day logs including mood, urge levels and notes (mapped by `yyyy-mm-dd`). */
  dayLogs?: Record<string, DayLogEntry>
  /** Chronological list of relapses. */
  relapses: RelapseEntry[]
  /** Financial reward goals funded by money saved from this habit. */
  rewardGoals?: RewardGoal[]
}

export interface MultiTrackerState {
  version: 2
  userName?: string
  guardian?: GuardianContact
  activeTrackerId: string
  trackers: Record<string, TrackerState>
}

export const DEFAULT_LETTER =
  "Lembre-se do porquê você começou. Essa vontade é passageira — ela vai crescer, atingir o pico e desaparecer se você não alimentá-la. Você já provou que consegue. Respire. Beba água. Você não vai jogar fora o progresso que construiu com tanto esforço por um impulso de alguns minutos. Amanhã você vai se orgulhar da escolha que fizer agora."

