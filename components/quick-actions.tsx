"use client"

import { CheckCircle2, LifeBuoy, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTracker } from "@/components/tracker-provider"

interface QuickActionsProps {
  onOpenSos: () => void
  onOpenRelapse: () => void
}

export function QuickActions({ onOpenSos, onOpenRelapse }: QuickActionsProps) {
  const { checkIn, checkedInToday } = useTracker()

  return (
    <div className="flex flex-col gap-3.5">
      {/* Máximo destaque: momento de crise */}
      <Button
        onClick={onOpenSos}
        className={cn(
          "relative overflow-hidden h-16 rounded-2xl bg-destructive text-base font-bold text-destructive-foreground",
          "shadow-[0_8px_24px_-8px_var(--color-destructive)] transition-all duration-300",
          "hover:bg-destructive/90 hover:scale-[0.99] active:scale-[0.97]",
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
        <LifeBuoy data-icon="inline-start" className="size-5 mr-2" />
        SOS · Momento de crise
      </Button>

      <div className="grid grid-cols-2 gap-3.5">
        <Button
          onClick={checkIn}
          disabled={checkedInToday}
          className={cn(
            "h-14 rounded-2xl text-sm font-semibold transition-all duration-300",
            checkedInToday
              ? "bg-primary/10 text-primary border border-primary/20 shadow-none opacity-100 disabled:opacity-100 cursor-default"
              : "bg-card text-foreground border border-border shadow-sm hover:border-primary/50 hover:bg-primary/5 hover:text-primary active:scale-95",
          )}
        >
          <CheckCircle2 data-icon="inline-start" className={cn("size-4 mr-2", checkedInToday && "text-primary")} />
          {checkedInToday ? "Dia concluído" : "Check-in diário"}
        </Button>

        <Button
          onClick={onOpenRelapse}
          variant="ghost"
          className="h-14 rounded-2xl text-sm font-medium text-muted-foreground bg-transparent border border-transparent hover:bg-muted/50 hover:text-foreground active:scale-95 transition-all duration-300"
        >
          <RotateCcw data-icon="inline-start" className="size-4 mr-2" />
          Registrar recaída
        </Button>
      </div>
    </div>
  )
}
