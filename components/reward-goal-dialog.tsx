"use client"

import * as React from "react"
import { Gift, Coins, Plus, Trash2, CheckCircle2, Sparkles, Target, ArrowRight } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTracker, useNow } from "@/components/tracker-provider"
import { calculateSavings } from "@/lib/tracker/utils"
import { triggerCelebrationConfetti, triggerHaptic, triggerMiniConfetti } from "@/lib/feedback"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface RewardGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenSettings?: () => void
}

const PRESET_GOALS = [
  { title: "Livro / Curso Novo", amount: 80 },
  { title: "Jantar Especial", amount: 150 },
  { title: "Tênis / Roupa Nova", amount: 350 },
  { title: "Fone de Ouvido Bluetooth", amount: 250 },
  { title: "Viagem de Fim de Semana", amount: 800 },
]

export function RewardGoalDialog({ open, onOpenChange, onOpenSettings }: RewardGoalDialogProps) {
  const { state, addRewardGoal, removeRewardGoal, toggleRewardGoalCompleted } = useTracker()
  const liveNow = useNow(1000)
  const now = liveNow ?? new Date(state.streakStart).getTime()
  const savings = calculateSavings(state.streakStart, state.dailyCost, now)

  const [title, setTitle] = React.useState("")
  const [amountStr, setAmountStr] = React.useState("")
  const [showAddForm, setShowAddForm] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setTitle("")
      setAmountStr("")
      setShowAddForm(false)
    }
  }, [open])

  const handleAdd = () => {
    const amount = parseFloat(amountStr.replace(",", "."))
    if (!title.trim() || isNaN(amount) || amount <= 0) {
      toast.error("Informe um título e valor válido para sua meta.")
      return
    }

    addRewardGoal(title.trim(), amount)
    triggerHaptic("success")
    triggerMiniConfetti()
    setTitle("")
    setAmountStr("")
    setShowAddForm(false)
    toast.success(`Meta "${title.trim()}" adicionada com sucesso!`)
  }

  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    triggerHaptic(currentlyCompleted ? "light" : "success")
    if (!currentlyCompleted) {
      triggerCelebrationConfetti()
      toast.success("Parabéns! Meta conquistada!", {
        description: "Você financiou seu presente com a sua própria superação.",
      })
    }
    toggleRewardGoalCompleted(id)
  }

  const goals = state.rewardGoals || []
  const hasDailyCost = state.dailyCost !== undefined && state.dailyCost > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Gift className="size-5 text-emerald-500" />
            Metas de Presentes & Recompensas
          </DialogTitle>
          <DialogDescription>
            Transforme o dinheiro poupado com a superação do hábito em recompensas reais para você.
          </DialogDescription>
        </DialogHeader>

        {/* Savings Header Banner */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 my-1">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
              <Coins className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-muted-foreground font-medium">Economia Acumulada</span>
              <span className="text-xl font-bold text-emerald-500 tabular-nums leading-tight">
                R$ {savings.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {hasDailyCost ? (
            <span className="text-[10px] font-semibold text-emerald-500 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 shrink-0">
              R$ {state.dailyCost?.toFixed(2)}/dia
            </span>
          ) : (
            onOpenSettings && (
              <Button
                variant="outline"
                size="sm"
                className="text-[10px] h-7 px-2.5 rounded-lg border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                onClick={() => {
                  onOpenChange(false)
                  onOpenSettings()
                }}
              >
                Definir gasto
              </Button>
            )
          )}
        </div>

        {!hasDailyCost && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-500/90 leading-relaxed flex items-start gap-2">
            <Target className="size-4 shrink-0 mt-0.5" />
            <span>
              Você ainda não cadastrou o gasto diário deste hábito. Vá em <strong>Configurações</strong> e defina o valor médio para calcular suas metas automaticamente.
            </span>
          </div>
        )}

        {/* Goals List */}
        <div className="flex flex-col gap-2.5 my-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Suas Metas ({goals.length})
            </span>

            {!showAddForm && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs font-semibold gap-1 text-primary border-primary/30 hover:bg-primary/10 rounded-lg"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="size-3.5" />
                Nova Meta
              </Button>
            )}
          </div>

          {showAddForm && (
            <div className="flex flex-col gap-3 p-4 rounded-2xl border border-primary/30 bg-primary/5 animate-in fade-in zoom-in-95 duration-200">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                O que você quer comprar com sua economia?
              </span>

              <div className="flex flex-col gap-2">
                <Input
                  placeholder="Ex: Tênis de Corrida, Jantar especial..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-9 text-xs"
                />

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">R$</span>
                  <Input
                    type="number"
                    step="5"
                    min="1"
                    placeholder="0.00"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className="h-9 pl-9 text-xs"
                  />
                </div>

                {/* Suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_GOALS.map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => {
                        setTitle(preset.title)
                        setAmountStr(String(preset.amount))
                      }}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground border border-border/40 transition-colors"
                    >
                      {preset.title} (R$ {preset.amount})
                    </button>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setShowAddForm(false)}>
                    Cancelar
                  </Button>
                  <Button size="sm" className="h-8 text-xs font-bold" onClick={handleAdd}>
                    Salvar Meta
                  </Button>
                </div>
              </div>
            </div>
          )}

          {goals.length === 0 && !showAddForm ? (
            <div className="flex flex-col items-center justify-center py-8 text-center rounded-2xl border border-dashed border-border/60 bg-muted/15">
              <Gift className="size-8 text-muted-foreground/50 mb-2" />
              <p className="text-xs font-semibold text-foreground">Nenhuma meta cadastrada</p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-[240px]">
                Defina presentes materiais para celebrar sua consistência com o dinheiro que você deixou de gastar.
              </p>
              <Button
                size="sm"
                className="mt-3 text-xs font-bold rounded-xl gap-1.5"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="size-3.5" />
                Criar Primeira Meta
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {goals.map((goal) => {
                const isReached = savings >= goal.targetAmount
                const isCompleted = Boolean(goal.completed)
                const percent = Math.min(100, Math.round((savings / goal.targetAmount) * 100))
                const remaining = Math.max(0, goal.targetAmount - savings)

                return (
                  <div
                    key={goal.id}
                    className={cn(
                      "p-3.5 rounded-2xl border transition-all flex flex-col gap-2.5",
                      isCompleted
                        ? "bg-muted/30 border-border/40 opacity-70"
                        : isReached
                        ? "bg-emerald-500/10 border-emerald-500/30 shadow-sm"
                        : "bg-card border-border/60"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggle(goal.id, isCompleted)}
                          className={cn(
                            "size-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer",
                            isCompleted
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-border/80 hover:border-emerald-500 text-transparent"
                          )}
                        >
                          <CheckCircle2 className="size-4" />
                        </button>
                        <div className="flex flex-col">
                          <span className={cn("text-xs font-bold leading-tight", isCompleted && "line-through text-muted-foreground")}>
                            {goal.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">
                            Alvo: R$ {goal.targetAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                            isCompleted
                              ? "bg-muted text-muted-foreground"
                              : isReached
                              ? "bg-emerald-500 text-white animate-pulse"
                              : "bg-primary/10 text-primary"
                          )}
                        >
                          {isCompleted ? "Comprado! 🎁" : isReached ? "Alcançado! 🎉" : `${percent}%`}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeRewardGoal(goal.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {!isCompleted && (
                      <div className="space-y-1">
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-700", isReached ? "bg-emerald-500" : "bg-primary")}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>R$ {savings.toFixed(2)} poupados</span>
                          <span>{isReached ? "Pronto para resgatar!" : `Faltam R$ ${remaining.toFixed(2)}`}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
