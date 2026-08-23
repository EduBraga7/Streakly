"use client"

import * as React from "react"
import { Activity, CheckCircle2, Lock, Sparkles, Coins } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useTracker, useNow } from "@/components/tracker-provider"
import { HEALTH_RECOVERY_MILESTONES, getFractionalDays, calculateSavings } from "@/lib/tracker/utils"
import { cn } from "@/lib/utils"

interface HealthTimelineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HealthTimelineDialog({ open, onOpenChange }: HealthTimelineDialogProps) {
  const { state } = useTracker()
  const liveNow = useNow(1000)
  const now = liveNow ?? new Date(state.streakStart).getTime()
  const fractionalDays = getFractionalDays(state.streakStart, now)
  const savings = calculateSavings(state.streakStart, state.dailyCost, now)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="mb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Activity className="size-5 text-emerald-500" />
            Linha de Recuperação & Saúde
          </DialogTitle>
          <DialogDescription>
            Como o seu cérebro e organismo evoluem a cada dia sem recaídas.
          </DialogDescription>
        </DialogHeader>

        {state.dailyCost && state.dailyCost > 0 ? (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Coins className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-muted-foreground font-medium">Economia acumulada</span>
                <span className="text-base font-bold text-emerald-500 tabular-nums">
                  R$ {savings.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25">
              R$ {state.dailyCost.toFixed(2)}/dia
            </span>
          </div>
        ) : null}

        <div className="relative flex flex-col gap-4 pl-4 border-l-2 border-border/60 ml-2 mt-2">
          {HEALTH_RECOVERY_MILESTONES.map((item) => {
            const isCompleted = fractionalDays >= item.day
            const isCurrent = !isCompleted && (
              item.day === 1 
                ? fractionalDays < 1 
                : fractionalDays >= (HEALTH_RECOVERY_MILESTONES.find(m => m.day < item.day)?.day || 0)
            )

            let progress = 0
            if (isCompleted) {
              progress = 100
            } else {
              progress = Math.min(99, Math.max(0, Math.round((fractionalDays / item.day) * 100)))
            }

            return (
              <div key={item.day} className="relative flex flex-col gap-1.5 pb-2">
                {/* Timeline Dot */}
                <div
                  className={cn(
                    "absolute -left-[25px] top-0.5 size-5 rounded-full flex items-center justify-center text-[10px]",
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-sm"
                      : isCurrent
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse"
                      : "bg-muted text-muted-foreground border border-border"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="size-3.5" />
                  ) : isCurrent ? (
                    <Sparkles className="size-3" />
                  ) : (
                    <Lock className="size-2.5" />
                  )}
                </div>

                {/* Milestone Card */}
                <div
                  className={cn(
                    "p-3.5 rounded-2xl border transition-all",
                    isCompleted
                      ? "bg-card border-border/60"
                      : isCurrent
                      ? "bg-primary/5 border-primary/30 shadow-sm"
                      : "bg-muted/15 border-border/30 opacity-60"
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-foreground leading-tight">
                      {item.title}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0",
                        item.category === "physical"
                          ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                          : "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                      )}
                    >
                      {item.category === "physical" ? "Biológico" : "Neural / Mental"}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>

                  {/* Progress bar if in progress */}
                  {!isCompleted && isCurrent && (
                    <div className="mt-3 pt-2 border-t border-border/40 space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Progresso para este marco:</span>
                        <span className="font-semibold text-primary">{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
