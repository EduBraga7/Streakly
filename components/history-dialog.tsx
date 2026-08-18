"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useTracker } from "@/components/tracker-provider"
import { dayKey } from "@/lib/tracker/utils"
import { cn } from "@/lib/utils"

interface HistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

export function HistoryDialog({ open, onOpenChange }: HistoryDialogProps) {
  const { state, editHistoryEntry } = useTracker()
  const [currentDate, setCurrentDate] = React.useState(new Date())

  // Reset to current month when opening
  React.useEffect(() => {
    if (open) {
      setCurrentDate(new Date())
    }
  }, [open])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // Generate calendar grid
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  
  const todayKey = dayKey(new Date())

  // Statistics for this specific month
  let cleanCount = 0
  let crisisCount = 0
  let relapseCount = 0

  const gridDays = []

  // Padding start of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    gridDays.push(null)
  }

  // Actual days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i)
    const k = dayKey(d)
    const status = state.history[k]

    if (status === "clean") cleanCount++
    if (status === "crisis") crisisCount++
    if (status === "relapse") relapseCount++

    gridDays.push({ day: i, key: k, status, isToday: k === todayKey, date: d })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CalendarIcon className="size-5" />
            Histórico Completo
          </DialogTitle>
          <DialogDescription>
            Acompanhe a sua jornada mês a mês.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {/* Calendar Header / Navigation */}
          <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="size-8">
              <ChevronLeft className="size-4" />
            </Button>
            <span className="font-semibold text-sm">
              {MONTH_NAMES[month]} {year}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={nextMonth} 
              className="size-8"
              disabled={year === new Date().getFullYear() && month === new Date().getMonth()}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {/* Grid */}
          <div className="rounded-xl border border-border/50 p-4">
            <div className="grid grid-cols-7 gap-y-3 gap-x-1 sm:gap-x-2 text-center">
              {/* Weekday Labels */}
              {WEEKDAYS.map((w) => (
                <div key={w} className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  {w}
                </div>
              ))}

              {/* Day Cells */}
              {gridDays.map((cell, index) => {
                if (!cell) {
                  return <div key={`empty-${index}`} />
                }

                const isFuture = cell.date > new Date()
                let bgClass = "bg-muted/10 hover:bg-muted/30"
                let textClass = "text-foreground"

                if (cell.status === "clean") {
                  bgClass = "bg-primary text-primary-foreground"
                } else if (cell.status === "crisis") {
                  bgClass = "bg-warning text-warning-foreground"
                } else if (cell.status === "relapse") {
                  bgClass = "bg-destructive text-destructive-foreground"
                } else if (isFuture) {
                  textClass = "text-muted-foreground/30"
                }

                return (
                  <DropdownMenu key={cell.key}>
                    <DropdownMenuTrigger disabled={isFuture} asChild>
                      <button className="flex flex-col items-center justify-center focus:outline-none disabled:cursor-default disabled:opacity-50">
                        <div 
                          className={cn(
                            "flex size-8 sm:size-9 items-center justify-center rounded-full text-xs font-medium transition-colors cursor-pointer",
                            bgClass,
                            textClass,
                            cell.isToday && !cell.status && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background",
                            cell.isToday && cell.status && "ring-2 ring-offset-2 ring-offset-background",
                            cell.status === "clean" && cell.isToday && "ring-primary/50",
                            cell.status === "crisis" && cell.isToday && "ring-warning/50",
                            cell.status === "relapse" && cell.isToday && "ring-destructive/50"
                          )}
                        >
                          {cell.day}
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="min-w-[180px]">
                      <DropdownMenuItem onClick={() => editHistoryEntry(cell.key, "clean")}>
                        <div className="size-2 rounded-full bg-primary mr-2" />
                        Marcar como Limpo
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => editHistoryEntry(cell.key, "crisis")}>
                        <div className="size-2 rounded-full bg-warning mr-2" />
                        Crise Superada
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => editHistoryEntry(cell.key, "relapse")}>
                        <div className="size-2 rounded-full bg-destructive mr-2" />
                        Marcar Recaída
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => editHistoryEntry(cell.key, null)}>
                        <div className="size-2 rounded-full bg-transparent border border-destructive mr-2" />
                        Remover Registro
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              })}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center justify-center gap-1 rounded-xl bg-primary/10 py-3 border border-primary/20">
              <span className="text-xl font-bold text-primary">{cleanCount}</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-primary/80">Limpos</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 rounded-xl bg-warning/10 py-3 border border-warning/20">
              <span className="text-xl font-bold text-warning">{crisisCount}</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-warning/80">Crises</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 rounded-xl bg-destructive/10 py-3 border border-destructive/20">
              <span className="text-xl font-bold text-destructive">{relapseCount}</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-destructive/80">Recaídas</span>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
