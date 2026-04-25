"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, BookOpen, BrainCircuit, Gamepad2, CheckCircle2, Bot, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import confetti from "canvas-confetti"

type GeneratedQuestion = {
  id: number
  question: string
  options?: string[]
  answer?: string
  justification?: string
  source?: string
}

export default function ModoEstudioFocus() {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState<"lector" | "flashcards" | "minijuegos">("lector")
  const [questionIndex, setQuestionIndex] = React.useState(0)
  const [showAnswer, setShowAnswer] = React.useState(false)
  const [questions, setQuestions] = React.useState<GeneratedQuestion[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const loadMaterial = async () => {
      setLoading(true)
      setError(null)
      try {
        const sb = supabase()
        const { data: { session } } = await sb.auth.getSession()
        const token = session?.access_token
        if (!token) {
          setError("Debes iniciar sesión para generar material real.")
          return
        }

        const res = await fetch("/api/generate-quiz", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            topic: "Identificación del Cliente y Enfoque Basado en Riesgos",
            difficulty: "Intermedio",
            count: 4,
            formatType: "ceneval",
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? "No se pudo generar el material.")
        setQuestions(Array.isArray(data.quiz) ? data.quiz : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo generar el material.")
      } finally {
        setLoading(false)
      }
    }

    loadMaterial()
  }, [])

  const activeQuestion = questions[questionIndex]
  const progress = questions.length > 0 ? ((questionIndex + 1) / questions.length) * 100 : 0

  const handleFinish = async () => {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
    const sb = supabase()
    const { data: { session } } = await sb.auth.getSession()
    await fetch("/api/update-xp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({
        xpGained: 50,
        correct: true,
        topic: "Identificación del Cliente y EBR",
        difficulty: "Intermedio",
      }),
    })
    setTimeout(() => router.push("/dashboard"), 1500)
  }

  const nextQuestion = () => {
    setShowAnswer(false)
    if (questionIndex < questions.length - 1) setQuestionIndex((prev) => prev + 1)
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-50">
      <div className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/dashboard")} className="rounded-full p-2 transition-colors hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-800">Material real generado desde tu base de conocimiento</h1>
            <p className="text-xs font-bold text-blue-600">
              {questions.length > 0 ? `Reactivo ${questionIndex + 1} de ${questions.length}` : "Preparando contenido"}
            </p>
          </div>
        </div>
        <div className="flex w-1/3 max-w-xs items-center gap-4">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="mt-6 flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
        {[
          { id: "lector", label: "Teoría", icon: BookOpen },
          { id: "flashcards", label: "Flashcards", icon: BrainCircuit },
          { id: "minijuegos", label: "Práctica", icon: Gamepad2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
              activeTab === tab.id ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="relative flex w-full max-w-3xl flex-1 flex-col p-6">
        <button className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl transition-transform hover:scale-110">
          <Bot className="h-6 w-6" />
        </button>

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center font-bold text-slate-500">
            Generando contenido real con tus documentos y fuentes oficiales...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center text-amber-800">
            <AlertTriangle className="mx-auto mb-3 h-8 w-8" />
            <p className="font-bold">{error}</p>
          </div>
        )}

        {!loading && !error && questions.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            No hay material generado todavía para este tema.
          </div>
        )}

        {!loading && !error && activeQuestion && (
          <AnimatePresence mode="wait">
            {activeTab === "lector" && (
              <motion.div key="lector" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="rounded-3xl border border-slate-100 bg-white p-8 text-lg leading-relaxed text-slate-700 shadow-sm">
                  <h2 className="mb-4 text-xl font-black text-slate-900">Reactivo generado</h2>
                  <p>{activeQuestion.question}</p>
                  {activeQuestion.options && (
                    <div className="mt-5 space-y-2">
                      {activeQuestion.options.map((option) => (
                        <div key={option} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold">
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <details className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <summary className="flex items-center justify-between p-4 font-bold text-slate-700">
                    Ver fuente y justificación
                    <span className="transition group-open:rotate-180">v</span>
                  </summary>
                  <div className="border-t border-slate-200 bg-white/50 p-4 pt-3 text-sm text-slate-600">
                    <p className="font-bold text-slate-800">Respuesta: {activeQuestion.answer ?? "Sin respuesta registrada"}</p>
                    <p className="mt-2">{activeQuestion.justification ?? "Sin justificación registrada."}</p>
                    {activeQuestion.source && <p className="mt-2 text-xs font-bold text-blue-700">Fuente: {activeQuestion.source}</p>}
                  </div>
                </details>
              </motion.div>
            )}

            {activeTab === "flashcards" && (
              <motion.div key="flashcards" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-1 flex-col items-center justify-center">
                <button
                  onClick={() => setShowAnswer((value) => !value)}
                  className="flex aspect-[3/4] w-full max-w-md flex-col items-center justify-center rounded-3xl border-2 border-slate-200 bg-white p-8 text-center shadow-xl"
                >
                  <BrainCircuit className="mb-6 h-12 w-12 text-blue-200" />
                  <h3 className="text-2xl font-black text-slate-800">
                    {showAnswer ? activeQuestion.answer ?? activeQuestion.justification : activeQuestion.question}
                  </h3>
                  <p className="absolute bottom-10 text-xs font-bold uppercase tracking-widest text-slate-400">Toca para girar</p>
                </button>

                {showAnswer && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex gap-4">
                    <Button variant="outline" className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100" onClick={nextQuestion}>Repasar</Button>
                    <Button variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100" onClick={nextQuestion}>Lo dominé</Button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === "minijuegos" && (
              <motion.div key="minijuegos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-1 flex-col items-center justify-center text-center">
                <Gamepad2 className="mb-4 h-16 w-16 text-slate-300" />
                <h3 className="mb-8 text-xl font-bold text-slate-700">Práctica con material generado</h3>
                <Button onClick={handleFinish} className="rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 px-12 py-6 text-lg font-black text-white shadow-lg transition-transform hover:scale-105 hover:from-yellow-500 hover:to-orange-600">
                  <CheckCircle2 className="mr-2 h-6 w-6" /> Registrar avance real
                </Button>
                <p className="mt-4 text-sm font-bold text-slate-400">Se guardará un evento real de estudio y +50 XP</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
