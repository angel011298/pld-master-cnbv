"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Globe, GraduationCap, MessageSquare, BookOpen,
  Shield, Users, FileText, AlertTriangle, Scale, ChevronDown,
  Gamepad2, Zap, Target,
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/* ─── Types ─────────────────────────────────────────────────────────── */
interface RecContent {
  tipo?: string
  numero?: number
  titulo?: string
  texto_oficial_parafraseado?: string
  nota_interpretativa?: string
  explicacion_resumida?: string
  vital_examen?: boolean
  elementos_clave?: string[]
  aplicacion_mexico?: string
  importancia_examen?: string
  fundamento_mexico?: string
}

interface ContentItem {
  tipo: string
  subtema?: string
  contenido: {
    titulo?: string
    cuerpo?: RecContent[]
    [key: string]: unknown
  }
}

/* ─── Static data ────────────────────────────────────────────────────── */
const PILLARS = [
  {
    code: "R.1 – R.2",
    title: "Políticas y Coordinación",
    color: "bg-violet-600",
    bgLight: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    icon: Shield,
    recs: [
      { num: 1,  n: "R.1",  label: "Evaluación de riesgos y enfoque basado en riesgos (EBR)" },
      { num: 2,  n: "R.2",  label: "Cooperación y coordinación nacional en PLD/FT" },
    ],
  },
  {
    code: "R.3 – R.8",
    title: "Lavado de Activos, FT y Proliferación",
    color: "bg-rose-600",
    bgLight: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    icon: AlertTriangle,
    recs: [
      { num: 3,  n: "R.3",  label: "Delito de lavado de activos" },
      { num: 4,  n: "R.4",  label: "Decomiso y medidas provisionales" },
      { num: 5,  n: "R.5",  label: "Delito de financiamiento del terrorismo" },
      { num: 6,  n: "R.6",  label: "Sanciones financieras dirigidas — terrorismo" },
      { num: 7,  n: "R.7",  label: "Sanciones financieras dirigidas — proliferación" },
      { num: 8,  n: "R.8",  label: "Organizaciones sin fines de lucro" },
    ],
  },
  {
    code: "R.9 – R.23",
    title: "Medidas Preventivas",
    color: "bg-blue-600",
    bgLight: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    icon: FileText,
    recs: [
      { num: 9,  n: "R.9",  label: "Leyes sobre secreto de instituciones financieras" },
      { num: 10, n: "R.10", label: "Debida diligencia del cliente (DDC / KYC)" },
      { num: 11, n: "R.11", label: "Conservación de registros" },
      { num: 12, n: "R.12", label: "Personas Políticamente Expuestas (PEP)" },
      { num: 13, n: "R.13", label: "Banca corresponsal" },
      { num: 14, n: "R.14", label: "Servicios de transferencia de dinero o valores" },
      { num: 15, n: "R.15", label: "Nuevas tecnologías y activos virtuales" },
      { num: 16, n: "R.16", label: "Transferencias electrónicas de fondos" },
      { num: 17, n: "R.17", label: "Confianza en terceros" },
      { num: 18, n: "R.18", label: "Controles internos y sucursales en el extranjero" },
      { num: 19, n: "R.19", label: "Países de mayor riesgo" },
      { num: 20, n: "R.20", label: "Reporte de operaciones sospechosas (ROS)" },
      { num: 21, n: "R.21", label: "Confidencialidad y tipping-off" },
      { num: 22, n: "R.22", label: "APNFD: DDC y conservación de registros" },
      { num: 23, n: "R.23", label: "APNFD: Otras medidas preventivas" },
    ],
  },
  {
    code: "R.24 – R.40",
    title: "Transparencia, Supervisión y Cooperación",
    color: "bg-teal-600",
    bgLight: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-700",
    icon: Users,
    recs: [
      { num: 24, n: "R.24", label: "Transparencia y beneficiario final de personas jurídicas" },
      { num: 25, n: "R.25", label: "Transparencia y beneficiario final de estructuras jurídicas" },
      { num: 26, n: "R.26", label: "Regulación y supervisión de instituciones financieras" },
      { num: 27, n: "R.27", label: "Facultades de los supervisores" },
      { num: 28, n: "R.28", label: "Regulación y supervisión de APNFD" },
      { num: 29, n: "R.29", label: "Unidades de inteligencia financiera" },
      { num: 30, n: "R.30", label: "Responsabilidades de autoridades policiales e investigativas" },
      { num: 31, n: "R.31", label: "Poderes de autoridades policiales e investigativas" },
      { num: 32, n: "R.32", label: "Transporte de efectivo y portadores" },
      { num: 33, n: "R.33", label: "Estadísticas" },
      { num: 34, n: "R.34", label: "Directrices y retroalimentación" },
      { num: 35, n: "R.35", label: "Sanciones" },
      { num: 36, n: "R.36", label: "Instrumentos internacionales" },
      { num: 37, n: "R.37", label: "Asistencia jurídica mutua" },
      { num: 38, n: "R.38", label: "Asistencia jurídica mutua — congelamiento y decomiso" },
      { num: 39, n: "R.39", label: "Extradición" },
      { num: 40, n: "R.40", label: "Otras formas de cooperación internacional" },
    ],
  },
]

const KEY_TOPICS = [
  "EBR: El Enfoque Basado en Riesgos es la columna vertebral del estándar GAFI",
  "DDC/KYC (R.10): identificación del cliente, verificación y monitoreo continuo",
  "PEP (R.12): diligencia reforzada para personas políticamente expuestas",
  "ROS (R.20): obligación de reportar operaciones sospechosas a la UIF",
  "Activos Virtuales (R.15): VASP, exchange y wallet providers como sujetos obligados",
  "Beneficiario final (R.24-25): identificar quién controla realmente una entidad",
  "Transferencias (R.16): regla del viajero (travel rule) en pagos internacionales",
  "Evaluación mutua: el GAFI evalúa a México periódicamente (efectividad técnica)",
]

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.38, ease: "easeOut" },
  }),
}

/* ─── Component ──────────────────────────────────────────────────────── */
export default function GafiPage() {
  const [recMap, setRecMap] = useState<Record<number, RecContent>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/educational-content?bloque=2")
      .then((r) => r.json())
      .then((data: { content: ContentItem[] }) => {
        const map: Record<number, RecContent> = {}
        // Each explicacion block has contenido.cuerpo[] with nested recomendacion objects
        for (const item of data.content ?? []) {
          const cuerpo = item.contenido?.cuerpo
          if (Array.isArray(cuerpo)) {
            for (const block of cuerpo) {
              if (block.tipo === "recomendacion" && block.numero) {
                map[block.numero] = block
              }
            }
          }
        }
        setRecMap(map)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-12">

      {/* ── HERO ── */}
      <motion.div
        custom={0} variants={fadeUp} initial="hidden" animate="visible"
        className="rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-700 p-6 md:p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Globe className="absolute right-4 top-4 h-56 w-56 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Globe className="h-5 w-5" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-wider">
                Estándar Internacional
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
              40 Recomendaciones GAFI
            </h1>
            <p className="mt-2 text-teal-100 text-base font-medium max-w-xl">
              El estándar global contra el Lavado de Dinero y el Financiamiento
              al Terrorismo. Base del sistema PLD/FT de México y la CNBV.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            {[
              { n: "40",   label: "Recomendaciones" },
              { n: "4",    label: "Pilares temáticos" },
              { n: "200+", label: "Países adoptaron" },
              { n: "1989", label: "Año de creación" },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 rounded-xl p-3 text-center">
                <p className="text-2xl font-black">{s.n}</p>
                <p className="text-[11px] font-semibold text-teal-100 mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── ACCIONES RÁPIDAS ── */}
      <motion.div
        custom={1} variants={fadeUp} initial="hidden" animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        <Link href="/simulator">
          <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-teal-200 bg-teal-50 hover:border-teal-400 hover:bg-teal-100 transition-all cursor-pointer group">
            <div className="h-10 w-10 rounded-xl bg-teal-600 flex items-center justify-center shrink-0">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-teal-800 text-sm">Practicar con Simulador CENEVAL</p>
              <p className="text-xs text-teal-600 font-medium mt-0.5">Preguntas específicas sobre GAFI y las 40 Recomendaciones</p>
            </div>
          </div>
        </Link>
        <Link href="/chatbot?topic=GAFI">
          <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-cyan-200 bg-cyan-50 hover:border-cyan-400 hover:bg-cyan-100 transition-all cursor-pointer group">
            <div className="h-10 w-10 rounded-xl bg-cyan-600 flex items-center justify-center shrink-0">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-cyan-800 text-sm">Preguntar al Chatbot IA sobre GAFI</p>
              <p className="text-xs text-cyan-600 font-medium mt-0.5">Consulta cualquier recomendación con contexto del documento</p>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* ── PRACTICAR LAS 40 RECOMENDACIONES ── */}
      <motion.div
        custom={2} variants={fadeUp} initial="hidden" animate="visible"
        className="rounded-2xl border-2 border-teal-300 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 overflow-hidden shadow-sm"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-teal-200 bg-white/60">
          <div className="h-10 w-10 rounded-xl bg-teal-600 flex items-center justify-center shrink-0">
            <Gamepad2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-teal-900 text-base leading-tight">
              Practica el dominio de las 40 Recomendaciones
            </p>
            <p className="text-xs text-teal-600 font-medium mt-0.5">
              Contenido teórico · Ejercicios interactivos · Quiz tipo CENEVAL
            </p>
          </div>
          <Badge className="bg-teal-100 text-teal-700 border-teal-300 text-xs font-black shrink-0">
            BLOQUE 2
          </Badge>
        </div>

        {/* Exercise types */}
        <div className="px-6 py-4">
          <p className="text-[11px] font-black text-teal-700 uppercase tracking-wider mb-3">
            Formatos de práctica disponibles
          </p>
          <div className="flex flex-wrap gap-2 mb-5">
            {[
              { label: "Opción múltiple CENEVAL", color: "bg-blue-100 text-blue-800 border-blue-200" },
              { label: "Sopa de letras",           color: "bg-violet-100 text-violet-800 border-violet-200" },
              { label: "Crucigrama",               color: "bg-rose-100 text-rose-800 border-rose-200" },
              { label: "Caso práctico",             color: "bg-amber-100 text-amber-800 border-amber-200" },
              { label: "Relacionar conceptos",      color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
              { label: "Completar espacios",        color: "bg-orange-100 text-orange-800 border-orange-200" },
            ].map((tag) => (
              <span key={tag.label} className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full border", tag.color)}>
                {tag.label}
              </span>
            ))}
          </div>

          {/* 3 action buttons — same tabs as Modo Estudio */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/estudio/bloque/2?tab=teoria">
              <Button variant="outline" className="w-full h-12 border-2 border-teal-300 text-teal-800 hover:bg-teal-100 font-bold gap-2 rounded-xl">
                <BookOpen className="h-4 w-4 shrink-0" />
                Contenido Teórico
              </Button>
            </Link>
            <Link href="/estudio/bloque/2?tab=ejercicios">
              <Button variant="outline" className="w-full h-12 border-2 border-violet-300 text-violet-800 hover:bg-violet-50 font-bold gap-2 rounded-xl">
                <Gamepad2 className="h-4 w-4 shrink-0" />
                Ejercicios
              </Button>
            </Link>
            <Link href="/estudio/bloque/2?tab=practicar">
              <Button className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-black gap-2 rounded-xl border-b-4 border-teal-800 active:border-b-0 active:translate-y-0.5 transition-all">
                <Target className="h-4 w-4 shrink-0" />
                Practicar Quiz
              </Button>
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-teal-200">
            {[
              { icon: Zap,        value: "123",  label: "Preguntas CENEVAL" },
              { icon: Gamepad2,   value: "6",    label: "Ejercicios interactivos" },
              { icon: Target,     value: "40",   label: "Recomendaciones cubiertas" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-teal-700">
                <Icon className="h-3.5 w-3.5 shrink-0 text-teal-500" />
                <span className="text-sm font-black">{value}</span>
                <span className="text-xs text-teal-600 hidden sm:inline">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── 4 PILARES INTERACTIVOS ── */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="h-5 w-5 text-teal-600" />
          <h2 className="text-xl font-bold text-slate-900">Las 40 Recomendaciones GAFI</h2>
          {loading && (
            <span className="text-xs text-slate-400 font-normal ml-1 animate-pulse">Cargando contenido…</span>
          )}
        </div>
        <p className="text-sm text-slate-500 mb-5 -mt-3">
          Haz clic en cualquier recomendación para ver su texto completo, nota interpretativa y explicación para el examen.
        </p>

        <div className="flex flex-col gap-5">
          {PILLARS.map((pillar, pi) => (
            <motion.div key={pillar.code} custom={4 + pi} variants={fadeUp} initial="hidden" animate="visible">
              <div className={cn("rounded-2xl border-2 overflow-hidden shadow-sm", pillar.border)}>
                {/* Pillar header */}
                <div className={cn("flex items-center gap-3 px-5 py-4", pillar.color)}>
                  <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <pillar.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-white/70 uppercase tracking-widest">{pillar.code}</p>
                    <p className="text-base font-bold text-white leading-tight">{pillar.title}</p>
                  </div>
                  <span className="ml-auto text-xs font-semibold text-white/60 bg-white/10 rounded-full px-3 py-1">
                    {pillar.recs.length} recomendaciones
                  </span>
                </div>

                {/* Individual recs */}
                <div className="divide-y divide-slate-100 bg-white">
                  {pillar.recs.map((rec) => {
                    const data = recMap[rec.num]
                    const isVital = data?.vital_examen === true
                    return (
                      <details key={rec.num} className="group">
                        <summary className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-slate-50 list-none select-none transition-colors">
                          {/* Number circle */}
                          <span className={cn(
                            "shrink-0 h-7 w-7 rounded-full text-white text-[11px] font-black flex items-center justify-center",
                            isVital ? "bg-amber-500" : pillar.color,
                          )}>
                            {rec.num}
                          </span>
                          {/* Code + label */}
                          <div className="flex-1 min-w-0">
                            <span className={cn("text-[10px] font-black uppercase tracking-wider mr-1.5", pillar.text)}>
                              {rec.n}
                            </span>
                            <span className="text-sm font-semibold text-slate-800">{rec.label}</span>
                          </div>
                          {/* VITAL badge */}
                          {isVital && (
                            <span className="shrink-0 hidden sm:flex text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 rounded-full px-2.5 py-0.5 items-center gap-1">
                              ⭐ VITAL
                            </span>
                          )}
                          {/* Chevron */}
                          <ChevronDown className={cn(
                            "h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180",
                            pillar.text,
                          )} />
                        </summary>

                        {/* Expanded content */}
                        <div className="px-5 pb-5 pt-3 bg-slate-50 space-y-3">
                          {data ? (
                            <>
                              {/* Texto oficial */}
                              {!!data.texto_oficial_parafraseado && (
                                <div className="rounded-xl bg-white border border-slate-200 p-4">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                                    📋 Texto de la Recomendación
                                  </p>
                                  <p className="text-sm text-slate-700 leading-relaxed">{data.texto_oficial_parafraseado}</p>
                                </div>
                              )}

                              {/* Nota interpretativa */}
                              {!!data.nota_interpretativa && (
                                <div className="rounded-xl bg-purple-50 border border-purple-200 p-4">
                                  <p className="text-[10px] font-black text-purple-500 uppercase tracking-wider mb-2">
                                    📖 Nota Interpretativa
                                  </p>
                                  <p className="text-sm text-purple-800 leading-relaxed">{data.nota_interpretativa}</p>
                                </div>
                              )}

                              {/* Explicación resumida */}
                              {!!data.explicacion_resumida && (
                                <div className="rounded-xl bg-teal-50 border border-teal-200 p-4">
                                  <p className="text-[10px] font-black text-teal-600 uppercase tracking-wider mb-2">
                                    💡 Explicación sencilla
                                  </p>
                                  <p className="text-sm text-teal-800 leading-relaxed">{data.explicacion_resumida}</p>
                                </div>
                              )}

                              {/* Elementos clave */}
                              {Array.isArray(data.elementos_clave) && data.elementos_clave.length > 0 && (
                                <div className="rounded-xl bg-white border border-slate-200 p-4">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                                    🔑 Elementos clave
                                  </p>
                                  <ul className="space-y-1.5">
                                    {data.elementos_clave.map((el, k) => (
                                      <li key={k} className="flex items-start gap-2 text-sm text-slate-700">
                                        <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
                                        {el}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Aplicación en México */}
                              {!!data.aplicacion_mexico && (
                                <div className="rounded-xl bg-green-50 border border-green-200 p-4">
                                  <p className="text-[10px] font-black text-green-600 uppercase tracking-wider mb-2">
                                    🇲🇽 Aplicación en México
                                  </p>
                                  <p className="text-sm text-green-800 leading-relaxed">{data.aplicacion_mexico}</p>
                                </div>
                              )}

                              {/* Importancia examen */}
                              {!!data.importancia_examen && (
                                <div className={cn(
                                  "rounded-xl p-4 border",
                                  isVital ? "bg-amber-50 border-amber-300" : "bg-white border-slate-200",
                                )}>
                                  <p className={cn(
                                    "text-[10px] font-black uppercase tracking-wider mb-2",
                                    isVital ? "text-amber-600" : "text-slate-400",
                                  )}>
                                    📝 {isVital ? "⭐ VITAL — " : ""}Importancia para el examen CNBV
                                  </p>
                                  <p className={cn(
                                    "text-sm leading-relaxed font-medium",
                                    isVital ? "text-amber-800" : "text-slate-700",
                                  )}>
                                    {data.importancia_examen}
                                  </p>
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-slate-400 italic py-1">
                              {loading ? "Cargando contenido…" : "Contenido detallado no disponible para esta recomendación."}
                            </p>
                          )}
                        </div>
                      </details>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── TEMAS CLAVE PARA EL EXAMEN ── */}
      <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="border-2 border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-800 text-lg">
              <BookOpen className="h-5 w-5 text-amber-600" />
              Lo más importante para el Examen CENEVAL
            </CardTitle>
            <CardDescription className="text-amber-700 font-medium">
              Conceptos GAFI que aparecen frecuentemente en el simulacro certificado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {KEY_TOPICS.map((topic, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-white rounded-lg px-3 py-2.5 border border-amber-100">
                  <div className="h-5 w-5 rounded-full bg-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-[10px] font-black">{i + 1}</span>
                  </div>
                  <p className="text-sm text-slate-700 font-medium leading-snug">{topic}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

    </div>
  )
}
