"use client"

import * as React from "react"
import { Calendar, Flame, ShieldCheck, AlertTriangle, Sparkles } from "lucide-react"
import { useTracker, useNow } from "@/components/tracker-provider"
import { getYearlyHeatmapData, HeatmapDay } from "@/lib/tracker/utils"
import { cn } from "@/lib/utils"

const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
]

const WEEKDAY_NAMES = ["D", "S", "T", "Q", "Q", "S", "S"]

export function YearHeatmap() {
  const { state } = useTracker()
  const liveNow = useNow(60_000)
  const now = liveNow ?? new Date(state.streakStart).getTime()
  const [hoveredDay, setHoveredDay] = React.useState<HeatmapDay | null>(null)

  const heatmapData = React.useMemo(
    () => getYearlyHeatmapData(state.history, now),
    [state.history, now]
  )

  const { weeks, totalClean, totalCrisis, totalRelapse, consistencyPercent } = heatmapData

  return (
    <div className="flex flex-col gap-4 p-4 rounded-2xl border border-border/60 bg-card shadow-sm">
      {/* Stats Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/40">
        <div>
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Calendar className="size-3.5 text-primary" />
            Mapa de Calor Anual (365 Dias)
          </span>
          <span className="text-[11px] text-muted-foreground">
            Sua consistência visual em cada semana do ano
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-emerald-500 font-bold">{totalClean}</span>
            <span className="text-[10px] text-muted-foreground">limpos</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-amber-500 font-bold">{totalCrisis}</span>
            <span className="text-[10px] text-muted-foreground">crises</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-primary font-bold">{consistencyPercent}%</span>
            <span className="text-[10px] text-muted-foreground">foco</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid (Horizontally scrollable for mobile) */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[650px] flex flex-col gap-1.5 select-none">
          
          {/* Month Labels Header */}
          <div className="flex pl-6 text-[10px] text-muted-foreground font-medium">
            {weeks.map((week, wIdx) => {
              const firstDay = week[0]
              const isFirstWeekOfMonth = firstDay && firstDay.dayOfMonth <= 7 && (wIdx === 0 || weeks[wIdx - 1][0]?.month !== firstDay.month)
              return (
                <div key={wIdx} className="w-[12px] mr-[3px] text-center shrink-0">
                  {isFirstWeekOfMonth ? (
                    <span className="block -ml-2 font-bold text-foreground/80">{MONTH_NAMES[firstDay.month]}</span>
                  ) : null}
                </div>
              )
            })}
          </div>

          {/* Grid rows by day of week (0 to 6) */}
          <div className="flex gap-[3px]">
            {/* Weekday indicator column */}
            <div className="flex flex-col gap-[3px] pr-1.5 text-[9px] font-semibold text-muted-foreground justify-between py-[1px]">
              {WEEKDAY_NAMES.map((name, i) => (
                <span key={i} className="h-[11px] leading-[11px] flex items-center justify-center">
                  {i % 2 === 1 ? name : ""}
                </span>
              ))}
            </div>

            {/* Weeks Columns */}
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-[3px]">
                {week.map((cell) => {
                  let bgClass = "bg-muted/40 hover:bg-muted/70"

                  if (cell.status === "clean") {
                    bgClass = "bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.4)]"
                  } else if (cell.status === "crisis") {
                    bgClass = "bg-amber-500 hover:bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.4)]"
                  } else if (cell.status === "relapse") {
                    bgClass = "bg-rose-500 hover:bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.4)]"
                  }

                  return (
                    <div
                      key={cell.dateKey}
                      onMouseEnter={() => setHoveredDay(cell)}
                      onClick={() => setHoveredDay(cell)}
                      className={cn(
                        "size-[11px] rounded-[3px] transition-all cursor-pointer",
                        bgClass,
                        cell.isToday && "ring-1 ring-primary ring-offset-1 ring-offset-background"
                      )}
                    />
                  )
                })}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Hover / Selected Info Tooltip Banner */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40 min-h-[28px]">
        {hoveredDay ? (
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">
              {hoveredDay.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}:
            </span>
            <span
              className={cn(
                "font-semibold px-2 py-0.5 rounded-full text-[10px]",
                hoveredDay.status === "clean"
                  ? "bg-emerald-500/15 text-emerald-500"
                  : hoveredDay.status === "crisis"
                  ? "bg-amber-500/15 text-amber-500"
                  : hoveredDay.status === "relapse"
                  ? "bg-rose-500/15 text-rose-500"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {hoveredDay.status === "clean"
                ? "Dia Limpo ✓"
                : hoveredDay.status === "crisis"
                ? "Crise Superada ⚡"
                : hoveredDay.status === "relapse"
                ? "Recaída 🔄"
                : "Sem Registro"}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground">Passe o mouse ou toque nos blocos para ver os detalhes do dia.</span>
        )}

        {/* Legend */}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground shrink-0">
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-[2px] bg-muted/40" />
            <span>Vazio</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-[2px] bg-emerald-500" />
            <span>Limpo</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-[2px] bg-amber-500" />
            <span>Crise</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-[2px] bg-rose-500" />
            <span>Recaída</span>
          </div>
        </div>
      </div>
    </div>
  )
}
