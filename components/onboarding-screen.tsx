"use client"

import * as React from "react"
import { Flame, Check, Plus, Trash2, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useTracker } from "@/components/tracker-provider"
import { cn } from "@/lib/utils"

const HABIT_TEMPLATES = [
  {
    id: "porn",
    name: "Pornografia",
    triggers: [
      { id: "boredom", label: "Tédio" },
      { id: "tiredness", label: "Cansaço" },
      { id: "social", label: "Redes Sociais" },
      { id: "stress", label: "Estresse" },
      { id: "loneliness", label: "Solidão" },
    ],
  },
  {
    id: "smoking",
    name: "Cigarro",
    triggers: [
      { id: "anxiety", label: "Ansiedade" },
      { id: "after_meal", label: "Pós-refeição" },
      { id: "traffic", label: "Trânsito" },
      { id: "coffee", label: "Tomando Café" },
      { id: "work_break", label: "Pausa no trabalho" },
    ],
  },
  {
    id: "alcohol",
    name: "Álcool",
    triggers: [
      { id: "party", label: "Festas" },
      { id: "weekend", label: "Fim de semana" },
      { id: "stress", label: "Estresse" },
      { id: "social_pressure", label: "Pressão social" },
      { id: "sadness", label: "Tristeza" },
    ],
  },
  {
    id: "social_media",
    name: "Redes Sociais",
    triggers: [
      { id: "notifications", label: "Notificações" },
      { id: "waking_up", label: "Ao acordar" },
      { id: "boredom", label: "Tédio" },
      { id: "procrastination", label: "Procrastinação" },
      { id: "fomo", label: "FOMO (Medo de perder algo)" },
    ],
  },
  {
    id: "custom",
    name: "Outro Hábito",
    triggers: [
      { id: "stress", label: "Estresse" },
      { id: "boredom", label: "Tédio" },
    ],
  },
]

export function OnboardingScreen() {
  const { completeOnboarding, updateUserName, user } = useTracker()
  const [step, setStep] = React.useState(1)

  // Step 1 State
  const [userName, setUserName] = React.useState(user?.displayName?.split(" ")[0] || "")

  // Step 2 State
  const [habitId, setHabitId] = React.useState<string | null>(null)
  const [customHabitName, setCustomHabitName] = React.useState("")

  // Step 3 State
  const [triggers, setTriggers] = React.useState<{ id: string; label: string }[]>([])
  const [newTrigger, setNewTrigger] = React.useState("")

  // Init triggers when habit is selected
  React.useEffect(() => {
    if (habitId) {
      const template = HABIT_TEMPLATES.find((h) => h.id === habitId)
      if (template) {
        setTriggers(template.triggers)
      }
    }
  }, [habitId])

  const handleNextStep2 = () => {
    if (habitId) setStep(3)
  }

  const handleAddTrigger = () => {
    if (newTrigger.trim() === "") return
    const id = "custom_" + Date.now()
    setTriggers([...triggers, { id, label: newTrigger.trim() }])
    setNewTrigger("")
  }

  const handleRemoveTrigger = (idToRemove: string) => {
    setTriggers(triggers.filter((t) => t.id !== idToRemove))
  }

  const handleComplete = () => {
    const finalName = habitId === "custom" && customHabitName.trim() ? customHabitName.trim() : HABIT_TEMPLATES.find(h => h.id === habitId)?.name ?? "Hábito"
    if (userName.trim()) {
      updateUserName(userName.trim())
    }
    completeOnboarding({
      id: habitId!,
      name: finalName,
      triggers,
    })
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-12 relative overflow-hidden">
      {/* Background ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="size-[500px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col gap-8">
        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-4">
          <div className={cn("h-1.5 flex-1 rounded-full transition-colors", step >= 1 ? "bg-primary" : "bg-muted")} />
          <div className={cn("h-1.5 flex-1 rounded-full transition-colors", step >= 2 ? "bg-primary" : "bg-muted")} />
          <div className={cn("h-1.5 flex-1 rounded-full transition-colors", step >= 3 ? "bg-primary" : "bg-muted")} />
        </div>

        {/* Step 1: Nome do Usuário */}
        {step === 1 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-2xl font-bold">Como quer ser chamado?</h1>
              <p className="text-sm text-muted-foreground">
                Vamos personalizar a sua experiência.
              </p>
            </div>

            <Input 
              placeholder="Seu nome ou apelido" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="h-14 rounded-xl text-lg text-center"
            />

            <Button 
              onClick={() => setStep(2)} 
              disabled={!userName.trim()}
              className="w-full h-14 rounded-xl mt-4 text-base font-semibold"
            >
              Continuar <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Escolha do Hábito */}
        {step === 2 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-2xl font-bold">O que você quer vencer?</h1>
              <p className="text-sm text-muted-foreground">
                Escolha o hábito que você deseja rastrear e abandonar.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {HABIT_TEMPLATES.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setHabitId(h.id)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                    habitId === h.id 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "border-border/50 bg-card hover:border-primary/30"
                  )}
                >
                  <span className="font-semibold">{h.name}</span>
                  {habitId === h.id && <Check className="size-5 text-primary" />}
                </button>
              ))}
            </div>

            {habitId === "custom" && (
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-medium">Nome do seu hábito</label>
                <Input 
                  placeholder="Ex: Roer unhas, Compulsão alimentar..." 
                  value={customHabitName}
                  onChange={(e) => setCustomHabitName(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <Button onClick={() => setStep(1)} variant="ghost" className="h-14 rounded-xl px-6">
                Voltar
              </Button>
              <Button 
                onClick={handleNextStep2} 
                disabled={!habitId || (habitId === "custom" && !customHabitName.trim())}
                className="flex-1 h-14 rounded-xl text-base font-semibold"
              >
                Continuar <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Gatilhos */}
        {step === 3 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-2xl font-bold">Mapeie seus Gatilhos</h1>
              <p className="text-sm text-muted-foreground">
                Identificar o que causa a vontade é o primeiro passo para evitá-la.
                Deixamos alguns prontos, mas você pode adicionar os seus.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {triggers.map((t) => (
                <div key={t.id} className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium border border-primary/20">
                  {t.label}
                  <button onClick={() => handleRemoveTrigger(t.id)} className="hover:text-primary/70">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Input 
                placeholder="Ex: Tristeza, Fome..." 
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTrigger()
                  }
                }}
                className="h-12 rounded-xl flex-1"
              />
              <Button onClick={handleAddTrigger} variant="outline" size="icon" className="h-12 w-12 rounded-xl shrink-0">
                <Plus className="size-5" />
              </Button>
            </div>

            <div className="flex gap-3 mt-4">
              <Button onClick={() => setStep(2)} variant="ghost" className="h-14 rounded-xl px-6">
                Voltar
              </Button>
              <Button 
                onClick={handleComplete} 
                disabled={triggers.length === 0}
                className="flex-1 h-14 rounded-xl text-base font-semibold"
              >
                Concluir Setup <Flame className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
