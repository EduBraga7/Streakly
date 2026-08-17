"use client"

import { CalendarCheck, Target } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { useNow, useTracker } from "@/components/tracker-provider"
import { TRIGGERS } from "@/lib/tracker/types"
import { cleanDaysThisMonth, mostFrequentTrigger } from "@/lib/tracker/utils"

export function StatsCards() {
  const { state } = useTracker()
  const liveNow = useNow(60_000)
  // Anchor to the streak start pre-mount so the SSR and first client render
  // agree; the live value takes over after mount.
  const now = liveNow ?? new Date(state.streakStart).getTime()

  const monthClean = cleanDaysThisMonth(state.history, now)
  const topTriggerId = mostFrequentTrigger(state)
  const topTrigger =
    TRIGGERS.find((t) => t.id === topTriggerId)?.label ?? "Nenhum"

  return (
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
  )
}
