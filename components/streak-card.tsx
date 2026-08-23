"use client"

import { Award, Share2 } from "lucide-react"
import * as React from "react"

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
import { updateAppBadge } from "@/lib/pwa/badging"
import { triggerHaptic } from "@/lib/feedback"

/**
 * Subcomponent that isolates the 1-second interval ticking
 * so only this pill re-renders every second, not the entire StreakCard tree.
 */
function LiveTimePill({ streakStart }: { streakStart: string }) {
  const liveNow = useNow(1000)
  const now = liveNow ?? new Date(streakStart).getTime()
  const elapsed = getElapsed(streakStart, now)
  const timeParts = formatElapsed(elapsed)

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1 font-mono text-xs text-muted-foreground border border-border/40 mt-3"
      aria-hidden="true"
    >
      <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse" />
      {timeParts}
    </span>
  )
}

interface StreakCardProps {
  onOpenShare?: () => void
}

export function StreakCard({ onOpenShare }: StreakCardProps) {
  const { state } = useTracker()
  // Reduce tick rate for milestone calculation to 10s instead of 1s
  const liveNow = useNow(10_000)
  const now = liveNow ?? new Date(state.streakStart).getTime()
  const elapsed = getElapsed(state.streakStart, now)
  const fractionalDays = getFractionalDays(state.streakStart, now)
  const milestone = getMilestoneProgress(fractionalDays)
  const best = state.bestStreakDays
  const timeParts = formatElapsed(elapsed)

  React.useEffect(() => {
    updateAppBadge(elapsed.days)
  }, [elapsed.days])

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
      
      <CardContent className="relative flex flex-col items-center gap-8 py-8">
        <div className="w-full flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Foco Contínuo
          </div>
          {onOpenShare && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light")
                onOpenShare()
              }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2.5 py-1 rounded-lg hover:bg-primary/10 cursor-pointer"
              title="Compartilhar Conquista (Story/WhatsApp)"
            >
              <Share2 className="size-3.5 text-primary" />
              <span className="text-[11px] font-semibold text-foreground">Compartilhar</span>
            </button>
          )}
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
              <LiveTimePill streakStart={state.streakStart} />
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
