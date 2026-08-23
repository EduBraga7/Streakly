"use client"

import * as React from "react"
import { Printer, Download, FileText, CheckCircle2, ShieldAlert, Heart, Activity, Target } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTracker, useNow } from "@/components/tracker-provider"
import {
  getElapsed,
  getTriggersFrequency,
  getMoodFrequency,
  getDiaryEntries,
  cleanDaysThisMonth,
  calculateSavings,
} from "@/lib/tracker/utils"
import { triggerHaptic, triggerMiniConfetti } from "@/lib/feedback"
import { toast } from "sonner"

interface ExportReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportReportDialog({ open, onOpenChange }: ExportReportDialogProps) {
  const { state, user } = useTracker()
  const liveNow = useNow(60_000)
  const now = liveNow ?? new Date(state.streakStart).getTime()
  const elapsed = getElapsed(state.streakStart, now)
  const savings = calculateSavings(state.streakStart, state.dailyCost, now)

  const triggersData = React.useMemo(() => getTriggersFrequency(state), [state])
  const moodData = React.useMemo(() => getMoodFrequency(state), [state])
  const diaryEntries = React.useMemo(() => getDiaryEntries(state).slice(0, 5), [state])

  const totalMoodLogs = moodData.reduce((acc, curr) => acc + curr.count, 0)
  const cleanCount = cleanDaysThisMonth(state.history, now)
  const displayName = state.userName || user?.displayName?.split(" ")[0] || "Paciente / Usuário"
  const habitName = state.habit?.name || "Hábito"

  const handlePrint = () => {
    triggerHaptic("light")
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto print:max-w-full print:m-0 print:p-0 print:border-none print:shadow-none">
        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileText className="size-5 text-primary" />
              Relatório de Evolução & Acompanhamento
            </DialogTitle>
            <Button
              size="sm"
              className="h-8 text-xs font-bold gap-1.5 rounded-xl shadow-sm"
              onClick={handlePrint}
            >
              <Printer className="size-3.5" />
              Imprimir / Salvar PDF
            </Button>
          </div>
          <DialogDescription>
            Documento consolidado pronto para compartilhar com psicólogo, terapeuta ou médico.
          </DialogDescription>
        </DialogHeader>

        {/* Printable Report Sheet */}
        <div className="flex flex-col gap-5 p-6 rounded-2xl border border-border/60 bg-card/60 print:bg-white print:text-black print:p-8 print:border-none">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border/80 gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                Streakly • Relatório de Sobriedade & Foco
              </span>
              <h1 className="text-xl font-black text-foreground print:text-black">
                Acompanhamento: {habitName}
              </h1>
              <p className="text-xs text-muted-foreground print:text-neutral-600">
                Titular: <strong className="text-foreground print:text-black">{displayName}</strong> · Gerado em {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end">
              <span className="text-2xl font-black text-primary tabular-nums">
                {elapsed.days} {elapsed.days === 1 ? "dia limpo" : "dias limpos"}
              </span>
              <span className="text-[11px] text-muted-foreground print:text-neutral-600">
                Maior Sequência: {state.bestStreakDays} dias
              </span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Dias no Mês</span>
              <span className="text-lg font-black text-primary tabular-nums">{cleanCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Crises Vencidas</span>
              <span className="text-lg font-black text-amber-500 tabular-nums">
                {Object.values(state.history).filter((s) => s === "crisis").length}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Recaídas Totais</span>
              <span className="text-lg font-black text-destructive tabular-nums">{state.relapses.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Economia Estimada</span>
              <span className="text-lg font-black text-emerald-500 tabular-nums">
                R$ {savings.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Emotional & Mood Breakdown */}
          <div className="flex flex-col gap-2 pt-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground print:text-black flex items-center gap-1.5">
              <Heart className="size-3.5 text-primary" />
              Distribuição Emocional nos Check-ins ({totalMoodLogs} registros)
            </h2>
            {totalMoodLogs > 0 ? (
              <div className="grid grid-cols-5 gap-1.5 text-center">
                {moodData.map((m) => {
                  const percent = totalMoodLogs > 0 ? Math.round((m.count / totalMoodLogs) * 100) : 0
                  return (
                    <div key={m.mood} className="p-2 rounded-xl border border-border/50 bg-muted/20 flex flex-col items-center">
                      <span className="text-lg">{m.label.split(" ")[0]}</span>
                      <span className="text-xs font-bold text-foreground mt-0.5">{m.count}x</span>
                      <span className="text-[9px] text-muted-foreground">{percent}%</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Sem registros de humor suficientes no período.</p>
            )}
          </div>

          {/* Triggers Breakdown */}
          <div className="flex flex-col gap-2 pt-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground print:text-black flex items-center gap-1.5">
              <Target className="size-3.5 text-warning" />
              Mapeamento de Gatilhos & Vulnerabilidades
            </h2>
            {triggersData.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {triggersData.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/60 bg-muted/20 text-xs">
                    <span className="font-medium text-foreground">{t.label}:</span>
                    <span className="font-bold text-destructive">{t.count} {t.count === 1 ? "recaída" : "recaídas"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-500 font-medium">Nenhuma recaída associada a gatilhos no período. Sequência excelente!</p>
            )}
          </div>

          {/* Recent Diary / Reflections */}
          {diaryEntries.length > 0 && (
            <div className="flex flex-col gap-2 pt-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground print:text-black flex items-center gap-1.5">
                <FileText className="size-3.5 text-primary" />
                Anotações Recentes do Diário de Bordo
              </h2>
              <div className="flex flex-col gap-2">
                {diaryEntries.map((entry, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-border/50 bg-muted/15 flex flex-col gap-1 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="font-bold">{entry.dateKey}</span>
                      <span className="uppercase font-semibold">{entry.status}</span>
                    </div>
                    <p className="italic text-foreground/90 leading-relaxed">
                      “{entry.note}”
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer signature space for therapy / personal review */}
          <div className="mt-4 pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-[10px] text-muted-foreground gap-2">
            <span>Streakly App · Autonomia e consistência comportamental</span>
            <span className="italic">Documento para uso pessoal ou clínico</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
