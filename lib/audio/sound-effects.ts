"use client"

const SOUND_ENABLED_KEY = "streakly.sound_effects_enabled"

let sharedAudioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return null
    if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
      sharedAudioCtx = new AudioCtx()
    }
    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {})
    }
    return sharedAudioCtx
  } catch {
    return null
  }
}

export function isSoundEffectsEnabled(): boolean {
  if (typeof window === "undefined") return true
  const stored = window.localStorage.getItem(SOUND_ENABLED_KEY)
  return stored === null ? true : stored === "true"
}

export function setSoundEffectsEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(SOUND_ENABLED_KEY, String(enabled))
}

/**
 * Play a soothing 3-note ascending chime when completing a daily check-in
 */
export function playSuccessChime(): void {
  if (!isSoundEffectsEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    // C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz), C6 (1046.50Hz)
    const notes = [
      { freq: 523.25, time: 0, dur: 0.5 },
      { freq: 659.25, time: 0.08, dur: 0.5 },
      { freq: 783.99, time: 0.16, dur: 0.7 },
      { freq: 1046.5, time: 0.24, dur: 1.0 },
    ]

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      filter.type = "lowpass"
      filter.frequency.setValueAtTime(2500, now)

      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, now + time)

      gain.gain.setValueAtTime(0, now + time)
      gain.gain.linearRampToValueAtTime(0.12, now + time + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + time)
      osc.stop(now + time + dur)
    })
  } catch (err) {
    console.debug("Audio play failed:", err)
  }
}

/**
 * Play a victorious, warm fanfare when unlocking achievements or milestone streaks
 */
export function playAchievementFanfare(): void {
  if (!isSoundEffectsEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    // F4 (349.23), A4 (440.0), C5 (523.25), F5 (698.46)
    const notes = [
      { freq: 349.23, time: 0, dur: 0.4 },
      { freq: 440.0, time: 0.1, dur: 0.4 },
      { freq: 523.25, time: 0.2, dur: 0.5 },
      { freq: 698.46, time: 0.32, dur: 1.4 },
      { freq: 880.0, time: 0.36, dur: 1.2 },
    ]

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "triangle"
      osc.frequency.setValueAtTime(freq, now + time)

      gain.gain.setValueAtTime(0, now + time)
      gain.gain.linearRampToValueAtTime(0.1, now + time + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + time)
      osc.stop(now + time + dur)
    })
  } catch (err) {
    console.debug("Audio fanfare failed:", err)
  }
}

/**
 * Deep Tibetan Singing Bowl tone for meditation or crisis timer completion
 */
export function playSurfingBell(): void {
  if (!isSoundEffectsEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = "sine"
    osc1.frequency.setValueAtTime(216, now) // 216Hz

    osc2.type = "sine"
    osc2.frequency.setValueAtTime(432, now) // Harmonic octave 432Hz

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.18, now + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 2.5)
    osc2.stop(now + 2.5)
  } catch (err) {
    console.debug("Audio bell failed:", err)
  }
}
