"use client"

import * as React from "react"
import { Moon, Settings, Sun, Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"

interface AppHeaderProps {
  onOpenSettings: () => void
  onOpenAchievements: () => void
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

import { useTracker } from "@/components/tracker-provider"

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
  // Usa o dia atual para escolher a frase, assim não dá erro de hidratação
  // e o usuário vê uma frase diferente a cada dia do mês.
  const dayIndex = new Date().getDate()
  return quotes[dayIndex % quotes.length]
}

export function AppHeader({ onOpenSettings, onOpenAchievements }: AppHeaderProps) {
  const { dark, toggle } = useDarkMode()
  const { state, user } = useTracker()

  const [quote, setQuote] = React.useState("Foco diário")
  const [greeting, setGreeting] = React.useState("Streakly")

  // Use useEffect to set the quote and greeting after mount to prevent hydration mismatch
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
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="relative flex items-center justify-center h-10 shrink-0">
          <img 
            src="/streakly-assets/logo-color.png" 
            alt="Streakly Logo" 
            className="h-full w-auto object-contain"
          />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-base font-semibold text-foreground transition-all duration-500">
            {greeting}
          </span>
          <span className="text-xs text-muted-foreground transition-all duration-500">
            {quote}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
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
  )
}
