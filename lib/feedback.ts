import confetti from "canvas-confetti"

export type HapticType =
  | "light"
  | "medium"
  | "heavy"
  | "success"
  | "warning"
  | "error"
  | "breathe-phase"

/**
 * Triggers haptic feedback via Web Vibration API when available on device.
 */
export function triggerHaptic(type: HapticType = "light") {
  if (typeof window === "undefined" || !("vibrate" in navigator)) return

  try {
    switch (type) {
      case "light":
        navigator.vibrate(20)
        break
      case "medium":
        navigator.vibrate(45)
        break
      case "heavy":
        navigator.vibrate(70)
        break
      case "success":
        navigator.vibrate([30, 60, 40])
        break
      case "warning":
        navigator.vibrate([60, 40, 60])
        break
      case "error":
        navigator.vibrate([80, 40, 80, 40, 100])
        break
      case "breathe-phase":
        navigator.vibrate([35, 40, 35])
        break
      default:
        navigator.vibrate(25)
    }
  } catch {
    // Ignore environments where vibrate is restricted or disabled
  }
}

/**
 * Fires a joyful celebratory confetti burst across the screen.
 */
export function triggerCelebrationConfetti() {
  if (typeof window === "undefined") return

  try {
    // First burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 },
      colors: ["#10b981", "#3b82f6", "#f59e0b", "#6366f1", "#ec4899"],
      disableForReducedMotion: true,
    })

    // Second delayed burst for a cascading effect
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#10b981", "#f59e0b", "#3b82f6"],
        disableForReducedMotion: true,
      })
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#10b981", "#f59e0b", "#3b82f6"],
        disableForReducedMotion: true,
      })
    }, 250)
  } catch (e) {
    console.warn("Could not trigger confetti:", e)
  }
}

/**
 * Fires a subtle, quick confetti pop for daily check-ins.
 */
export function triggerMiniConfetti() {
  if (typeof window === "undefined") return

  try {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.75 },
      colors: ["#10b981", "#34d399", "#6ee7b7", "#fbbf24"],
      disableForReducedMotion: true,
    })
  } catch (e) {
    console.warn("Could not trigger mini confetti:", e)
  }
}
