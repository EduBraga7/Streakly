"use client"

import * as React from "react"
import Image from "next/image"
import { Moon, Settings, Sun, Trophy, ChevronDown, PlusCircle, Check, Layers, EyeOff } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTracker } from "@/components/tracker-provider"
import { getElapsed } from "@/lib/tracker/utils"
import { triggerHaptic } from "@/lib/feedback"
import { AddHabitDialog } from "@/components/add-habit-dialog"
import { cn } from "@/lib/utils"

interface AppHeaderProps {
  onOpenSettings: () => void
  onOpenAchievements: () => void
  onQuickHide: () => void
}

const THEME_KEY = "reset.theme"

function useDarkMode() {
  const [dark, setDark] = React.useState(true)

  React.useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY)
    const initial = stored ? stored === "dark" : true
    setDark(initial)
    document.documentElement.classList.toggle("dark", initial)
    document.documentElement.classList.toggle("light", !initial)
  }, [])

  const toggle = React.useCallback(() => {
    setDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle("dark", next)
      document.documentElement.classList.toggle("light", !next)
      window.localStorage.setItem(THEME_KEY, next ? "dark" : "light")
      return next
    })
  }, [])

  return { dark, toggle }
}

const MOTIVATIONAL_QUOTES: Record<string, string[]> = {
  porn: [
    "O controle está em suas mãos",
    "Reconecte-se com o mundo real",
    "Sua mente livre novamente",
    "Mais foco, menos distração",
    "Construindo uma nova versão",
  ],
  smoking: [
    "Seus pulmões agradecem",
    "Respirando liberdade",
    "Cada dia mais fôlego",
    "Sua saúde em primeiro lugar",
    "Um dia de cada vez",
  ],
  alcohol: [
    "Clareza e sobriedade",
    "Sua mente alerta e forte",
    "Dias mais brilhantes",
    "No controle das suas escolhas",
    "Energia renovada",
  ],
  social_media: [
    "Viva o momento presente",
    "Menos tela, mais vida real",
    "Desconecte para conectar",
    "Seu tempo é muito precioso",
    "Foco no que realmente importa",
  ],
  default: [
    "Um dia de cada vez",
    "Foco diário absoluto",
    "Você está no controle",
    "Rumo à sua melhor versão",
    "Pequenas vitórias diárias",
  ],
}

function getDailyQuote(habitId?: string) {
  const quotes = MOTIVATIONAL_QUOTES[habitId || ""] || MOTIVATIONAL_QUOTES.default
  const dayIndex = new Date().getDate()
  return quotes[dayIndex % quotes.length]
}

export function AppHeader({ onOpenSettings, onOpenAchievements, onQuickHide }: AppHeaderProps) {
  const { dark, toggle } = useDarkMode()
  const { state, allTrackers, switchTracker, user } = useTracker()
  const [habitsOpen, setHabitsOpen] = React.useState(false)
  const [addHabitOpen, setAddHabitOpen] = React.useState(false)

  const [quote, setQuote] = React.useState("Foco diário")
  const [greeting, setGreeting] = React.useState("Streakly")

  React.useEffect(() => {
    setQuote(getDailyQuote(state.habit?.id))

    const hour = new Date().getHours()
    let timeGreeting = "Boa noite"
    if (hour >= 5 && hour < 12) timeGreeting = "Bom dia"
    else if (hour >= 12 && hour < 18) timeGreeting = "Boa tarde"

    const firstName = state.userName?.trim() || user?.displayName?.split(" ")[0]
    setGreeting(firstName ? `${timeGreeting}, ${firstName}` : `${timeGreeting}!`)
  }, [state.habit?.id, user?.displayName, state.userName])

  return (
    <>
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            triggerHaptic("light")
            setHabitsOpen(true)
          }}
          className="flex items-center gap-2.5 text-left outline-none group rounded-2xl hover:bg-muted/30 p-1.5 -ml-1.5 transition-colors cursor-pointer"
        >
          <div className="relative flex items-center justify-center h-10 w-10 shrink-0">
            <Image 
              src="/streakly-assets/logo-color.png" 
              alt="Streakly Logo" 
              width={40}
              height={40}
              priority
              className="h-full w-auto object-contain"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-foreground flex items-center gap-1.5 group-hover:text-primary transition-colors">
              {state.habit?.name || "Streakly"}
              <ChevronDown className="size-3.5 text-muted-foreground transition-transform group-hover:text-primary group-hover:translate-y-0.5" />
            </span>
            <span className="text-xs text-muted-foreground">
              {greeting}
            </span>
          </div>
        </button>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onQuickHide}
            aria-label="Camuflagem Rápida"
            title="Camuflagem Rápida (ou tecla Esc)"
            className="text-muted-foreground hover:text-foreground"
          >
            <EyeOff className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenAchievements}
            aria-label="Conquistas"
            className="text-muted-foreground hover:text-yellow-500"
          >
            <Trophy className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={dark ? "Ativar modo claro" : "Ativar modo discreto"}
            className="text-muted-foreground hover:text-foreground"
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            aria-label="Configurações"
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="size-4" />
          </Button>
        </div>
      </header>

      {/* ── Modal de Seleção de Hábitos ── */}
      <Dialog open={habitsOpen} onOpenChange={setHabitsOpen}>
        <DialogContent className="sm:max-w-md w-[95vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Layers className="size-5 text-primary" />
              Seus Hábitos Ativos
            </DialogTitle>
            <DialogDescription>
              Alterne entre seus hábitos ou adicione novos rastreadores independentes.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2.5 my-2">
            {allTrackers.map((tracker) => {
              const id = tracker.id || tracker.habit?.id || "default"
              const isActive = (tracker.id || tracker.habit?.id) === (state.id || state.habit?.id)
              const elapsed = getElapsed(tracker.streakStart)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    triggerHaptic("success")
                    switchTracker(id)
                    setHabitsOpen(false)
                  }}
                  className={cn(
                    "flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer",
                    isActive
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                      : "border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-border"
                  )}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className={cn("text-sm font-bold truncate", isActive ? "text-primary" : "text-foreground")}>
                      {tracker.habit?.name}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {elapsed.days} {elapsed.days === 1 ? "dia limpo" : "dias limpos"} · Recorde: {tracker.bestStreakDays}d
                    </span>
                  </div>

                  {isActive ? (
                    <div className="size-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
                      <Check className="size-3.5" />
                    </div>
                  ) : (
                    <span className="text-[11px] font-semibold text-muted-foreground px-2.5 py-1 rounded-lg bg-muted border border-border/40 shrink-0">
                      Selecionar
                    </span>
                  )}
                </button>
              )
            })}

            <div className="pt-2">
              <Button
                variant="outline"
                className="h-12 w-full rounded-2xl text-xs font-semibold gap-2 border-dashed border-primary/40 text-primary hover:bg-primary/10"
                onClick={() => {
                  triggerHaptic("light")
                  setHabitsOpen(false)
                  setAddHabitOpen(true)
                }}
              >
                <PlusCircle className="size-4" />
                Adicionar Novo Hábito
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddHabitDialog open={addHabitOpen} onOpenChange={setAddHabitOpen} />
    </>
  )
}
