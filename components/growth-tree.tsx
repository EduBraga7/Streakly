"use client"

import * as React from "react"
import { Sparkles, Sprout, Trees, Leaf, Heart } from "lucide-react"
import { useTracker, useNow } from "@/components/tracker-provider"
import { getElapsed } from "@/lib/tracker/utils"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StageConfig {
  stage: number
  name: string
  subtitle: string
  minDays: number
  maxDays: number
  nextDays: number | null
}

const STAGES: StageConfig[] = [
  {
    stage: 1,
    name: "Semente & Raízes",
    subtitle: "A decisão foi plantada no solo fértil da sua força de vontade.",
    minDays: 0,
    maxDays: 3,
    nextDays: 4,
  },
  {
    stage: 2,
    name: "Broto de Esperança",
    subtitle: "Primeiras folhas rompem a superfície em direção à luz.",
    minDays: 4,
    maxDays: 14,
    nextDays: 15,
  },
  {
    stage: 3,
    name: "Arbusto Resiliente",
    subtitle: "Galhos flexíveis que resistem aos ventos da tentação.",
    minDays: 15,
    maxDays: 30,
    nextDays: 31,
  },
  {
    stage: 4,
    name: "Árvore em Flor",
    subtitle: "Copa verdejante e florescendo com clareza e paz mental.",
    minDays: 31,
    maxDays: 89,
    nextDays: 90,
  },
  {
    stage: 5,
    name: "Árvore Centenária",
    subtitle: "Raízes inabaláveis e frutos dourados de uma nova vida construída.",
    minDays: 90,
    maxDays: Infinity,
    nextDays: null,
  },
]

export function GrowthTree() {
  const { state } = useTracker()
  const liveNow = useNow(60_000)
  const now = liveNow ?? new Date(state.streakStart).getTime()
  const elapsed = getElapsed(state.streakStart, now)
  const days = elapsed.days

  const currentStage =
    STAGES.find((s) => days >= s.minDays && days <= s.maxDays) ?? STAGES[0]

  const daysToNext = currentStage.nextDays ? currentStage.nextDays - days : 0

  return (
    <Card className="border-border/60 bg-gradient-to-b from-card/80 to-card/40 overflow-hidden relative shadow-sm">
      {/* Background radial ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-20 h-48 bg-emerald-500/10 blur-3xl rounded-full"
      />

      <CardContent className="p-5 flex flex-col items-center text-center gap-4">
        {/* Stage Header */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Sprout className="size-4 text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Jardim da Evolução
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            Estágio {currentStage.stage} de 5
          </span>
        </div>

        {/* Tree SVG Graphic */}
        <div className="relative size-44 my-1 flex items-center justify-center">
          {/* Ground soil curve */}
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full drop-shadow-md select-none"
          >
            {/* Defs / Gradients */}
            <defs>
              <linearGradient id="soilGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2e1065" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#2e1065" stopOpacity="0.3" />
              </linearGradient>
              <radialGradient id="auraGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="trunkGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#582f0e" />
                <stop offset="100%" stopColor="#7f4f24" />
              </linearGradient>
              <linearGradient id="leafGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            {/* Aura Glow */}
            <circle cx="100" cy="110" r="75" fill="url(#auraGrad)" />

            {/* Ground Arc */}
            <path
              d="M 20 165 Q 100 155 180 165"
              fill="none"
              stroke="url(#soilGrad)"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* ── STAGE 1: Seed & Small Root (0-3d) ── */}
            {currentStage.stage === 1 && (
              <g className="animate-in fade-in zoom-in-75 duration-700">
                {/* Underground Roots */}
                <path
                  d="M 100 162 Q 95 175 88 185 M 100 162 Q 105 178 112 186"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="2 2"
                  className="opacity-70"
                />
                {/* Seed body */}
                <ellipse cx="100" cy="158" rx="8" ry="11" fill="#7f4f24" transform="rotate(-15 100 158)" />
                <ellipse cx="100" cy="158" rx="7" ry="10" fill="#936639" transform="rotate(-15 100 158)" />
                {/* Tiny green sprout tip */}
                <path
                  d="M 98 149 Q 100 138 106 132 Q 102 144 98 149"
                  fill="#34d399"
                />
                <circle cx="106" cy="132" r="2.5" fill="#6ee7b7" className="animate-pulse" />
              </g>
            )}

            {/* ── STAGE 2: Sprout (4-14d) ── */}
            {currentStage.stage === 2 && (
              <g className="animate-in fade-in zoom-in-75 duration-700">
                {/* Roots */}
                <path
                  d="M 100 160 Q 85 175 75 188 M 100 160 Q 115 175 125 188 M 100 160 V 190"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="opacity-60"
                />
                {/* Green Stem */}
                <path
                  d="M 100 160 Q 98 130 100 105"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                {/* Left Leaf */}
                <path
                  d="M 99 125 C 75 120 70 100 98 110 C 98 118 99 125 99 125"
                  fill="url(#leafGrad)"
                />
                {/* Right Leaf */}
                <path
                  d="M 101 115 C 125 110 130 90 102 100 C 102 108 101 115 101 115"
                  fill="url(#leafGrad)"
                />
                {/* Glowing Dewdrop */}
                <circle cx="78" cy="106" r="2.5" fill="#93c5fd" className="animate-pulse" />
              </g>
            )}

            {/* ── STAGE 3: Sapling / Young Tree (15-30d) ── */}
            {currentStage.stage === 3 && (
              <g className="animate-in fade-in zoom-in-75 duration-700">
                {/* Trunk */}
                <path
                  d="M 95 160 C 97 130 96 110 100 90 C 104 110 103 130 105 160 Z"
                  fill="url(#trunkGrad)"
                />
                {/* Branches */}
                <path
                  d="M 98 115 Q 75 100 68 85 M 102 105 Q 125 92 132 80"
                  fill="none"
                  stroke="#7f4f24"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Leaf Clusters */}
                <ellipse cx="68" cy="82" rx="16" ry="12" fill="url(#leafGrad)" />
                <ellipse cx="132" cy="78" rx="18" ry="13" fill="url(#leafGrad)" />
                <ellipse cx="100" cy="72" rx="22" ry="16" fill="url(#leafGrad)" />
              </g>
            )}

            {/* ── STAGE 4: Flourishing Tree (31-89d) ── */}
            {currentStage.stage === 4 && (
              <g className="animate-in fade-in zoom-in-75 duration-700">
                {/* Thick Trunk with root flare */}
                <path
                  d="M 92 160 C 95 125 96 95 100 80 C 104 95 105 125 108 160 C 102 158 98 158 92 160 Z"
                  fill="url(#trunkGrad)"
                />
                {/* Broad Canopy */}
                <circle cx="100" cy="65" r="32" fill="url(#leafGrad)" />
                <circle cx="75" cy="78" r="24" fill="#059669" />
                <circle cx="125" cy="78" r="24" fill="#10b981" />
                <circle cx="100" cy="50" r="22" fill="#34d399" />
                {/* Subtle Flowers */}
                <circle cx="72" cy="70" r="3" fill="#f43f5e" className="animate-pulse" />
                <circle cx="128" cy="72" r="3" fill="#fb7185" className="animate-pulse" />
                <circle cx="95" cy="45" r="3.5" fill="#fda4af" className="animate-pulse" />
                <circle cx="108" cy="60" r="3" fill="#f43f5e" className="animate-pulse" />
              </g>
            )}

            {/* ── STAGE 5: Ancient Sacred Tree (90+ days) ── */}
            {currentStage.stage === 5 && (
              <g className="animate-in fade-in zoom-in-75 duration-700">
                {/* Golden Crown Aura */}
                <circle cx="100" cy="65" r="48" fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3 3" className="animate-pulse" opacity="0.6" />
                {/* Mighty Trunk */}
                <path
                  d="M 88 160 C 93 120 94 85 100 70 C 106 85 107 120 112 160 C 105 156 95 156 88 160 Z"
                  fill="url(#trunkGrad)"
                />
                {/* Deep Roots */}
                <path
                  d="M 88 160 Q 70 172 55 185 M 112 160 Q 130 172 145 185 M 100 160 V 188"
                  fill="none"
                  stroke="#7f4f24"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Magnificent Dense Foliage */}
                <circle cx="100" cy="60" r="38" fill="url(#leafGrad)" />
                <circle cx="68" cy="75" r="28" fill="#047857" />
                <circle cx="132" cy="75" r="28" fill="#10b981" />
                <circle cx="100" cy="40" r="26" fill="#34d399" />
                {/* Golden Fruits */}
                <circle cx="68" cy="68" r="4" fill="url(#goldGrad)" className="animate-pulse" />
                <circle cx="132" cy="68" r="4" fill="url(#goldGrad)" className="animate-pulse" />
                <circle cx="95" cy="38" r="4" fill="url(#goldGrad)" className="animate-pulse" />
                <circle cx="112" cy="55" r="4.5" fill="url(#goldGrad)" className="animate-pulse" />
                <circle cx="82" cy="88" r="3.5" fill="url(#goldGrad)" className="animate-pulse" />
              </g>
            )}
          </svg>
        </div>

        {/* Stage Description & Progress */}
        <div className="flex flex-col items-center gap-1 max-w-xs">
          <h3 className="text-sm font-black text-foreground">
            {currentStage.name}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {currentStage.subtitle}
          </p>

          {daysToNext > 0 ? (
            <span className="text-[11px] font-semibold text-emerald-500 mt-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              🌱 Faltam {daysToNext} {daysToNext === 1 ? "dia" : "dias"} para o próximo estágio
            </span>
          ) : (
            <span className="text-[11px] font-bold text-yellow-500 mt-2 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20 flex items-center gap-1">
              <Sparkles className="size-3.5" /> Árvore em maturação máxima!
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
