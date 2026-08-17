"use client"

import * as React from "react"
import { Save, TriangleAlert, LogIn, LogOut, Shield, Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useTracker } from "@/components/tracker-provider"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Minimal Google wordmark as an inline SVG */
function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className="size-4 shrink-0"
    >
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.5 26.9 36 24 36c-5.3 0-9.6-3.1-11.3-7.5l-6.5 5C9.7 39.7 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.7 5.8l6.2 5.2C40.8 35.4 44 30.1 44 24c0-1.3-.1-2.7-.4-4z" />
    </svg>
  )
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { state, updateLetter, resetAll, user, linkWithGoogle, logout } = useTracker()
  const [draft, setDraft] = React.useState(state.letterToSelf)
  const [confirmReset, setConfirmReset] = React.useState(false)
  const [linking, setLinking] = React.useState(false)
  const [linkError, setLinkError] = React.useState<string | null>(null)

  const isAnonymous = !user || user.isAnonymous

  React.useEffect(() => {
    if (open) {
      setDraft(state.letterToSelf)
      setConfirmReset(false)
      setLinkError(null)
    }
  }, [open, state.letterToSelf])

  function handleLinkWithGoogle() {
    setLinking(true)
    setLinkError(null)
    
    // Popup must be triggered immediately, not inside an async function after state update
    linkWithGoogle().catch((err: any) => {
      console.error("Link with Google error:", err)
      setLinkError(`Erro: ${err?.code ?? err?.message ?? "desconhecido"}`)
    }).finally(() => {
      setLinking(false)
    })
  }

  async function handleLogout() {
    await logout()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Configurações</DialogTitle>
          <DialogDescription>
            Personalize sua carta de emergência e gerencie seus dados.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">

          {/* ── Account section ── */}
          <div className="flex flex-col gap-2.5">
            <Label className="text-sm font-medium">Conta</Label>

            {isAnonymous ? (
              <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 p-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Seu progresso está salvo neste dispositivo de forma anônima.
                    Vincule ao Google para acessar de qualquer lugar e nunca perder sua sequência.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="self-start gap-2"
                  onClick={handleLinkWithGoogle}
                  disabled={linking}
                  id="btn-link-google"
                >
                  {linking ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <GoogleIcon />
                  )}
                  {linking ? "Conectando..." : "Continuar com o Google"}
                </Button>
                {linkError && (
                  <p className="text-xs text-destructive">{linkError}</p>
                )}
              </div>
            ) : (
              <div className="rounded-xl bg-muted/40 p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <GoogleIcon />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{user.displayName ?? "Usuário"}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={handleLogout}
                  id="btn-logout"
                >
                  <LogOut className="size-3.5" />
                  Sair
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* ── Letter section ── */}
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="letter" className="text-sm font-medium">
              Carta para mim mesmo
            </Label>
            <Textarea
              id="letter"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={6}
              className="resize-none text-sm leading-relaxed"
              placeholder="Escreva o que você precisa ouvir num momento de fraqueza..."
            />
            <Button
              size="sm"
              className="self-end"
              onClick={() => updateLetter(draft.trim() || state.letterToSelf)}
            >
              <Save data-icon="inline-start" className="size-3.5" />
              Salvar carta
            </Button>
          </div>

          <Separator />

          {/* ── Danger zone ── */}
          <div className="flex flex-col gap-2.5">
            <Label className="text-sm font-medium text-destructive">
              Zona de risco
            </Label>
            <p className="text-xs text-muted-foreground">
              Isso apaga sua sequência, histórico e recorde. Não pode ser
              desfeito.
            </p>
            {confirmReset ? (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => setConfirmReset(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    resetAll()
                    onOpenChange(false)
                  }}
                >
                  <TriangleAlert data-icon="inline-start" className="size-3.5" />
                  Confirmar
                </Button>
              </div>
            ) : (
              <Button
                variant="destructive"
                size="sm"
                className="self-start"
                onClick={() => setConfirmReset(true)}
              >
                Apagar todos os dados
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
