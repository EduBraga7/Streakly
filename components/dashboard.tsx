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

export function Dashboard() {
  const [sosOpen, setSosOpen] = React.useState(false)
  const [relapseOpen, setRelapseOpen] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-7 px-5 pt-6 pb-12">
      <AppHeader onOpenSettings={() => setSettingsOpen(true)} />

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
        <WeekCalendar />
        <StatsCards />
      </section>

      <SosDialog open={sosOpen} onOpenChange={setSosOpen} />
      <RelapseDialog open={relapseOpen} onOpenChange={setRelapseOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </main>
  )
}
