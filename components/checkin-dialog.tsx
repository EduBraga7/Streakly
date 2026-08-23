"use client"

import * as React from "react"
import { CheckCircle2, Smile, Frown, Meh, Sparkles, Flame, PenLine } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useTracker } from "@/components/tracker-provider"
import { triggerMiniConfetti, triggerHaptic } from "@/lib/feedback"
import { playSuccessChime } from "@/lib/audio/sound-effects"
import { toast } from "sonner"
import type { MoodType } from "@/lib/tracker/types"
import { cn } from "@/lib/utils"

interface CheckinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MOODS: { id: MoodType; emoji: string; label: string; color: string }[] = [
  { id: "great", emoji: "😃", label: "Radiante", color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500" },
  { id: "good", emoji: "😊", label: "Bem", color: "border-blue-500/40 bg-blue-500/10 text-blue-500" },
  { id: "neutral", emoji: "😐", label: "Neutro", color: "border-muted-foreground/30 bg-muted/20 text-muted-foreground" },
  { id: "stressed", emoji: "😫", label: "Estressado", color: "border-amber-500/40 bg-amber-500/10 text-amber-500" },
  { id: "bad", emoji: "😔", label: "Difícil", color: "border-rose-500/40 bg-rose-500/10 text-rose-500" },
]

export function CheckinDialog({ open, onOpenChange }: CheckinDialogProps) {
  const { checkIn } = useTracker()
  const [selectedMood, setSelectedMood] = React.useState<MoodType>("good")
  const [urgeLevel, setUrgeLevel] = React.useState<number>(1)
  const [note, setNote] = React.useState("")

  React.useEffect(() => {
    if (open) {
      setSelectedMood("good")
      setUrgeLevel(1)
      setNote("")
    }
  }, [open])

  const handleComplete = (quick: boolean = false) => {
    triggerHaptic("success")
    triggerMiniConfetti()
    playSuccessChime()
    
    if (quick) {
      checkIn()
    } else {
      checkIn({
        mood: selectedMood,
        urgeLevel,
        note: note.trim() || undefined,
      })
    }

    onOpenChange(false)
    toast.success("Check-in diário concluído!", {
      description: "Mais um dia de vitória somado à sua jornada.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="size-5 text-primary" />
            Check-in Diário & Diário de Bordo
          </DialogTitle>
          <DialogDescription>
            Como foi o seu dia? Registre seu humor e percepções para entender seus padrões.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 my-2">
          {/* Mood Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-foreground">Como você se sentiu hoje?</label>
            <div className="grid grid-cols-5 gap-1.5">
              {MOODS.map((m) => {
                const isSelected = selectedMood === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic("light")
                      setSelectedMood(m.id)
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all text-center",
                      isSelected
                        ? cn("ring-2 ring-primary shadow-sm scale-105", m.color)
                        : "border-border/60 bg-muted/20 hover:bg-muted/40 opacity-70 hover:opacity-100"
                    )}
                  >
                    <span className="text-2xl mb-1">{m.emoji}</span>
                    <span className="text-[10px] font-medium leading-tight">{m.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Urge Level */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Nível de tentação / impulso:</span>
              <span className="font-bold text-primary">
                {urgeLevel === 1 && "1 — Quase nenhum"}
                {urgeLevel === 2 && "2 — Leve"}
                {urgeLevel === 3 && "3 — Moderado"}
                {urgeLevel === 4 && "4 — Forte"}
                {urgeLevel === 5 && "5 — Crítico / Extremo"}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    triggerHaptic("light")
                    setUrgeLevel(lvl)
                  }}
                  className={cn(
                    "h-9 rounded-xl border text-xs font-bold transition-all",
                    urgeLevel === lvl
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "border-border/60 bg-muted/20 hover:bg-muted/40 text-muted-foreground"
                  )}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Note / Reflection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <PenLine className="size-3.5 text-muted-foreground" />
              Nota do dia / Gratidão (Opcional):
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Escreva algo sobre seus pensamentos, vitórias ou desafios do dia..."
              rows={3}
              className="resize-none text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              className="h-12 w-full rounded-2xl text-sm font-bold bg-primary text-primary-foreground shadow-sm"
              onClick={() => handleComplete(false)}
            >
              <CheckCircle2 className="size-4 mr-1.5" />
              Concluir Check-in do Dia
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => handleComplete(true)}
            >
              Check-in rápido (Pular notas)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
