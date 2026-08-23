"use client"

import * as React from "react"
import { Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { triggerHaptic } from "@/lib/feedback"

const PHASES = [
  { label: "Inspire", from: 0, to: 4000 },
  { label: "Segure", from: 4000, to: 8000 },
  { label: "Expire", from: 8000, to: 12000 },
] as const

// Synthesizes a soothing pink/brown noise via Web Audio API without any external mp3 files
function createAmbientSound() {
  if (typeof window === "undefined") return null
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
  if (!AudioCtx) return null

  try {
    const ctx = new AudioCtx()
    const bufferSize = ctx.sampleRate * 2
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    let lastOut = 0.0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      output[i] = (lastOut + 0.02 * white) / 1.02
      lastOut = output[i]
      output[i] *= 3.5
    }

    const whiteNoise = ctx.createBufferSource()
    whiteNoise.buffer = noiseBuffer
    whiteNoise.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.setValueAtTime(450, ctx.currentTime)

    const gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(0.12, ctx.currentTime)

    whiteNoise.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    whiteNoise.start(0)

    return {
      stop: () => {
        try {
          whiteNoise.stop()
          ctx.close()
        } catch {}
      },
    }
  } catch {
    return null
  }
}

export function BreathingCircle() {
  const [phase, setPhase] = React.useState<string>("Inspire")
  const [count, setCount] = React.useState(4)
  const [soundActive, setSoundActive] = React.useState(false)
  const soundRef = React.useRef<{ stop: () => void } | null>(null)
  const startRef = React.useRef<number>(Date.now())
  const lastPhaseRef = React.useRef<string>("Inspire")

  React.useEffect(() => {
    startRef.current = Date.now()
    triggerHaptic("breathe-phase")

    const id = window.setInterval(() => {
      const t = (Date.now() - startRef.current) % 12000
      const active = PHASES.find((p) => t >= p.from && t < p.to) ?? PHASES[0]
      
      if (lastPhaseRef.current !== active.label) {
        lastPhaseRef.current = active.label
        triggerHaptic("breathe-phase")
      }

      setPhase(active.label)
      setCount(Math.max(1, Math.ceil((active.to - t) / 1000)))
    }, 150)

    return () => {
      window.clearInterval(id)
      if (soundRef.current) {
        soundRef.current.stop()
        soundRef.current = null
      }
    }
  }, [])

  const toggleSound = () => {
    triggerHaptic("light")
    if (soundActive) {
      if (soundRef.current) {
        soundRef.current.stop()
        soundRef.current = null
      }
      setSoundActive(false)
    } else {
      soundRef.current = createAmbientSound()
      setSoundActive(true)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div className="relative flex size-52 items-center justify-center">
        {/* halo estático */}
        <div className="absolute size-52 rounded-full bg-primary/5" />
        {/* círculo que respira */}
        <div className="animate-breathe absolute size-52 rounded-full bg-primary/15 ring-1 ring-primary/30" />
        <div className="relative z-10 flex flex-col items-center gap-1">
          <span className="text-lg font-medium text-foreground">{phase}</span>
          <span className="text-4xl font-semibold tabular-nums text-primary">
            {count}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between w-full px-2 text-xs text-muted-foreground">
        <p className="text-[11px] text-muted-foreground flex-1">
          Acompanhe o círculo: inspire 4s, segure 4s e expire 4s.
        </p>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleSound}
          className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold gap-1.5 shrink-0 ${
            soundActive ? "border-primary/40 bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"
          }`}
          title="Som ambiente de chuva/mar para relaxamento"
        >
          {soundActive ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
          <span>{soundActive ? "Som: Ligado" : "Som Chuva"}</span>
        </Button>
      </div>
    </div>
  )
}
