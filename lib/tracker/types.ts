export type DayStatus = "clean" | "crisis" | "relapse"

export type TriggerId =
  | "boredom"
  | "tiredness"
  | "social"
  | "stress"
  | "loneliness"

export interface RelapseEntry {
  /** ISO timestamp of when the relapse was registered. */
  date: string
  trigger: TriggerId
  reflection: string
}

export interface TrackerState {
  /** ISO timestamp marking the start of the current clean streak. */
  streakStart: string
  /** Longest streak ever reached, in whole days. */
  bestStreakDays: number
  /** User-authored motivational letter shown during a crisis. */
  letterToSelf: string
  /** Map of `yyyy-mm-dd` -> status, used for the calendar/history. */
  history: Record<string, DayStatus>
  /** Chronological list of relapses. */
  relapses: RelapseEntry[]
}

export const TRIGGERS: { id: TriggerId; label: string }[] = [
  { id: "boredom", label: "Tédio" },
  { id: "tiredness", label: "Cansaço" },
  { id: "social", label: "Redes Sociais" },
  { id: "stress", label: "Estresse" },
  { id: "loneliness", label: "Solidão" },
]

export const DEFAULT_LETTER =
  "Lembre-se do porquê você começou. Essa vontade é passageira — ela vai crescer, atingir o pico e desaparecer se você não alimentá-la. Você já provou que consegue. Respire. Beba água. Você não vai jogar fora o progresso que construiu com tanto esforço por um impulso de alguns minutos. Amanhã você vai se orgulhar da escolha que fizer agora."
