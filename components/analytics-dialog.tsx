"use client"

import * as React from "react"
import { BarChart3, Target, Smile, BookOpen, Clock, AlertTriangle, FileText } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Cell } from "recharts"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useTracker } from "@/components/tracker-provider"
import { getTriggersFrequency, getRelapsesByDayOfWeek, getMoodFrequency, getDiaryEntries } from "@/lib/tracker/utils"
import { YearHeatmap } from "@/components/year-heatmap"
import { cn } from "@/lib/utils"

interface AnalyticsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenExportReport?: () => void
}

export function AnalyticsDialog({ open, onOpenChange, onOpenExportReport }: AnalyticsDialogProps) {
  const { state } = useTracker()
  
  const triggersData = React.useMemo(() => getTriggersFrequency(state), [state])
  const daysData = React.useMemo(() => getRelapsesByDayOfWeek(state), [state])
  const moodData = React.useMemo(() => getMoodFrequency(state), [state])
  const diaryEntries = React.useMemo(() => getDiaryEntries(state), [state])

  const totalMoodLogs = moodData.reduce((acc, curr) => acc + curr.count, 0)
  const hasRelapseData = state.relapses.length > 0
  const hasMoodData = totalMoodLogs > 0
  const hasDiaryData = diaryEntries.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-[95vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" />
              Análises & Diário
            </DialogTitle>
            {onOpenExportReport && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs font-semibold gap-1.5 rounded-xl border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => {
                  onOpenChange(false)
                  onOpenExportReport()
                }}
              >
                <FileText className="size-3.5" />
                Relatório PDF
              </Button>
            )}
          </div>
          <DialogDescription>
            Entenda seus padrões de humor, tentações e evolução ao longo do ano.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="heatmap" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-4 h-9">
            <TabsTrigger value="heatmap" className="text-xs">Mapa 365d</TabsTrigger>
            <TabsTrigger value="mood" className="text-xs">Humor</TabsTrigger>
            <TabsTrigger value="triggers" className="text-xs">Gatilhos</TabsTrigger>
            <TabsTrigger value="diary" className="text-xs">Diário ({diaryEntries.length})</TabsTrigger>
          </TabsList>

          {/* ── ABA 0: HEATMAP ANUAL (365 DIAS) ── */}
          <TabsContent value="heatmap" className="mt-4 focus-visible:outline-none flex flex-col gap-3">
            <YearHeatmap />
          </TabsContent>

          {/* ── ABA 1: HUMOR & BEM-ESTAR ── */}
          <TabsContent value="mood" className="mt-4 focus-visible:outline-none flex flex-col gap-3">
            {!hasMoodData ? (
              <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border border-dashed border-border/60 bg-muted/20">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Smile className="size-5 text-primary" />
                </div>
                <p className="text-xs font-semibold">Sem registros de humor</p>
                <p className="text-[11px] text-muted-foreground mt-1 max-w-[220px]">
                  Faça o check-in diário selecionando seu humor para ver a distribuição emocional aqui.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                <span className="text-xs font-bold text-foreground block mb-1">Distribuição de Humor nos Check-ins</span>
                <div className="h-[220px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={moodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="label" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        allowDecimals={false} 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <RechartsTooltip 
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {moodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-center text-muted-foreground mt-2">
                  Total de {totalMoodLogs} check-ins com humor avaliado
                </p>
              </div>
            )}
          </TabsContent>

          {/* ── ABA 2: GATILHOS E DIAS CRÍTICOS ── */}
          <TabsContent value="triggers" className="mt-4 focus-visible:outline-none flex flex-col gap-3">
            {!hasRelapseData ? (
              <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border border-dashed border-border/60 bg-muted/20">
                <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                  <Target className="size-5 text-emerald-500" />
                </div>
                <p className="text-xs font-semibold text-emerald-500">Nenhuma recaída registrada!</p>
                <p className="text-[11px] text-muted-foreground mt-1 max-w-[220px]">
                  Continue firme na sua sequência limpa. Os gráficos de análise de gatilhos aparecerão se houver registros.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                  <span className="text-xs font-bold text-foreground block mb-1">Gatilhos mais frequentes</span>
                  <div className="h-[200px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={triggersData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="label" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis 
                          allowDecimals={false} 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <RechartsTooltip 
                          cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                          contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                  <span className="text-xs font-bold text-foreground block mb-1">Recaídas por dia da semana</span>
                  <div className="h-[200px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={daysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="day" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis 
                          allowDecimals={false} 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <RechartsTooltip 
                          cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                          contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── ABA 3: DIÁRIO DE BORDO & REFLEXÕES ── */}
          <TabsContent value="diary" className="mt-4 focus-visible:outline-none flex flex-col gap-3">
            {!hasDiaryData ? (
              <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border border-dashed border-border/60 bg-muted/20">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <BookOpen className="size-5 text-primary" />
                </div>
                <p className="text-xs font-semibold">Diário vazio</p>
                <p className="text-[11px] text-muted-foreground mt-1 max-w-[220px]">
                  Adicione notas no check-in diário ou reflexões de recaída para revisitar seus pensamentos aqui.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {diaryEntries.map((item, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-3.5 rounded-2xl border flex flex-col gap-1.5",
                      item.status === "clean"
                        ? "bg-primary/5 border-primary/20"
                        : item.status === "crisis"
                        ? "bg-amber-500/5 border-amber-500/20"
                        : "bg-destructive/5 border-destructive/20"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground">{item.dateKey}</span>
                        {item.mood && (
                          <span className="text-xs">
                            {item.mood === "great" && "😃"}
                            {item.mood === "good" && "😊"}
                            {item.mood === "neutral" && "😐"}
                            {item.mood === "stressed" && "😫"}
                            {item.mood === "bad" && "😔"}
                          </span>
                        )}
                        {item.urgeLevel && item.urgeLevel > 1 && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            Impulso {item.urgeLevel}/5
                          </span>
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-[9px] font-bold uppercase px-2 py-0.5 rounded-full",
                          item.status === "clean"
                            ? "bg-primary/15 text-primary"
                            : item.status === "crisis"
                            ? "bg-amber-500/15 text-amber-500"
                            : "bg-destructive/15 text-destructive"
                        )}
                      >
                        {item.status === "clean" ? "Check-in" : item.status === "crisis" ? "Crise Superada" : "Recaída"}
                      </span>
                    </div>

                    <p className="text-xs text-foreground/90 leading-relaxed italic">
                      “{item.note}”
                    </p>

                    {item.trigger && (
                      <span className="text-[10px] text-destructive font-medium">
                        Gatilho: {item.trigger}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
