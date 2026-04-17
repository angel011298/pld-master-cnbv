"use client"

import * as React from "react"
import { 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Loader2, 
  BrainCircuit,
  Lightbulb
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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

export function QuizSimulator() {
  const [topic, setTopic] = React.useState("Disposiciones de Carácter General")
  const [difficulty, setDifficulty] = React.useState("Intermedio")
  const [gameState, setGameState] = React.useState<"idle" | "loading" | "quiz" | "finished">("idle")
  const [questions, setQuestions] = React.useState<Question[]>([])
  const [currentIdx, setCurrentIdx] = React.useState(0)
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null)
  const [isRevealed, setIsRevealed] = React.useState(false)
  const [score, setScore] = React.useState(0)

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

  const handleConfirm = () => {
    if (!selectedOption) return
    setIsRevealed(true)
    if (selectedOption === questions[currentIdx].answer) {
      setScore(s => s + 1)
    }
  }

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1)
      setSelectedOption(null)
      setIsRevealed(false)
    } else {
      setGameState("finished")
    }
  }

  if (gameState === "idle") {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto py-10">
        <div className="text-center space-y-4">
          <BrainCircuit className="h-16 w-16 mx-auto text-primary" />
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tight">Simulador de Examen</h1>
          <p className="text-muted-foreground text-lg italic">Pon a prueba tus conocimientos con casos reales basados en tus documentos.</p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Configura tu entrenamiento</CardTitle>
            <CardDescription>Selecciona el tema y la dificultad para comenzar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase">Tema de Estudio</label>
              <input 
                className="w-full p-3 rounded-xl border-2 focus:border-primary outline-none" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej: Multas en UMAs, Reportes de Inusuales..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase">Nivel de Dificultad</label>
              <div className="flex gap-2">
                {["Básico", "Intermedio", "Avanzado"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setDifficulty(lvl)}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-xl border-2 font-bold transition-all",
                      difficulty === lvl ? "bg-primary text-white border-primary" : "bg-white text-muted-foreground border-gray-200 hover:border-primary"
                    )}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button size="lg" className="w-full font-black text-xl h-14" onClick={fetchQuiz}>
              ¡EMPEZAR EXAMEN!
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (gameState === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-xl font-bold animate-pulse">Gemini está redactando tu examen...</p>
      </div>
    )
  }

  if (gameState === "quiz") {
    const q = questions[currentIdx]
    const progress = ((currentIdx + 1) / questions.length) * 100

    return (
      <div className="max-w-2xl mx-auto py-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Progress value={progress} className="h-4 flex-1" />
          <span className="font-black text-primary">{currentIdx + 1}/{questions.length}</span>
        </div>

        <Card className="border-b-[8px] border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl leading-snug">{q.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {q.options.map((opt) => {
              const isCorrect = isRevealed && opt === q.answer
              const isWrong = isRevealed && selectedOption === opt && opt !== q.answer
              
              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  disabled={isRevealed}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 font-bold text-left transition-all flex items-center justify-between",
                    selectedOption === opt && !isRevealed ? "border-primary bg-primary/5 text-primary" : "border-gray-200",
                    isCorrect ? "border-green-500 bg-green-50 text-green-700" : "",
                    isWrong ? "border-red-500 bg-red-50 text-red-700" : ""
                  )}
                >
                  <span>{opt}</span>
                  {isCorrect && <CheckCircle2 className="h-5 w-5" />}
                  {isWrong && <XCircle className="h-5 w-5" />}
                </button>
              )
            })}
          </CardContent>
          {isRevealed && (
            <CardFooter className="flex flex-col items-start gap-4 bg-muted/30 p-6 rounded-b-2xl border-t border-gray-100">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Lightbulb className="h-5 w-5" />
                JUSTIFICACIÓN LEGAL
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed italic">{q.justification}</p>
            </CardFooter>
          )}
        </Card>

        <div className="flex gap-4">
          <Button 
            disabled={!selectedOption || isRevealed} 
            onClick={handleConfirm}
            className="flex-1 h-14 text-xl font-black rounded-2xl border-b-4 border-primary/70"
          >
            COMPROBAR
          </Button>
          {isRevealed && (
            <Button onClick={handleNext} className="flex-1 h-14 text-xl font-black rounded-2xl bg-secondary hover:bg-secondary/90 border-b-4 border-secondary/70">
              SIGUIENTE
              <ChevronRight className="h-6 w-6 ml-2" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (gameState === "finished") {
    const xpGained = score * 50
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-8 max-w-md mx-auto">
        <Trophy className="h-24 w-24 text-accent animate-bounce" />
        <h2 className="text-4xl font-black text-center">¡EXAMEN COMPLETADO!</h2>
        <div className="grid grid-cols-2 gap-4 w-full text-center">
          <div className="p-6 bg-primary/10 rounded-2xl border-2 border-primary/20">
            <span className="text-sm text-primary font-bold uppercase">Puntaje</span>
            <div className="text-4xl font-black">{score}/{questions.length}</div>
          </div>
          <div className="p-6 bg-accent/10 rounded-2xl border-2 border-accent/20">
            <span className="text-sm text-accent font-bold uppercase">XP Ganado</span>
            <div className="text-4xl font-black">+{xpGained}</div>
          </div>
        </div>
        <Button size="lg" className="w-full h-14 text-xl font-black" onClick={() => setGameState("idle")}>
          VOLVER AL INICIO
        </Button>
      </div>
    )
  }

  return null
}
