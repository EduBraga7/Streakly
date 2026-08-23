"use client"

import * as React from "react"
import { Brain, Sparkles, BookOpen, Clock, ChevronRight, CheckCircle, Lightbulb } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { KNOWLEDGE_PILLS, type KnowledgePill } from "@/lib/tracker/knowledge"
import { triggerHaptic } from "@/lib/feedback"
import { cn } from "@/lib/utils"

interface MindsetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialPillId?: string
}

export function MindsetDialog({ open, onOpenChange, initialPillId }: MindsetDialogProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")
  const [activePill, setActivePill] = React.useState<KnowledgePill | null>(null)

  React.useEffect(() => {
    if (open) {
      if (initialPillId) {
        const found = KNOWLEDGE_PILLS.find((p) => p.id === initialPillId)
        if (found) setActivePill(found)
      } else {
        setActivePill(null)
      }
    }
  }, [open, initialPillId])

  const categories = [
    { id: "all", label: "Todas" },
    { id: "dopamine", label: "Dopamina & Cérebro" },
    { id: "urgency", label: "Fissura & Controle" },
    { id: "mindset", label: "Mindset & TCC" },
    { id: "habits", label: "Hábitos" },
    { id: "relapse", label: "Prevenção" },
  ]

  const filteredPills = React.useMemo(() => {
    if (selectedCategory === "all") return KNOWLEDGE_PILLS
    return KNOWLEDGE_PILLS.filter((p) => p.category === selectedCategory)
  }, [selectedCategory])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl w-[95vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Brain className="size-5 text-primary" />
              Pílulas de Neurociência & Sabedoria
            </DialogTitle>
          </div>
          <DialogDescription>
            Micro-lições de 1 minuto para fortalecer sua mente com ciência comportamental.
          </DialogDescription>
        </DialogHeader>

        {activePill ? (
          /* Detailed View */
          <div className="flex flex-col gap-4 py-2 animate-in fade-in zoom-in-95 duration-200">
            <Button
              variant="ghost"
              size="sm"
              className="self-start text-xs text-muted-foreground hover:text-foreground h-8 -ml-2 gap-1"
              onClick={() => setActivePill(null)}
            >
              ← Voltar para todas as lições
            </Button>

            <div className="flex flex-col gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xl">{activePill.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-2.5 py-0.5 rounded-full bg-primary/15 border border-primary/25">
                  {activePill.categoryLabel} · {activePill.readTimeMinutes} min de leitura
                </span>
              </div>

              <h2 className="text-lg font-bold text-foreground mt-1">
                {activePill.title}
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                {activePill.subtitle}
              </p>

              {/* Quote Highlight */}
              <blockquote className="my-2 border-l-2 border-primary/60 pl-3 py-1 text-xs italic text-foreground/90 bg-muted/20 rounded-r-lg">
                “{activePill.quote}”
              </blockquote>

              {/* Explanation */}
              <div className="flex flex-col gap-1.5 text-xs leading-relaxed text-foreground/90 pt-1">
                <p>{activePill.explanation}</p>
              </div>

              {/* Action Step */}
              <div className="mt-3 p-3 rounded-xl bg-card border border-border/80 flex items-start gap-2.5">
                <Lightbulb className="size-4 text-warning shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                    Como aplicar hoje:
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {activePill.actionStep}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* List View with Category Filter */
          <div className="flex flex-col gap-3.5 py-1">
            {/* Category horizontal scrolling bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic("light")
                    setSelectedCategory(cat.id)
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0",
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-muted/30 text-muted-foreground border-border/60 hover:bg-muted/60"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Pills Cards Grid */}
            <div className="flex flex-col gap-2.5">
              {filteredPills.map((pill) => (
                <div
                  key={pill.id}
                  onClick={() => {
                    triggerHaptic("light")
                    setActivePill(pill)
                  }}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-border/60 bg-card/60 hover:bg-card hover:border-primary/40 transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0 p-2 rounded-xl bg-muted/30 border border-border/40">
                      {pill.icon}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                          {pill.categoryLabel}
                        </span>
                        <span className="text-[10px] text-muted-foreground">· {pill.readTimeMinutes} min</span>
                      </div>
                      <span className="text-xs font-bold text-foreground truncate mt-0.5">
                        {pill.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate">
                        {pill.subtitle}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
