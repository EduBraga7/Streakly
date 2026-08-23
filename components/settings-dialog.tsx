"use client"

import * as React from "react"
import { Save, TriangleAlert, LogIn, LogOut, Shield, Loader2, Bell, Download, Upload, EyeOff, Eye, Coins, Lock, Fingerprint, KeyRound, HeartHandshake, Volume2, VolumeX } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useTracker } from "@/components/tracker-provider"
import { validateAndNormalizeBackup } from "@/lib/tracker/storage"
import { useDiscreetMode } from "@/lib/hooks/use-discreet-mode"
import { useAppLock } from "@/lib/hooks/use-app-lock"
import { isSoundEffectsEnabled, setSoundEffectsEnabled, playSuccessChime } from "@/lib/audio/sound-effects"
import {
  requestLocalNotificationPermission,
  getStoredReminderSettings,
  saveReminderSettings,
  sendLocalNotification,
} from "@/lib/pwa/notifications"
import { triggerHaptic } from "@/lib/feedback"
import { toast } from "sonner"

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
  const { state, allTrackers, deleteTracker, updateLetter, updateUserName, updateDailyCost, updateGuardian, resetAll, importBackup, user, isGuest, linkWithGoogle, logout } = useTracker()
  const { discreetMode, discreetTitle, toggleDiscreetMode, setDiscreetTitle } = useDiscreetMode()
  const [draft, setDraft] = React.useState(state.letterToSelf)
  const [nameDraft, setNameDraft] = React.useState(state.userName || user?.displayName?.split(" ")[0] || "")
  const [dailyCostDraft, setDailyCostDraft] = React.useState<string>(state.dailyCost ? String(state.dailyCost) : "")
  const [guardianNameDraft, setGuardianNameDraft] = React.useState(state.guardian?.name || "")
  const [guardianPhoneDraft, setGuardianPhoneDraft] = React.useState(state.guardian?.phone || "")
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [confirmReset, setConfirmReset] = React.useState(false)
  const [confirmDeleteHabit, setConfirmDeleteHabit] = React.useState(false)
  const [linking, setLinking] = React.useState(false)
  const [linkError, setLinkError] = React.useState<string | null>(null)
  const [reminderEnabled, setReminderEnabled] = React.useState(false)
  const [reminderTime, setReminderTime] = React.useState("21:00")
  const [soundEnabled, setSoundEnabled] = React.useState(true)

  const {
    pinEnabled,
    biometricsEnabled,
    autoLockMinutes,
    isBiometricsAvailable,
    setPin,
    removePin,
    setBiometricsEnabled,
    setAutoLockMinutes,
  } = useAppLock()

  const [showPinSetup, setShowPinSetup] = React.useState(false)
  const [pinInput, setPinInput] = React.useState("")
  const [confirmPinInput, setConfirmPinInput] = React.useState("")

  const isGuestOrAnonymous = isGuest || !user || user.isAnonymous

  React.useEffect(() => {
    if (open) {
      setDraft(state.letterToSelf)
      setNameDraft(state.userName || user?.displayName?.split(" ")[0] || "")
      setDailyCostDraft(state.dailyCost !== undefined ? String(state.dailyCost) : "")
      setGuardianNameDraft(state.guardian?.name || "")
      setGuardianPhoneDraft(state.guardian?.phone || "")
      setConfirmReset(false)
      setLinkError(null)
      setSoundEnabled(isSoundEffectsEnabled())

      const stored = getStoredReminderSettings()
      setReminderEnabled(stored.enabled)
      setReminderTime(stored.time)
    }
  }, [open, state.letterToSelf, state.userName, state.dailyCost, state.guardian, user?.displayName])

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

  function handleExportBackup() {
    triggerHaptic("light")
    const jsonStr = JSON.stringify(state, null, 2)
    const blob = new Blob([jsonStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    const dateStr = new Date().toISOString().split("T")[0]
    a.href = url
    a.download = `streakly-backup-${dateStr}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Backup exportado com sucesso!")
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const parsed = JSON.parse(text)
        const validated = validateAndNormalizeBackup(parsed)
        if (validated) {
          importBackup(validated)
          triggerHaptic("success")
          toast.success("Backup restaurado com sucesso!", {
            description: "Seu progresso e histórico foram sincronizados.",
          })
          onOpenChange(false)
        } else {
          triggerHaptic("error")
          toast.error("Arquivo de backup inválido ou incompatível.")
        }
      } catch (err) {
        triggerHaptic("error")
        toast.error("Erro ao ler o arquivo de backup.")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
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
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Conta & Sincronização</Label>
              {isGuestOrAnonymous && (
                <span className="text-[10px] font-semibold text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                  Modo Local / Convidado
                </span>
              )}
            </div>

            {isGuestOrAnonymous ? (
              <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 p-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Seu progresso está salvo neste dispositivo de forma anônima e 100% privada.
                    Conecte com o Google para fazer backup em nuvem e acessar em outros aparelhos.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="self-start gap-2 rounded-xl border-primary/30 text-foreground hover:bg-primary/10"
                  onClick={handleLinkWithGoogle}
                  disabled={linking}
                  id="btn-link-google"
                >
                  {linking ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <GoogleIcon />
                  )}
                  {linking ? "Conectando..." : "Conectar com o Google"}
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

          {/* ── Perfil ── */}
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="userName" className="text-sm font-medium">
              Como quer ser chamado?
            </Label>
            <div className="flex gap-2">
              <Input
                id="userName"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="Seu nome ou apelido"
                className="h-9"
              />
              <Button
                size="sm"
                className="shrink-0 h-9"
                onClick={() => updateUserName(nameDraft.trim())}
              >
                Salvar
              </Button>
            </div>
          </div>

          <Separator />

          {/* ── Economia Financeira ── */}
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="dailyCost" className="text-sm font-medium flex items-center gap-2">
              <Coins className="size-4 text-emerald-500" />
              Gasto Médio Diário (Opcional)
            </Label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Informe quanto você gastava por dia com esse hábito (ex: cigarros, bebidas, apostas, compras) para calcular o dinheiro poupado.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">R$</span>
                <Input
                  id="dailyCost"
                  type="number"
                  step="0.50"
                  min="0"
                  value={dailyCostDraft}
                  onChange={(e) => setDailyCostDraft(e.target.value)}
                  placeholder="0.00"
                  className="h-9 pl-9"
                />
              </div>
              <Button
                size="sm"
                className="shrink-0 h-9"
                onClick={() => {
                  const val = parseFloat(dailyCostDraft.replace(",", "."))
                  const finalCost = !isNaN(val) && val > 0 ? val : undefined
                  updateDailyCost(finalCost)
                  triggerHaptic("success")
                  toast.success(finalCost ? `Economia diária definida: R$ ${finalCost.toFixed(2)}/dia` : "Gasto diário removido.")
                }}
              >
                Salvar
              </Button>
            </div>
          </div>

          <Separator />

          {/* ── Guardião de Confiança / Parceiro de Apoio ── */}
          <div className="flex flex-col gap-2.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <HeartHandshake className="size-4 text-primary" />
              Guardião de Confiança (Parceiro de Apoio)
            </Label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Cadastre um amigo, parceiro ou terapeuta para enviar mensagem de socorro no WhatsApp com 1 toque durante o Modo SOS.
            </p>
            <div className="flex flex-col gap-2.5 rounded-xl bg-muted/20 border border-border/60 p-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-muted-foreground font-medium">Nome do Guardião:</label>
                  <Input
                    value={guardianNameDraft}
                    onChange={(e) => setGuardianNameDraft(e.target.value)}
                    placeholder="Ex: Carlos, Maria, Dr. Silva"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-muted-foreground font-medium">WhatsApp (com DDD):</label>
                  <Input
                    value={guardianPhoneDraft}
                    onChange={(e) => setGuardianPhoneDraft(e.target.value.replace(/\D/g, ""))}
                    placeholder="Ex: 11999999999"
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border/40">
                {state.guardian?.name ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
                    onClick={() => {
                      updateGuardian(undefined)
                      setGuardianNameDraft("")
                      setGuardianPhoneDraft("")
                      toast.info("Guardião removido.")
                    }}
                  >
                    Remover Guardião
                  </Button>
                ) : <div />}

                <Button
                  size="sm"
                  className="h-8 text-xs font-bold"
                  onClick={() => {
                    if (!guardianNameDraft.trim() || !guardianPhoneDraft.trim()) {
                      toast.error("Informe o nome e o número de WhatsApp do guardião.")
                      return
                    }
                    updateGuardian({
                      name: guardianNameDraft.trim(),
                      phone: guardianPhoneDraft.trim(),
                    })
                    triggerHaptic("success")
                    toast.success("Guardião de confiança salvo com sucesso!")
                  }}
                >
                  Salvar Guardião
                </Button>
              </div>
            </div>
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

          {/* ── Notifications section ── */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Lembretes & Notificações</Label>
              <span className="text-[10px] text-muted-foreground font-medium">PWA Local</span>
            </div>
            
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 flex flex-col gap-3.5">
              <div className="flex items-start gap-3">
                <Bell className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Receba lembretes diários para não esquecer de fazer o check-in e manter seu streak ativo.
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/40">
                <span className="text-xs font-semibold text-foreground">Lembrete Diário</span>
                <Button
                  size="sm"
                  variant={reminderEnabled ? "default" : "outline"}
                  className="h-8 text-xs font-bold gap-1.5"
                  onClick={async () => {
                    if (!reminderEnabled) {
                      const permission = await requestLocalNotificationPermission()
                      if (permission === "granted") {
                        setReminderEnabled(true)
                        saveReminderSettings(true, reminderTime)
                        toast.success("Lembrete ativado com sucesso!")
                      } else {
                        toast.error("Permissão de notificações não concedida no navegador.")
                      }
                    } else {
                      setReminderEnabled(false)
                      saveReminderSettings(false, reminderTime)
                      toast.info("Lembrete diário desativado.")
                    }
                  }}
                >
                  {reminderEnabled ? "Ativado ✓" : "Ativar Lembrete"}
                </Button>
              </div>

              {reminderEnabled && (
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-xs text-muted-foreground">Horário do lembrete:</span>
                  <Input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => {
                      setReminderTime(e.target.value)
                      saveReminderSettings(true, e.target.value)
                    }}
                    className="w-28 h-8 text-xs font-mono"
                  />
                </div>
              )}

              <Button
                size="sm"
                variant="ghost"
                className="self-start text-xs text-muted-foreground hover:text-foreground h-7 px-2"
                onClick={async () => {
                  const perm = await requestLocalNotificationPermission()
                  if (perm === "granted") {
                    sendLocalNotification(
                      "Streakly • Hora do Check-in!",
                      "Mais um dia de vitória. Abra o app para registrar seu progresso."
                    )
                    toast.success("Notificação de teste disparada!")
                  } else {
                    toast.error("Notificações bloqueadas pelo navegador.")
                  }
                }}
              >
                🔔 Testar Notificação
              </Button>
            </div>
          </div>

          <Separator />

          {/* ── Sound Effects section ── */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Volume2 className="size-4 text-primary" />
                Efeitos Sonoros
              </Label>
              <span className="text-[10px] text-muted-foreground font-medium">Web Audio</span>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-foreground">Sons de Conquistas & Check-in</span>
                <span className="text-[11px] text-muted-foreground">Chimes suaves para celebrar seu progresso</span>
              </div>
              <Button
                size="sm"
                variant={soundEnabled ? "default" : "outline"}
                className="h-8 text-xs font-semibold gap-1.5"
                onClick={() => {
                  const next = !soundEnabled
                  setSoundEnabled(next)
                  setSoundEffectsEnabled(next)
                  if (next) {
                    playSuccessChime()
                    toast.success("Efeitos sonoros ativados!")
                  } else {
                    toast.info("Efeitos sonoros desativados.")
                  }
                }}
              >
                {soundEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
                {soundEnabled ? "Ativado ✓" : "Silencioso"}
              </Button>
            </div>
          </div>

          <Separator />

          {/* ── Privacy & Camouflage section ── */}
          <div className="flex flex-col gap-2.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <EyeOff className="size-4 text-muted-foreground" />
              Privacidade & Modo Disfarce
            </Label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Disfarce a aba do navegador com outro nome e ícone neutro para evitar olhares curiosos.
            </p>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Modo Camuflagem</span>
                <Button
                  size="sm"
                  variant={discreetMode ? "default" : "outline"}
                  className="h-8 text-xs font-semibold gap-1.5"
                  onClick={() => {
                    triggerHaptic("light")
                    toggleDiscreetMode()
                    toast.success(discreetMode ? "Modo normal restaurado" : "Modo disfarce ativado!")
                  }}
                >
                  {discreetMode ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  {discreetMode ? "Ativado" : "Desativado"}
                </Button>
              </div>

              {discreetMode && (
                <div className="flex flex-col gap-1.5 pt-1 border-t border-border/40">
                  <label className="text-[11px] text-muted-foreground font-medium">Nome exibido na aba:</label>
                  <Input
                    value={discreetTitle}
                    onChange={(e) => setDiscreetTitle(e.target.value)}
                    placeholder="Ex: Minhas Notas, Calculadora..."
                    className="h-8 text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* ── Security & PIN Lock section ── */}
          <div className="flex flex-col gap-2.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Lock className="size-4 text-primary" />
              Bloqueio por PIN & Biometria
            </Label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Exija um PIN de 4 dígitos ou biometria para abrir o Streakly no seu dispositivo.
            </p>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Proteção por PIN</span>
                {pinEnabled ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => {
                      removePin()
                      toast.info("Bloqueio por PIN desativado.")
                    }}
                  >
                    Desativar
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="h-8 text-xs font-semibold gap-1.5"
                    onClick={() => setShowPinSetup(true)}
                  >
                    <KeyRound className="size-3.5" />
                    Ativar PIN
                  </Button>
                )}
              </div>

              {showPinSetup && !pinEnabled && (
                <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-card border border-primary/30 animate-in fade-in">
                  <span className="text-xs font-semibold text-foreground">Definir PIN de 4 dígitos</span>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="password"
                      maxLength={4}
                      inputMode="numeric"
                      placeholder="Novo PIN (4 dígitos)"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="h-8 text-xs text-center font-mono tracking-widest"
                    />
                    <Input
                      type="password"
                      maxLength={4}
                      inputMode="numeric"
                      placeholder="Confirmar PIN"
                      value={confirmPinInput}
                      onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="h-8 text-xs text-center font-mono tracking-widest"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        setShowPinSetup(false)
                        setPinInput("")
                        setConfirmPinInput("")
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-xs font-bold"
                      onClick={async () => {
                        if (!/^\d{4}$/.test(pinInput)) {
                          toast.error("O PIN deve conter exatamente 4 números.")
                          return
                        }
                        if (pinInput !== confirmPinInput) {
                          toast.error("Os PINs informados não coincidem.")
                          return
                        }
                        await setPin(pinInput)
                        setPinInput("")
                        setConfirmPinInput("")
                        setShowPinSetup(false)
                        triggerHaptic("success")
                        toast.success("Bloqueio por PIN ativado com sucesso!")
                      }}
                    >
                      Salvar PIN
                    </Button>
                  </div>
                </div>
              )}

              {pinEnabled && isBiometricsAvailable && (
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div className="flex items-center gap-1.5 text-xs text-foreground">
                    <Fingerprint className="size-4 text-primary" />
                    <span>Desbloqueio Biométrico (Touch ID / Face ID)</span>
                  </div>
                  <Button
                    size="sm"
                    variant={biometricsEnabled ? "default" : "outline"}
                    className="h-8 text-xs font-semibold"
                    onClick={async () => {
                      const success = await setBiometricsEnabled(!biometricsEnabled)
                      if (success) {
                        toast.success(
                          biometricsEnabled
                            ? "Biometria desativada"
                            : "Biometria configurada com sucesso!"
                        )
                      }
                    }}
                  >
                    {biometricsEnabled ? "Ativado ✓" : "Ativar"}
                  </Button>
                </div>
              )}

              {pinEnabled && (
                <div className="flex flex-col gap-1.5 pt-2 border-t border-border/40">
                  <span className="text-xs text-muted-foreground">Bloquear após inatividade:</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: "Imediato", val: 0 },
                      { label: "1 min", val: 1 },
                      { label: "5 min", val: 5 },
                      { label: "15 min", val: 15 },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => {
                          triggerHaptic("light")
                          setAutoLockMinutes(opt.val)
                        }}
                        className={`h-7 rounded-lg text-[11px] font-semibold border transition-all ${
                          autoLockMinutes === opt.val
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted/70"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* ── Backup & Data section ── */}
          <div className="flex flex-col gap-2.5">
            <Label className="text-sm font-medium">Backup & Dados</Label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Guarde uma cópia segura do seu progresso ou transfira para outro dispositivo via arquivo JSON.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={handleExportBackup}
              >
                <Download className="size-3.5" />
                Exportar Backup (JSON)
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileSelected}
              />

              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-3.5" />
                Restaurar Backup
              </Button>
            </div>
          </div>

          <Separator />

          {/* ── Danger zone ── */}
          <div className="flex flex-col gap-2.5">
            <Label className="text-sm font-medium text-destructive">
              Zona de risco
            </Label>

            {allTrackers.length > 1 && (
              <div className="flex flex-col gap-2 pb-3 mb-1 border-b border-border/40">
                <span className="text-xs font-semibold text-foreground">Excluir este hábito ({state.habit?.name})</span>
                <p className="text-[11px] text-muted-foreground">
                  Remove apenas o rastreador de &quot;{state.habit?.name}&quot;. Seus outros hábitos continuarão intactos.
                </p>
                {confirmDeleteHabit ? (
                  <div className="flex gap-2 pt-1">
                    <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={() => setConfirmDeleteHabit(false)}>
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        const id = state.id || state.habit?.id || "default"
                        deleteTracker(id)
                        toast.success("Hábito excluído com sucesso.")
                        onOpenChange(false)
                      }}
                    >
                      Confirmar Exclusão
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="self-start text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => setConfirmDeleteHabit(true)}
                  >
                    Excluir apenas este hábito
                  </Button>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Isso apaga a sequência, histórico e recordes do hábito atual. Não pode ser
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
                Resetar dados deste hábito
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
