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
  localTrackerRepository,
  type TrackerRepository,
} from "@/lib/tracker/storage"
import { createFirebaseRepository } from "@/lib/tracker/firebase-storage"
import type { TrackerState, TriggerId } from "@/lib/tracker/types"
import { dayKey, getElapsed } from "@/lib/tracker/utils"
import { LoginScreen } from "@/components/login-screen"

interface TrackerContextValue {
  state: TrackerState
  ready: boolean
  user: User | null
  checkIn: () => void
  markCrisisSurvived: () => void
  registerRelapse: (trigger: TriggerId, reflection: string) => void
  updateLetter: (text: string) => void
  resetAll: () => void
  checkedInToday: boolean
  linkWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const TrackerContext = React.createContext<TrackerContextValue | null>(null)

export const googleProvider = new GoogleAuthProvider()
// Force prompt to select account to avoid silent auto-login loops
googleProvider.setCustomParameters({ prompt: 'select_account' })

export function TrackerProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = React.useState<User | null>(null)
  /** 'loading' = waiting for Firebase to resolve auth state
   *  'login'   = resolved, no user → show login screen
   *  'ready'   = user logged in → show the app */
  const [authStage, setAuthStage] = React.useState<"loading" | "login" | "ready">("loading")
  const [state, setState] = React.useState<TrackerState>(() => createInitialState())
  const [dataReady, setDataReady] = React.useState(false)
  const [repository, setRepository] = React.useState<TrackerRepository | null>(null)

  // 1. Listen to auth state
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        setRepository(createFirebaseRepository(currentUser.uid))
        setAuthStage("ready")
      } else {
        setAuthStage("login")
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
        setState(loaded)
        setDataReady(true)
      }
    })
    return () => { active = false }
  }, [repository])

  // 3. Persist state changes
  React.useEffect(() => {
    if (!dataReady || !repository) return
    repository.save(state)
  }, [state, dataReady, repository])

  // ── Auth actions ──────────────────────────────────────────

  const linkWithGoogle = React.useCallback(async () => {
    if (!auth.currentUser) return
    try {
      // Must be called directly from user interaction to avoid popup blocker
      const result = await linkWithPopup(auth.currentUser, googleProvider)
      setUser(result.user)
    } catch (error: any) {
      // If the Google account already has a Firebase account, just sign in with it.
      if (
        error.code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE ||
        error.code === AuthErrorCodes.EMAIL_EXISTS
      ) {
        await signInWithPopup(auth, googleProvider)
        // onAuthStateChanged will handle updating user + authStage
      } else {
        throw error
      }
    }
  }, [])

  const logout = React.useCallback(async () => {
    await signOut(auth)
    setState(createInitialState())
    setDataReady(false)
    setRepository(null)
    setUser(null)
    setAuthStage("login")
  }, [])

  // ── Tracker mutations ─────────────────────────────────────

  const checkIn = React.useCallback(() => {
    setState((prev) => {
      const key = dayKey(new Date())
      if (prev.history[key] === "relapse") return prev
      return { ...prev, history: { ...prev.history, [key]: "clean" } }
    })
  }, [])

  const markCrisisSurvived = React.useCallback(() => {
    setState((prev) => {
      const key = dayKey(new Date())
      if (prev.history[key] === "relapse") return prev
      return { ...prev, history: { ...prev.history, [key]: "crisis" } }
    })
  }, [])

  const registerRelapse = React.useCallback(
    (trigger: TriggerId, reflection: string) => {
      setState((prev) => {
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
    [],
  )

  const updateLetter = React.useCallback((text: string) => {
    setState((prev) => ({ ...prev, letterToSelf: text }))
  }, [])

  const resetAll = React.useCallback(() => {
    setState(createInitialState())
  }, [])

  const checkedInToday = state.history[dayKey(new Date())] === "clean"

  const value = React.useMemo<TrackerContextValue>(
    () => ({
      state,
      ready: dataReady,
      user,
      checkIn,
      markCrisisSurvived,
      registerRelapse,
      updateLetter,
      resetAll,
      checkedInToday,
      linkWithGoogle,
      logout,
    }),
    [state, dataReady, user, checkIn, markCrisisSurvived, registerRelapse, updateLetter, resetAll, checkedInToday, linkWithGoogle, logout],
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
    return <LoginScreen />
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
