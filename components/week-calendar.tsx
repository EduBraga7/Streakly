"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNow, useTracker } from "@/components/tracker-provider"
import { getRecentDays } from "@/lib/tracker/utils"
import type { DayStatus } from "@/lib/tracker/types"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"]

const STATUS_STYLES: Record<
  DayStatus | "empty" | "today",
  { dot: string; label: string }
> = {
  clean: { dot: "bg-primary", label: "Limpo" },
  crisis: { dot: "bg-warning", label: "Crise superada" },
  relapse: { dot: "bg-destructive", label: "Recaída" },
  empty: { dot: "bg-muted-foreground/30", label: "Sem registro" },
  today: { dot: "bg-muted-foreground/30", label: "Hoje" },
}

interface WeekCalendarProps {
  onOpenHistory?: () => void
}

export function WeekCalendar({ onOpenHistory }: WeekCalendarProps) {
  const { state } = useTracker()
  const liveNow = useNow(60_000)
  // Anchor to the streak start pre-mount so the 7-day window matches between
  // server and first client render, avoiding hydration mismatches.
  const now = liveNow ?? new Date(state.streakStart).getTime()
  const days = getRecentDays(state.history, 7, now)
  const todayKey = days[days.length - 1]?.key

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium">Últimos 7 dias</CardTitle>
        {onOpenHistory && (
          <button 
            onClick={onOpenHistory}
            className="text-xs font-medium text-primary hover:underline"
          >
            Ver mês a mês
          </button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-7 gap-1.5">
          {days.map(({ date, key, status }) => {
            const isToday = key === todayKey
            const style = STATUS_STYLES[status ?? "empty"]
            return (
              <div
                key={key}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-muted/20 py-2.5",
                  isToday && "border-primary/40 bg-primary/5",
                )}
              >
                <span className="text-[10px] font-medium text-muted-foreground">
                  {WEEKDAYS[date.getDay()]}
                </span>
                <span className="text-sm font-medium tabular-nums text-foreground">
                  {date.getDate()}
                </span>
                <span
                  className={cn("size-2 rounded-full", style.dot)}
                  aria-label={style.label}
                />
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {(["clean", "crisis", "relapse"] as DayStatus[]).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full", STATUS_STYLES[s].dot)} />
              <span className="text-xs text-muted-foreground">
                {STATUS_STYLES[s].label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
