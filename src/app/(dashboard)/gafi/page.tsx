"use client"

import { motion } from "framer-motion"
import {
  Globe, GraduationCap, MessageSquare, BookOpen, ChevronRight,
  Shield, Users, FileText, AlertTriangle, Scale, Link2
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const PILLARS = [
  {
    code: "R1–R2",
    title: "Políticas y Coordinación",
    color: "bg-violet-600",
    bgLight: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    icon: Shield,
    recs: [
      { n: "R.1", label: "Evaluación de riesgos y enfoque basado en riesgos (EBR)" },
      { n: "R.2", label: "Cooperación y coordinación nacional en PLD/FT" },
    ],
  },
  {
    code: "R3–R8",
    title: "Lavado de Activos, FT y Proliferación",
    color: "bg-rose-600",
    bgLight: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    icon: AlertTriangle,
    recs: [
      { n: "R.3", label: "Delito de lavado de activos" },
      { n: "R.4", label: "Decomiso y medidas provisionales" },
      { n: "R.5", label: "Delito de financiamiento del terrorismo" },
      { n: "R.6", label: "Sanciones financieras dirigidas (terrorismo)" },
      { n: "R.7", label: "Sanciones financieras dirigidas (proliferación)" },
      { n: "R.8", label: "Organizaciones sin fines de lucro" },
    ],
  },
  {
    code: "R9–R23",
    title: "Medidas Preventivas",
    color: "bg-blue-600",
    bgLight: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    icon: FileText,
    recs: [
      { n: "R.9", label: "Leyes sobre secreto de instituciones financieras" },
      { n: "R.10", label: "Debida diligencia del cliente (DDC/KYC)" },
      { n: "R.11", label: "Conservación de registros" },
      { n: "R.12", label: "Personas Políticamente Expuestas (PEP)" },
      { n: "R.13", label: "Banca corresponsal" },
      { n: "R.15", label: "Nuevas tecnologías y activos virtuales" },
      { n: "R.16", label: "Transferencias electrónicas de fondos" },
      { n: "R.20", label: "Reporte de operaciones sospechosas (ROS)" },
      { n: "R.21", label: "Confidencialidad y tipping-off" },
      { n: "R.22–R.23", label: "APNFD: Medidas preventivas para sujetos no financieros" },
    ],
  },
  {
    code: "R24–R40",
    title: "Transparencia, Supervisión y Cooperación",
    color: "bg-teal-600",
    bgLight: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-700",
    icon: Users,
    recs: [
      { n: "R.24", label: "Transparencia y beneficiario final de personas jurídicas" },
      { n: "R.25", label: "Transparencia y beneficiario final de estructuras jurídicas" },
      { n: "R.26–R.28", label: "Regulación y supervisión de instituciones financieras y APNFD" },
      { n: "R.29–R.32", label: "Poderes y responsabilidades de las autoridades" },
      { n: "R.33–R.34", label: "Estadísticas y directrices" },
      { n: "R.35–R.36", label: "Sanciones y convenios internacionales" },
      { n: "R.37–R.40", label: "Asistencia jurídica mutua y cooperación internacional" },
    ],
  },
]

const KEY_TOPICS_FOR_EXAM = [
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
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.38, ease: "easeOut" },
  }),
}

export default function GafiPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-12">

      {/* ——— HERO ——— */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
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
              { n: "40", label: "Recomendaciones" },
              { n: "4",  label: "Pilares temáticos" },
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

      {/* ——— ACCIONES RÁPIDAS ——— */}
      <motion.div
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        <Link href="/simulator">
          <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-teal-200 bg-teal-50 hover:border-teal-400 hover:bg-teal-100 transition-all cursor-pointer group">
            <div className="h-10 w-10 rounded-xl bg-teal-600 flex items-center justify-center shrink-0">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-teal-800 text-sm">Practicar con Simulador CENEVAL</p>
              <p className="text-xs text-teal-600 font-medium mt-0.5">
                Busca "GAFI" en el temario para preguntas específicas
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-teal-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>
        </Link>
        <Link href="/chatbot?topic=GAFI">
          <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-cyan-200 bg-cyan-50 hover:border-cyan-400 hover:bg-cyan-100 transition-all cursor-pointer group">
            <div className="h-10 w-10 rounded-xl bg-cyan-600 flex items-center justify-center shrink-0">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-cyan-800 text-sm">Preguntar al Chatbot IA sobre GAFI</p>
              <p className="text-xs text-cyan-600 font-medium mt-0.5">
                Consulta cualquier recomendación con contexto del documento
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-cyan-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>
        </Link>
      </motion.div>

      {/* ——— 4 PILARES ——— */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Scale className="h-5 w-5 text-teal-600" />
          Los 4 Pilares del Estándar GAFI
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {PILLARS.map((pillar, i) => (
            <motion.div key={pillar.code} custom={3 + i} variants={fadeUp} initial="hidden" animate="visible">
              <Card className={cn("border-2 h-full", pillar.border)}>
                <CardHeader className={cn("pb-3 rounded-t-xl", pillar.bgLight)}>
                  <div className="flex items-center gap-3">
                    <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", pillar.color)}>
                      <pillar.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <Badge className={cn("text-[10px] font-black uppercase tracking-wider mb-1 border-0", pillar.bgLight, pillar.text)}>
                        {pillar.code}
                      </Badge>
                      <CardTitle className={cn("text-base leading-tight", pillar.text)}>
                        {pillar.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 space-y-1.5">
                  {pillar.recs.map((rec) => (
                    <div key={rec.n} className="flex items-start gap-2 text-sm">
                      <span className={cn("shrink-0 text-[11px] font-black pt-0.5 min-w-[2.5rem]", pillar.text)}>
                        {rec.n}
                      </span>
                      <span className="text-slate-600 font-medium leading-snug">{rec.label}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ——— TEMAS CLAVE PARA EL EXAMEN ——— */}
      <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
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
              {KEY_TOPICS_FOR_EXAM.map((topic, i) => (
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

      {/* ——— FUENTE OFICIAL ——— */}
      <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600">
          <Link2 className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="font-medium">
            Documento oficial disponible para el Chatbot IA — El texto completo de las
            40 Recomendaciones está indexado como documento global en Certifik PLD.
          </span>
        </div>
      </motion.div>

    </div>
  )
}
