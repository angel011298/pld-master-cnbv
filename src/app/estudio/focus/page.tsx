// Archivo: src/app/estudio/focus/page.tsx
"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, BookOpen, BrainCircuit, Gamepad2, CheckCircle2, Bot, BookmarkPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import confetti from "canvas-confetti"

export default function ModoEstudioFocus() {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState<"lector" | "flashcards" | "minijuegos">("lector")
  const [flashcardIndex, setFlashcardIndex] = React.useState(0)
  const [isFlipped, setIsFlipped] = React.useState(false)
  const [savingNote, setSavingNote] = React.useState(false)

  // Datos mockeados (Estos vendrían de tu API /api/generate-quiz con formatType)
  const capsuleData = {
    title: "Identificación del Cliente (EBR)",
    step: 2,
    totalSteps: 5,
    bullets: [
      "Las entidades deben integrar un expediente de identificación antes de celebrar contratos.",
      "El Enfoque Basado en Riesgos (EBR) exige debida diligencia reforzada para clientes de Alto Riesgo.",
      "Personas Políticamente Expuestas (PEPs) extranjeras son siempre riesgo alto."
    ],
    originalLaw: "Artículo 115 de la LIC, Capítulo II: 'Las Instituciones de Crédito deberán formular y desarrollar manuales de cumplimiento... integrando expedientes para la identificación de los clientes...'",
    flashcards: [
      { id: 1, front: "Cliente PEP (Persona Políticamente Expuesta)", back: "Individuo que desempeña funciones públicas destacadas. Requiere Debida Diligencia Reforzada. Fundamento: Art. 115 LIC." },
      { id: 2, front: "Debida Diligencia Simplificada", back: "Aplica solo a clientes catalogados como de Bajo Riesgo en la metodología de la Entidad." }
    ]
  }

  const handleFinish = async () => {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
    // Llamar a tu API real de update-xp
    await fetch('/api/update-xp', { method: 'POST', body: JSON.stringify({ amount: 50, reason: "Completar Cápsula" }) })
    setTimeout(() => router.push('/dashboard'), 3000)
  }

  const nextFlashcard = () => {
    setIsFlipped(false)
    if (flashcardIndex < capsuleData.flashcards.length - 1) setFlashcardIndex(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      {/* Barra de Progreso Superior (Modo Enfoque) */}
      <div className="w-full bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="font-black text-slate-800 text-lg">{capsuleData.title}</h1>
            <p className="text-xs font-bold text-blue-600">Paso {capsuleData.step} de {capsuleData.totalSteps}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-1/3 max-w-xs">
          <Progress value={(capsuleData.step / capsuleData.totalSteps) * 100} className="h-2" />
        </div>
      </div>

      {/* Navegación de Tabs */}
      <div className="flex bg-white rounded-full p-1 mt-6 shadow-sm border border-slate-200">
        {[
          { id: "lector", label: "Teoría", icon: BookOpen },
          { id: "flashcards", label: "Flashcards", icon: BrainCircuit },
          { id: "minijuegos", label: "Práctica", icon: Gamepad2 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeTab === tab.id ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido Dinámico */}
      <div className="w-full max-w-3xl flex-1 p-6 flex flex-col relative">
        
        {/* BOTÓN FLOTANTE ASK AI */}
        <button className="fixed bottom-8 right-8 h-14 w-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
          <Bot className="h-6 w-6" />
        </button>

        <AnimatePresence mode="wait">
          {activeTab === "lector" && (
            <motion.div key="lector" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-slate-700 text-lg leading-relaxed">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-slate-900">Puntos Clave</h2>
                  <Button variant="outline" size="sm" onClick={() => setSavingNote(true)} className="gap-2 text-blue-600 border-blue-200 bg-blue-50">
                    <BookmarkPlus className="h-4 w-4" /> {savingNote ? "Guardado" : "Guardar Apunte"}
                  </Button>
                </div>
                <ul className="space-y-4">
                  {capsuleData.bullets.map((b, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Acordeón de la Ley Original */}
              <details className="group bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden cursor-pointer">
                <summary className="p-4 font-bold text-slate-700 flex items-center justify-between">
                  📖 Ver Artículo Original de la Ley
                  <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <div className="p-4 pt-0 text-sm text-slate-600 italic bg-white/50 border-t border-slate-200">
                  {capsuleData.originalLaw}
                </div>
              </details>
            </motion.div>
          )}

          {activeTab === "flashcards" && (
            <motion.div key="flashcards" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center">
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full max-w-md aspect-[3/4] perspective-1000 cursor-pointer"
              >
                <motion.div 
                  className="w-full h-full relative preserve-3d"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.4, type: "spring" }}
                >
                  {/* Frente */}
                  <div className="absolute inset-0 backface-hidden bg-white border-2 border-slate-200 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center">
                    <BrainCircuit className="h-12 w-12 text-blue-200 mb-6" />
                    <h3 className="text-2xl font-black text-slate-800">{capsuleData.flashcards[flashcardIndex].front}</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs absolute bottom-6">Toca para girar</p>
                  </div>
                  {/* Reverso */}
                  <div className="absolute inset-0 backface-hidden bg-blue-600 border-2 border-blue-700 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center text-white" style={{ transform: "rotateY(180deg)" }}>
                    <p className="text-lg font-medium leading-relaxed">{capsuleData.flashcards[flashcardIndex].back}</p>
                  </div>
                </motion.div>
              </div>

              {isFlipped && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 mt-8">
                  <Button variant="outline" className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100" onClick={nextFlashcard}>Dudé (Repasar)</Button>
                  <Button variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100" onClick={nextFlashcard}>Lo dominé</Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === "minijuegos" && (
             <motion.div key="minijuegos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
                <Gamepad2 className="h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-8">Zona de Práctica CENEVAL</h3>
                <Button onClick={handleFinish} className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-black text-lg py-6 px-12 rounded-2xl shadow-lg hover:scale-105 transition-transform">
                  <CheckCircle2 className="mr-2 h-6 w-6" /> Marcar Módulo como Completado
                </Button>
                <p className="text-sm font-bold text-slate-400 mt-4">+50 XP y Aumento de Racha</p>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}