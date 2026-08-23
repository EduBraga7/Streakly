"use client"

import * as React from "react"
import {
  ChevronDown,
  HeartHandshake,
  PencilLine,
  ShieldCheck,
  PhoneCall,
  ExternalLink,
  Headphones,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Eye,
  Hand,
  Ear,
  Wind,
  Coffee,
  CheckCircle2,
  Activity,
  Flame,
  MessageCircle,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { BreathingCircle } from "@/components/breathing-circle"
import { useTracker } from "@/components/tracker-provider"
import { triggerCelebrationConfetti, triggerHaptic, triggerMiniConfetti } from "@/lib/feedback"
import { playSurfingBell } from "@/lib/audio/sound-effects"
import { toast } from "sonner"

const ANCHOR_ACTIONS = [
  { id: 0, category: "Físico", text: "Beber 1 copo de água bem gelada", icon: "💧" },
  { id: 1, category: "Físico", text: "Lavar o rosto com água fria", icon: "🧊" },
  { id: 2, category: "Corpo", text: "Fazer 15 flexões ou agachamentos", icon: "⚡" },
  { id: 3, category: "Ambiente", text: "Sair do quarto e ir para local visível", icon: "🚪" },
  { id: 4, category: "Foco", text: "Deixar o celular em outro cômodo por 10 min", icon: "📵" },
  { id: 5, category: "Social", text: "Mandar mensagem para alguém de confiança", icon: "💬" },
]

const GROUNDING_STEPS = [
  {
    count: 5,
    icon: Eye,
    title: "5 Coisas que você VÊ",
    description: "Olhe ao redor e nomeie 5 objetos específicos (a maçaneta, a sombra na parede, a caneta...).",
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
  {
    count: 4,
    icon: Hand,
    title: "4 Coisas que você TOCA",
    description: "Sinta a textura da sua roupa, o tecido da cadeira, a temperatura do chão ou uma superfície lisa.",
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    count: 3,
    icon: Ear,
    title: "3 Sons que você OUVE",
    description: "Feche os olhos por alguns segundos. Ouça o trânsito distante, o vento, a respiração ou o relógio.",
    color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  },
  {
    count: 2,
    icon: Wind,
    title: "2 Aromas que você SENTE",
    description: "Inspire fundo pelo nariz. Note o aroma do ambiente, de um perfume, café ou sabonete.",
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  {
    count: 1,
    icon: Coffee,
    title: "1 Sensação / Sabor",
    description: "Beba um gole d'água gelada prestando total atenção na temperatura e sensação na boca.",
    color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  },
]

interface SosDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SosDialog({ open, onOpenChange }: SosDialogProps) {
  const { state, updateLetter, markCrisisSurvived } = useTracker()
  const [checked, setChecked] = React.useState<Record<number, boolean>>({})
  const [groundingChecked, setGroundingChecked] = React.useState<Record<number, boolean>>({})
  const [editingLetter, setEditingLetter] = React.useState(false)
  const [letterOpen, setLetterOpen] = React.useState(false)
  const [letterDraft, setLetterDraft] = React.useState(state.letterToSelf)

  // Urge Surfing Timer State (15 min = 900s)
  const [timerSeconds, setTimerSeconds] = React.useState(900)
  const [timerRunning, setTimerRunning] = React.useState(false)

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false)
            triggerHaptic("success")
            playSurfingBell()
            triggerCelebrationConfetti()
            toast.success("15 minutos concluídos!", {
              description: "Você surfou a onda da vontade com sucesso absoluto!",
            })
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerRunning, timerSeconds])

  React.useEffect(() => {
    if (open) {
      setChecked({})
      setGroundingChecked({})
      setEditingLetter(false)
      setLetterOpen(false)
      setLetterDraft(state.letterToSelf)
      setTimerSeconds(900)
      setTimerRunning(false)
    }
  }, [open, state.letterToSelf])

  const handleSurvived = () => {
    triggerHaptic("success")
    triggerCelebrationConfetti()
    markCrisisSurvived()
    onOpenChange(false)
    toast.success("Vitória! Você superou o impulso.", {
      description: "Mais um passo gigante rumo ao seu objetivo.",
    })
  }

  const saveLetter = () => {
    updateLetter(letterDraft.trim() || state.letterToSelf)
    setEditingLetter(false)
  }

  // Timer helpers
  const minutes = Math.floor(timerSeconds / 60)
  const seconds = timerSeconds % 60
  const progressPercent = Math.round(((900 - timerSeconds) / 900) * 100)

  // Dynamic supportive messages based on urge surfing timeline
  let surfingMessage = "O impulso atingiu o pico. Lembre-se: vontades são como ondas do mar. Elas não duram para sempre se você não alimentá-las."
  let surfingPhaseTitle = "Pico Inicial da Onda"
  if (timerSeconds <= 720 && timerSeconds > 480) {
    surfingMessage = "Você já superou os primeiros minutos! A química de urgência do cérebro começa a recuar. Mantenha o foco na sua respiração."
    surfingPhaseTitle = "Fase de Resistência"
  } else if (timerSeconds <= 480 && timerSeconds > 180) {
    surfingMessage = "A intensidade está em declínio claro. Beba um copo de água e mude de cômodo. Você é o capitão do seu corpo."
    surfingPhaseTitle = "Declínio da Vontade"
  } else if (timerSeconds <= 180 && timerSeconds > 0) {
    surfingMessage = "Reta final! O impulso perdeu quase toda a força. Sinta o orgulho genuíno da sua vitória."
    surfingPhaseTitle = "Vitória Iminente"
  } else if (timerSeconds === 0) {
    surfingMessage = "15 minutos superados! A onda passou e você continua no comando."
    surfingPhaseTitle = "Onda Vencida!"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] sm:max-w-lg gap-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <DialogHeader className="text-center sm:text-center pb-2">
          <DialogTitle className="text-lg sm:text-xl font-bold flex items-center justify-center gap-2 text-foreground">
            <Flame className="size-5 text-destructive" />
            Central de Controle de Crises
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            A vontade é uma onda biológica passageira. Escolha uma ferramenta para superá-la:
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="breathe" className="w-full mt-3">
          <TabsList className="grid w-full grid-cols-4 h-9 p-1 bg-muted/40 rounded-xl">
            <TabsTrigger value="breathe" className="text-[10px] sm:text-xs font-semibold rounded-lg px-1 truncate">
              Respiração
            </TabsTrigger>
            <TabsTrigger value="surf" className="text-[10px] sm:text-xs font-semibold rounded-lg px-1 truncate">
              Surfar 15m
            </TabsTrigger>
            <TabsTrigger value="grounding" className="text-[10px] sm:text-xs font-semibold rounded-lg px-1 truncate">
              5-4-3-2-1
            </TabsTrigger>
            <TabsTrigger value="help" className="text-[10px] sm:text-xs font-semibold rounded-lg px-1 truncate">
              Ajuda 24h
            </TabsTrigger>
          </TabsList>

          {/* ── ABA 1: RESPIRAÇÃO & AÇÕES DE CHOQUE ── */}
          <TabsContent value="breathe" className="mt-4 focus-visible:outline-none flex flex-col gap-4">
            <BreathingCircle />

            <section className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Ações de Choque & Substituição
                </h3>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {Object.values(checked).filter(Boolean).length}/{ANCHOR_ACTIONS.length} feitas
                </span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {ANCHOR_ACTIONS.map((action) => {
                  const isChecked = !!checked[action.id]
                  return (
                    <li key={action.id}>
                      <label
                        className={cn(
                          "flex cursor-pointer items-center justify-between gap-2.5 rounded-xl border px-3 py-2 text-xs transition-colors select-none",
                          isChecked
                            ? "border-primary/40 bg-primary/10 text-muted-foreground"
                            : "border-border/60 bg-muted/20 hover:border-border hover:bg-muted/40"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(value) => {
                              triggerHaptic("light")
                              setChecked((prev) => ({ ...prev, [action.id]: value === true }))
                            }}
                          />
                          <span className="text-sm shrink-0">{action.icon}</span>
                          <span className={cn("truncate text-xs", isChecked && "line-through text-muted-foreground")}>
                            {action.text}
                          </span>
                        </div>
                        <span className="text-[9px] font-semibold text-muted-foreground px-1.5 py-0.5 rounded bg-muted border border-border/40 shrink-0">
                          {action.category}
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </section>

            <Collapsible
              open={letterOpen}
              onOpenChange={setLetterOpen}
              className="rounded-xl border border-border/60 bg-muted/20"
            >
              <CollapsibleTrigger
                render={
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-3 text-left text-xs font-medium outline-none transition-colors hover:bg-muted/40"
                  />
                }
              >
                <span className="flex items-center gap-2 font-bold text-foreground">
                  <HeartHandshake className="size-4 text-primary" />
                  Minha Carta de Emergência
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform",
                    letterOpen && "rotate-180",
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pb-3">
                {editingLetter ? (
                  <div className="flex flex-col gap-2">
                    <Textarea
                      value={letterDraft}
                      onChange={(e) => setLetterDraft(e.target.value)}
                      rows={5}
                      className="resize-none text-xs leading-relaxed"
                      placeholder="Escreva uma mensagem para o seu eu em crise..."
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => setEditingLetter(false)}
                      >
                        Cancelar
                      </Button>
                      <Button size="sm" className="text-xs h-8 font-semibold" onClick={saveLetter}>
                        Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <p className="text-xs leading-relaxed text-muted-foreground italic">
                      “{state.letterToSelf}”
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="self-start text-[11px] h-7 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setLetterDraft(state.letterToSelf)
                        setEditingLetter(true)
                      }}
                    >
                      <PencilLine data-icon="inline-start" className="size-3 mr-1" />
                      Editar carta
                    </Button>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>

          {/* ── ABA 2: TEMPORIZADOR DE URGE SURFING (15 MIN) ── */}
          <TabsContent value="surf" className="mt-4 focus-visible:outline-none flex flex-col gap-4">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-5 flex flex-col items-center text-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                  {surfingPhaseTitle}
                </span>
                <span className="text-5xl font-black tabular-nums tracking-tight text-foreground mt-2">
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {progressPercent}% da onda concluída
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Dynamic supportive message */}
              <p className="text-xs text-muted-foreground/90 leading-relaxed max-w-sm px-2">
                {surfingMessage}
              </p>

              {/* Controls */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  className="h-10 px-5 rounded-xl font-bold gap-1.5"
                  onClick={() => {
                    triggerHaptic("medium")
                    setTimerRunning(!timerRunning)
                  }}
                >
                  {timerRunning ? <Pause className="size-4" /> : <Play className="size-4" />}
                  {timerRunning ? "Pausar" : "Iniciar Surfe (15 min)"}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl"
                  onClick={() => {
                    triggerHaptic("light")
                    setTimerRunning(false)
                    setTimerSeconds(900)
                  }}
                  title="Reiniciar temporizador"
                >
                  <RotateCcw className="size-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border/40 bg-card p-3.5 text-xs text-muted-foreground leading-relaxed">
              💡 <strong className="text-foreground">O que é Urge Surfing?</strong> É uma técnica cientificamente comprovada: a vontade é como uma onda. Ela atinge o pico entre 5 a 10 minutos e se dissipa naturalmente se você não ceder à ação.
            </div>
          </TabsContent>

          {/* ── ABA 3: TÉCNICA DE ATERRAMENTO 5-4-3-2-1 ── */}
          <TabsContent value="grounding" className="mt-4 focus-visible:outline-none flex flex-col gap-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              O aterramento sensorial desconecta a mente do impulso compulsivo e reconecta você com o momento presente:
            </p>

            <div className="flex flex-col gap-2">
              {GROUNDING_STEPS.map((step, idx) => {
                const Icon = step.icon
                const isChecked = !!groundingChecked[idx]
                return (
                  <button
                    key={step.count}
                    type="button"
                    onClick={() => {
                      triggerHaptic("light")
                      setGroundingChecked((prev) => ({ ...prev, [idx]: !isChecked }))
                    }}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer select-none",
                      isChecked
                        ? "border-primary/40 bg-primary/10 opacity-70"
                        : "border-border/60 bg-muted/20 hover:bg-muted/40"
                    )}
                  >
                    <div className={cn("size-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5", step.color)}>
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={cn("text-xs font-bold", isChecked ? "line-through text-muted-foreground" : "text-foreground")}>
                          {step.title}
                        </span>
                        {isChecked && <CheckCircle2 className="size-4 text-primary shrink-0" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </TabsContent>

          {/* ── ABA 4: CANAIS DE APOIO GRATUITOS & SIGILOSOS ── */}
          <TabsContent value="help" className="mt-4 focus-visible:outline-none flex flex-col gap-3">
            {/* Guardião de Confiança */}
            {state.guardian?.name && state.guardian?.phone ? (
              <a
                href={`https://wa.me/${state.guardian.phone.startsWith("55") ? state.guardian.phone : `55${state.guardian.phone}`}?text=${encodeURIComponent(
                  `Olá ${state.guardian.name}! Estou no Streakly enfrentando um momento de crise com meu hábito agora e preciso de uma palavra de apoio.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all group gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="size-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                    <MessageCircle className="size-4" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold text-foreground truncate">Chamar Guardião ({state.guardian.name})</span>
                    <span className="text-[10px] text-emerald-500 font-semibold truncate">Pedir apoio no WhatsApp 💬</span>
                  </div>
                </div>
                <ExternalLink className="size-4 text-emerald-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </a>
            ) : null}

            <p className="text-xs text-muted-foreground leading-relaxed">
              Se sentir que a situação está insustentável, procure apoio humano. O atendimento é 100% gratuito, confidencial e sem julgamentos:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* CVV */}
              <a
                href="tel:188"
                className="flex items-center justify-between p-3.5 rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">CVV — Apoio Emocional</span>
                  <span className="text-[11px] text-primary font-semibold mt-0.5">Ligue 188 (24h / Grátis)</span>
                </div>
                <PhoneCall className="size-4 text-primary" />
              </a>

              {/* VivaVoz */}
              <a
                href="tel:132"
                className="flex items-center justify-between p-3.5 rounded-2xl border border-border/60 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">VivaVoz — SUS</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">Ligue 132 (Orientações)</span>
                </div>
                <PhoneCall className="size-4 text-muted-foreground" />
              </a>
            </div>

            <div className="flex flex-col gap-1.5 pt-2 border-t border-border/40">
              <span className="text-xs font-semibold text-foreground">Grupos de Apoio Online:</span>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <a
                  href="https://cvv.org.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Chat online CVV <ExternalLink className="size-3" />
                </a>
                <span className="text-muted-foreground">•</span>
                <a
                  href="https://alcoolicosanonimos.org.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Reuniões Alcoólicos Anônimos <ExternalLink className="size-3" />
                </a>
                <span className="text-muted-foreground">•</span>
                <a
                  href="https://na.org.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Narcóticos Anônimos <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Button: Superei a Crise */}
        <div className="mt-5 pt-3 border-t border-border/50">
          <Button 
            onClick={handleSurvived} 
            className="h-14 w-full rounded-2xl text-base font-bold bg-success text-success-foreground hover:bg-success/90 shadow-[0_8px_24px_-8px_var(--color-success)] transition-all duration-300 hover:scale-[0.99] active:scale-[0.97]"
          >
            <ShieldCheck data-icon="inline-start" className="size-5 mr-2" />
            Superei a crise
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
