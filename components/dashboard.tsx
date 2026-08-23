"use client"

import * as React from "react"

import dynamic from "next/dynamic"

import { AppHeader } from "@/components/app-header"
import { StreakCard } from "@/components/streak-card"
import { QuickActions } from "@/components/quick-actions"
import { WeekCalendar } from "@/components/week-calendar"
import { StatsCards } from "@/components/stats-cards"
import { useDiscreetMode } from "@/lib/hooks/use-discreet-mode"

// Lazy-loaded dialogs to optimize initial bundle size and startup performance
const SosDialog = dynamic(
  () => import("@/components/sos-dialog").then((m) => m.SosDialog),
  { ssr: false }
)
const RelapseDialog = dynamic(
  () => import("@/components/relapse-dialog").then((m) => m.RelapseDialog),
  { ssr: false }
)
const SettingsDialog = dynamic(
  () => import("@/components/settings-dialog").then((m) => m.SettingsDialog),
  { ssr: false }
)
const HistoryDialog = dynamic(
  () => import("@/components/history-dialog").then((m) => m.HistoryDialog),
  { ssr: false }
)
const AchievementsDialog = dynamic(
  () => import("@/components/achievements-dialog").then((m) => m.AchievementsDialog),
  { ssr: false }
)
const AnalyticsDialog = dynamic(
  () => import("@/components/analytics-dialog").then((m) => m.AnalyticsDialog),
  { ssr: false }
)
const HealthTimelineDialog = dynamic(
  () => import("@/components/health-timeline-dialog").then((m) => m.HealthTimelineDialog),
  { ssr: false }
)
const CheckinDialog = dynamic(
  () => import("@/components/checkin-dialog").then((m) => m.CheckinDialog),
  { ssr: false }
)
const RewardGoalDialog = dynamic(
  () => import("@/components/reward-goal-dialog").then((m) => m.RewardGoalDialog),
  { ssr: false }
)
const QuickHideScreen = dynamic(
  () => import("@/components/quick-hide-screen").then((m) => m.QuickHideScreen),
  { ssr: false }
)
const ExportReportDialog = dynamic(
  () => import("@/components/export-report-dialog").then((m) => m.ExportReportDialog),
  { ssr: false }
)
const ShareAchievementDialog = dynamic(
  () => import("@/components/share-achievement-dialog").then((m) => m.ShareAchievementDialog),
  { ssr: false }
)
const MindsetDialog = dynamic(
  () => import("@/components/mindset-dialog").then((m) => m.MindsetDialog),
  { ssr: false }
)
import { getDailyPill } from "@/lib/tracker/knowledge"

export function Dashboard() {
  useDiscreetMode()
  const [quickHidden, setQuickHidden] = React.useState(false)
  const [sosOpen, setSosOpen] = React.useState(false)
  const [relapseOpen, setRelapseOpen] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [historyOpen, setHistoryOpen] = React.useState(false)
  const [achievementsOpen, setAchievementsOpen] = React.useState(false)
  const [analyticsOpen, setAnalyticsOpen] = React.useState(false)
  const [healthTimelineOpen, setHealthTimelineOpen] = React.useState(false)
  const [checkinOpen, setCheckinOpen] = React.useState(false)
  const [rewardGoalsOpen, setRewardGoalsOpen] = React.useState(false)
  const [exportReportOpen, setExportReportOpen] = React.useState(false)
  const [shareOpen, setShareOpen] = React.useState(false)
  const [mindsetOpen, setMindsetOpen] = React.useState(false)
  const [selectedPillId, setSelectedPillId] = React.useState<string | undefined>(undefined)

  const dailyPill = React.useMemo(() => getDailyPill(), [])

  // Listen for Escape key to toggle quick hide when no modal is open
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        !sosOpen &&
        !relapseOpen &&
        !settingsOpen &&
        !historyOpen &&
        !achievementsOpen &&
        !analyticsOpen &&
        !healthTimelineOpen &&
        !checkinOpen &&
        !rewardGoalsOpen &&
        !exportReportOpen &&
        !shareOpen &&
        !mindsetOpen
      ) {
        setQuickHidden(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [sosOpen, relapseOpen, settingsOpen, historyOpen, achievementsOpen, analyticsOpen, healthTimelineOpen, checkinOpen, rewardGoalsOpen, exportReportOpen, shareOpen, mindsetOpen])

  // Handle URL action parameters (e.g. from PWA shortcuts)
  React.useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const action = params.get("action")

    if (action === "sos") {
      setSosOpen(true)
      window.history.replaceState({}, "", window.location.pathname)
    } else if (action === "checkin") {
      setCheckinOpen(true)
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  if (quickHidden) {
    return <QuickHideScreen onRestore={() => setQuickHidden(false)} />
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(3rem+env(safe-area-inset-bottom))]">
      <AppHeader
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAchievements={() => setAchievementsOpen(true)}
        onQuickHide={() => setQuickHidden(true)}
      />

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
        <StreakCard onOpenShare={() => setShareOpen(true)} />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 ease-out fill-mode-both">
        <QuickActions
          onOpenSos={() => setSosOpen(true)}
          onOpenRelapse={() => setRelapseOpen(true)}
          onOpenCheckin={() => setCheckinOpen(true)}
        />
      </div>

      {/* Pílula de Sabedoria do Dia */}
      <div
        onClick={() => {
          setSelectedPillId(dailyPill.id)
          setMindsetOpen(true)
        }}
        className="flex items-center justify-between p-3.5 rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer group shadow-2xs animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 ease-out fill-mode-both"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 rounded-xl bg-primary/15 flex items-center justify-center text-lg shrink-0">
            {dailyPill.icon}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Pílula de Sabedoria do Dia
            </span>
            <span className="text-xs font-bold text-foreground truncate">
              {dailyPill.title}
            </span>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-primary group-hover:underline shrink-0 ml-2">
          Ler (1 min) →
        </span>
      </div>

      <section className="flex flex-col gap-3.5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 ease-out fill-mode-both">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Histórico recente
          </h2>
          <button
            type="button"
            onClick={() => setExportReportOpen(true)}
            className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            Exportar Relatório PDF
          </button>
        </div>
        <WeekCalendar onOpenHistory={() => setHistoryOpen(true)} />
        <StatsCards 
          onOpenAnalytics={() => setAnalyticsOpen(true)} 
          onOpenHealthTimeline={() => setHealthTimelineOpen(true)}
          onOpenRewardGoals={() => setRewardGoalsOpen(true)}
          onOpenExportReport={() => setExportReportOpen(true)}
        />
      </section>

      <SosDialog open={sosOpen} onOpenChange={setSosOpen} />
      <RelapseDialog open={relapseOpen} onOpenChange={setRelapseOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <HistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} />
      <AchievementsDialog open={achievementsOpen} onOpenChange={setAchievementsOpen} />
      <AnalyticsDialog 
        open={analyticsOpen} 
        onOpenChange={setAnalyticsOpen} 
        onOpenExportReport={() => setExportReportOpen(true)}
      />
      <HealthTimelineDialog open={healthTimelineOpen} onOpenChange={setHealthTimelineOpen} />
      <CheckinDialog open={checkinOpen} onOpenChange={setCheckinOpen} />
      <RewardGoalDialog
        open={rewardGoalsOpen}
        onOpenChange={setRewardGoalsOpen}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <ExportReportDialog open={exportReportOpen} onOpenChange={setExportReportOpen} />
      <ShareAchievementDialog open={shareOpen} onOpenChange={setShareOpen} />
      <MindsetDialog
        open={mindsetOpen}
        onOpenChange={setMindsetOpen}
        initialPillId={selectedPillId}
      />
    </main>
  )
}
