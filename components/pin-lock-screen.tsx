"use client"

import * as React from "react"
import Image from "next/image"
import { Shield, Fingerprint, Delete, Lock, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { triggerHaptic } from "@/lib/feedback"
import { cn } from "@/lib/utils"

interface PinLockScreenProps {
  onUnlockWithPin: (pin: string) => Promise<boolean>
  onUnlockWithBiometrics?: () => Promise<boolean>
  isBiometricsAvailable?: boolean
  biometricsEnabled?: boolean
  onQuickHide?: () => void
}

export function PinLockScreen({
  onUnlockWithPin,
  onUnlockWithBiometrics,
  isBiometricsAvailable,
  biometricsEnabled,
  onQuickHide,
}: PinLockScreenProps) {
  const [pin, setPin] = React.useState("")
  const [errorShake, setErrorShake] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [verifying, setVerifying] = React.useState(false)

  // Auto trigger biometrics prompt on mount if enabled
  React.useEffect(() => {
    if (biometricsEnabled && onUnlockWithBiometrics) {
      const timer = setTimeout(() => {
        onUnlockWithBiometrics()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [biometricsEnabled, onUnlockWithBiometrics])

  // Handle number press
  const handleDigit = React.useCallback(
    async (digit: string) => {
      if (verifying || pin.length >= 4) return
      triggerHaptic("light")

      const newPin = pin + digit
      setPin(newPin)
      setErrorMessage(null)

      if (newPin.length === 4) {
        setVerifying(true)
        const success = await onUnlockWithPin(newPin)
        if (!success) {
          triggerHaptic("error")
          setErrorShake(true)
          setErrorMessage("PIN incorreto. Tente novamente.")
          setTimeout(() => {
            setPin("")
            setErrorShake(false)
            setVerifying(false)
          }, 600)
        } else {
          triggerHaptic("success")
        }
      }
    },
    [pin, verifying, onUnlockWithPin]
  )

  const handleBackspace = React.useCallback(() => {
    if (pin.length === 0 || verifying) return
    triggerHaptic("light")
    setPin((prev) => prev.slice(0, -1))
    setErrorMessage(null)
  }, [pin, verifying])

  // Keyboard listener for physical numpad
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key)
      } else if (e.key === "Backspace") {
        handleBackspace()
      } else if (e.key === "Escape" && onQuickHide) {
        onQuickHide()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleDigit, handleBackspace, onQuickHide])

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-between bg-background px-6 py-10 select-none">
      {/* Background ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center -z-10"
      >
        <div className="size-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Top bar */}
      <div className="w-full flex items-center justify-between max-w-xs">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <Shield className="size-4 text-primary" />
          <span>Streakly Protegido</span>
        </div>
        {onQuickHide && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onQuickHide}
            className="h-8 text-[11px] text-muted-foreground hover:text-foreground gap-1 px-2 rounded-xl"
            title="Camuflagem Rápida"
          >
            <EyeOff className="size-3.5" />
            Disfarce
          </Button>
        )}
      </div>

      {/* Center lock info */}
      <div className="flex flex-col items-center gap-5 max-w-xs text-center my-auto">
        <div className="size-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
          <Lock className="size-7" />
        </div>

        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-bold text-foreground">Digite seu PIN</h1>
          <p className="text-xs text-muted-foreground">
            Acesso seguro aos seus dados e histórico
          </p>
        </div>

        {/* 4 dots */}
        <div
          className={cn(
            "flex items-center gap-4 py-2 transition-transform",
            errorShake && "animate-shake"
          )}
        >
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx
            return (
              <div
                key={idx}
                className={cn(
                  "size-4 rounded-full border-2 transition-all duration-200",
                  isFilled
                    ? "bg-primary border-primary scale-110 shadow-sm shadow-primary/30"
                    : "border-border/80 bg-muted/30"
                )}
              />
            )
          })}
        </div>

        {errorMessage && (
          <p className="text-xs font-semibold text-destructive animate-in fade-in">
            {errorMessage}
          </p>
        )}
      </div>

      {/* Numeric Keypad */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-3 pb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigit(String(digit))}
            className="h-16 rounded-2xl bg-card border border-border/60 hover:bg-muted/50 active:bg-primary/20 active:scale-95 transition-all text-xl font-bold text-foreground flex items-center justify-center shadow-xs"
          >
            {digit}
          </button>
        ))}

        {/* Bottom row: Biometrics / Empty */}
        <div className="flex items-center justify-center">
          {biometricsEnabled && onUnlockWithBiometrics ? (
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light")
                onUnlockWithBiometrics()
              }}
              className="size-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 active:scale-95 transition-all flex items-center justify-center"
              title="Desbloquear com Biometria"
            >
              <Fingerprint className="size-7" />
            </button>
          ) : (
            <div className="size-16" />
          )}
        </div>

        {/* 0 */}
        <button
          type="button"
          onClick={() => handleDigit("0")}
          className="h-16 rounded-2xl bg-card border border-border/60 hover:bg-muted/50 active:bg-primary/20 active:scale-95 transition-all text-xl font-bold text-foreground flex items-center justify-center shadow-xs"
        >
          0
        </button>

        {/* Backspace */}
        <button
          type="button"
          onClick={handleBackspace}
          className="h-16 rounded-2xl bg-card border border-border/60 hover:bg-muted/50 active:bg-muted/80 active:scale-95 transition-all text-muted-foreground hover:text-foreground flex items-center justify-center shadow-xs"
          title="Apagar"
        >
          <Delete className="size-6" />
        </button>
      </div>
    </div>
  )
}
