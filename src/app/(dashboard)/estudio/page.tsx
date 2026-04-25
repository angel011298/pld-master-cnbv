"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, BookOpen, GraduationCap, MessageSquare, Target, Scale, AlertTriangle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useUserProfile } from "@/hooks/useUserProfile"

const SECTOR_INFO: Record<string, { name: string; topics: string[]; modules: string[] }> = {
  banca: {
    name: "Banca Múltiple",
    topics: ["Art. 115 LIC y PLD en Banca", "Reportes R01, R12 y R14", "EBR en Banca", "Oficial de Cumplimiento", "KYC Banca", "Comité de Comunicación y Control"],
    modules: ["Marco Jurídico de Banca", "Obligaciones de Reportería", "Órganos Internos Bancarios", "Gestión de Riesgos EBR", "Simulacro Examen Banca"],
  },
  sofom: {
    name: "SOFOM ENR",
    topics: ["LGOAC y PLD SOFOM", "Reportes Trimestrales", "Matriz de Riesgo Simplificada", "Manual PLD SOFOM", "Umbrales relevantes SOFOM"],
    modules: ["Fundamentos SOFOM ENR", "Obligaciones de Reportería", "Gestión de Expedientes", "Simulacro SOFOM"],
  },
  fintech: {
    name: "Fintech (IFC / IFPE)",
    topics: ["LRITF y PLD Fintech", "Activos Virtuales CNBV", "Onboarding Digital", "Geolocalización en PLD", "Reportes Fintech"],
    modules: ["Marco Jurídico Fintech", "Activos Virtuales y PLD", "Identidad Digital y KYC", "Simulacro Fintech"],
  },
  socap: {
    name: "SOCAP / SOFIPO",
    topics: ["LRASCAP y LACP", "Niveles de Operación I-IV", "Identificación Proporcional", "Reportes Mensuales", "Consejo de Administración y PLD"],
    modules: ["Marco Jurídico SOCAP", "Niveles de Operación PLD", "Órganos Internos SOCAP", "Simulacro SOCAP/SOFIPO"],
  },
  "casa-bolsa": {
    name: "Casa de Bolsa",
    topics: ["LMV y PLD Bursátil", "KYC Bursátil (Versado/No Versado)", "Operaciones en Bloque", "Reportes de Mercado", "Auditoría PLD Bursátil"],
    modules: ["Marco Jurídico Bursátil", "Perfil del Cliente Bursátil", "Reportería Bursátil", "Simulacro Casa de Bolsa"],
  },
}

function EstudioContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { profile } = useUserProfile()
  const sectorId = searchParams.get("sector") ?? ""
  const sector = SECTOR_INFO[sectorId]
  const isPremium = profile?.effectiveTier === "premium"

  // VISTA 1: DASHBOARD GENERAL (Cuando no hay sector en la URL)
  if (!sector) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
        {/* Header del Módulo General */}
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            Modo Estudio
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Domina los conceptos clave para tu certificación CNBV. Selecciona un área general o elige tu sector específico.
          </p>
        </div>

        {/* Módulos Transversales / Generales */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
          <Card className="hover:shadow-md transition-all border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Scale className="h-6 w-6 text-blue-700" />
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">Disponible</Badge>
              </div>
              <CardTitle className="mt-4 text-xl">Marco Legal General</CardTitle>
              <CardDescription>Leyes, normativas y disposiciones aplicables a todas las entidades.</CardDescription>
            </CardHeader>
            <CardContent>
              <button className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors">
                Iniciar Lección
              </button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-amber-700" />
                </div>
              </div>
              <CardTitle className="mt-4 text-xl">Enfoque Basado en Riesgo</CardTitle>
              <CardDescription>Metodologías de evaluación y mitigación (EBR) universales.</CardDescription>
            </CardHeader>
            <CardContent>
              <button className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors">
                {isPremium ? "Iniciar Lección" : "Disponible con Premium"}
              </button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <FileText className="h-6 w-6 text-emerald-700" />
                </div>
              </div>
              <CardTitle className="mt-4 text-xl">Tipologías</CardTitle>
              <CardDescription>Casos prácticos documentados sobre Lavado de Dinero y FT.</CardDescription>
            </CardHeader>
            <CardContent>
              <button className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors">
                {isPremium ? "Iniciar Lección" : "Disponible con Premium"}
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Catálogo de Sectores para navegar a la vista específica */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              Estudio Especializado por Sector
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(SECTOR_INFO).map(([key, info]) => (
              <Link href={`/estudio?sector=${key}`} key={key}>
                <Card className="hover:shadow-md transition-all border-slate-200 cursor-pointer h-full hover:border-blue-400 group bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-slate-800 group-hover:text-blue-700 transition-colors">{info.name}</CardTitle>
                    <CardDescription className="text-slate-500">{info.topics.length} temas clave regulados</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // VISTA 2: DASHBOARD ESPECÍFICO DE SECTOR (Mantiene tu funcionalidad actual)
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={() => router.push("/estudio")} variant="outline" size="sm" className="gap-2 text-gray-700 border-gray-300">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            Modo Estudio: <span className="text-blue-700">{sector.name}</span>
          </h1>
          <p className="text-gray-600 text-sm">Contenido filtrado exclusivamente para este sector regulatorio.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: BookOpen, label: "Temas", value: sector.topics.length, color: "text-blue-700", bg: "bg-blue-50" },
          { icon: GraduationCap, label: "Módulos", value: sector.modules.length, color: "text-emerald-700", bg: "bg-emerald-50" },
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ scale: 1.02 }}>
            <Card className="border-2 border-gray-200 hover:border-blue-200 transition-colors">
              <CardContent className="flex flex-col items-center justify-center py-5 gap-2">
                <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{stat.label}</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Topics */}
        <Card className="border-2 border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Temas Clave de {sector.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sector.topics.map((topic, i) => (
              <div key={topic} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="h-6 w-6 rounded-lg bg-blue-700 flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-black">{i + 1}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">{topic}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Modules */}
        <Card className="border-2 border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <GraduationCap className="h-5 w-5 text-emerald-600" />
              Módulos de Estudio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sector.modules.map((mod, i) => (
              <motion.div key={mod} whileHover={{ x: 4 }}>
                <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 bg-white transition-all cursor-pointer group">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <span className="text-emerald-700 text-sm font-black">{i + 1}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800 flex-1">{mod}</span>
                  <GraduationCap className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href={`/simulator?sector=${sectorId}`}>
          <Button className="w-full py-6 text-lg font-black rounded-2xl bg-blue-700 hover:bg-blue-800 text-white border-b-4 border-blue-900 active:border-b-0 active:translate-y-1 transition-all">
            <GraduationCap className="mr-2 h-5 w-5" />
            Simulador: {sector.name}
          </Button>
        </Link>
        <Link href={`/chatbot?sector=${sectorId}`}>
          <Button variant="outline" className="w-full py-6 text-lg font-black rounded-2xl border-2 border-blue-200 text-blue-700 hover:bg-blue-50">
            <MessageSquare className="mr-2 h-5 w-5" />
            Chatbot IA — Preguntar sobre {sector.name}
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function Estudio() {
  return (
    <Suspense fallback={
      <div className="flex h-full w-full items-center justify-center p-8 text-slate-500">
        Cargando módulo de estudio...
      </div>
    }>
      <EstudioContent />
    </Suspense>
  )
}
