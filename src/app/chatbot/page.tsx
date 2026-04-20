"use client"

import * as React from "react"
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { buildAuthHeaders } from "@/lib/auth-client"

type Message = {
  role: "user" | "assistant"
  content: string
}

export default function ChatbotPage() {
  const [messages, setMessages] = React.useState<Message[]>([
    { role: "assistant", content: "Hola, soy tu Tutor Certifik PLD. ¿Qué concepto de la certificación CNBV te gustaría repasar hoy?" }
  ])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMsg: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      const headers = await buildAuthHeaders({ "Content-Type": "application/json" })
      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })

      if (!response.ok) throw new Error("Fallo en la comunicación con la IA")

      const reader = response.body?.getReader()
      let assistantContent = ""
      
      setMessages((prev) => [...prev, { role: "assistant", content: "" }])

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        assistantContent += chunk

        setMessages((prev) => {
          const last = prev[prev.length - 1]
          return [...prev.slice(0, -1), { ...last, content: assistantContent }]
        })
      }
    } catch (error) {
      console.error(error)
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Error: No pude conectarme con mi cerebro digital. Revisa tu conexión u API Key." }])
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
          <h2 className="font-black text-foreground">Tutor IA - Gemini 3 Flash</h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-accent" />
            Especialista en PLD/FT
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
            <div className={cn(
              "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
              m.role === "user" ? "bg-secondary text-white rounded-tr-none" : "bg-white text-foreground border rounded-tl-none"
            )}>
              {m.content || (isLoading && i === messages.length - 1 && <Loader2 className="h-4 w-4 animate-spin" />)}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Input 
            placeholder="Pregúntame sobre la Ley LFPIORPI o Reportes CNBV..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="rounded-xl border-2 focus:border-primary"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            className="rounded-xl font-bold bg-primary hover:bg-primary/90"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-2 uppercase tracking-widest font-bold">
          Potenciado por Google Gemini - Respuestas basadas en tu material
        </p>
      </div>
    </div>
  )
}
