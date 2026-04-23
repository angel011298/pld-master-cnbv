"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { X, Heart, Zap, Trophy, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const TOTAL_QUESTIONS = 25

export default function TrialPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(0)
  const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(null)
  const [isCompleted, setIsCompleted] = React.useState(false)

  // Generamos preguntas "mock" variadas para la sensación de interactividad
  const questionType = currentStep % 3 === 0 ? "Selecciona la correcta" : currentStep % 2 === 0 ? "Verdadero o Falso" : "Caso Práctico"

  const handleNext = () => {
    if (currentStep < TOTAL_QUESTIONS - 1) {
      setCurrentStep(prev => prev + 1)
      setSelectedAnswer(null)
    } else {
      setIsCompleted(true)
    }
  }

  // PANTALLA DE ÉXITO FINAL (Otorgar 50 XP y Call To Action Gigante)
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border-2 border-yellow-400"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Zap className="h-24 w-24 text-yellow-400 fill-yellow-400" />
              <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: -10, opacity: 1 }} 
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -top-4 -right-8 bg-blue-600 text-white font-black text-xl px-3 py-1 rounded-full rotate-12"
              >
                +50 XP
              </motion.div>
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 mb-2">¡Excelente Trabajo!</h2>
          <p className="text-slate-600 mb-8 font-medium">
            Has superado la prueba de diagnóstico inicial. Estás listo para comenzar tu camino a la certificación CNBV.
          </p>

          <Button 
            onClick={() => router.push("/register/individual")}
            className="w-full h-16 text-lg font-black rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
          >
            Aceptar Desafío: Certificarme en 2026 <ArrowRight className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    )
  }

  // PANTALLA TIPO DUOLINGO (Durante las 25 preguntas)
  return (
    <div className="min-h-screen bg-white flex flex-col max-w-2xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center gap-4 p-4 mt-4">
        <button onClick={() => router.push("/")} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X className="h-6 w-6" />
        </button>
        <Progress value={((currentStep + 1) / TOTAL_QUESTIONS) * 100} className="h-3 flex-1 bg-slate-100" />
        <div className="flex items-center gap-1.5 text-red-500 font-bold">
          <Heart className="h-6 w-6 fill-red-500" />
          <span>5</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-2xl font-black text-slate-900 mb-6">{questionType}</h2>
            
            {/* Ilustración "Humaaans style" genérica/placeholder */}
            <div className="w-full flex justify-center mb-8">
              <img 
                src="https://assets.maccarianagency.com/svg/illustrations/illustration-4.svg" 
                alt="Ilustración estilo Humaaans" 
                className="h-40 md:h-48 w-auto object-contain"
              />
            </div>

            <p className="text-lg font-medium text-slate-800 mb-8">
              Pregunta simulada {currentStep + 1} de 25 sobre la Ley de Instituciones de Crédito o metodologías de PLD.
            </p>

            <div className="space-y-3">
              {[1, 2, 3].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedAnswer(opt)}
                  className={`w-full text-left p-4 rounded-2xl border-2 font-bold transition-all ${
                    selectedAnswer === opt 
                      ? "border-blue-500 bg-blue-50 text-blue-700" 
                      : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  Opción de respuesta {opt} simulada
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Bar (CTA) */}
      <div className="border-t-2 border-slate-100 p-4 md:p-6 pb-8">
        <Button 
          disabled={selectedAnswer === null}
          onClick={handleNext}
          className={`w-full h-14 text-lg font-black rounded-2xl transition-all ${
            selectedAnswer !== null 
              ? "bg-green-500 hover:bg-green-600 text-white" 
              : "bg-slate-200 text-slate-400"
          }`}
        >
          {currentStep < TOTAL_QUESTIONS - 1 ? "Comprobar" : "Finalizar Prueba"}
        </Button>
      </div>
    </div>
  )
}