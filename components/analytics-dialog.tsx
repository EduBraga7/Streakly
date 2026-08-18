"use client"

import * as React from "react"
import { BarChart3, CalendarDays, Target } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTracker } from "@/components/tracker-provider"
import { getTriggersFrequency, getRelapsesByDayOfWeek } from "@/lib/tracker/utils"

interface AnalyticsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AnalyticsDialog({ open, onOpenChange }: AnalyticsDialogProps) {
  const { state } = useTracker()
  
  const triggersData = React.useMemo(() => getTriggersFrequency(state), [state])
  const daysData = React.useMemo(() => getRelapsesByDayOfWeek(state), [state])

  const hasData = state.relapses.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            Relatório de Análises
          </DialogTitle>
          <DialogDescription>
            Entenda seus padrões de recaída para evitá-los no futuro.
          </DialogDescription>
        </DialogHeader>

        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Target className="size-6 text-primary" />
            </div>
            <p className="text-sm font-medium">Nenhum dado ainda</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
              Continue firme! Os gráficos aparecerão aqui se você registrar recaídas.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="triggers" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="triggers">Gatilhos</TabsTrigger>
              <TabsTrigger value="days">Dias da Semana</TabsTrigger>
            </TabsList>
            
            <TabsContent value="triggers" className="mt-4 focus-visible:outline-none">
              <div className="rounded-xl border bg-card p-3 shadow-sm">
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={triggersData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="label" 
                        fontSize={11} 
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
                <p className="text-[10px] text-center text-muted-foreground mt-3">
                  Frequência dos motivos que causaram recaídas
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="days" className="mt-4 focus-visible:outline-none">
              <div className="rounded-xl border bg-card p-3 shadow-sm">
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={daysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="day" 
                        fontSize={11} 
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
                <p className="text-[10px] text-center text-muted-foreground mt-3">
                  Distribuição de recaídas por dia da semana
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
