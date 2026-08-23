import { DEFAULT_LETTER, type TrackerState, type MultiTrackerState } from "./types"

export interface TrackerRepository {
  load(): Promise<MultiTrackerState>
  save(state: MultiTrackerState): Promise<void>
}

const STORAGE_KEY = "reset.tracker.v2"
const LEGACY_STORAGE_KEY = "reset.tracker.v1"

export function createInitialState(now: number = Date.now()): TrackerState {
  return {
    id: "default",
    habit: null,
    streakStart: new Date(now).toISOString(),
    bestStreakDays: 0,
    letterToSelf: DEFAULT_LETTER,
    history: {},
    dayLogs: {},
    relapses: [],
    rewardGoals: [],
  }
}

export function createInitialMultiState(now: number = Date.now()): MultiTrackerState {
  const initialTracker = createInitialState(now)
  return {
    version: 2,
    activeTrackerId: "default",
    trackers: {
      default: initialTracker,
    },
  }
}

export function validateAndNormalizeBackup(raw: unknown): TrackerState | null {
  if (!raw || typeof raw !== "object") return null
  const parsed = raw as Partial<TrackerState>
  if (typeof parsed.streakStart !== "string") return null

  return {
    id: typeof parsed.id === "string" ? parsed.id : parsed.habit?.id || "default",
    habit:
      parsed.habit && typeof parsed.habit === "object"
        ? {
            id: String(parsed.habit.id || "custom"),
            name: String(parsed.habit.name || "Hábito"),
            triggers: Array.isArray(parsed.habit.triggers)
              ? parsed.habit.triggers.map((t: any) => ({
                  id: String(t.id),
                  label: String(t.label),
                }))
              : [],
          }
        : null,
    userName: typeof parsed.userName === "string" ? parsed.userName : undefined,
    dailyCost:
      typeof parsed.dailyCost === "number" && !isNaN(parsed.dailyCost)
        ? Math.max(0, parsed.dailyCost)
        : undefined,
    guardian:
      parsed.guardian && typeof parsed.guardian === "object"
        ? {
            name: String(parsed.guardian.name || ""),
            phone: String(parsed.guardian.phone || "").replace(/\D/g, ""),
          }
        : undefined,
    streakStart: parsed.streakStart,
    bestStreakDays:
      typeof parsed.bestStreakDays === "number"
        ? Math.max(0, parsed.bestStreakDays)
        : 0,
    letterToSelf:
      typeof parsed.letterToSelf === "string"
        ? parsed.letterToSelf
        : DEFAULT_LETTER,
    history:
      parsed.history && typeof parsed.history === "object"
        ? (parsed.history as Record<string, any>)
        : {},
    dayLogs:
      parsed.dayLogs && typeof parsed.dayLogs === "object"
        ? (parsed.dayLogs as Record<string, any>)
        : {},
    relapses: Array.isArray(parsed.relapses)
      ? parsed.relapses.map((r: any) => ({
          date: String(r.date),
          trigger: String(r.trigger),
          reflection: String(r.reflection || ""),
        }))
      : [],
    rewardGoals: Array.isArray(parsed.rewardGoals)
      ? parsed.rewardGoals.map((g: any) => ({
          id: String(g.id || crypto.randomUUID()),
          title: String(g.title || "Meta"),
          targetAmount: typeof g.targetAmount === "number" && !isNaN(g.targetAmount) ? Math.max(0, g.targetAmount) : 0,
          imageUrl: typeof g.imageUrl === "string" ? g.imageUrl : undefined,
          completed: Boolean(g.completed),
          completedAt: typeof g.completedAt === "string" ? g.completedAt : undefined,
        }))
      : [],
  }
}

export function validateAndNormalizeMultiBackup(raw: unknown): MultiTrackerState | null {
  if (!raw || typeof raw !== "object") return null
  const parsed = raw as any

  // Case 1: Multi-tracker format
  if (parsed.trackers && typeof parsed.trackers === "object") {
    const validTrackers: Record<string, TrackerState> = {}
    for (const [id, t] of Object.entries(parsed.trackers)) {
      const normalized = validateAndNormalizeBackup(t)
      if (normalized) {
        validTrackers[id] = { ...normalized, id }
      }
    }
    const keys = Object.keys(validTrackers)
    if (keys.length === 0) return null
    const activeTrackerId = keys.includes(parsed.activeTrackerId) ? parsed.activeTrackerId : keys[0]
    return {
      version: 2,
      userName: typeof parsed.userName === "string" ? parsed.userName : undefined,
      guardian:
        parsed.guardian && typeof parsed.guardian === "object"
          ? {
              name: String(parsed.guardian.name || ""),
              phone: String(parsed.guardian.phone || "").replace(/\D/g, ""),
            }
          : undefined,
      activeTrackerId,
      trackers: validTrackers,
    }
  }

  // Case 2: Legacy single-tracker format
  const single = validateAndNormalizeBackup(raw)
  if (!single) return null
  const id = single.habit?.id || "default"
  return {
    version: 2,
    userName: single.userName,
    guardian: single.guardian,
    activeTrackerId: id,
    trackers: {
      [id]: { ...single, id },
    },
  }
}

function coerce(raw: unknown): MultiTrackerState {
  const normalized = validateAndNormalizeMultiBackup(raw)
  return normalized ?? createInitialMultiState()
}

/** Browser localStorage implementation with automatic migration from v1. */
export const localTrackerRepository: TrackerRepository = {
  async load() {
    if (typeof window === "undefined") return createInitialMultiState()
    try {
      // Check v2 first
      const rawV2 = window.localStorage.getItem(STORAGE_KEY)
      if (rawV2) {
        return coerce(JSON.parse(rawV2))
      }

      // Fallback: check legacy v1
      const rawV1 = window.localStorage.getItem(LEGACY_STORAGE_KEY)
      if (rawV1) {
        const migrated = coerce(JSON.parse(rawV1))
        // Save to v2
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
        return migrated
      }

      return createInitialMultiState()
    } catch {
      return createInitialMultiState()
    }
  },
  async save(multiState) {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(multiState))
    } catch {
      /* storage full or unavailable — ignore */
    }
  },
}
