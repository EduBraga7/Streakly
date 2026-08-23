"use client"

import * as React from "react"
import { Share2, Download, Copy, Check, Sparkles, Flame, Trophy, EyeOff } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTracker, useNow } from "@/components/tracker-provider"
import { getElapsed } from "@/lib/tracker/utils"
import { triggerCelebrationConfetti, triggerHaptic } from "@/lib/feedback"
import { toast } from "sonner"

interface ShareAchievementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  milestoneDay?: number
  milestoneTitle?: string
}

export function ShareAchievementDialog({
  open,
  onOpenChange,
  milestoneDay,
  milestoneTitle,
}: ShareAchievementDialogProps) {
  const { state, user } = useTracker()
  const liveNow = useNow(1000)
  const now = liveNow ?? new Date(state.streakStart).getTime()
  const elapsed = getElapsed(state.streakStart, now)

  const [hideHabit, setHideHabit] = React.useState(true)
  const [includeName, setIncludeName] = React.useState(true)
  const [downloading, setDownloading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  const displayDays = milestoneDay ?? elapsed.days
  const displayTitle = milestoneTitle ?? (displayDays >= 365 ? "Lenda Viva" : displayDays >= 30 ? "Mês Intacto" : "Foco Contínuo")
  const displayName = state.userName || user?.displayName?.split(" ")[0] || "Guerreiro(a)"
  const habitLabel = hideHabit ? "Jornada de Superação" : (state.habit?.name || "Hábito")

  // Draw card on hidden canvas for high-res export (1080 x 1920)
  const drawCardToCanvas = React.useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const W = 1080
    const H = 1920
    canvas.width = W
    canvas.height = H

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
    bgGrad.addColorStop(0, "#0a0b0f")
    bgGrad.addColorStop(0.5, "#111420")
    bgGrad.addColorStop(1, "#0a0b0f")
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, W, H)

    // 2. Ambient glows
    const glow1 = ctx.createRadialGradient(W / 2, H * 0.35, 50, W / 2, H * 0.35, 450)
    glow1.addColorStop(0, "rgba(16, 185, 129, 0.22)")
    glow1.addColorStop(1, "rgba(16, 185, 129, 0)")
    ctx.fillStyle = glow1
    ctx.fillRect(0, 0, W, H)

    const glow2 = ctx.createRadialGradient(W * 0.8, H * 0.7, 50, W * 0.8, H * 0.7, 350)
    glow2.addColorStop(0, "rgba(59, 130, 246, 0.15)")
    glow2.addColorStop(1, "rgba(59, 130, 246, 0)")
    ctx.fillStyle = glow2
    ctx.fillRect(0, 0, W, H)

    // 3. Inner Card Frame
    const cardX = 90
    const cardY = 180
    const cardW = W - 180
    const cardH = H - 360
    const radius = 64

    ctx.save()
    ctx.beginPath()
    ctx.roundRect(cardX, cardY, cardW, cardH, radius)
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)"
    ctx.fill()
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.restore()

    // 4. Header / Brand
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
    ctx.font = "bold 34px sans-serif"
    ctx.fillText("STREAKLY", W / 2, cardY + 100)

    ctx.fillStyle = "rgba(16, 185, 129, 0.9)"
    ctx.font = "600 28px sans-serif"
    ctx.fillText(habitLabel.toUpperCase(), W / 2, cardY + 160)

    // 5. Huge Days Number
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 240px sans-serif"
    ctx.fillText(String(displayDays), W / 2, cardY + 450)

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
    ctx.font = "bold 44px sans-serif"
    ctx.fillText(displayDays === 1 ? "DIA LIMPO" : "DIAS LIMPOS", W / 2, cardY + 600)

    // 6. Milestone Title Pill
    const pillY = cardY + 740
    const pillW = 560
    const pillH = 90
    ctx.save()
    ctx.beginPath()
    ctx.roundRect((W - pillW) / 2, pillY, pillW, pillH, 45)
    ctx.fillStyle = "rgba(16, 185, 129, 0.15)"
    ctx.fill()
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)"
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.fillStyle = "#10b981"
    ctx.font = "bold 38px sans-serif"
    ctx.fillText(`🏆 ${displayTitle}`, W / 2, pillY + pillH / 2)
    ctx.restore()

    // 7. Motivational Phrase & User Name
    if (includeName) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)"
      ctx.font = "bold 36px sans-serif"
      ctx.fillText(`Vitória de ${displayName}`, W / 2, cardY + 980)
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.45)"
    ctx.font = "italic 30px sans-serif"
    ctx.fillText("“A vitória de hoje constrói a liberdade de amanhã.”", W / 2, cardY + (includeName ? 1060 : 1000))

    // 8. Footer Watermark
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
    ctx.font = "500 26px sans-serif"
    ctx.fillText("Foco Diário · streakly.app", W / 2, cardY + cardH - 80)

  }, [displayDays, displayTitle, displayName, habitLabel, includeName])

  React.useEffect(() => {
    if (open) {
      setTimeout(drawCardToCanvas, 100)
    }
  }, [open, drawCardToCanvas])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setDownloading(true)
    triggerHaptic("medium")

    try {
      const dataUrl = canvas.toDataURL("image/png")
      const a = document.createElement("a")
      a.href = dataUrl
      a.download = `streakly-conquista-${displayDays}dias.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      triggerCelebrationConfetti()
      toast.success("Imagem baixada com sucesso!", {
        description: "Pronta para compartilhar nos Stories ou WhatsApp!",
      })
    } catch (err) {
      toast.error("Erro ao gerar imagem para download.")
    } finally {
      setDownloading(false)
    }
  }

  const handleShareOrCopy = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    triggerHaptic("light")

    canvas.toBlob(async (blob) => {
      if (!blob) return

      // Try native Web Share API with file (smartphones)
      if (navigator.canShare && navigator.canShare({ files: [new File([blob], "conquista.png", { type: "image/png" })] })) {
        try {
          await navigator.share({
            files: [new File([blob], `streakly-${displayDays}dias.png`, { type: "image/png" })],
            title: `Conquista Streakly: ${displayDays} dias!`,
            text: `Mais uma vitória no Streakly: ${displayDays} dias com foco absoluto!`,
          })
          triggerCelebrationConfetti()
          return
        } catch (e) {
          // Fallback to clipboard
        }
      }

      // Fallback: Copy to Clipboard
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ])
        setCopied(true)
        triggerHaptic("success")
        toast.success("Imagem copiada para a área de transferência!")
        setTimeout(() => setCopied(false), 2500)
      } catch (e) {
        // Direct download as last resort
        handleDownload()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="size-5 text-yellow-500" />
            Compartilhar Conquista
          </DialogTitle>
          <DialogDescription>
            Gere um cartão visual exclusivo para celebrar seu marco.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 my-2">
          {/* Card Preview */}
          <div className="relative w-[240px] aspect-[9/16] rounded-2xl overflow-hidden border border-border/60 shadow-xl bg-[oklch(0.18_0.005_260)] flex flex-col items-center justify-between p-5 text-center select-none">
            {/* Ambient glow */}
            <div className="absolute inset-x-0 -top-10 h-32 bg-primary/20 blur-2xl rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-1">
              <span className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">Streakly</span>
              <span className="text-[10px] font-semibold text-primary">{habitLabel}</span>
            </div>

            <div className="relative z-10 flex flex-col items-center my-auto">
              <span className="text-6xl font-black tracking-tighter text-foreground tabular-nums drop-shadow-sm">
                {displayDays}
              </span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                {displayDays === 1 ? "Dia Limpo" : "Dias Limpos"}
              </span>
              <div className="mt-3 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-[11px] font-bold">
                🏆 {displayTitle}
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-1">
              {includeName && (
                <span className="text-[11px] font-medium text-foreground">Vitória de {displayName}</span>
              )}
              <span className="text-[8px] text-muted-foreground/60 tracking-wider">streakly.app</span>
            </div>
          </div>

          {/* Hidden Canvas for High-Resolution Export */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Privacy & Customization Toggles */}
          <div className="w-full flex flex-col gap-2 rounded-xl bg-muted/30 p-3 border border-border/50 text-xs">
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <EyeOff className="size-3.5" />
                Ocultar nome do hábito (Garante privacidade)
              </span>
              <input
                type="checkbox"
                checked={hideHabit}
                onChange={(e) => setHideHabit(e.target.checked)}
                className="size-4 accent-primary rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1 border-t border-border/30">
              <span className="text-muted-foreground">Exibir meu nome/apelido</span>
              <input
                type="checkbox"
                checked={includeName}
                onChange={(e) => setIncludeName(e.target.checked)}
                className="size-4 accent-primary rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="w-full grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-11 rounded-xl text-xs font-semibold gap-1.5"
              onClick={handleShareOrCopy}
            >
              {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
              {copied ? "Copiado!" : "Compartilhar / Copiar"}
            </Button>

            <Button
              className="h-11 rounded-xl text-xs font-semibold gap-1.5"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download className="size-4" />
              Baixar Imagem
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
