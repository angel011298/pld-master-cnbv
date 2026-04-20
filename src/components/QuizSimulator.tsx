"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronRight, CheckCircle2, XCircle, Trophy, Loader2,
  BrainCircuit, Lightbulb, Zap, Flame, Target
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { buildAuthHeaders } from "@/lib/auth-client"

interface Question {
  id: number
  question: string
  options: string[]
  answer: string
  justification: string
}

const TOPICS = [
  "Disposiciones de Carácter General",
  "Reportes de Operaciones Inusuales",
  "Multas en UMAs",
  "Evaluación Basada en Riesgos (EBR)",
  "Tipologías de Lavado de Dinero",
]

export function QuizSimulator() {
  const [topic, setTopic] = React.useState(TOPICS[0])
  const [difficulty, setDifficulty] = React.useState("Intermedio")
  const [gameState, setGameState] = React.useState<"idle" | "loading" | "quiz" | "finished">("idle")
  const [questions, setQuestions] = React.useState<Question[]>([])
  const [currentIdx, setCurrentIdx] = React.useState(0)
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null)
  const [isRevealed, setIsRevealed] = React.useState(false)
  const [score, setScore] = React.useState(0)
  const [sessionXp, setSessionXp] = React.useState(0)
  const [totalXp, setTotalXp] = React.useState<number | null>(null)
  const [streak, setStreak] = React.useState<number | null>(null)
  const [startTime, setStartTime] = React.useState<number>(0)

  const fetchQuiz = async () => {
    setGameState("loading")
    try {
      const headers = await buildAuthHeaders({ "Content-Type": "application/json" })
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers,
        body: JSON.stringify({ topic, difficulty, count: 5 }),
      })
      const data = await res.json()
      if (res.ok) {
        setQuestions(data.quiz)
        setGameState("quiz")
        setCurrentIdx(0)
        setScore(0)
        setSessionXp(0)
        setStartTime(Date.now())
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      alert("Error al generar el quiz: " + (err as Error).message)
      setGameState("idle")
    }
  }

  const handleSelect = (option: string) => {
    if (isRevealed) return
    setSelectedOption(option)
  }

  const handleConfirm = async () => {
    if (!selectedOption) return
    const responseTimeMs = Date.now() - startTime
    const q = questions[currentIdx]
    const correct = selectedOption === q.answer
    const xpGained = correct ? 50 : 10
    setIsRevealed(true)
    if (correct) setScore((s) => s + 1)
    setSessionXp((x) => x + xpGained)

    // Persist XP asynchronously (non-blocking)
    try {
      const headers = await buildAuthHeaders({ "Content-Type": "application/json" })
      const res = await fetch("/api/update-xp", {
        method: "POST",
        headers,
        body: JSON.stringify({ xpGained, correct, topic, difficulty, responseTimeMs }),
      })
      const data = await res.json()
      if (res.ok) {
        setTotalXp(data.totalXp)
        setStreak(data.streak)
      }
    } catch {
      // XP update failure is non-critical
    }

    setStartTime(Date.now())
  }

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1)
      setSelectedOption(null)
      setIsRevealed(false)
    } else {
      setGameState("finished")
    }
  }

  // ——— IDLE STATE ———
  if (gameState === "idle") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto py-6">
        {/* Config card — 2 cols */}
        <Card className="md:col-span-2 border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BrainCircuit className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl font-black tracking-tight uppercase">Simulador CNBV</CardTitle>
                <CardDescription>Preguntas generadas con IA basadas en tus documentos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Tema de Estudio</label>
              <div className="grid grid-cols-1 gap-2">
                {TOPICS.map((t) => (
                  <motion.button
                    key={t}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTopic(t)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left text-sm font-semibold transition-all",
                      topic === t
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 hover:border-primary/40"
                    )}
                  >
                    {t}
                  </motion.button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Nivel</label>
              <div className="flex gap-2">
                {["Básico", "Intermedio", "Avanzado"].map((lvl) => (
                  <motion.button
                    key={lvl}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDifficulty(lvl)}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-xl border-2 font-bold text-sm transition-all",
                      difficulty === lvl
                        ? "bg-primary text-white border-primary"
                        : "border-gray-200 text-muted-foreground hover:border-primary"
                    )}
                  >
                    {lvl}
                  </motion.button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <motion.div className="w-full" whileTap={{ scale: 0.98 }}>
              <Button size="lg" className="w-full font-black text-lg h-14 border-b-4 border-primary/70" onClick={fetchQuiz}>
                ¡EMPEZAR EXAMEN!
              </Button>
            </motion.div>
          </CardFooter>
        </Card>

        {/* Stats sidebar — 1 col */}
        <div className="space-y-4">
          <Card className="border-2 border-secondary/30">
            <CardContent className="py-6 flex flex-col items-center gap-2">
              <Zap className="h-8 w-8 text-secondary" />
              <span className="text-3xl font-black">{totalXp !== null ? totalXp.toLocaleString() : "—"}</span>
              <span className="text-xs uppercase font-bold text-muted-foreground">XP Acumulado</span>
            </CardContent>
          </Card>
          <Card className="border-2 border-orange-200">
            <CardContent className="py-6 flex flex-col items-center gap-2">
              <Flame className="h-8 w-8 text-orange-500" />
              <span className="text-3xl font-black">{streak !== null ? streak : "—"}</span>
              <span className="text-xs uppercase font-bold text-muted-foreground">Días de Racha</span>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="py-6 flex flex-col items-center gap-2">
              <Target className="h-8 w-8 text-primary" />
              <span className="text-3xl font-black">5</span>
              <span className="text-xs uppercase font-bold text-muted-foreground">Preguntas por Quiz</span>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ——— LOADING STATE ———
  if (gameState === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="h-12 w-12 text-primary" />
        </motion.div>
        <p className="text-xl font-bold animate-pulse">Gemini está redactando tu examen...</p>
      </div>
    )
  }

  // ——— QUIZ STATE ———
  if (gameState === "quiz") {
    const q = questions[currentIdx]
    const progress = ((currentIdx + 1) / questions.length) * 100

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto py-6">
        {/* Question card — 2 cols */}
        <div className="md:col-span-2 space-y-4">
          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <Progress value={progress} className="h-3 flex-1" />
            <span className="font-black text-primary text-sm shrink-0">{currentIdx + 1}/{questions.length}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="border-b-[6px] border-primary/30">
                <CardHeader>
                  <CardTitle className="text-xl leading-snug">{q.question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {q.options.map((opt) => {
                    const isCorrect = isRevealed && opt === q.answer
                    const isWrong = isRevealed && selectedOption === opt && opt !== q.answer

                    return (
                      <motion.button
                        key={opt}
                        onClick={() => handleSelect(opt)}
                        disabled={isRevealed}
                        whileHover={!isRevealed ? { scale: 1.01 } : {}}
                        whileTap={!isRevealed ? { scale: 0.99 } : {}}
                        animate={
                          isCorrect
                            ? { scale: [1, 1.02, 1], transition: { duration: 0.3 } }
                            : isWrong
                            ? { x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.35 } }
                            : {}
                        }
                        className={cn(
                          "w-full p-4 rounded-2xl border-2 font-semibold text-left transition-colors flex items-center justify-between gap-3",
                          selectedOption === opt && !isRevealed
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-200",
                          isCorrect ? "border-green-500 bg-green-50 text-green-700" : "",
                          isWrong ? "border-red-500 bg-red-50 text-red-700" : ""
                        )}
                      >
                        <span>{opt}</span>
                        {isCorrect && <CheckCircle2 className="h-5 w-5 shrink-0" />}
                        {isWrong && <XCircle className="h-5 w-5 shrink-0" />}
                      </motion.button>
                    )
                  })}
                </CardContent>

                <AnimatePresence>
                  {isRevealed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-100"
                    >
                      <div className="p-6 space-y-3">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase">
                          <Lightbulb className="h-4 w-4" /> Justificación Legal
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed italic">{q.justification}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3">
            <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
              <Button
                disabled={!selectedOption || isRevealed}
                onClick={handleConfirm}
                className="w-full h-14 text-lg font-black rounded-2xl border-b-4 border-primary/70"
              >
                COMPROBAR
              </Button>
            </motion.div>
            <AnimatePresence>
              {isRevealed && (
                <motion.div
                  className="flex-1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Button
                    onClick={handleNext}
                    className="w-full h-14 text-lg font-black rounded-2xl bg-secondary hover:bg-secondary/90 border-b-4 border-secondary/70"
                  >
                    SIGUIENTE <ChevronRight className="h-5 w-5 ml-1" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Stats sidebar — 1 col */}
        <div className="space-y-4">
          <Card className="border-2">
            <CardContent className="py-5 flex flex-col items-center gap-1">
              <Target className="h-7 w-7 text-primary" />
              <span className="text-3xl font-black">{score}/{currentIdx + (isRevealed ? 1 : 0)}</span>
              <span className="text-xs uppercase font-bold text-muted-foreground">Correctas</span>
            </CardContent>
          </Card>
          <Card className="border-2 border-secondary/30">
            <CardContent className="py-5 flex flex-col items-center gap-1">
              <Zap className="h-7 w-7 text-secondary" />
              <span className="text-3xl font-black">+{sessionXp}</span>
              <span className="text-xs uppercase font-bold text-muted-foreground">XP Esta Sesión</span>
            </CardContent>
          </Card>
          {streak !== null && (
            <Card className="border-2 border-orange-200">
              <CardContent className="py-5 flex flex-col items-center gap-1">
                <Flame className="h-7 w-7 text-orange-500" />
                <span className="text-3xl font-black">{streak}</span>
                <span className="text-xs uppercase font-bold text-muted-foreground">Días de Racha</span>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // ——— FINISHED STATE ———
  if (gameState === "finished") {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="max-w-2xl mx-auto py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            >
              <Trophy className="h-20 w-20 mx-auto text-secondary" />
            </motion.div>
            <h2 className="text-4xl font-black tracking-tight">¡EXAMEN COMPLETADO!</h2>
            <p className="text-muted-foreground">Tema: {topic} · {difficulty}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="border-2 border-primary/30 text-center">
              <CardContent className="py-6">
                <span className="text-xs font-bold uppercase text-primary block mb-1">Puntaje</span>
                <span className="text-4xl font-black">{score}/{questions.length}</span>
              </CardContent>
            </Card>
            <Card className="border-2 border-secondary/30 text-center">
              <CardContent className="py-6">
                <span className="text-xs font-bold uppercase text-secondary block mb-1">XP Ganado</span>
                <span className="text-4xl font-black">+{sessionXp}</span>
              </CardContent>
            </Card>
            <Card className="border-2 border-orange-200 text-center">
              <CardContent className="py-6">
                <span className="text-xs font-bold uppercase text-orange-500 block mb-1">Porcentaje</span>
                <span className="text-4xl font-black">{pct}%</span>
              </CardContent>
            </Card>
          </div>

          {totalXp !== null && (
            <Card className="border-2">
              <CardContent className="py-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">XP Total Acumulado</span>
                <span className="text-2xl font-black text-primary">{totalXp.toLocaleString()} XP</span>
              </CardContent>
            </Card>
          )}

          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              className="w-full h-14 text-xl font-black border-b-4 border-primary/70"
              onClick={() => setGameState("idle")}
            >
              VOLVER AL INICIO
            </Button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return null
}
