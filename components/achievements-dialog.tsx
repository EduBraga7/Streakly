"use client"

import * as React from "react"
import { Trophy, Footprints, Zap, Flame, Medal, ShieldCheck, BrainCircuit, Rocket, Crown, Lock, Share2, Award, Sparkles } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useTracker } from "@/components/tracker-provider"
import { MILESTONES, getUserRank } from "@/lib/tracker/utils"
import { cn } from "@/lib/utils"
import { triggerHaptic, triggerMiniConfetti } from "@/lib/feedback"
import { playAchievementFanfare } from "@/lib/audio/sound-effects"
import { ShareAchievementDialog } from "@/components/share-achievement-dialog"
import { GrowthTree } from "@/components/growth-tree"

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
  const rank = getUserRank(bestStreak)
  const [shareOpen, setShareOpen] = React.useState(false)
  const [selectedMilestone, setSelectedMilestone] = React.useState<{ day: number; title: string } | undefined>(undefined)

  React.useEffect(() => {
    if (open && bestStreak > 0) {
      playAchievementFanfare()
    }
  }, [open, bestStreak])

  const handleOpenShare = (day?: number, title?: string) => {
    triggerHaptic("light")
    setSelectedMilestone(day && title ? { day, title } : undefined)
    setShareOpen(true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="mb-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Trophy className="size-5 text-yellow-500" />
              Sala de Troféus & Evolução
            </DialogTitle>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs font-semibold gap-1.5 rounded-xl border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => handleOpenShare()}
            >
              <Share2 className="size-3.5" />
              Compartilhar
            </Button>
          </div>
          <DialogDescription>
            Acompanhe seu rank, conquistas eternas e a evolução viva do seu hábito.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="badges" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2 h-9">
            <TabsTrigger value="badges" className="text-xs">Troféus & Patentes</TabsTrigger>
            <TabsTrigger value="tree" className="text-xs">Jardim da Vida 🌱</TabsTrigger>
          </TabsList>

          <TabsContent value="tree" className="mt-3 focus-visible:outline-none">
            <GrowthTree />
          </TabsContent>

          <TabsContent value="badges" className="mt-3 focus-visible:outline-none flex flex-col gap-3">
            {/* User Rank Card */}
            <div className={cn("p-4 rounded-2xl border flex flex-col gap-3", rank.bg, rank.border)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-background/80 flex items-center justify-center shadow-sm">
                <Award className={cn("size-5", rank.color)} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nível {rank.level}</span>
                  <span className={cn("text-xs font-black", rank.color)}>{rank.title}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">{rank.subtitle}</span>
              </div>
            </div>

            <span className="text-xs font-bold tabular-nums text-foreground bg-background/60 px-2 py-0.5 rounded-full border border-border/40">
              {bestStreak} {bestStreak === 1 ? "dia" : "dias"}
            </span>
          </div>

          {rank.level < 9 && (
            <div className="space-y-1 pt-1 border-t border-border/30">
              <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                <span>Próxima patente ({rank.nextLevelDays} dias)</span>
                <span className="font-bold text-foreground">{Math.round(rank.progress * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-background/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${rank.progress * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MILESTONES.map((milestone) => {
            const badge = BADGES[milestone as keyof typeof BADGES]
            const isUnlocked = bestStreak >= milestone
            const Icon = badge.icon

            if (isUnlocked) {
              return (
                <button 
                  key={milestone}
                  type="button"
                  onClick={() => {
                    triggerHaptic("success")
                    triggerMiniConfetti()
                    handleOpenShare(milestone, badge.name)
                  }}
                  className={cn(
                    "relative group flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all cursor-pointer",
                    "hover:scale-[1.03] active:scale-[0.97]",
                    badge.bg, badge.border
                  )}
                >
                  <Icon className={cn("size-8 mb-3", badge.color)} />
                  <span className="text-xs font-bold leading-tight">{badge.name}</span>
                  <span className="text-[10px] text-muted-foreground mt-1">{milestone} dias</span>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Share2 className="size-3 text-muted-foreground" />
                  </div>
                </button>
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
          </TabsContent>
        </Tabs>

        <ShareAchievementDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          milestoneDay={selectedMilestone?.day}
          milestoneTitle={selectedMilestone?.title}
        />
      </DialogContent>
    </Dialog>
  )
}
