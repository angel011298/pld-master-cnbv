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
import { cn } from "@/lib/utils"
import { CNBV_SYLLABUS } from "@/lib/constants"

// Catálogo completo alineado con entities/page.tsx
const SECTOR_INFO: Record<string, { name: string; topics: string[]; modules: string[] }> = {
  "banca-multiple": { name: "Banca Múltiple", topics: ["Art. 115 LIC", "Reportes R01, R12 y R14", "EBR Banca"], modules: ["Marco Jurídico", "Reportería Bancaria"] },
  "banca-desarrollo": { name: "Banca de Desarrollo", topics: ["Art. 115 LIC", "Fomento Económico", "EBR Banca"], modules: ["Marco Jurídico", "Desarrollo Nacional"] },
  "sofom-enr": { name: "SOFOM ENR", topics: ["LGOAC", "Reportes Trimestrales", "Matriz de Riesgo"], modules: ["Fundamentos SOFOM"] },
  "sofom-er": { name: "SOFOM ER", topics: ["LGOAC Regulada", "Reportes Mensuales", "EBR"], modules: ["Cumplimiento SOFOM ER"] },
  "ifpe": { name: "Fondos de Pago Electrónico (IFPE)", topics: ["LRITF", "Activos Virtuales", "Onboarding Digital"], modules: ["Fintech PLD"] },
  "ifc": { name: "Financiamiento Colectivo (IFC)", topics: ["LRITF", "Prevención Fraude", "Geolocalización"], modules: ["Crowdfunding PLD"] },
  "socap": { name: "SOCAP", topics: ["LRASCAP", "Niveles I-IV", "Identificación Proporcional"], modules: ["Sector Cooperativo"] },
  "sofipo": { name: "SOFIPO", topics: ["LACP", "Niveles I-IV", "Reportes Mensuales"], modules: ["Sector Popular"] },
  "casa-bolsa": { name: "Casas de Bolsa", topics: ["LMV", "KYC Bursátil", "Operaciones en Bloque"], modules: ["Mercado de Valores"] },
  "casa-cambio": { name: "Casas de Cambio", topics: ["Mercado Cambiario", "Reportes Relevantes"], modules: ["Operaciones de Divisas"] },
  "transmisores-dinero": { name: "Transmisores de Dinero", topics: ["Transferencias", "Umbrales Internacionales"], modules: ["Sistemas de Pago"] },
  "sofinco": { name: "SOFINCO", topics: ["LACP Comunitario", "Sector Rural"], modules: ["Finanzas Comunitarias"] },
  "fideicomisos": { name: "Fideicomisos", topics: ["Rol Fiduciario", "Identificación Fideicomitente"], modules: ["Vehículos Estructurados"] },
  "centros-cambiarios": { name: "Centros Cambiarios", topics: ["Compra/Venta de Divisas", "Reportes Operativos"], modules: ["Mercado Cambiario Local"] },
  "almacenes-generales": { name: "Almacenes Generales de Depósito", topics: ["LGOAC", "Certificados de Depósito"], modules: ["Actividades Auxiliares"] },
  "fondos-inversion": { name: "Fondos de Inversión", topics: ["LFI", "Prospectos de Información"], modules: ["Carteras de Inversión"] },
  "uniones-credito": { name: "Uniones de Crédito", topics: ["LUC", "Asociados y Operaciones"], modules: ["Organizaciones Auxiliares"] },
  "asesores-inversiones": { name: "Asesores en Inversiones", topics: ["LMV", "Cartera No Institucional"], modules: ["Asesoría Independiente"] },
  "fnd": { name: "FINANCIERA NACIONAL DE DESARROLLO", topics: ["Sector Agropecuario", "EBR Sectorial"], modules: ["Desarrollo Rural"] }
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
            Modo Estudio Oficial
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Temario general y especializado para la Certificación CNBV.
          </p>
        </div>

        {/* Módulos Transversales / Generales usando CNBV_SYLLABUS */}
        <div className="mt-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Scale className="h-6 w-6 text-emerald-600" />
            Temario Desglosado (Guía CNBV)
          </h2>
          <div className="grid gap-6 lg:grid-cols-3">
            {CNBV_SYLLABUS.map((mod, index) => {
              const isLocked = index > 0 && !isPremium;
              return (
                <Card key={mod.id} className="hover:shadow-lg transition-all flex flex-col border-slate-200">
                  <CardHeader className="bg-slate-50 rounded-t-xl border-b pb-4">
                    <CardTitle className="text-lg leading-tight text-slate-800">{mod.module}</CardTitle>
                    <CardDescription className="font-semibold text-blue-600 mt-1">
                      {mod.topics.length} temas clave
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 flex-1 flex flex-col">
                    <ul className="text-sm space-y-2 mb-6 text-slate-600 font-medium">
                      {/* Muestra los primeros 4 temas como resumen */}
                      {mod.topics.slice(0, 4).map(t => (
                        <li key={t} className="flex items-start gap-2">
                          <span className="text-emerald-500 shrink-0">•</span> <span className="line-clamp-2">{t}</span>
                        </li>
                      ))}
                      {mod.topics.length > 4 && (
                        <li className="text-xs text-slate-400 font-bold italic mt-2">
                          + {mod.topics.length - 4} subtemas adicionales...
                        </li>
                      )}
                    </ul>
                    <div className="mt-auto">
                      <Button 
                        disabled={isLocked}
                        className={cn("w-full", isLocked ? "bg-slate-200 text-slate-500" : "bg-slate-900 text-white hover:bg-slate-800")}
                      >
                        {isLocked ? "Premium Requerido" : "Iniciar Módulo"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
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

  // VISTA 2: DASHBOARD ESPECÍFICO DE SECTOR
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