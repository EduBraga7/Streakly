"use client"

import * as React from "react"

const DISCREET_KEY = "streakly.discreet_mode"
const DISCREET_TITLE_KEY = "streakly.discreet_title"

const NEUTRAL_FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'/%3E%3C/svg%3E"
const DEFAULT_FAVICON = "/streakly-assets/favicon-32.png"

export function useDiscreetMode() {
  const [discreetMode, setDiscreetMode] = React.useState(false)
  const [discreetTitle, setDiscreetTitleState] = React.useState("Minhas Notas")

  // Load initial settings from localStorage on mount
  React.useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(DISCREET_KEY) === "true"
    const storedTitle = window.localStorage.getItem(DISCREET_TITLE_KEY) || "Minhas Notas"
    setDiscreetMode(stored)
    setDiscreetTitleState(storedTitle)
  }, [])

  // Apply document title and favicon dynamically
  React.useEffect(() => {
    if (typeof window === "undefined") return

    if (discreetMode) {
      document.title = discreetTitle
      updateFavicon(NEUTRAL_FAVICON)
    } else {
      document.title = "Streakly — Foco Diário"
      updateFavicon(DEFAULT_FAVICON)
    }
  }, [discreetMode, discreetTitle])

  const toggleDiscreetMode = React.useCallback(() => {
    setDiscreetMode((prev) => {
      const next = !prev
      window.localStorage.setItem(DISCREET_KEY, String(next))
      return next
    })
  }, [])

  const setDiscreetTitle = React.useCallback((title: string) => {
    setDiscreetTitleState(title)
    window.localStorage.setItem(DISCREET_TITLE_KEY, title)
  }, [])

  return {
    discreetMode,
    discreetTitle,
    toggleDiscreetMode,
    setDiscreetTitle,
  }
}

function updateFavicon(iconUrl: string) {
  const existingLinks = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']")
  if (existingLinks.length > 0) {
    existingLinks.forEach((link) => {
      link.href = iconUrl
    })
  } else {
    const newLink = document.createElement("link")
    newLink.rel = "icon"
    newLink.href = iconUrl
    document.head.appendChild(newLink)
  }
}
