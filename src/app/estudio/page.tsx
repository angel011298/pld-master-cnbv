"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, BookOpen, GraduationCap, MessageSquare, Target, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

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

// CORRECCIÓN: Cambiamos el nombre de EstudioPage a EstudioContent
function EstudioContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sectorId = searchParams.get("sector") ?? ""
  const sector = SECTOR_INFO[sectorId]

  if (!sector) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-2xl font-black text-gray-700 mb-4">Sector no encontrado</h1>
        <Button onClick={() => router.push("/entities")} variant="outline">
          Volver a Entidades
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/entities">
          <Button variant="outline" size="sm" className="gap-2 text-gray-700 border-gray-300">
            <ArrowLeft className="h-4 w-4" /> Entidades
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            Modo Estudio: <span className="text-blue-700">{sector.name}</span>
          </h1>
          <p className="text-gray-600 text-sm">Contenido filtrado exclusivamente para este sector regulatorio.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: "Temas", value: sector.topics.length, color: "text-blue-700", bg: "bg-blue-50" },
          { icon: GraduationCap, label: "Módulos", value: sector.modules.length, color: "text-emerald-700", bg: "bg-emerald-50" },
          { icon: Target, label: "Reactivos", value: "150+", color: "text-indigo-700", bg: "bg-indigo-50" },
          { icon: Zap, label: "XP disponible", value: "500", color: "text-yellow-700", bg: "bg-yellow-50" },
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

// Este es el envoltorio que Next.js exige, ahora coincidiendo con el nombre correcto
export default function Estudio() {
  return (
    <Suspense fallback={
      <div className="flex h-full w-full items-center justify-center p-8 text-muted-foreground">
        Cargando módulo de estudio...
      </div>
    }>
      <EstudioContent />
    </Suspense>
  )
}