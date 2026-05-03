"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Send, Bot, User, Loader2, Sparkles, FileText, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { buildAuthHeaders } from "@/lib/auth-client"
import type { ChatSource } from "@/types/chat"
import { Suspense } from "react"

interface Message {
  role: "user" | "assistant"
  content: string
  sources?: ChatSource[]
}

function SourceChips({ sources }: { sources: ChatSource[] }) {
  const [expandedIdx, setExpandedIdx] = React.useState<number | null>(null)

  if (!sources || sources.length === 0) return null

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {sources.map((s, i) => (
        <div key={i} className="text-xs">
          <button
            onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
            className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-full px-2.5 py-1 transition-colors font-medium"
          >
            <FileText className="h-3 w-3 shrink-0" />
            <span className="truncate max-w-[160px]">
              📄 {s.documento}{s.pagina ? ` p.${s.pagina}` : ""}
            </span>
            {expandedIdx === i
              ? <ChevronUp className="h-3 w-3 shrink-0" />
              : <ChevronDown className="h-3 w-3 shrink-0" />}
          </button>
          {expandedIdx === i && s.fragmento && (
            <div className="mt-1 ml-1 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-blue-800 max-w-xs italic">
              "{s.fragmento}"
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ChatbotInner() {
  const searchParams = useSearchParams()
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "assistant",
      content: "Hola, soy tu Tutor PLD-Master. ¿Qué concepto de la certificación CNBV te gustaría repasar hoy?",
    },
  ])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const hasAutoSent = React.useRef(false)

  // Pre-load from query param (e.g., from QuizCard "Explain" button)
  React.useEffect(() => {
    const preload = searchParams.get("q")
    if (preload && !hasAutoSent.current) {
      setInput(decodeURIComponent(preload))
      inputRef.current?.focus()
    }
  }, [searchParams])

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (overrideInput?: string) => {
    const text = (overrideInput ?? input).trim()
    if (!text || isLoading) return

    const userMsg: Message = { role: "user", content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    // Optimistic empty assistant bubble
    setMessages((prev) => [...prev, { role: "assistant", content: "" }])

    try {
      const headers = await buildAuthHeaders({ "Content-Type": "application/json" })
      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? "Fallo en la comunicación con la IA")
      }

      const data = await response.json() as { text: string; sources: ChatSource[] }

      setMessages((prev) => {
        const rest = prev.slice(0, -1)
        return [...rest, { role: "assistant", content: data.text, sources: data.sources ?? [] }]
      })
    } catch (error) {
      console.error(error)
      setMessages((prev) => {
        const rest = prev.slice(0, -1)
        return [
          ...rest,
          {
            role: "assistant",
            content: "⚠️ Error: No pude conectarme con mi cerebro digital. Revisa tu conexión o intenta de nuevo.",
          },
        ]
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto border rounded-3xl overflow-hidden bg-white shadow-xl">
      {/* Header */}
      <div className="bg-primary/5 border-b p-4 flex items-center gap-3">
        <div className="bg-primary rounded-full p-2 text-white">
          <Bot className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-black text-foreground">Tutor IA - Gemini Flash</h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-accent" />
            Especialista en PLD/FT · Respuestas con citas a documentos
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/50"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3 max-w-[85%]",
              m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border",
              m.role === "user" ? "bg-secondary text-white" : "bg-white text-primary"
            )}>
              {m.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
            </div>
            <div className="flex flex-col">
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap",
                m.role === "user"
                  ? "bg-secondary text-white rounded-tr-none"
                  : "bg-white text-foreground border rounded-tl-none"
              )}>
                {m.content || (isLoading && i === messages.length - 1 && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ))}
              </div>
              {m.role === "assistant" && m.sources && m.sources.length > 0 && (
                <SourceChips sources={m.sources} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Pregúntame sobre la Ley LFPIORPI o Reportes CNBV..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="rounded-xl border-2 focus:border-primary"
          />
          <Button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="rounded-xl font-bold bg-primary hover:bg-primary/90"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-2 uppercase tracking-widest font-bold">
          Potenciado por Google Gemini · Respuestas basadas en documentos oficiales CNBV
        </p>
      </div>
    </div>
  )
}

export default function ChatbotPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ChatbotInner />
    </Suspense>
  )
}
