// src/components/QuizSimulator.tsx
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
import { useUserProfile } from "@/hooks/useUserProfile"

interface Question {
  id: number
  question: string
  options: string[]
  answer: string
  justification: string
}

// TEMARIO EXTRAÍDO ESTRICTAMENTE DEL DOCUMENTO FUENTE (Google Drive)
const CNBV_SYLLABUS = [
  {
    module: "Área 1. Conocimientos básicos en PLD/FT",
    topics: [
      "1.1. Conceptos básicos PLD/FT",
      "1.1.1. LD",
      "1.1.2. FT",
      "1.1.3. Corrupción",
      "1.1.4. Penas del delito de LD conforme al Código Penal Federal",
      "1.1.5. Penas del delito de FT conforme al Código Penal Federal",
      "1.2. Organismos internacionales",
      "1.2.1. Conocimientos básicos sobre los organismos y foros internacionales e intergubernamentales...",
      "1.2.2. Grupo de Acción Financiera Internacional",
      "1.2.3. Recomendaciones del GAFI",
      "1.3. Autoridades nacionales",
      "1.3.1. Régimen de prevención",
      "1.3.2. Autoridades nacionales en materia de PLD y FT"
    ]
  },
  {
    module: "Área 2. Conocimientos técnicos en PLD/FT",
    topics: [
      "2.1. Leyes relativas al sistema financiero mexicano y disposiciones de carácter general aplicables a los sujetos obligados",
      "2.1.1. Objetivo",
      "2.1.2. Política de identificación y conocimiento del cliente o usuario",
      "2.1.3. Reportes",
      "2.1.4. Restricciones de dólares en efectivo",
      "2.1.5. Sistemas automatizados",
      "2.1.6. Otras obligaciones",
      "2.1.7. Intercambio de información",
      "2.1.8. Lista de personas bloqueadas",
      "2.1.9. Comité de Comunicación y Control",
      "2.1.10. Oficial de cumplimiento",
      "2.1.11. Obligaciones de los modelos novedosos",
      "2.1.12. Centros cambiarios",
      "2.1.13. Transmisores de dinero",
      "2.1.14. Instituciones de tecnología financiera",
      "2.1.15. Sanciones",
      "2.1.16. Propietario real",
      "2.1.17. Plazos de cumplimiento"
    ]
  }
];

const EXERCISE_TYPES = [
  "Opción Múltiple",
  "Verdadero o Falso",
  "Flashcards",
  "Casos Prácticos",
  "Completar Texto",
  "Crucigramas",
  "Sopas de Letras"
];

export function QuizSimulator() {
  const { profile, loading } = useUserProfile()
  
  const [topic, setTopic] = React.useState(CNBV_SYLLABUS[0].topics[0])
  const [difficulty, setDifficulty] = React.useState("Intermedio")
  const [exerciseType, setExerciseType] = React.useState(EXERCISE_TYPES[0])
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

  const displayTotalXp = totalXp !== null ? totalXp : (profile?.totalXp ?? null)
  const displayStreak = streak !== null ? streak : (profile?.currentStreak ?? null)

  const fetchQuiz = async () => {
    setGameState("loading")
    try {
      const headers = await buildAuthHeaders({ "Content-Type": "application/json" })
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers,
        body: JSON.stringify({ topic, difficulty, count: 5, exerciseType }),
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
      // Ignorar
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto py-6">
        <Card className="md:col-span-2 border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BrainCircuit className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl font-black tracking-tight uppercase">Simulador CNBV</CardTitle>
                <CardDescription>Selecciona un subtema específico de la Guía Oficial para practicar.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
           
            {/* SELECCIÓN DE TEMARIO DESGLOSADO OFICIAL */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Temario Oficial Desglosado CNBV</label>
              <div className="h-[280px] overflow-y-auto border-2 border-gray-200 rounded-xl p-3 bg-gray-50 custom-scrollbar space-y-6">
                {CNBV_SYLLABUS.map((mod) => (
                  <div key={mod.module} className="space-y-2">
                    <div className="sticky top-0 bg-gray-50/95 backdrop-blur-sm py-1 font-black text-primary text-sm uppercase border-b border-primary/20">
                      {mod.module}
                    </div>
                    <div className="grid gap-1 pl-2">
                      {mod.topics.map((t) => (
                        <button
                          key={t}
                          onClick={() => setTopic(t)}
                          className={cn(
                            "text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-all border border-transparent",
                            topic === t
                              ? "bg-primary text-white shadow-md border-primary"
                              : "bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-100"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SELECCIÓN DE TIPO DE EJERCICIO */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Formato de Estudio</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {EXERCISE_TYPES.map((type) => (
                  <motion.button
                    key={type}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setExerciseType(type)}
                    className={cn(
                      "py-2 px-2 rounded-xl border-2 font-bold text-xs transition-all",
                      exerciseType === type
                        ? "bg-secondary text-white border-secondary"
                        : "border-gray-200 text-muted-foreground hover:border-secondary"
                    )}
                  >
                    {type}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* NIVEL DE DIFICULTAD */}
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
                ¡GENERAR MATERIAL!
              </Button>
            </motion.div>
          </CardFooter>
        </Card>

        {/* Stats sidebar — 1 col */}
        <div className="space-y-4">
          <Card className="border-2 border-secondary/30">
            <CardContent className="py-6 flex flex-col items-center gap-2">
              <Zap className="h-8 w-8 text-secondary" />
              <span className="text-3xl font-black">
                {loading ? "—" : (displayTotalXp !== null ? displayTotalXp.toLocaleString() : "0")}
              </span>
              <span className="text-xs uppercase font-bold text-muted-foreground">XP Acumulado</span>
            </CardContent>
          </Card>
          <Card className="border-2 border-orange-200">
            <CardContent className="py-6 flex flex-col items-center gap-2">
              <Flame className="h-8 w-8 text-orange-500" />
              <span className="text-3xl font-black">
                {loading ? "—" : (displayStreak !== null ? displayStreak : "0")}
              </span>
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
        <p className="text-xl font-bold animate-pulse">Gemini está redactando tu material de estudio...</p>
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
          {displayStreak !== null && (
            <Card className="border-2 border-orange-200">
              <CardContent className="py-5 flex flex-col items-center gap-1">
                <Flame className="h-7 w-7 text-orange-500" />
                <span className="text-3xl font-black">{displayStreak}</span>
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

          {displayTotalXp !== null && (
            <Card className="border-2">
              <CardContent className="py-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">XP Total Acumulado</span>
                <span className="text-2xl font-black text-primary">{displayTotalXp.toLocaleString()} XP</span>
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