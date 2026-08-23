"use client"

import * as React from "react"
import { PlusCircle, Sparkles, Cigarette, Wine, Smartphone, ShieldAlert, DollarSign, Candy, Plus, Check } from "lucide-react"

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
import { useTracker } from "@/components/tracker-provider"
import { triggerCelebrationConfetti, triggerHaptic } from "@/lib/feedback"
import { toast } from "sonner"
import type { HabitData } from "@/lib/tracker/types"
import { cn } from "@/lib/utils"

interface AddHabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface HabitPreset {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  triggers: string[]
  suggestedCost?: number
}

const PRESETS: HabitPreset[] = [
  {
    id: "smoking",
    name: "Parar de Fumar",
    icon: Cigarette,
    triggers: ["Estresse", "Depois das refeições", "Bebidas alcoólicas", "Pausa no trabalho", "Ansiedade"],
    suggestedCost: 15,
  },
  {
    id: "alcohol",
    name: "Livre do Álcool",
    icon: Wine,
    triggers: ["Eventos sociais", "Fim de semana", "Estresse / Frustração", "Pressão de amigos", "Solidão"],
    suggestedCost: 30,
  },
  {
    id: "porn",
    name: "Livre de Pornografia",
    icon: ShieldAlert,
    triggers: ["Tédio / Celular na cama", "Solidão", "Estresse", "Ficar sozinho em casa", "Madrugada acordado"],
    suggestedCost: 0,
  },
  {
    id: "social_media",
    name: "Detox Digital",
    icon: Smartphone,
    triggers: ["Tédio", "Hábito ao acordar", "Fuga de tarefas", "Ansiedade", "Notificações"],
    suggestedCost: 0,
  },
  {
    id: "sugar",
    name: "Sem Açúcar & Junk Food",
    icon: Candy,
    triggers: ["Ansiedade", "Tristeza", "Depois do almoço", "Cansaço", "Finais de semana"],
    suggestedCost: 20,
  },
  {
    id: "gambling",
    name: "Sem Apostas & Cassinos",
    icon: DollarSign,
    triggers: ["Tentativa de recuperar perda", "Tédio", "Propagandas", "Final de semana", "Ansiedade financeira"],
    suggestedCost: 50,
  },
]

export function AddHabitDialog({ open, onOpenChange }: AddHabitDialogProps) {
  const { createTracker, allTrackers } = useTracker()
  const [selectedPreset, setSelectedPreset] = React.useState<HabitPreset | null>(null)
  const [customName, setCustomName] = React.useState("")
  const [isCustom, setIsCustom] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setSelectedPreset(null)
      setCustomName("")
      setIsCustom(false)
    }
  }, [open])

  const handleCreate = () => {
    let newHabit: HabitData

    if (isCustom) {
      if (!customName.trim()) {
        toast.error("Informe o nome do seu novo hábito.")
        return
      }
      newHabit = {
        id: `custom-${Date.now()}`,
        name: customName.trim(),
        triggers: [
          { id: "1", label: "Estresse" },
          { id: "2", label: "Tédio" },
          { id: "3", label: "Ansiedade" },
        ],
      }
    } else if (selectedPreset) {
      // Check if already tracking this preset id
      const existing = allTrackers.find((t) => t.habit?.id === selectedPreset.id)
      const id = existing ? `${selectedPreset.id}-${Date.now()}` : selectedPreset.id
      newHabit = {
        id,
        name: selectedPreset.name,
        triggers: selectedPreset.triggers.map((t, idx) => ({ id: String(idx + 1), label: t })),
      }
    } else {
      toast.error("Selecione um hábito ou crie um personalizado.")
      return
    }

    createTracker(newHabit)
    triggerHaptic("success")
    triggerCelebrationConfetti()
    onOpenChange(false)
    toast.success(`Hábito "${newHabit.name}" adicionado com sucesso!`, {
      description: "Sua jornada limpa começou agora.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <PlusCircle className="size-5 text-primary" />
            Adicionar Novo Hábito
          </DialogTitle>
          <DialogDescription>
            Acompanhe múltiplos hábitos com sequências, recordes e estatísticas independentes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 my-2">
          {/* Preset list */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold text-foreground">Escolha um modelo ou crie o seu:</Label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset) => {
                const Icon = preset.icon
                const isSelected = !isCustom && selectedPreset?.id === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic("light")
                      setIsCustom(false)
                      setSelectedPreset(preset)
                    }}
                    className={cn(
                      "flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/30"
                        : "border-border/60 bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className={cn("size-8 rounded-xl flex items-center justify-center shrink-0", isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
                      <Icon className="size-4" />
                    </div>
                    <span className="text-xs font-semibold leading-tight line-clamp-2">{preset.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom option */}
          <div className="flex flex-col gap-2 pt-1 border-t border-border/40">
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light")
                setIsCustom(true)
                setSelectedPreset(null)
              }}
              className={cn(
                "flex items-center justify-between p-3 rounded-2xl border transition-all text-left",
                isCustom
                  ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/30"
                  : "border-border/60 bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-xs font-semibold flex items-center gap-2">
                <Plus className="size-4 text-primary" />
                Criar Hábito Personalizado
              </span>
              {isCustom && <Check className="size-4 text-primary" />}
            </button>

            {isCustom && (
              <div className="flex flex-col gap-1.5 pt-1">
                <Label htmlFor="customName" className="text-[11px] text-muted-foreground font-medium">Nome do hábito:</Label>
                <Input
                  id="customName"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Ex: Parar de Roer Unhas, Sem Compras Compulsivas..."
                  className="h-10 text-xs"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="pt-2">
            <Button
              className="h-12 w-full rounded-2xl text-sm font-bold bg-primary text-primary-foreground shadow-sm"
              onClick={handleCreate}
              disabled={!isCustom && !selectedPreset}
            >
              Começar Rastreamento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
