"use client"

import * as React from "react"
import { RefreshCw } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { type TriggerId } from "@/lib/tracker/types"
import { useTracker } from "@/components/tracker-provider"

import { toast } from "sonner"

interface RelapseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RelapseDialog({ open, onOpenChange }: RelapseDialogProps) {
  const { state, registerRelapse, undoLastAction } = useTracker()
  const [trigger, setTrigger] = React.useState<TriggerId | null>(null)
  const [reflection, setReflection] = React.useState("")

  React.useEffect(() => {
    if (open) {
      setTrigger(null)
      setReflection("")
    }
  }, [open])

  const handleConfirm = () => {
    if (!trigger) return
    registerRelapse(trigger, reflection.trim())
    onOpenChange(false)
    toast.error("Recaída registrada.", {
      description: "Seu cronômetro foi reiniciado.",
      action: {
        label: "Desfazer",
        onClick: () => undoLastAction(),
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Registrar recaída</DialogTitle>
          <DialogDescription>
            Recomeçar faz parte do processo. Sem culpa — só aprendizado para a
            próxima vez.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <Label className="text-sm font-medium">Qual foi o gatilho?</Label>
            <ToggleGroup
              value={trigger ? [trigger] : []}
              onValueChange={(vals: string[]) =>
                setTrigger((vals[vals.length - 1] as TriggerId) ?? null)
              }
              variant="outline"
              className="flex flex-wrap gap-2"
            >
              {state.habit?.triggers.map((t) => (
                <ToggleGroupItem
                  key={t.id}
                  value={t.id}
                  className="h-9 rounded-full px-3.5 text-sm aria-pressed:border-primary/40 aria-pressed:bg-primary/15 aria-pressed:text-primary"
                >
                  {t.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex flex-col gap-2.5">
            <Label htmlFor="reflection" className="text-sm font-medium">
              O que causou essa quebra e o que farei diferente?
            </Label>
            <Textarea
              id="reflection"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={4}
              placeholder="Uma reflexão curta e honesta ajuda a reconhecer o padrão..."
              className="resize-none text-sm"
            />
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <Button
            onClick={handleConfirm}
            disabled={!trigger}
            className="h-12 w-full rounded-xl text-sm font-semibold"
          >
            <RefreshCw data-icon="inline-start" className="size-4" />
            Reiniciar cronômetro
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Seu recorde pessoal continua guardado.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
