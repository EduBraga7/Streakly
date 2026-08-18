"use client"
import { Award } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CircularProgress } from "@/components/circular-progress"
import { useNow, useTracker } from "@/components/tracker-provider"
import {
  formatElapsed,
  getElapsed,
  getFractionalDays,
  getMilestoneProgress,
} from "@/lib/tracker/utils"

export function StreakCard() {
  const { state } = useTracker()
  const liveNow = useNow(1000)
  // Before the client mounts, anchor "now" to the streak start so elapsed time
  // renders as zero — matching the server render exactly.
  const now = liveNow ?? new Date(state.streakStart).getTime()

  const elapsed = getElapsed(state.streakStart, now)
  const fractional = getFractionalDays(state.streakStart, now)
  const milestone = getMilestoneProgress(fractional)
  const best = Math.max(state.bestStreakDays, elapsed.days)

  const timeParts = formatElapsed(elapsed)

  return (
    <Card className="relative overflow-hidden border-border/40 glass-card">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 h-56 bg-primary/10 blur-3xl rounded-full"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 top-20 h-32 w-32 bg-success/5 blur-3xl rounded-full"
      />
      
      <CardContent className="relative flex flex-col items-center gap-8 py-10">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Foco Contínuo
        </div>

        <div className="relative">
          <CircularProgress value={milestone.progress} size={280} strokeWidth={8}>
            <div className="flex flex-col items-center justify-center h-full px-6 text-center animate-in fade-in zoom-in duration-1000">
              <span className="font-sans text-8xl font-bold tracking-tighter tabular-nums text-foreground drop-shadow-sm">
                {elapsed.days}
              </span>
              <span className="text-sm font-medium tracking-widest text-muted-foreground uppercase mt-1">
                {elapsed.days === 1 ? "dia" : "dias"}
              </span>
              <span className="mt-5 text-sm font-semibold tracking-wider tabular-nums text-primary bg-primary/10 px-3 py-1 rounded-full ring-1 ring-primary/20">
                {`${`${elapsed.hours}`.padStart(2, "0")}:${`${elapsed.minutes}`.padStart(2, "0")}:${`${elapsed.seconds}`.padStart(2, "0")}`}
              </span>
            </div>
          </CircularProgress>
        </div>

        <div className="sr-only" aria-live="polite">
          {timeParts}
        </div>

        <div className="w-full max-w-[260px] text-center space-y-2">
          {milestone.reached ? (
            <p className="text-sm font-medium text-primary">
              Você superou todos os marcos. Continue firme.
            </p>
          ) : (
            <>
              <div className="flex items-baseline justify-between text-sm mb-1.5">
                <span className="text-muted-foreground font-medium">
                  Rumo a {milestone.target} dias
                </span>
                <span className="font-bold tabular-nums text-primary">
                  {Math.round(milestone.progress * 100)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${milestone.progress * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground/70 font-medium pt-1.5">
                Faltam {milestone.daysToGo} {milestone.daysToGo === 1 ? "dia" : "dias"}
              </p>
            </>
          )}
        </div>

        <Badge
          variant="secondary"
          className="gap-2 rounded-full px-4 py-1.5 font-medium bg-secondary/50 border-border/50 hover:bg-secondary/80 transition-colors"
        >
          <Award className="size-4 text-warning" />
          Melhor sequência: {best} {best === 1 ? "dia" : "dias"}
        </Badge>
      </CardContent>
    </Card>
  )
}
