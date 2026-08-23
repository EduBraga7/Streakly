"use client"

import * as React from "react"
import { CheckSquare, Plus, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface QuickHideScreenProps {
  onRestore: () => void
}

interface NoteItem {
  id: string
  text: string
  completed: boolean
}

const DEFAULT_NOTES: NoteItem[] = [
  { id: "1", text: "Revisar relatório trimestral de métricas", completed: true },
  { id: "2", text: "Comprar suprimentos e café para o escritório", completed: false },
  { id: "3", text: "Alinhar prazos da reunião de quinta-feira", completed: false },
  { id: "4", text: "Organizar pastas de backup no Google Drive", completed: true },
  { id: "5", text: "Agendar revisão do carro para o fim de semana", completed: false },
]

export function QuickHideScreen({ onRestore }: QuickHideScreenProps) {
  const [notes, setNotes] = React.useState<NoteItem[]>(DEFAULT_NOTES)
  const [newNote, setNewNote] = React.useState("")

  // Listen for Escape key to restore
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onRestore()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onRestore])

  const toggleNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n))
    )
  }

  const addNote = () => {
    if (!newNote.trim()) return
    setNotes((prev) => [
      ...prev,
      { id: String(Date.now()), text: newNote.trim(), completed: false },
    ])
    setNewNote("")
  }

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-neutral-200 font-sans p-6 flex flex-col items-center">
      <div className="w-full max-w-lg flex flex-col gap-6">
        
        {/* Header (looks like a normal Productivity Notes app) */}
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400">
              <CheckSquare className="size-4" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-neutral-100">Notas & Tarefas</h1>
              <p className="text-xs text-neutral-400">Produtividade Diária</p>
            </div>
          </div>

          {/* Discreet restore button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRestore}
            className="text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 rounded-xl gap-1.5 h-8 px-2.5"
            title="Voltar ao Streakly (ou pressione Esc)"
          >
            <Eye className="size-3.5" />
            <span>Voltar</span>
          </Button>
        </header>

        {/* Input box */}
        <div className="flex gap-2">
          <Input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addNote()
            }}
            placeholder="Adicionar nova tarefa..."
            className="h-10 text-sm bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-400 rounded-xl"
          />
          <Button
            onClick={addNote}
            size="sm"
            className="h-10 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100"
          >
            <Plus className="size-4" />
          </Button>
        </div>

        {/* Task List */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
            Tarefas Pendentes ({notes.filter((n) => !n.completed).length})
          </span>

          <div className="flex flex-col gap-1.5">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => toggleNote(note.id)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  note.completed
                    ? "bg-neutral-900/40 border-neutral-800/60 text-neutral-400 line-through"
                    : "bg-neutral-900 border-neutral-800 text-neutral-200 hover:border-neutral-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`size-4 rounded border flex items-center justify-center transition-colors ${
                      note.completed
                        ? "bg-neutral-700 border-neutral-600 text-neutral-200"
                        : "border-neutral-600"
                    }`}
                  >
                    {note.completed && <span className="text-[10px] font-bold">✓</span>}
                  </div>
                  <span className="text-sm">{note.text}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNote(note.id)
                  }}
                  className="text-neutral-400 hover:text-rose-400 transition-colors p-1"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Discreet hint at the bottom */}
        <footer className="mt-8 pt-4 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Pressione <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono text-[10px]">Esc</kbd> ou toque em Voltar</span>
          <span>Workspace · V1.4</span>
        </footer>

      </div>
    </div>
  )
}
