import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "../firebase"
import { createInitialState } from "./storage"
import type { TrackerRepository } from "./storage"
import type { TrackerState } from "./types"

function coerce(raw: unknown): TrackerState {
  const base = createInitialState()
  if (!raw || typeof raw !== "object") return base
  const value = raw as Partial<TrackerState>
  return {
    habit: value.habit && typeof value.habit === "object" ? (value.habit as any) : null,
    streakStart:
      typeof value.streakStart === "string" ? value.streakStart : base.streakStart,
    bestStreakDays:
      typeof value.bestStreakDays === "number" ? value.bestStreakDays : 0,
    letterToSelf:
      typeof value.letterToSelf === "string" ? value.letterToSelf : base.letterToSelf,
    history:
      value.history && typeof value.history === "object" ? value.history : {},
    relapses: Array.isArray(value.relapses) ? value.relapses : [],
  }
}

export function createFirebaseRepository(uid: string): TrackerRepository {
  const userDocRef = doc(db, "users", uid)

  return {
    async load() {
      try {
        const snapshot = await getDoc(userDocRef)
        if (snapshot.exists()) {
          return coerce(snapshot.data())
        }
        return createInitialState()
      } catch (error) {
        console.error("Error loading tracker state from Firebase:", error)
        return createInitialState()
      }
    },
    async save(state) {
      try {
        await setDoc(userDocRef, state, { merge: true })
      } catch (error) {
        console.error("Error saving tracker state to Firebase:", error)
      }
    },
  }
}
