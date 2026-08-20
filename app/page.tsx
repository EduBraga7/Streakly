"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  Flame,
  ShieldCheck,
  LineChart,
  Heart,
  Wifi,
  Award,
  CalendarCheck,
  LifeBuoy,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Target,
  TrendingUp,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"

/* ─────────────────────────────────────────────
   Tiny helper: animated number counter
───────────────────────────────────────────── */
function AnimatedNumber({
  target,
  suffix = "",
  duration = 1800,
}: {
  target: number
  suffix?: string
  duration?: number
}) {
  const [value, setValue] = React.useState(0)
  const ref = React.useRef<HTMLSpanElement>(null)
  const started = React.useRef(false)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const step = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setValue(Math.round(eased * target))
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return (
    <span ref={ref}>
      {value.toLocaleString("pt-BR")}
      {suffix}
    </span>
  )
}

/* ─────────────────────────────────────────────
   Tiny helper: FAQ accordion item
───────────────────────────────────────────── */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        {question}
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-40 pb-5" : "max-h-0"}`}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Mock app preview — pure CSS, no images
───────────────────────────────────────────── */
function MockAppPreview() {
  return (
    <div className="relative mx-auto w-[260px] select-none">
      {/* Phone shell */}
      <div className="relative rounded-[2.5rem] border border-white/10 bg-[oklch(0.18_0.005_260)] p-[3px] shadow-2xl ring-1 ring-white/5">
        {/* Inner screen */}
        <div className="rounded-[2.2rem] overflow-hidden bg-[oklch(0.18_0.005_260)]">
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-3 pb-2">
            <span className="text-[10px] font-semibold text-white/40">9:41</span>
            <div className="h-4 w-24 rounded-full bg-black" />
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-white/30" />
              <div className="h-2 w-3 rounded-sm bg-white/30" />
            </div>
          </div>

          {/* App content */}
          <div className="px-4 pb-6 pt-2 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <div className="size-6 rounded-full bg-primary/30 flex items-center justify-center">
                  <Flame className="size-3 text-primary" />
                </div>
                <span className="text-xs font-semibold text-white/80">Streakly</span>
              </div>
              <div className="size-6 rounded-full bg-white/5 flex items-center justify-center">
                <Award className="size-3 text-warning" />
              </div>
            </div>

            {/* Streak circle card */}
            <div className="relative rounded-2xl bg-white/5 border border-white/5 p-4 flex flex-col items-center gap-3 overflow-hidden">
              <div className="absolute inset-x-0 -top-8 h-20 rounded-full bg-primary/20 blur-2xl" />
              <span className="text-[9px] font-semibold tracking-[0.15em] text-white/40 uppercase">Foco Contínuo</span>
              <div className="relative flex items-center justify-center">
                {/* Circular progress SVG */}
                <svg width="88" height="88" viewBox="0 0 88 88">
                  <circle cx="44" cy="44" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                  <circle
                    cx="44"
                    cy="44"
                    r="38"
                    fill="none"
                    stroke="oklch(0.68 0.13 165)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 38}`}
                    strokeDashoffset={`${2 * Math.PI * 38 * (1 - 0.72)}`}
                    transform="rotate(-90 44 44)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white tabular-nums">37</span>
                  <span className="text-[9px] text-white/40 uppercase tracking-wider">dias</span>
                  <span className="mt-1 text-[8px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    14:22:09
                  </span>
                </div>
              </div>
              <div className="w-full space-y-1">
                <div className="flex justify-between text-[9px]">
                  <span className="text-white/40">Rumo a 60 dias</span>
                  <span className="text-primary font-bold">62%</span>
                </div>
                <div className="h-1 w-full rounded-full bg-white/5">
                  <div className="h-full w-[62%] rounded-full bg-primary" />
                </div>
              </div>
            </div>

            {/* SOS button */}
            <div className="rounded-xl bg-destructive/80 flex items-center justify-center gap-1.5 py-2.5">
              <LifeBuoy className="size-3 text-white" />
              <span className="text-[10px] font-bold text-white">SOS · Momento de crise</span>
            </div>

            {/* Action row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center gap-1 py-2.5">
                <CheckCircle2 className="size-3 text-primary" />
                <span className="text-[9px] font-semibold text-primary">Dia concluído</span>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/5 flex items-center justify-center gap-1 py-2.5">
                <RotateCcw className="size-3 text-white/40" />
                <span className="text-[9px] font-medium text-white/40">Recaída</span>
              </div>
            </div>

            {/* Week calendar */}
            <div className="rounded-xl bg-white/5 border border-white/5 p-3">
              <span className="text-[9px] font-semibold tracking-widest text-white/30 uppercase">Esta semana</span>
              <div className="mt-2 flex gap-1 justify-between">
                {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-[7px] text-white/30">{d}</span>
                    <div
                      className={`size-5 rounded-full flex items-center justify-center text-[7px] font-bold ${
                        i < 5
                          ? "bg-primary/20 text-primary"
                          : i === 5
                          ? "bg-white/10 text-white/50 ring-1 ring-white/10"
                          : "bg-white/5 text-white/20"
                      }`}
                    >
                      {i < 5 ? "✓" : i === 5 ? "•" : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Glow behind phone */}
      <div className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-primary/10 blur-3xl" />
    </div>
  )
}

/* ─────────────────────────────────────────────
   Feature card
───────────────────────────────────────────── */
function FeatureCard({
  icon: Icon,
  color,
  title,
  desc,
}: {
  icon: React.ElementType
  color: string
  title: string
  desc: string
}) {
  return (
    <div className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
      <div className={`mb-4 flex size-11 items-center justify-center rounded-xl ${color}`}>
        <Icon className="size-5" />
      </div>
      <h3 className="mb-2 text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Stat badge
───────────────────────────────────────────── */
function StatBadge({
  value,
  label,
  suffix,
}: {
  value: number
  label: string
  suffix?: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center px-6">
      <span className="text-4xl md:text-5xl font-bold text-foreground tabular-nums">
        <AnimatedNumber target={value} suffix={suffix} />
      </span>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main Landing Page
───────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 selection:text-primary overflow-x-hidden">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto max-w-5xl px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/streakly-assets/logo-color.png"
              alt="Streakly"
              className="h-8 w-auto object-contain"
            />
            <span className="text-base font-bold tracking-tight text-foreground">Streakly</span>
          </div>
          <nav className="flex items-center gap-3">
            <a
              href="#features"
              className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Recursos
            </a>
            <a
              href="#faq"
              className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </a>
            <Link href="/app">
              <Button size="sm" className="rounded-full px-5 font-semibold shadow-md shadow-primary/20">
                Começar grátis
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center">

        {/* ── Hero ── */}
        <section className="relative w-full overflow-hidden pt-20 pb-12 md:pt-32 md:pb-20">
          {/* Background glows */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-[100%] bg-primary/8 blur-[120px]" />
            <div className="absolute right-0 bottom-0 h-[300px] w-[400px] bg-blue-500/5 blur-[100px]" />
            <div className="absolute left-0 top-1/2 h-[200px] w-[300px] bg-emerald-500/5 blur-[80px]" />
          </div>

          <div className="container mx-auto max-w-5xl px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-12">

              {/* Left: text */}
              <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 mb-8">
                  <Sparkles className="size-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">Rastreamento sem julgamentos</span>
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05] mb-6">
                  Retome{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-primary">o controle.</span>
                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-1 h-3 rounded-full bg-primary/15 -z-0"
                    />
                  </span>
                  <br />
                  <span className="text-muted-foreground font-bold">Um dia de cada vez.</span>
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg">
                  Sem culpa, só aprendizado. Rastreie sua sequência de dias limpos, entenda seus gatilhos e construa sua melhor versão — no seu ritmo.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Link href="/app">
                    <Button
                      size="lg"
                      className="h-13 w-full sm:w-auto px-8 rounded-full text-base font-bold gap-2 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Começar agora — é grátis
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                  <a href="#features">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="h-13 w-full sm:w-auto px-6 rounded-full text-base font-medium text-muted-foreground hover:text-foreground"
                    >
                      Ver como funciona
                    </Button>
                  </a>
                </div>

                {/* Trust signals */}
                <div className="mt-8 flex items-center gap-5 flex-wrap justify-center lg:justify-start">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="size-3" />
                    100% privado
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Wifi className="size-3" />
                    Funciona offline
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Heart className="size-3 text-destructive" />
                    Sem anúncios
                  </div>
                </div>
              </div>

              {/* Right: phone mockup */}
              <div className="flex-shrink-0 flex items-center justify-center w-full lg:w-auto">
                <MockAppPreview />
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats strip ── */}
        <section className="w-full py-16 border-y border-white/5 bg-white/[0.015]">
          <div className="container mx-auto max-w-4xl px-6">
            <div className="flex flex-wrap justify-center gap-y-10 divide-x divide-white/5">
              <StatBadge value={0} label="Dados coletados sobre você" />
              <StatBadge value={0} label="Cadastros necessários" />
              <StatBadge value={0} label="Anúncios no app" />
              <StatBadge value={0} label="Custo para usar" suffix=" reais" />
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="w-full py-24">
          <div className="container mx-auto max-w-5xl px-6">
            {/* Section header */}
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 mb-4">
                <TrendingUp className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground">Tudo que você precisa</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ferramentas que realmente ajudam
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
                O Streakly foi criado com foco na experiência emocional — não só nos números. Cada recurso existe para te apoiar nos momentos que mais importam.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FeatureCard
                icon={Flame}
                color="bg-primary/10 text-primary"
                title="Sequência em tempo real"
                desc="Acompanhe seus dias, horas, minutos e segundos de progresso em tempo real com um visual circular motivador."
              />
              <FeatureCard
                icon={LifeBuoy}
                color="bg-destructive/10 text-destructive"
                title="Modo SOS"
                desc="Quando a vontade bate, acione o SOS. Você vai respirar, reler sua carta de emergência e superar o impulso."
              />
              <FeatureCard
                icon={ShieldCheck}
                color="bg-emerald-500/10 text-emerald-400"
                title="Recomeço sem culpa"
                desc="Uma recaída não é o fim. O Streakly registra o aprendizado, preserva seu recorde e te ajuda a recomeçar mais forte."
              />
              <FeatureCard
                icon={LineChart}
                color="bg-blue-500/10 text-blue-400"
                title="Análise de gatilhos"
                desc="Identifique os padrões por trás das crises. Tédio? Estresse? Solidão? Saiba onde você mais tropeça e se previna."
              />
              <FeatureCard
                icon={Heart}
                color="bg-pink-500/10 text-pink-400"
                title="Carta ao futuro eu"
                desc="Escreva uma mensagem de motivação para ler nos momentos de fraqueza. Suas próprias palavras têm mais poder do que qualquer conselho."
              />
              <FeatureCard
                icon={CalendarCheck}
                color="bg-amber-500/10 text-amber-400"
                title="Calendário semanal"
                desc="Visualize cada dia da semana: limpo, crise superada ou recaída. Ver o padrão visual é mais honesto do que qualquer planilha."
              />
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="w-full py-24 border-t border-white/5 bg-white/[0.015]">
          <div className="container mx-auto max-w-4xl px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Simples de usar. Poderoso de verdade.
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Você começa em menos de 30 segundos. Sem cadastro. Sem e-mail. Sem desculpas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  icon: Target,
                  title: "Defina seu hábito",
                  desc: "Diga ao Streakly o que você está trabalhando para superar. É só você que sabe.",
                  color: "text-primary border-primary/20 bg-primary/5",
                },
                {
                  step: "02",
                  icon: CalendarCheck,
                  title: "Faça check-in diário",
                  desc: "Um toque por dia para confirmar que você se manteve firme. Cada dia conta.",
                  color: "text-blue-400 border-blue-500/20 bg-blue-500/5",
                },
                {
                  step: "03",
                  icon: TrendingUp,
                  title: "Evolua e entenda",
                  desc: "Acompanhe sua sequência crescer e entenda seus gatilhos para chegar ao próximo nível.",
                  color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
                },
              ].map(({ step, icon: Icon, title, desc, color }) => (
                <div key={step} className="relative flex flex-col gap-4 p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <div className={`inline-flex items-center justify-center size-12 rounded-xl border ${color}`}>
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold tracking-widest text-muted-foreground/40 uppercase mb-1">
                      Passo {step}
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="w-full py-24 border-t border-white/5">
          <div className="container mx-auto max-w-5xl px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Histórias que a gente imagina
              </h2>
              <p className="text-muted-foreground">
                O app é novo. Ainda não temos depoimentos reais — mas estas histórias são o tipo de jornada que queremos apoiar.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  name: "Lucas M.",
                  days: "127 dias",
                  text: "\"O modo SOS me salvou umas três vezes já. Quando a vontade vem forte, eu respiro pelo app e releio minha carta. Funciona.\"",
                  color: "bg-primary/5 border-primary/10",
                },
                {
                  name: "Ana R.",
                  days: "64 dias",
                  text: "\"Nunca pensei que conseguiria passar de 30 dias. O calendário semanal me motiva demais — não quero quebrar a sequência.\"",
                  color: "bg-blue-500/5 border-blue-500/10",
                },
                {
                  name: "Pedro K.",
                  days: "203 dias",
                  text: "\"Recaí duas vezes. O Streakly não me fez sentir culpado — me ajudou a entender por que aconteceu. Isso mudou tudo.\"",
                  color: "bg-emerald-500/5 border-emerald-500/10",
                },
              ].map(({ name, days, text, color }) => (
                <div
                  key={name}
                  className={`flex flex-col gap-4 rounded-2xl border p-6 ${color}`}
                >
                  <p className="text-sm text-foreground/80 leading-relaxed flex-1">{text}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-foreground/60">
                        {name[0]}
                      </div>
                      <span className="text-sm font-semibold text-foreground">{name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      <Flame className="size-3" />
                      {days}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="w-full py-24 border-t border-white/5 bg-white/[0.015]">
          <div className="container mx-auto max-w-2xl px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Perguntas frequentes
              </h2>
            </div>

            <div className="divide-y divide-white/5 border-t border-white/5">
              <FaqItem
                question="Meus dados ficam seguros?"
                answer="Sim. O Streakly salva tudo diretamente no seu navegador (localStorage) — nada vai para nenhum servidor. Seus dados são 100% seus, e ficam apenas no seu dispositivo."
              />
              <FaqItem
                question="Funciona sem internet?"
                answer="Funciona bem pelo navegador mesmo offline, desde que você já tenha acessado antes. Não precisa de conexão para registrar check-ins, abrir o SOS ou ver seu histórico."
              />
              <FaqItem
                question="O que acontece se eu tiver uma recaída?"
                answer="Nada dramático. O Streakly registra a recaída, preserva seu recorde histórico e te pede para refletir sobre o gatilho. Cair faz parte do processo — o que importa é o que você aprende."
              />
              <FaqItem
                question="Preciso criar uma conta?"
                answer="Não. O Streakly não requer cadastro, e-mail ou senha. Basta abrir o app e começar. Simples assim."
              />
              <FaqItem
                question="O app custa alguma coisa?"
                answer="Não, é gratuito. Não tem plano pago, não tem anúncio, não tem nada escondido. É um projeto pessoal feito pra ajudar."
              />
              <FaqItem
                question="Posso usar para qualquer hábito?"
                answer="O app foi feito pensando em sobriedade e controle de impulsos, mas a lógica funciona para qualquer coisa que você queira parar de fazer ou construir consistência."
              />
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="w-full py-24 border-t border-white/5 relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-primary/10 blur-[100px] -z-10" />

          <div className="container mx-auto max-w-3xl px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 mb-8">
              <Sparkles className="size-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">Comece hoje mesmo</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight">
              Sua jornada começa{" "}
              <span className="text-primary">agora.</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
              Cada grande sequência começa com um único dia. Hoje pode ser o seu primeiro.
            </p>

            <Link href="/app">
              <Button
                size="lg"
                className="h-14 px-10 rounded-full text-lg font-bold gap-2.5 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                Começar agora — é gratuito
                <ArrowRight className="size-5" />
              </Button>
            </Link>

            <p className="mt-5 text-xs text-muted-foreground/50">
              Sem cadastro. Sem cartão. Funciona no celular e no computador.
            </p>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full border-t border-white/5 bg-background">
        {/* Top section */}
        <div className="container mx-auto max-w-5xl px-6 py-14">
          <div className="flex flex-col md:flex-row gap-12 md:gap-8 justify-between">

            {/* Brand column */}
            <div className="flex flex-col gap-4 max-w-xs">
              <div className="flex items-center gap-2">
                <img
                  src="/streakly-assets/logo-color.png"
                  alt="Streakly"
                  className="h-8 w-auto object-contain"
                />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Um contador de dias limpos discreto e honesto. Feito para apoiar, não para julgar.
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs text-muted-foreground/60">Dados salvos só no seu dispositivo</span>
              </div>
            </div>

            {/* Links columns */}
            <div className="flex flex-wrap gap-12">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold tracking-widest text-muted-foreground/40 uppercase">App</span>
                <nav className="flex flex-col gap-2.5">
                  <Link href="/app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Abrir o app</Link>
                  <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Recursos</a>
                  <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
                </nav>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold tracking-widest text-muted-foreground/40 uppercase">Projeto</span>
                <nav className="flex flex-col gap-2.5">
                  <a
                    href="https://github.com/EduBraga7/Streakly"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    GitHub
                  </a>
                  <span className="text-sm text-muted-foreground/40 cursor-default">Em desenvolvimento</span>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5">
          <div className="container mx-auto max-w-5xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground/30">
              © {new Date().getFullYear()} Streakly. Feito com cuidado para quem escolhe crescer.
            </p>
            <Link href="/app">
              <Button
                size="sm"
                className="rounded-full px-5 text-xs font-semibold shadow-md shadow-primary/20 h-8"
              >
                Começar agora
                <ArrowRight className="size-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
