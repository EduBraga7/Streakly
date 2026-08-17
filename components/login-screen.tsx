"use client"

import * as React from "react"
import { Shield, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signInAnonymously, signInWithPopup, AuthErrorCodes } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { googleProvider } from "@/components/tracker-provider"

/** Minimal Google wordmark as an inline SVG */
function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className="size-5 shrink-0"
    >
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.5 26.9 36 24 36c-5.3 0-9.6-3.1-11.3-7.5l-6.5 5C9.7 39.7 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.7 5.8l6.2 5.2C40.8 35.4 44 30.1 44 24c0-1.3-.1-2.7-.4-4z" />
    </svg>
  )
}

export function LoginScreen() {
  const [loadingGoogle, setLoadingGoogle] = React.useState(false)
  const [loadingAnon, setLoadingAnon] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const isLoading = loadingGoogle || loadingAnon

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-12">

      {/* Background ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="size-[500px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Card */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-16 items-center justify-center shrink-0">
            <img 
              src="/streakly-assets/logo-color.png" 
              alt="Streakly Logo" 
              className="h-full w-auto object-contain drop-shadow-md"
            />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Streakly
            </h1>
            <p className="text-sm text-muted-foreground">
              Foco diário. Um dia de cada vez.
            </p>
          </div>
        </div>

        {/* Divider with tagline */}
        <div className="flex w-full flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2 text-muted-foreground/60">
            <Flame className="size-3.5 text-primary/60" />
            <span className="text-xs">Rastreie sua sequência, supere crises, recomece sem culpa</span>
            <Flame className="size-3.5 text-primary/60" />
          </div>
        </div>

        {/* Auth buttons */}
        <div className="flex w-full flex-col gap-3">
          <Button
            id="btn-signin-google"
            size="lg"
            variant="outline"
            className="w-full gap-3 font-medium"
            disabled={isLoading}
            onClick={() => {
              // Popup must be triggered immediately in the click event
              const authPromise = signInWithPopup(auth, googleProvider)
              setLoadingGoogle(true)
              setError(null)

              authPromise.catch((err: any) => {
                if (err.code !== AuthErrorCodes.POPUP_CLOSED_BY_USER) {
                  setError(`Erro: ${err?.code ?? "Falha ao entrar com Google"}`)
                }
                setLoadingGoogle(false)
              })
            }}
          >
            {loadingGoogle ? (
              <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <GoogleIcon />
            )}
            {loadingGoogle ? "Entrando..." : "Continuar com o Google"}
          </Button>

          <div className="flex items-center gap-3 text-muted-foreground/50">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs">ou</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            id="btn-continue-anon"
            size="lg"
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            disabled={isLoading}
            onClick={() => {
              const authPromise = signInAnonymously(auth)
              setLoadingAnon(true)
              setError(null)
              
              authPromise.catch((err: any) => {
                setError(`Erro: ${err?.code ?? "Tente novamente."}`)
                setLoadingAnon(false)
              })
            }}
          >
            {loadingAnon ? (
              <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent mr-2" />
            ) : null}
            {loadingAnon ? "Carregando..." : "Continuar sem conta"}
          </Button>
        </div>

        {error && (
          <p className="text-center text-xs text-destructive">{error}</p>
        )}

        {/* Footer note */}
        <p className="text-center text-xs leading-relaxed text-muted-foreground/60 max-w-xs">
          Ao continuar sem conta, seu progresso fica salvo apenas neste dispositivo.
          Entre com o Google para sincronizar em qualquer lugar.
        </p>
      </div>
    </div>
  )
}
