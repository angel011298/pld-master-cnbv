"use client"

import * as React from "react"
import {
  Mic, MicOff, Send, MessageSquarePlus, ChevronDown, ChevronUp,
  CheckCircle2, Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────────────────────
// SugerenciasPanel — collapsible section embedded in the sidebar
// Lets users type or dictate a voice note (Web Speech API, auto-transcribed).
// Submits to POST /api/suggestions.
// ─────────────────────────────────────────────────────────────────────────────

export function SugerenciasPanel() {
  const [isOpen, setIsOpen]           = React.useState(false)
  const [text, setText]               = React.useState("")
  const [sending, setSending]         = React.useState(false)
  const [sent, setSent]               = React.useState(false)
  const [error, setError]             = React.useState<string | null>(null)
  const [isRecording, setIsRecording] = React.useState(false)
  const [liveTranscript, setLiveTranscript] = React.useState("")
  const [inputType, setInputType]     = React.useState<"text" | "voice">("text")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = React.useRef<any>(null)

  // ── Voice recording (Web Speech API — Chrome/Edge) ─────────────────────────
  const startRecording = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!SR) {
      setError("Tu navegador no soporta dictado. Usa Chrome o Edge.")
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new SR()
    recognition.lang = "es-MX"
    recognition.continuous = true
    recognition.interimResults = true

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      let interim = ""
      let final = ""
      for (let i = 0; i < e.results.length; i++) {
        const result = e.results[i]
        if (result.isFinal) {
          final += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }
      const combined = (final + interim).trim()
      setLiveTranscript(combined)
      setText(combined)
    }

    recognition.onerror = () => {
      setIsRecording(false)
      setError("Error de micrófono. Verifica los permisos del navegador.")
    }

    recognition.onend = () => setIsRecording(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
    setLiveTranscript("")
    setInputType("voice")
    setError(null)
  }

  const stopRecording = () => {
    recognitionRef.current?.stop()
    setIsRecording(false)
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const content = text.trim()
    if (!content) return
    if (isRecording) stopRecording()

    setSending(true)
    setError(null)

    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content, type: inputType }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Error al enviar")
      }

      setSent(true)
      setText("")
      setLiveTranscript("")
      setInputType("text")
      setTimeout(() => setSent(false), 4000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo enviar.")
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  // ── Panel toggle: also stop recording if closing ───────────────────────────
  const toggleOpen = () => {
    if (isOpen && isRecording) stopRecording()
    setIsOpen((v) => !v)
  }

  return (
    /* Hidden when sidebar is collapsed to icon-only mode */
    <div className="group-data-[collapsible=icon]:hidden border-t border-neutral-100 mt-1">
      {/* Header toggle */}
      <button
        onClick={toggleOpen}
        className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 transition-colors rounded-lg"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <MessageSquarePlus className="h-3.5 w-3.5 shrink-0" />
          Dudas y Sugerencias
        </span>
        {isOpen
          ? <ChevronUp className="h-3 w-3 shrink-0" />
          : <ChevronDown className="h-3 w-3 shrink-0" />}
      </button>

      {isOpen && (
        <div className="px-3 pb-3 space-y-2">
          {sent ? (
            /* Success state */
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              <p className="text-xs font-bold text-emerald-600">
                ¡Recibido! Gracias por tu mensaje.
              </p>
              <p className="text-[10px] text-neutral-400">
                El equipo lo revisará pronto.
              </p>
            </div>
          ) : (
            <>
              {/* Live transcript indicator */}
              {isRecording && (
                <div className="rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-2 space-y-1">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                    Grabando…
                  </p>
                  {liveTranscript && (
                    <p className="text-xs text-indigo-700 italic leading-snug line-clamp-3">
                      "{liveTranscript}"
                    </p>
                  )}
                </div>
              )}

              {/* Text area */}
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  if (!isRecording) setInputType("text")
                }}
                onKeyDown={handleKeyDown}
                placeholder={
                  isRecording
                    ? "Habla… el texto aparecerá aquí automáticamente"
                    : "Escribe tu duda o sugerencia… (Ctrl+Enter para enviar)"
                }
                rows={3}
                readOnly={isRecording}
                className={cn(
                  "w-full text-xs rounded-xl border-2 px-3 py-2 resize-none transition-colors",
                  "text-neutral-700 placeholder:text-neutral-400 bg-neutral-50",
                  "focus:outline-none focus:border-indigo-400",
                  isRecording
                    ? "border-indigo-300 bg-indigo-50/40 cursor-default"
                    : "border-neutral-200"
                )}
              />

              {/* Error */}
              {error && (
                <p className="text-[10px] text-red-500 font-medium">{error}</p>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                {/* Voice / Stop button */}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  title={isRecording ? "Detener grabación" : "Dictar con micrófono"}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl border-2 py-1.5 px-3",
                    "text-xs font-bold transition-all min-h-[36px]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
                    isRecording
                      ? "border-red-400 bg-red-50 text-red-600 animate-pulse"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-indigo-400 hover:text-indigo-600"
                  )}
                >
                  {isRecording
                    ? <MicOff className="h-3 w-3 shrink-0" />
                    : <Mic className="h-3 w-3 shrink-0" />}
                  <span className="hidden sm:inline">{isRecording ? "Stop" : "Voz"}</span>
                </button>

                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={!text.trim() || sending}
                  title="Enviar (Ctrl+Enter)"
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 rounded-xl py-1.5",
                    "text-xs font-bold text-white transition-colors min-h-[36px]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "bg-indigo-600 hover:bg-indigo-700"
                  )}
                >
                  {sending
                    ? <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                    : <Send className="h-3 w-3 shrink-0" />}
                  {sending ? "Enviando…" : "Enviar"}
                </button>
              </div>

              {/* Type indicator */}
              {inputType === "voice" && text && (
                <p className="text-[10px] text-indigo-500 font-medium">
                  🎙️ Nota de voz — se enviará como transcripción
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
