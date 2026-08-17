"use client"

import * as React from "react"

const PHASES = [
  { label: "Inspire", from: 0, to: 4000 },
  { label: "Segure", from: 4000, to: 8000 },
  { label: "Expire", from: 8000, to: 12000 },
] as const

export function BreathingCircle() {
  const [phase, setPhase] = React.useState<string>("Inspire")
  const [count, setCount] = React.useState(4)
  const startRef = React.useRef<number>(Date.now())

  React.useEffect(() => {
    startRef.current = Date.now()
    const id = window.setInterval(() => {
      const t = (Date.now() - startRef.current) % 12000
      const active = PHASES.find((p) => t >= p.from && t < p.to) ?? PHASES[0]
      setPhase(active.label)
      setCount(Math.max(1, Math.ceil((active.to - t) / 1000)))
    }, 200)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col items-center gap-5 py-2">
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
      <p className="text-center text-xs text-muted-foreground">
        Acompanhe o círculo: inspire por 4s, segure por 4s e expire por 4s.
      </p>
    </div>
  )
}
