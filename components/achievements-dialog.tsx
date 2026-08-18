"use client"

import * as React from "react"
import { Trophy, Footprints, Zap, Flame, Medal, ShieldCheck, BrainCircuit, Rocket, Crown, Lock } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useTracker } from "@/components/tracker-provider"
import { MILESTONES } from "@/lib/tracker/utils"
import { cn } from "@/lib/utils"

interface AchievementsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const BADGES = {
  1: { name: "Primeiro Passo", icon: Footprints, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  3: { name: "Ganhando Tração", icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  7: { name: "Uma Semana", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  14: { name: "Quinzena", icon: Medal, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  30: { name: "Mês Intacto", icon: ShieldCheck, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  60: { name: "Hábito Formado", icon: BrainCircuit, color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  90: { name: "Reboot Completo", icon: Rocket, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  180: { name: "Meio Ano", icon: Crown, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  365: { name: "Lenda Viva", icon: Trophy, color: "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]", bg: "bg-gradient-to-br from-yellow-500/20 to-amber-600/20", border: "border-yellow-500/40" },
} as const

export function AchievementsDialog({ open, onOpenChange }: AchievementsDialogProps) {
  const { state } = useTracker()
  const bestStreak = state.bestStreakDays

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="mb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Trophy className="size-5 text-yellow-500" />
            Sala de Troféus
          </DialogTitle>
          <DialogDescription>
            Suas conquistas nunca são apagadas. Elas representam o seu maior recorde pessoal.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MILESTONES.map((milestone) => {
            const badge = BADGES[milestone as keyof typeof BADGES]
            const isUnlocked = bestStreak >= milestone
            const Icon = badge.icon

            if (isUnlocked) {
              return (
                <div 
                  key={milestone}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all",
                    badge.bg, badge.border
                  )}
                >
                  <Icon className={cn("size-8 mb-3", badge.color)} />
                  <span className="text-xs font-bold leading-tight">{badge.name}</span>
                  <span className="text-[10px] text-muted-foreground mt-1">{milestone} dias</span>
                </div>
              )
            }

            // Locked state
            const progress = Math.min(100, Math.round((bestStreak / milestone) * 100))
            return (
              <div 
                key={milestone}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-border/50 bg-muted/20 text-center grayscale opacity-60 transition-all hover:grayscale-0 hover:opacity-100"
              >
                <div className="relative mb-3">
                  <Icon className="size-8 text-muted-foreground" />
                  <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                    <Lock className="size-3 text-muted-foreground" />
                  </div>
                </div>
                <span className="text-xs font-semibold leading-tight text-muted-foreground">{badge.name}</span>
                
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-muted-foreground/40 rounded-full" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-[9px] text-muted-foreground/60 mt-1">{bestStreak} / {milestone} d</span>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
