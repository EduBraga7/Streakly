export interface KnowledgePill {
  id: string
  title: string
  subtitle: string
  category: "dopamine" | "urgency" | "mindset" | "habits" | "relapse"
  categoryLabel: string
  readTimeMinutes: number
  icon: string
  quote: string
  explanation: string
  actionStep: string
}

export const KNOWLEDGE_PILLS: KnowledgePill[] = [
  {
    id: "urge-surfing",
    title: "A Onda da Fissura (Urge Surfing)",
    subtitle: "A vontade não cresce para sempre — ela atinge um pico e passa.",
    category: "urgency",
    categoryLabel: "Fissura & Controle",
    readTimeMinutes: 1,
    icon: "🌊",
    quote: "Você não precisa lutar contra a onda. Você só precisa surfá-la por 15 minutos.",
    explanation:
      "Neurocientistas comprovaram que um pico de fissura biológica dura em média de 10 a 20 minutos. Quando você resiste aos primeiros impulsos sem alimentá-los mentalmente, os receptores cerebrais diminuem o alerta e a intensidade da vontade cai drasticamente.",
    actionStep: "Quando a vontade surgir, acione o cronômetro SOS de 15 minutos e pratique respiração lenta até o pico diminuir.",
  },
  {
    id: "dopamine-reset",
    title: "A Linha de Base da Dopamina",
    subtitle: "Por que os primeiros 14 dias parecem tão difíceis e sem graça.",
    category: "dopamine",
    categoryLabel: "Neurociência & Dopamina",
    readTimeMinutes: 2,
    icon: "🧠",
    quote: "A calmaria de hoje é o seu cérebro reajustando os receptores para voltar a sentir prazer natural.",
    explanation:
      "Hábitos compulsivos inundam o cérebro com picos artificiais de dopamina. Para se proteger, o cérebro desativa receptores (down-regulation). Quando você para, sente um 'vazio' temporário. Entre 14 e 30 dias, seus receptores começam a se regenerar, devolvendo a clareza e alegria em pequenas coisas.",
    actionStep: "Entenda o desânimo inicial não como tristeza, mas como a cura e desintoxicação ativa dos seus receptores neurais.",
  },
  {
    id: "all-or-nothing",
    title: "A Armadilha do 'Tudo ou Nada'",
    subtitle: "Um deslize não apaga o aprendizado nem a biologia que você reconstruiu.",
    category: "mindset",
    categoryLabel: "Terapia Cognitiva (TCC)",
    readTimeMinutes: 1,
    icon: "🛡️",
    quote: "Se você tropeçar em um degrau, você não se joga da escada inteira.",
    explanation:
      "O 'Efeito de Violação da Abstinência' é quando a pessoa pensa: 'Já que falhei, vou exagerar o resto do dia'. A neurociência mostra que 30 dias limpos criaram conexões neurais reais que continuam lá. Levante-se imediatamente e retome o foco no mesmo instante.",
    actionStep: "Se houver qualquer tropeço, registre a reflexão com honestidade e recomece imediatamente sem culpa paralisante.",
  },
  {
    id: "two-minute-substitute",
    title: "A Regra da Substituição Rápida",
    subtitle: "É impossível apenas 'parar' um hábito — você precisa substituí-lo.",
    category: "habits",
    categoryLabel: "Ciência de Hábitos",
    readTimeMinutes: 1,
    icon: "⚡",
    quote: "A melhor maneira de eliminar um padrão ruim é preencher o espaço com uma resposta automática positiva.",
    explanation:
      "O cérebro funciona por circuitos de Estímulo -> Resposta -> Recompensa. Quando o gatilho acontecer (ex: tédio ou estresse), tenha uma ação âncora imediata preparada: beber água gelada, fazer flexões ou respirar 4-4-4.",
    actionStep: "Defina sua ação âncora favorita e execute-a nos primeiros 5 segundos em que o gatilho aparecer.",
  },
  {
    id: "friction-power",
    title: "Aumentando a Fricção do Vício",
    subtitle: "Dificulte o acesso ao comportamento destrutivo para salvar seu autocontrole.",
    category: "relapse",
    categoryLabel: "Prevenção de Recaída",
    readTimeMinutes: 2,
    icon: "🚪",
    quote: "Não confie apenas na força de vontade quando o cansaço chegar. Crie barreiras físicas.",
    explanation:
      "O córtex pré-frontal (responsável pela força de vontade) se cansa ao longo do dia. Ter que desbloquear PINs, deixar o celular longe da cama ou excluir atalhos cria segundos preciosos de hesitação, tempo suficiente para a racionalidade assumir o controle.",
    actionStep: "Ative o bloqueio por PIN no Streakly e coloque qualquer gatilho físico fora do seu alcance visual.",
  },
  {
    id: "identity-shift",
    title: "Mudança de Identidade: Quem Você É",
    subtitle: "A diferença entre 'estou tentando parar' e 'eu não sou mais essa pessoa'.",
    category: "mindset",
    categoryLabel: "Terapia Cognitiva (TCC)",
    readTimeMinutes: 1,
    icon: "✨",
    quote: "A verdadeira mudança de hábito é uma mudança de identidade.",
    explanation:
      "Pesquisas em psicologia mostram que dizer 'Eu não faço isso' tem 8x mais eficácia do que dizer 'Eu não posso fazer isso'. Quando você assume que é uma pessoa limpa, o comportamento se alinha naturalmente ao seu novo padrão pessoal.",
    actionStep: "Afirme para si mesmo com convicção: 'Eu sou livre e cuido do meu corpo e da minha mente com respeito'.",
  },
]

/**
 * Deterministically returns the knowledge pill of the day based on the calendar day
 */
export function getDailyPill(date: Date = new Date()): KnowledgePill {
  const startOfYear = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - startOfYear.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  const index = Math.abs(dayOfYear) % KNOWLEDGE_PILLS.length
  return KNOWLEDGE_PILLS[index]
}
