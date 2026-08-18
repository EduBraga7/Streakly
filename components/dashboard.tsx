"use client"

import * as React from "react"

import { AppHeader } from "@/components/app-header"
import { StreakCard } from "@/components/streak-card"
import { QuickActions } from "@/components/quick-actions"
import { WeekCalendar } from "@/components/week-calendar"
import { StatsCards } from "@/components/stats-cards"
import { SosDialog } from "@/components/sos-dialog"
import { RelapseDialog } from "@/components/relapse-dialog"
import { SettingsDialog } from "@/components/settings-dialog"
import { HistoryDialog } from "@/components/history-dialog"
import { AchievementsDialog } from "@/components/achievements-dialog"
import { AnalyticsDialog } from "@/components/analytics-dialog"

export function Dashboard() {
  const [sosOpen, setSosOpen] = React.useState(false)
  const [relapseOpen, setRelapseOpen] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [historyOpen, setHistoryOpen] = React.useState(false)
  const [achievementsOpen, setAchievementsOpen] = React.useState(false)
  const [analyticsOpen, setAnalyticsOpen] = React.useState(false)

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-7 px-5 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(3rem+env(safe-area-inset-bottom))]">
      <AppHeader onOpenSettings={() => setSettingsOpen(true)} onOpenAchievements={() => setAchievementsOpen(true)} />

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
        <StreakCard />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 ease-out fill-mode-both">
        <QuickActions
          onOpenSos={() => setSosOpen(true)}
          onOpenRelapse={() => setRelapseOpen(true)}
        />
      </div>

      <section className="flex flex-col gap-3.5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 ease-out fill-mode-both">
        <h2 className="px-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Histórico recente
        </h2>
        <WeekCalendar onOpenHistory={() => setHistoryOpen(true)} />
        <StatsCards onOpenAnalytics={() => setAnalyticsOpen(true)} />
      </section>

      <SosDialog open={sosOpen} onOpenChange={setSosOpen} />
      <RelapseDialog open={relapseOpen} onOpenChange={setRelapseOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <HistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} />
      <AchievementsDialog open={achievementsOpen} onOpenChange={setAchievementsOpen} />
      <AnalyticsDialog open={analyticsOpen} onOpenChange={setAnalyticsOpen} />
    </main>
  )
}
