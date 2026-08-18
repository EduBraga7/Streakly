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

export function AppHeader({ onOpenSettings, onOpenAchievements }: AppHeaderProps) {
  const { dark, toggle } = useDarkMode()

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
          <span className="text-base font-semibold text-foreground">Streakly</span>
          <span className="text-xs text-muted-foreground">Foco diário</span>
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
