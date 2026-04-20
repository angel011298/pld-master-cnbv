"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Calendar, CheckCircle2, XCircle, ArrowRight, Zap, Trophy, Lock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

// ─── Quiz questions ────────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  { q: "¿Cuál es el objetivo principal de la LFPIORPI?", options: ["Prevenir el lavado de dinero", "Regular los bancos", "Controlar el IVA", "Supervisar SOFOMES"], correct: 0 },
  { q: "¿Qué significa EBR en PLD/FT?", options: ["Enfoque Basado en Riesgo", "Estrategia de Banca Regulada", "Evaluación de Bienes Raíces", "Estudio Bancario Regional"], correct: 0 },
  { q: "¿Quién supervisa el cumplimiento de PLD/FT en el sector financiero?", options: ["SAT", "CNBV", "Banco de México", "IMSS"], correct: 1 },
  { q: "¿Cuál es el umbral para reportar operaciones relevantes en efectivo?", options: ["5,000 USD", "10,000 USD", "7,500 USD", "15,000 USD"], correct: 1 },
  { q: "¿Quién es el Oficial de Cumplimiento?", options: ["Director General", "Responsable de PLD ante la CNBV", "Auditor Externo", "Gerente de Riesgos"], correct: 1 },
  { q: "¿Cuántas horas tiene la entidad para reportar una operación inusual urgente?", options: ["12 horas", "24 horas", "48 horas", "72 horas"], correct: 1 },
  { q: "¿Qué es el KYC?", options: ["Know Your Customer", "Key Yield Control", "Know Your Contract", "Key Year Compliance"], correct: 0 },
  { q: "¿Qué documento norma las operaciones de Banca Múltiple en PLD?", options: ["LFPIORPI Art. 17", "Disposiciones CNBV Art. 115 LIC", "Ley del SAT", "Circular Banxico 3/2012"], correct: 1 },
  { q: "¿Qué tipo de reporte es el R01?", options: ["Operaciones Relevantes", "Operaciones Inusuales", "Operaciones Preocupantes", "Operaciones Reservadas"], correct: 1 },
  { q: "¿Cuál es el periodo de conservación mínimo de expedientes en PLD?", options: ["3 años", "5 años", "7 años", "10 años"], correct: 1 },
  { q: "¿Qué significa GAFI?", options: ["Grupo de Acción Financiera Internacional", "Gestión Administrativa Financiera Interna", "Grupo Antilavado Financiero Internacional", "Gestión de Activos Financieros Ilegales"], correct: 0 },
  { q: "¿Cuál es el nombre del reporte de 24 horas?", options: ["R12", "R01", "R14", "R08"], correct: 0 },
  { q: "¿Qué es la UIF?", options: ["Unidad de Inteligencia Financiera", "Unión de Instituciones Financieras", "Unidad de Inspección Fiscal", "Unidad de Información Financiera"], correct: 0 },
  { q: "¿Las SOFOM ENR están reguladas por?", options: ["CNBV directamente", "CONDUSEF", "CNBV mediante LGOAC", "Banco de México"], correct: 2 },
  { q: "¿Qué son las 40 Recomendaciones?", options: ["Reglas del GAFI para PLD/FT", "Recomendaciones del FMI", "Normas ISO financieras", "Criterios del BID"], correct: 0 },
  { q: "¿Qué es una PEP?", options: ["Persona Expuesta Políticamente", "Producto de Exportación Prioritaria", "Persona con Expediente Pendiente", "Plan Empresarial de Prevención"], correct: 0 },
  { q: "¿Cuál es la finalidad del Comité de Comunicación y Control?", options: ["Supervisar préstamos", "Aprobar operaciones sospechosas o inusuales", "Auditar estados financieros", "Controlar el presupuesto"], correct: 1 },
  { q: "¿Qué es el financiamiento al terrorismo (FT)?", options: ["Financiar actividades ilegales en general", "Proveer recursos para actos terroristas", "Evasión fiscal en zonas de conflicto", "Financiar guerras arancelarias"], correct: 1 },
  { q: "¿Qué ley regula las Fintech IFC/IFPE?", options: ["LFPIORPI", "Ley Fintech (LRITF)", "Ley del Mercado de Valores", "LIC"], correct: 1 },
  { q: "¿Cuándo se debe actualizar el expediente de un cliente de alto riesgo?", options: ["Cada 5 años", "Anualmente", "Cada 3 años", "Solo al aperturar"], correct: 1 },
  { q: "¿Qué es la Matriz de Riesgo?", options: ["Documento de activos tóxicos", "Herramienta para evaluar y mitigar riesgos de LA/FT", "Análisis de crédito", "Registro de errores operativos"], correct: 1 },
  { q: "¿Qué organismos forman el Comité de Basilea?", options: ["Bancos centrales y supervisores del G-10/G-20", "Solo el FMI y BM", "La ONU y el G7", "Solo la Reserva Federal"], correct: 0 },
  { q: "¿Qué es el monitoreo transaccional?", options: ["Vigilar las operaciones para detectar comportamientos anómalos", "Revisar créditos", "Controlar cajeros automáticos", "Analizar estados de cuenta trimestrales"], correct: 0 },
  { q: "¿Cuál es el límite para operaciones de efectivo sin identificación?", options: ["200 UDIS", "500 UDIS", "1,000 UDIS", "3,000 UDIS"], correct: 1 },
  { q: "¿Qué significa 'congelamiento de activos'?", options: ["Suspender operaciones con activos relacionados a terrorismo/LA", "Embargo fiscal por deudas", "Bloquear cuentas morosas", "Retener dividendos"], correct: 0 },
  { q: "¿Cuál es el papel del auditor en PLD?", options: ["Emitir cheques", "Revisar el cumplimiento del programa PLD", "Otorgar créditos", "Supervisar empleados"], correct: 1 },
  { q: "¿Qué es la debida diligencia reforzada?", options: ["Proceso intensificado para clientes de alto riesgo", "Proceso estándar para todos los clientes", "Solo para clientes VIP", "Verificación de crédito hipotecario"], correct: 0 },
  { q: "¿Qué entidad emite las disposiciones de carácter general para PLD en banca?", options: ["Banco de México", "CNBV", "SHCP", "UIF"], correct: 1 },
  { q: "¿Cada cuánto debe capacitarse el personal en PLD/FT?", options: ["Una sola vez", "Cada 6 meses", "Al menos una vez al año", "Cada 3 años"], correct: 2 },
  { q: "¿Qué información mínima debe contener el expediente de un cliente?", options: ["Solo nombre y RFC", "Identificación, domicilio, actividad económica y origen de fondos", "Solo CURP", "Únicamente firma y foto"], correct: 1 },
]

type Step = "welcome" | "date" | "quiz" | "challenge" | "paywall"

const EXAM_DATES = [
  { value: "2026-06-27", label: "27 de junio 2026", daysLeft: Math.ceil((new Date("2026-06-27").getTime() - Date.now()) / 86400000) },
  { value: "2026-10-24", label: "24 de octubre 2026", daysLeft: Math.ceil((new Date("2026-10-24").getTime() - Date.now()) / 86400000) },
]

export default function IndividualOnboarding() {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>("welcome")
  const [examDate, setExamDate] = React.useState<string | null>(null)
  const [quizIdx, setQuizIdx] = React.useState(0)
  const [selected, setSelected] = React.useState<number | null>(null)
  const [confirmed, setConfirmed] = React.useState(false)
  const [correct, setCorrect] = React.useState(0)
  const [showResult, setShowResult] = React.useState(false)
  const [xpEarned, setXpEarned] = React.useState(0)
  const [saving, setSaving] = React.useState(false)

  const current = QUIZ_QUESTIONS[quizIdx]
  const progress = ((quizIdx + (confirmed ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100

  function handleAnswer(idx: number) {
    if (confirmed) return
    setSelected(idx)
  }

  function handleConfirm() {
    if (selected === null || confirmed) return
    setConfirmed(true)
    setShowResult(true)
    if (selected === current.correct) setCorrect((c) => c + 1)
  }

  async function handleNext() {
    setShowResult(false)
    setSelected(null)
    setConfirmed(false)
    if (quizIdx + 1 >= QUIZ_QUESTIONS.length) {
      const earned = 50
      setXpEarned(earned)
      // Save XP and exam date to profile
      setSaving(true)
      try {
        const sb = supabase()
        const { data: { session } } = await sb.auth.getSession()
        if (session?.user?.id) {
          await sb.from("user_profiles").upsert({
            user_id: session.user.id,
            total_xp: earned,
            exam_date: examDate,
            onboarding_completed: true,
          }, { onConflict: "user_id" })
        }
      } catch {/* noop */} finally {
        setSaving(false)
      }
      setStep("challenge")
    } else {
      setQuizIdx((i) => i + 1)
    }
  }

  async function handleChallenge() {
    setStep("paywall")
  }

  async function handleCheckout() {
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: "individual" }) })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {/* noop */}
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-xl bg-yellow-400 flex items-center justify-center">
            <Shield className="h-6 w-6 text-blue-900" />
          </div>
          <span className="text-2xl font-black text-white">Certifik PLD</span>
        </div>

        <AnimatePresence mode="wait">

          {/* ── WELCOME ── */}
          {step === "welcome" && (
            <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-3xl p-8 shadow-2xl text-center">
              <div className="h-20 w-20 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-2">¡Bienvenido a Certifik PLD!</h1>
              <p className="text-gray-600 mb-6">Vas a prepararte para el examen de certificación de PLD/FT de la CNBV. Primero, selecciona tu fecha de examen.</p>
              <Button className="w-full py-6 text-lg font-black rounded-2xl bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setStep("date")}>
                Comenzar <ArrowRight className="ml-2" />
              </Button>
            </motion.div>
          )}

          {/* ── EXAM DATE ── */}
          {step === "date" && (
            <motion.div key="date" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-yellow-400 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-900" />
                </div>
                <h2 className="text-xl font-black text-gray-900">Selecciona la fecha de tu examen</h2>
              </div>
              <div className="space-y-3 mb-6">
                {EXAM_DATES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setExamDate(d.value)}
                    className={cn(
                      "w-full p-5 rounded-2xl border-3 border-2 text-left transition-all",
                      examDate === d.value
                        ? "border-blue-600 bg-blue-50 shadow-md shadow-blue-100"
                        : "border-gray-200 hover:border-blue-300 bg-white"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-gray-900">{d.label}</span>
                      <span className="text-sm font-bold text-blue-600">{d.daysLeft} días</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Convocatoria CNBV 2026</p>
                  </button>
                ))}
              </div>
              <Button
                className="w-full py-6 text-lg font-black rounded-2xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40"
                disabled={!examDate}
                onClick={() => setStep("quiz")}
              >
                Continuar <ArrowRight className="ml-2" />
              </Button>
            </motion.div>
          )}

          {/* ── QUIZ ── */}
          {step === "quiz" && (
            <motion.div key={`quiz-${quizIdx}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="bg-white rounded-3xl p-8 shadow-2xl">
              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-500">{quizIdx + 1} / {QUIZ_QUESTIONS.length}</span>
                  <span className="flex items-center gap-1 text-sm font-bold text-yellow-600">
                    <Zap className="h-4 w-4" /> {correct} correctas
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              <h2 className="text-lg font-black text-gray-900 mb-5">{current.q}</h2>

              <div className="space-y-3 mb-6">
                {current.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={confirmed}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 text-left text-sm font-bold transition-all",
                      !confirmed && selected === i ? "border-blue-500 bg-blue-50 text-blue-700" :
                      !confirmed ? "border-gray-200 text-gray-700 hover:border-blue-300" :
                      i === current.correct ? "border-green-500 bg-green-50 text-green-700" :
                      selected === i ? "border-red-400 bg-red-50 text-red-600" :
                      "border-gray-100 text-gray-400"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      {confirmed && i === current.correct && <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />}
                      {confirmed && selected === i && i !== current.correct && <XCircle className="h-5 w-5 text-red-400 shrink-0" />}
                      {opt}
                    </span>
                  </button>
                ))}
              </div>

              {!confirmed ? (
                <Button
                  className="w-full py-5 font-black rounded-2xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40"
                  disabled={selected === null}
                  onClick={handleConfirm}
                >
                  Verificar
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className={cn(
                    "p-4 rounded-2xl border-2 text-center font-black",
                    selected === current.correct ? "bg-green-50 border-green-300 text-green-700" : "bg-red-50 border-red-200 text-red-600"
                  )}>
                    {selected === current.correct ? "✅ ¡Correcto!" : "❌ Incorrecto — sigue practicando"}
                  </div>
                  <Button
                    className="w-full py-5 font-black rounded-2xl bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleNext}
                    disabled={saving}
                  >
                    {quizIdx + 1 >= QUIZ_QUESTIONS.length ? (saving ? "Guardando..." : "Ver mis resultados") : "Siguiente →"}
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* ── CHALLENGE ── */}
          {step === "challenge" && (
            <motion.div key="challenge" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-8 shadow-2xl text-center">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">¡Excelente arranque!</h2>
              <p className="text-gray-600 mb-4">Respondiste <strong>{correct}/30</strong> preguntas correctamente.</p>
              <div className="flex items-center justify-center gap-2 mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.3 }}
                  className="flex items-center gap-2 bg-yellow-400 text-blue-900 font-black text-2xl px-6 py-3 rounded-2xl"
                >
                  <Zap className="h-6 w-6" /> +{xpEarned} XP
                </motion.div>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6">
                <p className="text-blue-800 font-bold text-sm">Fecha de examen: <span className="text-blue-600">{EXAM_DATES.find(d => d.value === examDate)?.label}</span></p>
              </div>
              <Button
                className="w-full py-6 text-lg font-black rounded-2xl bg-blue-600 hover:bg-blue-700 text-white border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
                onClick={handleChallenge}
              >
                🎯 Aceptar Desafío: Certificarme en 2026
              </Button>
            </motion.div>
          )}

          {/* ── PAYWALL ── */}
          {step === "paywall" && (
            <motion.div key="paywall" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="h-16 w-16 rounded-2xl bg-yellow-400 flex items-center justify-center mx-auto mb-3">
                  <Star className="h-8 w-8 text-blue-900" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Hazte Premium</h2>
                <p className="text-gray-600 mt-1">Desbloquea todos los módulos y aprueba tu examen</p>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-black">$2,999</span>
                  <span className="text-blue-200 text-sm">MXN IVA incluido</span>
                </div>
                <ul className="space-y-2">
                  {[
                    "✅ +2,500 reactivos CENEVAL",
                    "✅ 5 módulos completos de estudio",
                    "✅ Chatbot IA regulatorio 24/7",
                    "✅ Simulador de examen oficial",
                    "✅ Guías descargables en PDF",
                    "✅ Soporte hasta aprobar",
                  ].map((f) => (
                    <li key={f} className="text-sm font-medium text-blue-100">{f}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <Lock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-bold text-gray-700">Marco Jurídico Avanzado</p>
                    <p className="text-xs text-gray-500">Módulo Premium — desbloqueado al pagar</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <Lock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-bold text-gray-700">EBR y Auditoría</p>
                    <p className="text-xs text-gray-500">Módulo Premium — desbloqueado al pagar</p>
                  </div>
                </div>
              </div>

              <Button
                className="w-full py-6 text-lg font-black rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-blue-900 border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all"
                onClick={handleCheckout}
              >
                💳 Pagar $2,999 MXN con Stripe
              </Button>
              <button
                className="w-full mt-3 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => router.push("/")}
              >
                Continuar con la versión gratuita →
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
