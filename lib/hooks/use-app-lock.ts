"use client"

import * as React from "react"

const PIN_HASH_KEY = "streakly.pin_hash"
const PIN_ENABLED_KEY = "streakly.pin_enabled"
const BIOMETRICS_ENABLED_KEY = "streakly.biometrics_enabled"
const AUTO_LOCK_MINUTES_KEY = "streakly.auto_lock_minutes"
const LAST_ACTIVE_KEY = "streakly.last_active_time"
const BIO_CREDENTIAL_KEY = "streakly.bio_credential_id"

// Helper to hash PIN with SHA-256 via Web Crypto API
async function hashPin(pin: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(`streakly-salt-${pin}`)
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export function useAppLock() {
  const [pinEnabled, setPinEnabled] = React.useState(false)
  const [biometricsEnabled, setBiometricsEnabledState] = React.useState(false)
  const [autoLockMinutes, setAutoLockMinutesState] = React.useState<number>(1)
  const [isLocked, setIsLocked] = React.useState(false)
  const [isBiometricsAvailable, setIsBiometricsAvailable] = React.useState(false)

  // 1. Initialize lock state from storage
  React.useEffect(() => {
    if (typeof window === "undefined") return

    const storedEnabled = window.localStorage.getItem(PIN_ENABLED_KEY) === "true"
    const storedPinHash = window.localStorage.getItem(PIN_HASH_KEY)
    const storedBio = window.localStorage.getItem(BIOMETRICS_ENABLED_KEY) === "true"
    const storedAutoLock = parseInt(window.localStorage.getItem(AUTO_LOCK_MINUTES_KEY) || "1", 10)

    const isConfigured = storedEnabled && Boolean(storedPinHash)
    setPinEnabled(isConfigured)
    setBiometricsEnabledState(storedBio)
    setAutoLockMinutesState(isNaN(storedAutoLock) ? 1 : storedAutoLock)

    // Check if device supports WebAuthn platform biometrics (TouchID / FaceID / Fingerprint)
    if (window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => setIsBiometricsAvailable(available))
        .catch(() => setIsBiometricsAvailable(false))
    }

    if (isConfigured) {
      // Check elapsed inactivity
      const lastActive = parseInt(window.sessionStorage.getItem(LAST_ACTIVE_KEY) || "0", 10)
      const now = Date.now()
      const diffMs = now - lastActive
      const lockThresholdMs = (storedAutoLock || 1) * 60 * 1000

      if (!lastActive || diffMs >= lockThresholdMs) {
        setIsLocked(true)
      }
    }
  }, [])

  // 2. Listen to visibility change for auto-locking
  React.useEffect(() => {
    if (typeof window === "undefined" || !pinEnabled) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        window.sessionStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()))
      } else if (document.visibilityState === "visible") {
        const lastActive = parseInt(window.sessionStorage.getItem(LAST_ACTIVE_KEY) || "0", 10)
        const now = Date.now()
        const lockThresholdMs = autoLockMinutes * 60 * 1000

        if (lastActive && now - lastActive >= lockThresholdMs) {
          setIsLocked(true)
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [pinEnabled, autoLockMinutes])

  // Unlock with PIN
  const unlockWithPin = React.useCallback(
    async (pin: string): Promise<boolean> => {
      const storedHash = window.localStorage.getItem(PIN_HASH_KEY)
      if (!storedHash) return false

      const enteredHash = await hashPin(pin)
      if (enteredHash === storedHash) {
        setIsLocked(false)
        window.sessionStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()))
        return true
      }
      return false
    },
    [],
  )

  // Unlock with Biometrics
  const unlockWithBiometrics = React.useCallback(async (): Promise<boolean> => {
    if (!biometricsEnabled || typeof window === "undefined" || !window.PublicKeyCredential) {
      return false
    }

    try {
      const challenge = new Uint8Array(32)
      window.crypto.getRandomValues(challenge)

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: "preferred",
        },
      })

      if (assertion) {
        setIsLocked(false)
        window.sessionStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()))
        return true
      }
      return false
    } catch (err) {
      console.warn("Biometric authentication cancelled or failed:", err)
      return false
    }
  }, [biometricsEnabled])

  // Setup new PIN
  const setPin = React.useCallback(async (newPin: string): Promise<void> => {
    const hash = await hashPin(newPin)
    window.localStorage.setItem(PIN_HASH_KEY, hash)
    window.localStorage.setItem(PIN_ENABLED_KEY, "true")
    setPinEnabled(true)
    setIsLocked(false)
    window.sessionStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()))
  }, [])

  // Remove PIN lock
  const removePin = React.useCallback(() => {
    window.localStorage.removeItem(PIN_HASH_KEY)
    window.localStorage.setItem(PIN_ENABLED_KEY, "false")
    window.localStorage.setItem(BIOMETRICS_ENABLED_KEY, "false")
    setPinEnabled(false)
    setBiometricsEnabledState(false)
    setIsLocked(false)
  }, [])

  // Toggle biometrics
  const setBiometricsEnabled = React.useCallback(
    async (enabled: boolean): Promise<boolean> => {
      if (!enabled) {
        window.localStorage.setItem(BIOMETRICS_ENABLED_KEY, "false")
        setBiometricsEnabledState(false)
        return true
      }

      if (!window.PublicKeyCredential) return false

      try {
        const challenge = new Uint8Array(32)
        window.crypto.getRandomValues(challenge)
        const userId = new Uint8Array(16)
        window.crypto.getRandomValues(userId)

        const credential = (await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: { name: "Streakly" },
            user: {
              id: userId,
              name: "streakly_user",
              displayName: "Usuário Streakly",
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              userVerification: "preferred",
            },
            timeout: 60000,
          },
        })) as PublicKeyCredential

        if (credential) {
          window.localStorage.setItem(BIOMETRICS_ENABLED_KEY, "true")
          window.localStorage.setItem(BIO_CREDENTIAL_KEY, credential.id)
          setBiometricsEnabledState(true)
          return true
        }
        return false
      } catch (err) {
        console.warn("Failed to register biometrics:", err)
        return false
      }
    },
    [],
  )

  const setAutoLockMinutes = React.useCallback((minutes: number) => {
    setAutoLockMinutesState(minutes)
    window.localStorage.setItem(AUTO_LOCK_MINUTES_KEY, String(minutes))
  }, [])

  const lockNow = React.useCallback(() => {
    if (pinEnabled) {
      setIsLocked(true)
    }
  }, [pinEnabled])

  return {
    pinEnabled,
    biometricsEnabled,
    autoLockMinutes,
    isLocked,
    isBiometricsAvailable,
    unlockWithPin,
    unlockWithBiometrics,
    setPin,
    removePin,
    setBiometricsEnabled,
    setAutoLockMinutes,
    lockNow,
  }
}
