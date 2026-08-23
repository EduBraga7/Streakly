"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNow, useTracker } from "@/components/tracker-provider"
import { getRecentDays } from "@/lib/tracker/utils"
import type { DayStatus } from "@/lib/tracker/types"
import { triggerHaptic } from "@/lib/feedback"
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
  const { state, editHistoryEntry } = useTracker()
  const liveNow = useNow(60_000)
  const now = liveNow ?? new Date(state.streakStart).getTime()
  const days = getRecentDays(state.history, 7, now)
  const todayKey = days[days.length - 1]?.key

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium">Últimos 7 dias</CardTitle>
        {onOpenHistory && (
          <button 
            type="button"
            onClick={onOpenHistory}
            className="text-xs font-medium text-primary hover:underline cursor-pointer"
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
              <DropdownMenu key={key}>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-muted/20 py-2.5 transition-all hover:bg-muted/40 cursor-pointer focus-visible:outline-none",
                        isToday && "border-primary/40 bg-primary/5 ring-1 ring-primary/30",
                        status === "clean" && "border-primary/30 bg-primary/10",
                        status === "crisis" && "border-warning/30 bg-warning/10",
                        status === "relapse" && "border-destructive/30 bg-destructive/10"
                      )}
                    />
                  }
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
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="min-w-[170px]">
                  <DropdownMenuItem
                    onClick={() => {
                      triggerHaptic("light")
                      editHistoryEntry(key, "clean")
                    }}
                  >
                    <div className="size-2 rounded-full bg-primary mr-2" />
                    Marcar como Limpo
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      triggerHaptic("light")
                      editHistoryEntry(key, "crisis")
                    }}
                  >
                    <div className="size-2 rounded-full bg-warning mr-2" />
                    Crise Superada
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      triggerHaptic("light")
                      editHistoryEntry(key, "relapse")
                    }}
                  >
                    <div className="size-2 rounded-full bg-destructive mr-2" />
                    Marcar Recaída
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    onClick={() => {
                      triggerHaptic("light")
                      editHistoryEntry(key, null)
                    }}
                  >
                    <div className="size-2 rounded-full bg-transparent border border-destructive mr-2" />
                    Remover Registro
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
