import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "../firebase"
import { createInitialMultiState, validateAndNormalizeMultiBackup } from "./storage"
import type { TrackerRepository } from "./storage"
import type { MultiTrackerState } from "./types"

function coerce(raw: unknown): MultiTrackerState {
  const normalized = validateAndNormalizeMultiBackup(raw)
  return normalized ?? createInitialMultiState()
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
        return createInitialMultiState()
      } catch (error) {
        console.error("Error loading tracker state from Firebase:", error)
        return createInitialMultiState()
      }
    },
    async save(multiState) {
      try {
        // Strip undefined fields to comply with Firestore document rules
        const cleanState = JSON.parse(JSON.stringify(multiState))
        await setDoc(userDocRef, cleanState)
      } catch (error) {
        console.error("Error saving tracker state to Firebase:", error)
      }
    },
  }
}
