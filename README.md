# Streakly

**Streakly** é um aplicativo web (PWA-ready em potencial) projetado para ajudar os usuários a rastrearem hábitos, sobriedade e o enfrentamento de impulsos e crises (streaks). 

## Stack Tecnológico
- **Framework:** Next.js 16+ (App Router)
- **UI/Estilização:** React 19, Tailwind CSS v4, Radix UI (via Shadcn UI), Lucide-React.
- **Gerenciamento de Estado:** Context API local (`TrackerProvider`).
- **Armazenamento:** `localStorage` (persistência local).
- **Cores:** Utiliza a escala de cor `oklch` tanto para os temas `light` quanto `dark`.

## Arquitetura de Domínio
O coração da aplicação está em `lib/tracker`.
- **`TrackerState`:** O estado principal. Mantém `streakStart` (início do progresso), `bestStreakDays` (recorde), `letterToSelf` (carta de motivação), `history` (status diário: 'clean', 'crisis', 'relapse') e `relapses` (histórico de recaídas com `trigger` e `reflection`).
- **Páginas e Componentes Principais:**
  - `app/page.tsx`: Envolve a aplicação em um `TrackerProvider` e carrega o `Dashboard`.
  - `components/dashboard.tsx`: A tela inicial com resumos e atalhos rápidos.
  - `components/streak-card.tsx`: Mostra o progresso atual.
  - `components/quick-actions.tsx`: Acesso a registrar crises, check-in, SOS, ou Recaída.
  - `components/sos-dialog.tsx`: Um fluxo modal com um círculo de respiração (`breathing-circle.tsx`) e a exibição da `letterToSelf` para evitar a quebra do streak.
  - `components/relapse-dialog.tsx`: Formulário para registrar se a pessoa recaiu e o motivo.
  - `components/week-calendar.tsx`: Calendário com o histórico da semana atual.
  - `components/stats-cards.tsx`: Cartões mostrando estatísticas como a maior ofensiva (best streak).

## Situação Atual
O projeto foi inicializado através da IA (v0) e possui a base estrutural e regras de negócio essenciais, mas precisa ser revisado, expandido e ter seu design lapidado para produção, principalmente focando em micro-interações, responsividade fluida e uma estética moderna ("premium design").
