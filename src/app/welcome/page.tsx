"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield, GraduationCap, MessageSquare, Trophy, Zap,
  BookOpen, Map, ChevronRight, ChevronLeft, X, Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const SLIDES = [
  {
    id: 1,
    emoji: "🎉",
    title: "¡Bienvenido a Certifik PLD Premium!",
    subtitle: "Tienes acceso completo para certificarte en PLD/FT ante la CNBV 2026.",
    content: (
      <div className="space-y-3 mt-4">
        {[
          { icon: GraduationCap, text: "+2,500 reactivos estilo CENEVAL", color: "text-blue-600" },
          { icon: MessageSquare, text: "Chatbot IA regulatorio 24/7", color: "text-emerald-600" },
          { icon: BookOpen, text: "Biblioteca de leyes y disposiciones", color: "text-indigo-600" },
          { icon: Trophy, text: "Sistema de XP y rachas diarias", color: "text-yellow-600" },
        ].map(({ icon: Icon, text, color }) => (
          <div key={text} className="flex items-center gap-3 p-3 rounded-xl bg-white border-2 border-gray-100">
            <Icon className={`h-5 w-5 ${color} shrink-0`} />
            <span className="text-sm font-bold text-gray-800">{text}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 2,
    emoji: "🗺️",
    title: "Tu Ruta de Aprendizaje",
    subtitle: "El módulo principal organiza tu estudio en 5 etapas progresivas.",
    content: (
      <div className="mt-4 space-y-3">
        {[
          { num: "1", title: "Fundamentos e Instituciones Internacionales", status: "Disponible", color: "bg-blue-600" },
          { num: "2", title: "Marco Jurídico Mexicano", status: "Disponible", color: "bg-emerald-600" },
          { num: "3", title: "Prevención y Gestión de Riesgos (EBR)", status: "Premium ✓", color: "bg-indigo-600" },
          { num: "4", title: "Auditoría y Supervisión", status: "Premium ✓", color: "bg-purple-600" },
          { num: "5", title: "Tipologías e Inteligencia Financiera", status: "Premium ✓", color: "bg-rose-600" },
        ].map((m) => (
          <div key={m.num} className="flex items-center gap-3 p-3 rounded-xl bg-white border-2 border-gray-100">
            <div className={`h-8 w-8 rounded-lg ${m.color} flex items-center justify-center shrink-0`}>
              <span className="text-white text-sm font-black">{m.num}</span>
            </div>
            <span className="text-sm font-bold text-gray-800 flex-1 truncate">{m.title}</span>
            <span className="text-xs font-bold text-emerald-600 shrink-0">{m.status}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 3,
    emoji: "🧠",
    title: "El Simulador CENEVAL",
    subtitle: "Practica con preguntas reales filtradas por tema, sector y dificultad.",
    content: (
      <div className="mt-4 space-y-4">
        <div className="p-5 bg-blue-50 border-2 border-blue-200 rounded-2xl text-center">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-blue-900 font-black text-lg">¿Cuál es el umbral para reportes en efectivo?</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {["$5,000 USD", "$10,000 USD", "$7,500 USD", "$15,000 USD"].map((opt, i) => (
              <div key={opt} className={`p-2 rounded-xl border-2 text-xs font-bold text-center ${i === 1 ? "bg-emerald-100 border-emerald-400 text-emerald-800" : "bg-white border-gray-200 text-gray-600"}`}>
                {opt} {i === 1 && "✅"}
              </div>
            ))}
          </div>
        </div>
        <p className="text-gray-600 text-sm text-center">Cada respuesta correcta suma XP y mejora tu predicción de aprobación.</p>
      </div>
    ),
  },
  {
    id: 4,
    emoji: "🤖",
    title: "Chatbot IA Regulatorio",
    subtitle: "Pregunta cualquier duda sobre PLD/FT y recibe respuestas con fundamento legal.",
    content: (
      <div className="mt-4 space-y-3">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
          <div className="flex gap-2 justify-end">
            <div className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-2xl rounded-br-sm max-w-xs">
              ¿Cuándo se debe reportar una operación inusual urgente?
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-7 w-7 rounded-full bg-yellow-400 flex items-center justify-center shrink-0">
              <Shield className="h-4 w-4 text-blue-900" />
            </div>
            <div className="bg-white border border-gray-200 text-gray-800 text-xs font-medium px-4 py-2 rounded-2xl rounded-bl-sm max-w-xs">
              Conforme al Art. 17 LFPIORPI y las Disposiciones CNBV, tienes <strong>24 horas</strong> para reportar a la UIF desde que detectas la operación inusual urgente. 📋
            </div>
          </div>
        </div>
        <p className="text-gray-600 text-sm text-center">El chatbot tiene acceso a todas las leyes y disposiciones vigentes.</p>
      </div>
    ),
  },
  {
    id: 5,
    emoji: "🏆",
    title: "Sistema de XP y Racha",
    subtitle: "Estudia diariamente para mantener tu racha y escalar en el ranking.",
    content: (
      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Zap, label: "XP por respuesta", value: "+5 XP", color: "text-yellow-600", bg: "bg-yellow-50" },
            { icon: Star, label: "Racha diaria", value: "+10 XP", color: "text-orange-600", bg: "bg-orange-50" },
            { icon: Trophy, label: "Módulo completo", value: "+100 XP", color: "text-blue-600", bg: "bg-blue-50" },
          ].map((item) => (
            <div key={item.label} className={`${item.bg} rounded-2xl p-4 text-center border-2 border-white`}>
              <item.icon className={`h-6 w-6 ${item.color} mx-auto mb-2`} />
              <p className={`text-xl font-black ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl text-center">
          <p className="text-blue-900 font-bold text-sm">
            🎯 Meta: llega a <strong>10,000 XP</strong> para tener alta probabilidad de aprobar el examen.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 6,
    emoji: "🚀",
    title: "¡Estás listo para empezar!",
    subtitle: "Tu ruta está personalizada según tu fecha de examen. ¡A estudiar!",
    content: (
      <div className="mt-4 space-y-3">
        <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white text-center">
          <p className="text-4xl font-black mb-1">0 XP</p>
          <p className="text-blue-200 text-sm">Tu punto de partida. ¡Cada pregunta cuenta!</p>
        </div>
        {[
          { step: "1", text: "Ve a Ruta de Aprendizaje → Módulo 1" },
          { step: "2", text: "Responde 10 preguntas diarias" },
          { step: "3", text: "Consulta el Chatbot ante dudas" },
          { step: "4", text: "Haz el simulador completo 2 semanas antes" },
        ].map((s) => (
          <div key={s.step} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200">
            <div className="h-7 w-7 rounded-lg bg-blue-700 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-black">{s.step}</span>
            </div>
            <span className="text-sm font-bold text-gray-800">{s.text}</span>
          </div>
        ))}
      </div>
    ),
  },
]

export default function WelcomePage() {
  const router = useRouter()
  const [slide, setSlide] = React.useState(0)
  const total = SLIDES.length

  const current = SLIDES[slide]
  const isLast = slide === total - 1

  function handleFinish() {
    // CORRECCIÓN: Tras el welcome, te dirige al dashboard (ya con funciones premium). Rompe el bucle de ir a "/"
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
      {/* Skip */}
      <div className="w-full max-w-lg mb-4 flex justify-between items-center">
        <div className="flex gap-1">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === slide ? "w-6 bg-yellow-400" : i < slide ? "w-3 bg-white/60" : "w-3 bg-white/20"
              }`}
            />
          ))}
        </div>
        <button
          onClick={handleFinish}
          className="flex items-center gap-1 text-blue-300 hover:text-white text-sm font-bold transition-colors"
        >
          Omitir guía <X className="h-4 w-4" />
        </button>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-8 shadow-2xl"
          >
            <div className="text-5xl mb-4 text-center">{current.emoji}</div>
            <h2 className="text-2xl font-black text-gray-900 text-center">{current.title}</h2>
            <p className="text-gray-500 text-sm text-center mt-2">{current.subtitle}</p>
            {current.content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4 mt-6 w-full max-w-lg">
        {slide > 0 && (
          <Button
            variant="outline"
            onClick={() => setSlide((s) => s - 1)}
            className="border-white/20 text-white bg-white/10 hover:bg-white/20 gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>
        )}
        <div className="flex-1" />
        {isLast ? (
          <Button
            className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-black py-5 px-8 rounded-2xl border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all"
            onClick={handleFinish}
          >
            <Map className="mr-2 h-5 w-5" /> Ir al Dashboard
          </Button>
        ) : (
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-8 rounded-2xl border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all gap-2"
            onClick={() => setSlide((s) => s + 1)}
          >
            Siguiente <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>

      <p className="text-blue-400 text-xs mt-4">
        {slide + 1} de {total} · Guía de bienvenida
      </p>
    </div>
  )
}