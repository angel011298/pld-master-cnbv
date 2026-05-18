// src/components/QuizSimulator.tsx
"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronRight, CheckCircle2, XCircle, Trophy, Loader2,
  BrainCircuit, Lightbulb, Zap, Flame, Target, Globe, Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { buildAuthHeaders } from "@/lib/auth-client"
import { useUserProfile } from "@/hooks/useUserProfile"
import { AchievementToast } from "@/components/AchievementToast"
import type { Achievement } from "@/components/AchievementToast"

interface Question {
  id: number
  question: string
  options: string[]
  answer: string
  justification: string
}

const CNBV_SYLLABUS = [
  {
    module: "BLOQUE 1: El Lavado de Dinero y el Financiamiento al Terrorismo",
    topics: [
      "1.1 Concepto y etapas del Lavado de Dinero (LD)",
      "1.2 Concepto de Financiamiento al Terrorismo (FT)",
      "1.3 Bien, producto o instrumento del delito",
      "1.4 Penas del delito de LD conforme al Código Penal Federal",
      "1.5 Penas del delito de FT conforme al Código Penal Federal",
    ]
  },
  {
    module: "BLOQUE 2: Organismos y Foros Internacionales que Participan en PLD y FT",
    topics: [
      "2.1 Grupo de Acción Financiera Internacional (GAFI)",
      "2.2 Las 40 Recomendaciones del GAFI",
      "2.3 Grupo Egmont de Unidades de Inteligencia Financiera",
      "2.4 Otros organismos (ONU, OEA, BM, FMI)",
    ]
  },
  {
    module: "BLOQUE 3: Detección y Gestión de Riesgos en Materia de PLD/FT",
    topics: [
      "3.1 Enfoque Basado en Riesgos (EBR)",
      "3.2 Evaluación Nacional de Riesgos",
      "3.3 Señales de alerta y tipologías de LD/FT",
      "3.4 Personas Políticamente Expuestas (PEP)",
      "3.5 Listas de personas bloqueadas y sanciones internacionales",
    ]
  },
  {
    module: "BLOQUE 4: Prevención y Combate del LD/FT en el Sistema Financiero Mexicano",
    topics: [
      "4.1 Política de Identificación del Cliente (KYC)",
      "4.2 Perfil Transaccional del Cliente",
      "4.3 Oficial de Cumplimiento y Comité de Comunicación y Control",
      "4.4 Sistemas automatizados de monitoreo",
      "4.5 Restricciones de dólares en efectivo",
    ]
  },
  {
    module: "BLOQUE 5: Régimen de Prevención del LD/FT en el Sistema Financiero Mexicano",
    topics: [
      "5.1 Reportes de Operaciones Relevantes (ROR)",
      "5.2 Reportes de Operaciones Inusuales (ROI)",
      "5.3 Reportes de Operaciones Internas Preocupantes (ROIP)",
      "5.4 Intercambio de información entre entidades",
      "5.5 Reserva y confidencialidad de la información",
      "5.6 Sanciones administrativas de la CNBV",
    ]
  },
  {
    module: "BLOQUE 6: Nociones de la Ley FPIORPI",
    topics: [
      "6.1 Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita",
      "6.2 Actividades vulnerables y sujetos obligados no financieros",
      "6.3 Obligaciones de identificación y reporte ante el SAT",
      "6.4 Umbral de identificación y reporte en efectivo",
    ]
  },
  {
    module: "BLOQUE 7: Auditoría en Materia de PLD/FT",
    topics: [
      "7.1 Auditoría interna del programa de PLD/FT",
      "7.2 Auditoría externa e independiente",
      "7.3 Supervisión de la CNBV: facultades, visitas e infracciones",
      "7.4 Evaluación mutua del GAFI a México",
    ]
  },
  {
    module: "40 RECOMENDACIONES GAFI · Material Internacional",
    topics: [
      "GAFI R.1 — Evaluación de riesgos y EBR (Enfoque Basado en Riesgos)",
      "GAFI R.2 — Cooperación y coordinación nacional en PLD/FT",
      "GAFI R.3 — Delito de lavado de activos y conductas asociadas",
      "GAFI R.4 — Decomiso y medidas provisionales de bienes",
      "GAFI R.5 — Delito de financiamiento del terrorismo",
      "GAFI R.6 — Sanciones financieras dirigidas (terrorismo y FT)",
      "GAFI R.7 — Sanciones financieras dirigidas (proliferación de armas)",
      "GAFI R.8 — Organizaciones sin fines de lucro y riesgos de FT",
      "GAFI R.10 — Debida diligencia del cliente (DDC) y KYC",
      "GAFI R.11 — Conservación de registros y documentos",
      "GAFI R.12 — Personas Políticamente Expuestas (PEP) extranjeras",
      "GAFI R.13 — Banca corresponsal y relaciones interbancarias",
      "GAFI R.15 — Nuevas tecnologías y activos virtuales",
      "GAFI R.16 — Transferencias electrónicas de fondos",
      "GAFI R.20 — Reporte de operaciones sospechosas (ROS)",
      "GAFI R.24 — Transparencia y beneficiario final de personas jurídicas",
      "GAFI R.25 — Transparencia y beneficiario final de estructuras jurídicas",
      "GAFI R.37 — Asistencia jurídica mutua entre países",
      "GAFI R.40 — Otras formas de cooperación internacional",
    ]
  },
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
  
  // ── Multi-select syllabus state ───────────────────────────────────────────
  const [selectedTopics, setSelectedTopics] = React.useState<Set<string>>(
    () => new Set([CNBV_SYLLABUS[0].topics[0]])
  )

  const toggleTopic = (t: string) =>
    setSelectedTopics((prev) => {
      const next = new Set(prev)
      if (next.has(t)) { next.delete(t) } else { next.add(t) }
      return next
    })

  const toggleBloque = (mod: typeof CNBV_SYLLABUS[0]) =>
    setSelectedTopics((prev) => {
      const allSelected = mod.topics.every((t) => prev.has(t))
      const next = new Set(prev)
      if (allSelected) { mod.topics.forEach((t) => next.delete(t)) }
      else             { mod.topics.forEach((t) => next.add(t)) }
      return next
    })

  // Derived: flat array + strings for API and display
  const topicsArray = [...selectedTopics]
  const topicForApi =
    topicsArray.length === 1
      ? topicsArray[0]
      : topicsArray.length > 1
      ? `los siguientes subtemas del temario CNBV PLD/FT: ${topicsArray.join(" | ")}`
      : ""
  const topicLabel =
    topicsArray.length === 1 ? topicsArray[0] : `${topicsArray.length} subtemas seleccionados`

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
  const [unlockedAchievements, setUnlockedAchievements] = React.useState<Achievement[]>([])
  const [currentAchievementIndex, setCurrentAchievementIndex] = React.useState(0)

  const displayTotalXp = totalXp !== null ? totalXp : (profile?.totalXp ?? null)
  const displayStreak = streak !== null ? streak : (profile?.currentStreak ?? null)

  const fetchQuiz = async () => {
    setGameState("loading")
    try {
      const headers = await buildAuthHeaders({ "Content-Type": "application/json" })
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers,
        body: JSON.stringify({ topic: topicForApi, difficulty, count: 5, exerciseType }),
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
        body: JSON.stringify({ xpGained, correct, topic: topicLabel, difficulty, responseTimeMs }),
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

  const handleNext = async () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1)
      setSelectedOption(null)
      setIsRevealed(false)
    } else {
      setGameState("finished")
      // Check achievements after quiz finishes
      try {
        const headers = await buildAuthHeaders({ "Content-Type": "application/json" })
        const res = await fetch("/api/achievements/check", {
          method: "POST",
          headers,
        })
        const data = await res.json()
        if (res.ok && data.unlocked && data.unlocked.length > 0) {
          setUnlockedAchievements(data.unlocked)
          setCurrentAchievementIndex(0)
        }
      } catch (err) {
        console.error("Error checking achievements:", err)
      }
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
                <CardDescription>Selecciona uno o varios subtemas del Temario Oficial para generar material de estudio.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
           
            {/* SELECCIÓN DE TEMARIO DESGLOSADO OFICIAL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase text-muted-foreground">Temario Oficial Desglosado CNBV</label>
                <div className="flex items-center gap-3">
                  {topicsArray.length > 0 && (
                    <span className="text-xs font-bold text-primary">
                      {topicsArray.length} subtema{topicsArray.length !== 1 ? "s" : ""} seleccionado{topicsArray.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {topicsArray.length > 0 && (
                    <button
                      onClick={() => setSelectedTopics(new Set())}
                      className="text-xs text-red-500 hover:text-red-700 font-bold transition-colors"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
              <div className="h-[280px] overflow-y-auto border-2 border-gray-200 rounded-xl p-3 bg-gray-50 custom-scrollbar space-y-4">
                {CNBV_SYLLABUS.map((mod) => {
                  const isGafi = mod.module.includes("GAFI")
                  const allSelected = mod.topics.every((t) => selectedTopics.has(t))
                  const someSelected = !allSelected && mod.topics.some((t) => selectedTopics.has(t))
                  const selectedCount = mod.topics.filter((t) => selectedTopics.has(t)).length
                  return (
                    <div key={mod.module} className="space-y-1.5">
                      {/* Bloque header — clicking toggles all topics in bloque */}
                      <button
                        onClick={() => toggleBloque(mod)}
                        className={cn(
                          "sticky top-0 w-full backdrop-blur-sm py-1.5 px-2 font-black text-xs uppercase border-b flex items-center gap-2 rounded-sm text-left transition-colors",
                          isGafi
                            ? "bg-teal-50/95 text-teal-700 border-teal-300 hover:bg-teal-100/95"
                            : "bg-gray-50/95 text-primary border-primary/20 hover:bg-gray-100/95"
                        )}
                      >
                        {/* Checkbox indicator: empty / partial / full */}
                        <div className={cn(
                          "h-4 w-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors",
                          allSelected
                            ? isGafi ? "bg-teal-600 border-teal-600" : "bg-primary border-primary"
                            : someSelected
                            ? isGafi ? "bg-teal-200 border-teal-400" : "bg-primary/30 border-primary/60"
                            : "border-gray-400 bg-white"
                        )}>
                          {allSelected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                          {someSelected && <div className={cn("h-1.5 w-1.5 rounded-sm", isGafi ? "bg-teal-600" : "bg-primary")} />}
                        </div>
                        {isGafi && <Globe className="h-3 w-3 shrink-0" />}
                        <span className="flex-1">{mod.module}</span>
                        {selectedCount > 0 && (
                          <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0",
                            isGafi ? "bg-teal-200 text-teal-800" : "bg-primary/20 text-primary"
                          )}>
                            {selectedCount}/{mod.topics.length}
                          </span>
                        )}
                      </button>

                      {/* Individual topic buttons */}
                      <div className="grid gap-0.5 pl-2">
                        {mod.topics.map((t) => {
                          const isSelected = selectedTopics.has(t)
                          return (
                            <button
                              key={t}
                              onClick={() => toggleTopic(t)}
                              className={cn(
                                "text-left px-3 py-2 rounded-lg text-sm font-semibold transition-all border flex items-center gap-2.5",
                                isSelected
                                  ? isGafi
                                    ? "bg-teal-600 text-white border-teal-600"
                                    : "bg-primary text-white border-primary"
                                  : isGafi
                                  ? "bg-white text-teal-700 border-transparent hover:border-teal-200 hover:bg-teal-50"
                                  : "bg-white text-gray-600 border-transparent hover:border-gray-300 hover:bg-gray-100"
                              )}
                            >
                              <div className={cn(
                                "h-3.5 w-3.5 rounded border-2 shrink-0 flex items-center justify-center transition-colors",
                                isSelected
                                  ? "bg-white/20 border-white/60"
                                  : isGafi ? "border-teal-300" : "border-gray-300"
                              )}>
                                {isSelected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                              </div>
                              {t}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
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
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-700 hover:bg-gray-50"
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
              <Button
                size="lg"
                className="w-full font-black text-lg h-14 border-b-4 border-primary/70"
                onClick={fetchQuiz}
                disabled={topicsArray.length === 0}
              >
                {topicsArray.length === 0 ? "Selecciona al menos un subtema" : "¡GENERAR MATERIAL!"}
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
            <p className="text-muted-foreground">Tema: {topicLabel} · {difficulty}</p>
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

  const currentAchievement = unlockedAchievements[currentAchievementIndex] || null

  return (
    <AchievementToast
      achievement={currentAchievement}
      onClose={() => {
        if (currentAchievementIndex < unlockedAchievements.length - 1) {
          setCurrentAchievementIndex(currentAchievementIndex + 1)
        } else {
          setUnlockedAchievements([])
          setCurrentAchievementIndex(0)
        }
      }}
    />
  )
}