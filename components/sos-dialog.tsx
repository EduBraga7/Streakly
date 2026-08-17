"use client"

import * as React from "react"
import { ChevronDown, HeartHandshake, PencilLine, ShieldCheck } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { BreathingCircle } from "@/components/breathing-circle"
import { useTracker } from "@/components/tracker-provider"

const SHOCK_ACTIONS = [
  "Beber 1 copo de água gelada",
  "Fazer 15 flexões ou agachamentos",
  "Sair do quarto e ficar visível",
  "Lavar o rosto com água fria",
  "Mandar mensagem para alguém de confiança",
]

interface SosDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SosDialog({ open, onOpenChange }: SosDialogProps) {
  const { state, updateLetter, markCrisisSurvived } = useTracker()
  const [checked, setChecked] = React.useState<Record<number, boolean>>({})
  const [editingLetter, setEditingLetter] = React.useState(false)
  const [letterOpen, setLetterOpen] = React.useState(false)
  const [letterDraft, setLetterDraft] = React.useState(state.letterToSelf)

  React.useEffect(() => {
    if (open) {
      setChecked({})
      setEditingLetter(false)
      setLetterOpen(false)
      setLetterDraft(state.letterToSelf)
    }
  }, [open, state.letterToSelf])

  const handleSurvived = () => {
    markCrisisSurvived()
    onOpenChange(false)
  }

  const saveLetter = () => {
    updateLetter(letterDraft.trim() || state.letterToSelf)
    setEditingLetter(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-lg">Momento de crise</DialogTitle>
          <DialogDescription>
            A vontade é uma onda. Ela sobe, atinge o pico e passa. Respire com o
            círculo.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-6">
          <BreathingCircle />

          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-foreground">
              Ações de choque
            </h3>
            <ul className="flex flex-col gap-1.5">
              {SHOCK_ACTIONS.map((action, i) => {
                const isChecked = !!checked[i]
                return (
                  <li key={action}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-sm transition-colors",
                        isChecked
                          ? "border-primary/30 bg-primary/10 text-muted-foreground"
                          : "hover:border-border hover:bg-muted/50",
                      )}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(value) =>
                          setChecked((prev) => ({ ...prev, [i]: value === true }))
                        }
                      />
                      <span className={cn(isChecked && "line-through")}>
                        {action}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </section>

          <Collapsible
            open={letterOpen}
            onOpenChange={setLetterOpen}
            className="rounded-xl border border-border/60 bg-muted/20"
          >
            <CollapsibleTrigger
              render={
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-3 text-left text-sm font-medium outline-none transition-colors hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              }
            >
              <span className="flex items-center gap-2">
                <HeartHandshake className="size-4 text-primary" />
                Carta para mim mesmo
              </span>
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform",
                  letterOpen && "rotate-180",
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3">
              {editingLetter ? (
                <div className="flex flex-col gap-2">
                  <Textarea
                    value={letterDraft}
                    onChange={(e) => setLetterDraft(e.target.value)}
                    rows={6}
                    className="resize-none text-sm"
                    placeholder="Escreva uma mensagem para o seu eu em crise..."
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingLetter(false)}
                    >
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={saveLetter}>
                      Salvar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {state.letterToSelf}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="self-start text-muted-foreground"
                    onClick={() => {
                      setLetterDraft(state.letterToSelf)
                      setEditingLetter(true)
                    }}
                  >
                    <PencilLine data-icon="inline-start" className="size-3.5" />
                    Editar mensagem
                  </Button>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="mt-6">
          <Button 
            onClick={handleSurvived} 
            className="h-14 w-full rounded-2xl text-base font-bold bg-success text-success-foreground hover:bg-success/90 shadow-[0_8px_24px_-8px_var(--color-success)] transition-all duration-300 hover:scale-[0.99] active:scale-[0.97]"
          >
            <ShieldCheck data-icon="inline-start" className="size-5 mr-2" />
            Superei a crise
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
