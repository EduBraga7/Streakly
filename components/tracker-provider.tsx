"use client"

import * as React from "react"
import {
  signInAnonymously,
  signInWithPopup,
  onAuthStateChanged,
  linkWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
  AuthErrorCodes,
} from "firebase/auth"
import { auth } from "@/lib/firebase"

import {
  createInitialState,
  createInitialMultiState,
  validateAndNormalizeMultiBackup,
  localTrackerRepository,
  type TrackerRepository,
} from "@/lib/tracker/storage"
import { createFirebaseRepository } from "@/lib/tracker/firebase-storage"
import { DEFAULT_LETTER, type TrackerState, type MultiTrackerState, type TriggerId, type DayStatus, type HabitData, type MoodType, type GuardianContact } from "@/lib/tracker/types"
import { dayKey, getElapsed } from "@/lib/tracker/utils"
import { recalculateState } from "@/lib/tracker/recalculate"
import { LoginScreen } from "@/components/login-screen"
import { OnboardingScreen } from "@/components/onboarding-screen"
import { PinLockScreen } from "@/components/pin-lock-screen"
import { useAppLock } from "@/lib/hooks/use-app-lock"

interface TrackerContextValue {
  state: TrackerState
  allTrackers: TrackerState[]
  activeTrackerId: string
  ready: boolean
  user: User | null
  isGuest: boolean
  continueAsGuest: () => void
  switchTracker: (id: string) => void
  createTracker: (habit: HabitData) => void
  deleteTracker: (id: string) => void
  checkIn: (logData?: { mood?: MoodType; urgeLevel?: number; note?: string }) => void
  markCrisisSurvived: () => void
  registerRelapse: (trigger: TriggerId, reflection: string) => void
  updateLetter: (text: string) => void
  resetAll: () => void
  undoLastAction: () => void
  importBackup: (backupState: TrackerState | MultiTrackerState) => void
  editHistoryEntry: (dateKey: string, status: DayStatus | null) => void
  completeOnboarding: (habit: HabitData) => void
  updateUserName: (name: string) => void
  updateDailyCost: (cost: number | undefined) => void
  updateGuardian: (guardian: GuardianContact | undefined) => void
  addTrigger: (label: string) => void
  removeTrigger: (id: TriggerId) => void
  updateTrigger: (id: TriggerId, label: string) => void
  addRewardGoal: (title: string, targetAmount: number) => void
  removeRewardGoal: (id: string) => void
  toggleRewardGoalCompleted: (id: string) => void
  canUndo: boolean
  checkedInToday: boolean
  linkWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const TrackerContext = React.createContext<TrackerContextValue | null>(null)

export const googleProvider = new GoogleAuthProvider()
// Force prompt to select account to avoid silent auto-login loops
googleProvider.setCustomParameters({ prompt: 'select_account' })

const GUEST_STORAGE_KEY = "streakly.guest_mode"

export function TrackerProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isGuest, setIsGuest] = React.useState(false)
  /** 'loading' = waiting for Firebase to resolve auth state
   *  'login'   = resolved, no user → show login screen
   *  'ready'   = user logged in or guest mode active → show the app */
  const [authStage, setAuthStage] = React.useState<"loading" | "login" | "ready">("loading")
  const [multiState, setMultiState] = React.useState<MultiTrackerState>(() => createInitialMultiState())
  const [previousMultiState, setPreviousMultiState] = React.useState<MultiTrackerState | null>(null)
  const [dataReady, setDataReady] = React.useState(false)
  const [repository, setRepository] = React.useState<TrackerRepository | null>(null)
  const appLock = useAppLock()

  // Derive active tracker and all trackers
  const activeTrackerId = multiState.activeTrackerId || Object.keys(multiState.trackers)[0] || "default"
  const state = multiState.trackers[activeTrackerId] || createInitialState()
  const allTrackers = React.useMemo(
    () => Object.values(multiState.trackers).filter((t) => t.habit !== null),
    [multiState.trackers],
  )

  // 1. Listen to auth state
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        setIsGuest(false)
        setRepository(createFirebaseRepository(currentUser.uid))
        setAuthStage("ready")
      } else {
        // Check if guest mode was previously selected or local data already exists
        const isGuestStored = typeof window !== "undefined" && window.localStorage.getItem(GUEST_STORAGE_KEY) === "true"
        const hasLocalData = typeof window !== "undefined" && Boolean(window.localStorage.getItem("reset.tracker.v2") || window.localStorage.getItem("reset.tracker.v1"))
        
        if (isGuestStored || hasLocalData) {
          setIsGuest(true)
          setRepository(localTrackerRepository)
          setAuthStage("ready")
        } else {
          setAuthStage("login")
        }
      }
    })
    return () => unsubscribe()
  }, [])

  // 2. Load data when repository is ready
  React.useEffect(() => {
    if (!repository) return
    let active = true
    setDataReady(false)
    repository.load().then((loaded) => {
      if (active) {
        setMultiState(loaded)
        setDataReady(true)
      }
    })
    return () => { active = false }
  }, [repository])

  // 3. Persist multiState changes with debounce to prevent I/O thrashing
  React.useEffect(() => {
    if (!dataReady || !repository) return
    const timeoutId = setTimeout(() => {
      repository.save(multiState)
    }, 400)
    return () => clearTimeout(timeoutId)
  }, [multiState, dataReady, repository])

  // ── Auth actions ──────────────────────────────────────────

  const continueAsGuest = React.useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(GUEST_STORAGE_KEY, "true")
    }
    setIsGuest(true)
    setRepository(localTrackerRepository)
    setAuthStage("ready")
  }, [])

  const linkWithGoogle = React.useCallback(async () => {
    try {
      let resultUser: User
      if (auth.currentUser) {
        const result = await linkWithPopup(auth.currentUser, googleProvider)
        resultUser = result.user
      } else {
        const result = await signInWithPopup(auth, googleProvider)
        resultUser = result.user
      }

      setUser(resultUser)
      setIsGuest(false)
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(GUEST_STORAGE_KEY)
      }

      const fbRepo = createFirebaseRepository(resultUser.uid)
      const remoteData = await fbRepo.load()
      const hasRemoteHabit = Object.values(remoteData.trackers).some((t) => t.habit !== null)
      const hasLocalHabit = Object.values(multiState.trackers).some((t) => t.habit !== null)

      // If remote has no data yet but local has, save local progress to Firebase
      if (!hasRemoteHabit && hasLocalHabit) {
        await fbRepo.save(multiState)
      }
      setRepository(fbRepo)
    } catch (error: any) {
      if (
        error.code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE ||
        error.code === AuthErrorCodes.EMAIL_EXISTS
      ) {
        const result = await signInWithPopup(auth, googleProvider)
        setUser(result.user)
        setIsGuest(false)
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(GUEST_STORAGE_KEY)
        }
        setRepository(createFirebaseRepository(result.user.uid))
      } else {
        throw error
      }
    }
  }, [multiState])

  const logout = React.useCallback(async () => {
    if (auth.currentUser) {
      await signOut(auth)
    }
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(GUEST_STORAGE_KEY)
    }
    setMultiState(createInitialMultiState())
    setDataReady(false)
    setRepository(null)
    setUser(null)
    setIsGuest(false)
    setAuthStage("login")
  }, [])

  // ── Helper to mutate current active tracker ───────────────

  const updateActiveTracker = React.useCallback(
    (updater: (prev: TrackerState) => TrackerState) => {
      setPreviousMultiState(multiState)
      setMultiState((prev) => {
        const currentId = prev.activeTrackerId || Object.keys(prev.trackers)[0] || "default"
        const currentTracker = prev.trackers[currentId] || createInitialState()
        const updated = updater(currentTracker)
        return {
          ...prev,
          trackers: {
            ...prev.trackers,
            [currentId]: { ...updated, id: currentId },
          },
        }
      })
    },
    [multiState],
  )

  // ── Multi-tracker management ──────────────────────────────

  const switchTracker = React.useCallback((id: string) => {
    setMultiState((prev) => {
      if (prev.trackers[id]) {
        return { ...prev, activeTrackerId: id }
      }
      return prev
    })
  }, [])

  const createTracker = React.useCallback((habit: HabitData) => {
    const newId = habit.id || crypto.randomUUID()
    const newTracker: TrackerState = {
      id: newId,
      habit,
      userName: multiState.userName,
      streakStart: new Date().toISOString(),
      bestStreakDays: 0,
      letterToSelf: DEFAULT_LETTER,
      history: {},
      dayLogs: {},
      relapses: [],
    }
    setMultiState((prev) => ({
      ...prev,
      activeTrackerId: newId,
      trackers: {
        ...prev.trackers,
        [newId]: newTracker,
      },
    }))
  }, [multiState.userName])

  const deleteTracker = React.useCallback((id: string) => {
    setMultiState((prev) => {
      const remainingKeys = Object.keys(prev.trackers).filter((k) => k !== id)
      if (remainingKeys.length === 0) return prev
      const { [id]: _, ...rest } = prev.trackers
      const nextActive = prev.activeTrackerId === id ? remainingKeys[0] : prev.activeTrackerId
      return {
        ...prev,
        activeTrackerId: nextActive,
        trackers: rest,
      }
    })
  }, [])

  // ── Tracker mutations ─────────────────────────────────────

  const checkIn = React.useCallback(
    (logData?: { mood?: MoodType; urgeLevel?: number; note?: string }) => {
      updateActiveTracker((prev) => {
        const key = dayKey(new Date())
        if (prev.history[key] === "relapse") return prev
        const newDayLogs = { ...prev.dayLogs }
        if (logData) {
          newDayLogs[key] = {
            status: "clean",
            date: new Date().toISOString(),
            ...logData,
          }
        }
        return {
          ...prev,
          history: { ...prev.history, [key]: "clean" },
          dayLogs: newDayLogs,
        }
      })
    },
    [updateActiveTracker],
  )

  const markCrisisSurvived = React.useCallback(() => {
    updateActiveTracker((prev) => {
      const key = dayKey(new Date())
      if (prev.history[key] === "relapse") return prev
      return { ...prev, history: { ...prev.history, [key]: "crisis" } }
    })
  }, [updateActiveTracker])

  const registerRelapse = React.useCallback(
    (trigger: TriggerId, reflection: string) => {
      updateActiveTracker((prev) => {
        const now = Date.now()
        const currentDays = getElapsed(prev.streakStart, now).days
        const key = dayKey(new Date(now))
        return {
          ...prev,
          streakStart: new Date(now).toISOString(),
          bestStreakDays: Math.max(prev.bestStreakDays, currentDays),
          history: { ...prev.history, [key]: "relapse" },
          relapses: [
            ...prev.relapses,
            { date: new Date(now).toISOString(), trigger, reflection },
          ],
        }
      })
    },
    [updateActiveTracker],
  )

  const updateLetter = React.useCallback((text: string) => {
    updateActiveTracker((prev) => ({ ...prev, letterToSelf: text }))
  }, [updateActiveTracker])

  const resetAll = React.useCallback(() => {
    updateActiveTracker(() => createInitialState())
    setPreviousMultiState(null)
  }, [updateActiveTracker])

  const undoLastAction = React.useCallback(() => {
    if (previousMultiState) {
      setMultiState(previousMultiState)
      setPreviousMultiState(null)
    }
  }, [previousMultiState])

  const importBackup = React.useCallback((backupState: TrackerState | MultiTrackerState) => {
    const normalized = validateAndNormalizeMultiBackup(backupState)
    if (normalized) {
      // Recalculate each tracker
      const recalced: Record<string, TrackerState> = {}
      for (const [id, t] of Object.entries(normalized.trackers)) {
        recalced[id] = recalculateState(t)
      }
      setPreviousMultiState(multiState)
      setMultiState({
        ...normalized,
        trackers: recalced,
      })
    }
  }, [multiState])

  const editHistoryEntry = React.useCallback((dateKey: string, status: DayStatus | null) => {
    updateActiveTracker((prev) => {
      const newHistory = { ...prev.history }
      if (status === null) {
        delete newHistory[dateKey]
      } else {
        newHistory[dateKey] = status
      }
      const newState = { ...prev, history: newHistory }
      return recalculateState(newState)
    })
  }, [updateActiveTracker])

  const completeOnboarding = React.useCallback((habit: HabitData) => {
    const trackerId = habit.id || "default"
    setMultiState((prev) => {
      const current = prev.trackers[prev.activeTrackerId] || createInitialState()
      const updated = { ...current, id: trackerId, habit }
      return {
        ...prev,
        activeTrackerId: trackerId,
        trackers: {
          ...prev.trackers,
          [trackerId]: updated,
        },
      }
    })
  }, [])

  const updateUserName = React.useCallback((name: string) => {
    setMultiState((prev) => {
      const updatedTrackers: Record<string, TrackerState> = {}
      for (const [id, t] of Object.entries(prev.trackers)) {
        updatedTrackers[id] = { ...t, userName: name }
      }
      return {
        ...prev,
        userName: name,
        trackers: updatedTrackers,
      }
    })
  }, [])

  const updateDailyCost = React.useCallback((cost: number | undefined) => {
    updateActiveTracker((prev) => ({ ...prev, dailyCost: cost }))
  }, [updateActiveTracker])

  const updateGuardian = React.useCallback((guardian: GuardianContact | undefined) => {
    setMultiState((prev) => {
      const updatedTrackers: Record<string, TrackerState> = {}
      for (const [id, t] of Object.entries(prev.trackers)) {
        updatedTrackers[id] = { ...t, guardian }
      }
      return {
        ...prev,
        guardian,
        trackers: updatedTrackers,
      }
    })
  }, [])

  const addTrigger = React.useCallback((label: string) => {
    updateActiveTracker((prev) => {
      if (!prev.habit) return prev
      const newTrigger = { id: crypto.randomUUID(), label }
      return {
        ...prev,
        habit: {
          ...prev.habit,
          triggers: [...prev.habit.triggers, newTrigger],
        },
      }
    })
  }, [updateActiveTracker])

  const removeTrigger = React.useCallback((id: TriggerId) => {
    updateActiveTracker((prev) => {
      if (!prev.habit) return prev
      return {
        ...prev,
        habit: {
          ...prev.habit,
          triggers: prev.habit.triggers.filter((t) => t.id !== id),
        },
      }
    })
  }, [updateActiveTracker])

  const updateTrigger = React.useCallback((id: TriggerId, label: string) => {
    updateActiveTracker((prev) => {
      if (!prev.habit) return prev
      return {
        ...prev,
        habit: {
          ...prev.habit,
          triggers: prev.habit.triggers.map((t) =>
            t.id === id ? { ...t, label } : t
          ),
        },
      }
    })
  }, [updateActiveTracker])

  const addRewardGoal = React.useCallback((title: string, targetAmount: number) => {
    updateActiveTracker((prev) => {
      const newGoal = {
        id: crypto.randomUUID(),
        title: title.trim(),
        targetAmount: Math.max(0, targetAmount),
        completed: false,
      }
      return {
        ...prev,
        rewardGoals: [...(prev.rewardGoals || []), newGoal],
      }
    })
  }, [updateActiveTracker])

  const removeRewardGoal = React.useCallback((id: string) => {
    updateActiveTracker((prev) => ({
      ...prev,
      rewardGoals: (prev.rewardGoals || []).filter((g) => g.id !== id),
    }))
  }, [updateActiveTracker])

  const toggleRewardGoalCompleted = React.useCallback((id: string) => {
    updateActiveTracker((prev) => ({
      ...prev,
      rewardGoals: (prev.rewardGoals || []).map((g) =>
        g.id === id
          ? {
              ...g,
              completed: !g.completed,
              completedAt: !g.completed ? new Date().toISOString() : undefined,
            }
          : g
      ),
    }))
  }, [updateActiveTracker])

  const checkedInToday = state.history[dayKey(new Date())] === "clean"

  const value = React.useMemo<TrackerContextValue>(
    () => ({
      state,
      allTrackers,
      activeTrackerId,
      ready: dataReady,
      user,
      isGuest,
      continueAsGuest,
      switchTracker,
      createTracker,
      deleteTracker,
      checkIn,
      markCrisisSurvived,
      registerRelapse,
      updateLetter,
      resetAll,
      undoLastAction,
      importBackup,
      editHistoryEntry,
      completeOnboarding,
      updateUserName,
      updateDailyCost,
      updateGuardian,
      addTrigger,
      removeTrigger,
      updateTrigger,
      addRewardGoal,
      removeRewardGoal,
      toggleRewardGoalCompleted,
      canUndo: previousMultiState !== null,
      checkedInToday,
      linkWithGoogle,
      logout,
    }),
    [state, allTrackers, activeTrackerId, dataReady, user, isGuest, continueAsGuest, switchTracker, createTracker, deleteTracker, checkIn, markCrisisSurvived, registerRelapse, updateLetter, resetAll, undoLastAction, importBackup, editHistoryEntry, completeOnboarding, updateUserName, updateDailyCost, updateGuardian, addTrigger, removeTrigger, updateTrigger, addRewardGoal, removeRewardGoal, toggleRewardGoalCompleted, previousMultiState, checkedInToday, linkWithGoogle, logout],
  )

  // ── Render gates ──────────────────────────────────────────

  if (authStage === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm">Carregando...</span>
        </div>
      </div>
    )
  }

  if (authStage === "login") {
    return <LoginScreen onContinueAsGuest={continueAsGuest} />
  }

  // Se bloqueio por PIN estiver ativado e bloqueado
  if (dataReady && appLock.pinEnabled && appLock.isLocked) {
    return (
      <PinLockScreen
        onUnlockWithPin={appLock.unlockWithPin}
        onUnlockWithBiometrics={appLock.unlockWithBiometrics}
        isBiometricsAvailable={appLock.isBiometricsAvailable}
        biometricsEnabled={appLock.biometricsEnabled}
      />
    )
  }

  // Se logado mas sem hábito configurado, mostrar Onboarding
  if (dataReady && !state.habit) {
    return (
      <TrackerContext.Provider value={value}>
        <OnboardingScreen />
      </TrackerContext.Provider>
    )
  }

  return (
    <TrackerContext.Provider value={value}>
      {children}
    </TrackerContext.Provider>
  )
}

export function useTracker() {
  const ctx = React.useContext(TrackerContext)
  if (!ctx) throw new Error("useTracker must be used within a TrackerProvider")
  return ctx
}

export function useNow(intervalMs = 1000): number | null {
  const [now, setNow] = React.useState<number | null>(null)
  React.useEffect(() => {
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}
