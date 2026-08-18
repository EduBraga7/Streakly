import { DEFAULT_LETTER, type TrackerState } from "./types"

/**
 * Storage abstraction for the tracker state.
 *
 * The app talks only to this interface, so swapping the local persistence for
 * Firebase Firestore later is a drop-in change: implement `TrackerRepository`
 * with Firestore calls (e.g. `doc(db, "users", uid)` + `onSnapshot`) and pass
 * it to the provider instead of `localTrackerRepository`.
 */
export interface TrackerRepository {
  load(): Promise<TrackerState>
  save(state: TrackerState): Promise<void>
}

const STORAGE_KEY = "reset.tracker.v1"

export function createInitialState(now: number = Date.now()): TrackerState {
  return {
    habit: null,
    streakStart: new Date(now).toISOString(),
    bestStreakDays: 0,
    letterToSelf: DEFAULT_LETTER,
    history: {},
    relapses: [],
  }
}

function coerce(raw: unknown): TrackerState {
  const base = createInitialState()
  if (!raw || typeof raw !== "object") return base
  const value = raw as Partial<TrackerState>
  return {
    habit: value.habit && typeof value.habit === "object" ? (value.habit as any) : null,
    userName: typeof value.userName === "string" ? value.userName : undefined,
    streakStart:
      typeof value.streakStart === "string" ? value.streakStart : base.streakStart,
    bestStreakDays:
      typeof value.bestStreakDays === "number" ? value.bestStreakDays : 0,
    letterToSelf:
      typeof value.letterToSelf === "string" ? value.letterToSelf : DEFAULT_LETTER,
    history:
      value.history && typeof value.history === "object" ? value.history : {},
    relapses: Array.isArray(value.relapses) ? value.relapses : [],
  }
}

/** Browser localStorage implementation (default). */
export const localTrackerRepository: TrackerRepository = {
  async load() {
    if (typeof window === "undefined") return createInitialState()
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return createInitialState()
      return coerce(JSON.parse(raw))
    } catch {
      return createInitialState()
    }
  },
  async save(state) {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage full or unavailable — ignore */
    }
  },
}
