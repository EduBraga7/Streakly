"use client"

import { CalendarCheck, Target, Activity, Coins, BarChart3 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { useNow, useTracker } from "@/components/tracker-provider"
import { Button } from "@/components/ui/button"
import { cleanDaysThisMonth, mostFrequentTrigger, calculateSavings } from "@/lib/tracker/utils"

interface StatsCardsProps {
  onOpenAnalytics: () => void
  onOpenHealthTimeline: () => void
  onOpenRewardGoals?: () => void
  onOpenExportReport?: () => void
}

export function StatsCards({ onOpenAnalytics, onOpenHealthTimeline, onOpenRewardGoals, onOpenExportReport }: StatsCardsProps) {
  const { state } = useTracker()
  const liveNow = useNow(60_000)
  // Anchor to the streak start pre-mount so the SSR and first client render
  // agree; the live value takes over after mount.
  const now = liveNow ?? new Date(state.streakStart).getTime()

  const monthClean = cleanDaysThisMonth(state.history, now)
  const topTriggerId = mostFrequentTrigger(state)
  const topTrigger =
    state.habit?.triggers.find((t) => t.id === topTriggerId)?.label ?? "Nenhum"
  const savings = calculateSavings(state.streakStart, state.dailyCost, now)

  const activeGoal = state.rewardGoals?.find((g) => !g.completed)

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border/60">
          <CardContent className="flex flex-col gap-2 py-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarCheck className="size-3.5 text-primary" />
              Dias limpos no mês
            </div>
            <span className="text-2xl font-semibold tabular-nums text-foreground">
              {monthClean}
            </span>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="flex flex-col gap-2 py-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="size-3.5 text-warning" />
              Gatilho frequente
            </div>
            <span className="truncate text-2xl font-semibold text-foreground">
              {topTrigger}
            </span>
          </CardContent>
        </Card>
      </div>

      {state.dailyCost && state.dailyCost > 0 ? (
        <Card
          onClick={onOpenRewardGoals}
          className="border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors cursor-pointer"
        >
          <CardContent className="flex flex-col gap-2.5 py-3.5 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Coins className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Economia Acumulada</span>
                  <span className="text-lg font-bold text-emerald-500 tabular-nums leading-tight">
                    R$ {savings.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <span className="text-[10px] text-emerald-500 font-semibold bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/25">
                {activeGoal ? "Ver Metas 🎁" : `R$ ${state.dailyCost.toFixed(2)}/dia`}
              </span>
            </div>

            {activeGoal && (
              <div className="pt-1 border-t border-emerald-500/20 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground truncate max-w-[200px]">
                  Meta: <strong className="text-foreground">{activeGoal.title}</strong>
                </span>
                <span className="font-bold text-emerald-500">
                  {Math.min(100, Math.round((savings / activeGoal.targetAmount) * 100))}%
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          className="h-10 border-border/60 bg-card text-muted-foreground hover:text-foreground text-xs font-semibold rounded-xl gap-1.5"
          onClick={onOpenHealthTimeline}
        >
          <Activity className="size-3.5 text-emerald-500" />
          Saúde & Corpo
        </Button>

        <Button 
          variant="outline" 
          className="h-10 border-border/60 bg-card text-muted-foreground hover:text-foreground text-xs font-semibold rounded-xl gap-1.5"
          onClick={onOpenAnalytics}
        >
          <BarChart3 className="size-3.5 text-primary" />
          Ver Relatório
        </Button>
      </div>
    </div>
  )
}
