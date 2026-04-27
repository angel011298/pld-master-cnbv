"use client"

import * as React from "react"
import {
  Building2,
  Scale,
  Users,
  FileSearch,
  ClipboardList,
  ArrowRight,
  Search,
  BookOpen,
  UserCog,
  BarChart3,
  CheckSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const basePlaceholder = {
  law: {
    title: "Marco Jurídico (Sincronizado con Guía CNBV)",
    summary: "Los detalles específicos de leyes, manuales y disposiciones de esta entidad se consultan dinámicamente desde la 'Guía PLD/FT_CNBV' oficial alojada en Drive.",
    norms: ["LFPIORPI (Ley General)", "Disposiciones de Carácter General aplicables", "Guía PLD/FT_CNBV"],
    articles: ["Ver base de conocimiento de la plataforma"],
  },
  organs: [
    { role: "Oficial de Cumplimiento", desc: "Sujeto a las especificaciones de la Guía PLD/FT de la CNBV." },
    { role: "Comité / Auditoría", desc: "Según corresponda por volumen y sector." }
  ],
  reports: [
    { name: "Reportes regulatorios", deadline: "Según normativa", threshold: "Consultar Guía CNBV" }
  ],
  obligations: [
    { text: "Cumplimiento normativo PLD/FT", law: "Disposiciones Generales aplicables" }
  ]
};

const ENTITY_TYPES = [
  {
    id: "banca-multiple",
    name: "Banca Múltiple (Instituciones de Crédito)",
    description: "Instituciones de crédito con mayores exigencias de reporteo.",
    law: {
      title: "Marco Jurídico — Banca Múltiple",
      summary: "La Banca Múltiple se rige por la Ley de Instituciones de Crédito (LIC), específicamente el Art. 115, complementado por las Disposiciones de Carácter General en materia de PLD/FT emitidas por la CNBV. La jerarquía normativa va desde la LFPIORPI (marco general) hasta las circulares sectoriales.",
      norms: ["LFPIORPI (Ley General)", "LIC — Art. 115", "Disposiciones CNBV Banca Múltiple", "Recomendaciones GAFI", "Criterios SHCP", "Guía PLD/FT_CNBV"],
      articles: ["Art. 115 LIC: Obligaciones PLD", "Art. 65 LFPIORPI: Reportes", "Disp. CNBV Cap. III: EBR"],
    },
    organs: [
      { role: "Oficial de Cumplimiento", desc: "Responsable de implementar el programa PLD ante la CNBV. Debe ser aprobado por el Consejo." },
      { role: "Comité de Comunicación y Control", desc: "Revisa y aprueba reportes de operaciones inusuales. Sesiona al menos mensualmente." },
      { role: "Auditor Interno PLD", desc: "Verifica el cumplimiento del programa PLD. Reporta directamente al Consejo." },
    ],
    reports: [
      { name: "Reporte de Operaciones Inusuales (R01)", deadline: "24 horas", threshold: "Detección por sistema" },
      { name: "Reporte de Operaciones Internas Preocupantes (R14)", deadline: "Mensual", threshold: "Por conducta del empleado" },
      { name: "Reporte de 24 Horas (R12)", deadline: "24 horas", threshold: "Por urgencia / alerta" },
      { name: "Reporte de Operaciones Relevantes", deadline: "17 días hábiles", threshold: "$10,000 USD en efectivo" },
    ],
    obligations: [
      { text: "Establecer un Programa de PLD/FT por escrito", law: "Art. 115 LIC" },
      { text: "Contar con Oficial de Cumplimiento aprobado", law: "Disp. CNBV Cap. II" },
      { text: "Aplicar Enfoque Basado en Riesgo (EBR)", law: "Disp. CNBV Cap. III" },
      { text: "Capacitar al personal anualmente", law: "Disp. CNBV Cap. IX" },
      { text: "Conservar expedientes por 7 años mínimo", law: "LFPIORPI Art. 18" },
      { text: "Enviar reportes en tiempo y forma a la UIF", law: "LFPIORPI Art. 17" },
    ],
  },
  {
    id: "banca-desarrollo",
    name: "Banca de desarrollo (Instituciones de Crédito)",
    description: "Instituciones de Crédito enfocadas al desarrollo económico y social.",
    ...basePlaceholder
  },
  {
    id: "sofom-enr",
    name: "Sofom ENR (Instituciones de Crédito)",
    description: "Sociedades Financieras de Objeto Múltiple No Reguladas.",
    law: {
      title: "Marco Jurídico — SOFOM ENR",
      summary: "Las SOFOM ENR se rigen por la Ley General de Organizaciones y Actividades Auxiliares del Crédito (LGOAC) y las Disposiciones Técnicas emitidas por la CNBV. Al ser 'no reguladas', tienen requisitos simplificados frente a la Banca Múltiple.",
      norms: ["LFPIORPI (Ley General)", "LGOAC", "Disposiciones Técnicas CNBV SOFOM", "NOM-151-SCFI-2016", "Guía PLD/FT_CNBV"],
      articles: ["Art. 87-D LGOAC: PLD", "LFPIORPI Art. 17: Obligados", "Disp. Técnicas: Matriz de Riesgo"],
    },
    organs: [
      { role: "Oficial de Cumplimiento", desc: "Puede ser el propio director en entidades pequeñas. Responsable del manual PLD." },
      { role: "Comité de Cumplimiento", desc: "Opcional para entidades pequeñas. Revisa casos inusuales." },
      { role: "Auditor Externo", desc: "Verifica anualmente el cumplimiento del programa PLD." },
    ],
    reports: [
      { name: "Reporte Trimestral de Operaciones", deadline: "Trimestral", threshold: "Consolidado del periodo" },
      { name: "Reporte de Operaciones Relevantes en Efectivo", deadline: "17 días hábiles", threshold: "> $7,500 USD" },
      { name: "Reporte de Operaciones Inusuales", deadline: "24 horas (urgentes)", threshold: "Por señales de alerta" },
    ],
    obligations: [
      { text: "Elaborar Manual de PLD/FT por escrito", law: "Disp. Técnicas SOFOM" },
      { text: "Designar Oficial de Cumplimiento", law: "LFPIORPI Art. 17" },
      { text: "Aplicar Matriz de Riesgo simplificada", law: "Disp. Técnicas Cap. III" },
      { text: "Obtener y conservar expedientes de clientes", law: "Disp. Técnicas Cap. IV" },
      { text: "Reportar a la UIF en tiempo y forma", law: "LFPIORPI Art. 17" },
    ],
  },
  {
    id: "sofom-er",
    name: "Sofom ER (Instituciones de Crédito)",
    description: "Sociedades Financieras de Objeto Múltiple Reguladas.",
    ...basePlaceholder
  },
  {
    id: "ifpe",
    name: "Institución de Fondos de Pago Electrónico (ITF)",
    description: "Entidades Fintech enfocadas en medios de pago electrónicos.",
    ...basePlaceholder
  },
  {
    id: "ifc",
    name: "Institución de Financiamiento Colectivo (ITF)",
    description: "Entidades Fintech de fondeo colectivo (Crowdfunding).",
    ...basePlaceholder
  },
  {
    id: "socap",
    name: "SOCAP",
    description: "Sociedades Cooperativas de Ahorro y Préstamo.",
    law: {
      title: "Marco Jurídico — SOCAP",
      summary: "Las SOCAP se rigen por la Ley para Regular las Actividades de las Sociedades Cooperativas de Ahorro y Préstamo (LRASCAP). Sus obligaciones PLD son proporcionales a su nivel de operación (I-IV).",
      norms: ["LFPIORPI", "LRASCAP (SOCAP)", "Disposiciones CNBV SOCAP", "Guía PLD/FT_CNBV"],
      articles: ["LRASCAP Art. 46: PLD", "Disp. CNBV: Niveles I-IV"],
    },
    organs: [
      { role: "Oficial de Cumplimiento", desc: "Designado según nivel de operación. En Nivel I puede ser el gerente general." },
      { role: "Consejo de Administración", desc: "Aprueba el programa PLD y supervisa al Oficial de Cumplimiento." },
      { role: "Comisión de Vigilancia", desc: "Audita internamente el cumplimiento regulatorio." },
    ],
    reports: [
      { name: "Reporte Mensual de Operaciones en Efectivo", deadline: "Mensual", threshold: "Según nivel de operación" },
      { name: "Reporte de Operaciones Relevantes", deadline: "17 días hábiles", threshold: "> $7,500 USD efectivo" },
      { name: "Reporte de Operaciones Inusuales", deadline: "24-48 horas", threshold: "Por señales de alerta" },
    ],
    obligations: [
      { text: "Clasificar operaciones por nivel (I-IV)", law: "Disp. CNBV SOCAP" },
      { text: "Identificación proporcional al riesgo del socio", law: "Disp. CNBV Cap. IV" },
      { text: "Reportar operaciones en efectivo mensualmente", law: "LFPIORPI Art. 17" },
      { text: "Conservar expedientes por 7 años", law: "LFPIORPI Art. 18" },
    ],
  },
  {
    id: "sofipo",
    name: "SOFIPO",
    description: "Sociedades Financieras Populares.",
    ...basePlaceholder
  },
  {
    id: "casa-bolsa",
    name: "Casas de Bolsa",
    description: "Intermediarios del mercado de valores sujetos a PLD/FT.",
    law: {
      title: "Marco Jurídico — Casa de Bolsa",
      summary: "Las Casas de Bolsa se rigen por la Ley del Mercado de Valores (LMV) y las Disposiciones de Carácter General en materia de PLD emitidas por la CNBV. Tienen requisitos especiales para clientes 'versados' y operaciones en bloque.",
      norms: ["LFPIORPI", "Ley del Mercado de Valores (LMV)", "Disposiciones CNBV Casas de Bolsa", "Guía PLD/FT_CNBV"],
      articles: ["LMV Art. 212: PLD", "LFPIORPI Art. 17", "Disp. CNBV Cap. V: KYC Bursátil"],
    },
    organs: [
      { role: "Oficial de Cumplimiento Bursátil", desc: "Especializado en mercado de valores y PLD. Debe tener certificación CNBV." },
      { role: "Comité de Control y Auditoría", desc: "Revisa operaciones en bloque y clientes de alto valor." },
      { role: "Auditor Externo PLD", desc: "Emite dictamen anual de cumplimiento PLD/FT." },
    ],
    reports: [
      { name: "Reporte de Operaciones de Mercado Inusuales", deadline: "Detección / 24h", threshold: "Operaciones atípicas" },
      { name: "Reporte de Operaciones en Bloque", deadline: "Mensual", threshold: "> $10,000 USD" },
      { name: "Reporte de Operaciones Relevantes", deadline: "17 días hábiles", threshold: "> $10,000 USD efectivo" },
    ],
    obligations: [
      { text: "Aplicar KYC (Conocimiento del Cliente) bursátil", law: "LMV Art. 212" },
      { text: "Clasificar al cliente: versado / no versado", law: "Disp. CNBV Casa de Bolsa" },
      { text: "Monitorear operaciones en mercados secundarios", law: "Disp. CNBV Cap. VI" },
      { text: "Designar Oficial de Cumplimiento certificado", law: "LMV Art. 212" },
      { text: "Reportar operaciones en bloque mensualmente", law: "Disp. CNBV Cap. VII" },
    ],
  },
  {
    id: "casa-cambio",
    name: "Casas de Cambio",
    description: "Entidades autorizadas para operaciones de divisas.",
    ...basePlaceholder
  },
  {
    id: "transmisores-dinero",
    name: "Transmisores de dinero",
    description: "Sociedades que prestan servicios de transferencia de fondos.",
    ...basePlaceholder
  },
  {
    id: "sofinco",
    name: "SOFINCO",
    description: "Sociedades Financieras Comunitarias.",
    ...basePlaceholder
  },
  {
    id: "fideicomisos",
    name: "Fideicomisos",
    description: "Entidades y vehículos fiduciarios.",
    ...basePlaceholder
  },
  {
    id: "centros-cambiarios",
    name: "Centros Cambiarios",
    description: "Compra y venta de divisas de manera habitual y profesional.",
    ...basePlaceholder
  },
  {
    id: "almacenes-generales",
    name: "Almacenes Generales de Deposito",
    description: "Almacenamiento, guarda y conservación de bienes.",
    ...basePlaceholder
  },
  {
    id: "fondos-inversion",
    name: "Fondos de Inversión",
    description: "Captación y administración de carteras de inversión.",
    ...basePlaceholder
  },
  {
    id: "uniones-credito",
    name: "Uniones de Crédito",
    description: "Organizaciones auxiliares del crédito.",
    ...basePlaceholder
  },
  {
    id: "asesores-inversiones",
    name: "Asesores en Inversiones",
    description: "Prestación de servicios de administración de cartera.",
    ...basePlaceholder
  },
  {
    id: "fnd",
    name: "FINANCIERA NACIONAL DE DESARROLLO AGRO., RURAL Y PESQUERO",
    description: "Entidad orientada al sector primario.",
    ...basePlaceholder
  }
]

type TabId = "juridico" | "organos" | "reporteria" | "obligaciones"

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "juridico", label: "Marco Jurídico", icon: Scale },
  { id: "organos", label: "Órganos Internos", icon: UserCog },
  { id: "reporteria", label: "Reportería", icon: BarChart3 },
  { id: "obligaciones", label: "Obligaciones", icon: CheckSquare },
]

export default function EntitiesPage() {
  const router = useRouter()
  const [search, setSearch] = React.useState("")
  const [selected, setSelected] = React.useState<string | null>(null)
  const [tab, setTab] = React.useState<TabId>("juridico")

  const filtered = ENTITY_TYPES.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase())
  )

  const activeEntity = ENTITY_TYPES.find((e) => e.id === selected)

  function handleStudy() {
    if (selected) router.push(`/estudio?sector=${selected}`)
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-3xl border-2 border-b-[6px] border-gray-200 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase text-blue-700">Explorador de Entidades</h1>
          <p className="text-gray-600 font-medium">Filtra por sector para conocer el marco normativo y obligaciones específicas.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input
            placeholder="Buscar entidad..."
            className="pl-10 rounded-2xl border-2 border-gray-200 focus:border-blue-500 h-12 text-gray-800 placeholder:text-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entity List */}
        <div className="lg:col-span-1 space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
          <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest px-2 sticky top-0 bg-gray-50/90 backdrop-blur-sm py-2">Sectores Disponibles ({filtered.length})</h2>
          <div className="space-y-3">
            {filtered.map((entity) => (
              <button
                key={entity.id}
                onClick={() => { setSelected(entity.id); setTab("juridico") }}
                className={cn(
                  "w-full text-left p-5 rounded-2xl transition-all duration-200 border-2",
                  selected === entity.id
                    ? "bg-blue-700 text-white border-blue-700 border-b-[6px] shadow-lg shadow-blue-200"
                    : "bg-white border-gray-200 hover:border-blue-300 text-gray-800 hover:bg-blue-50"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black uppercase tracking-tight text-sm line-clamp-1">{entity.name}</span>
                  <Building2 className={cn("h-4 w-4 shrink-0", selected === entity.id ? "text-white" : "text-blue-600")} />
                </div>
                <p className={cn("text-xs leading-relaxed line-clamp-2 font-medium", selected === entity.id ? "text-blue-100" : "text-gray-500")}>
                  {entity.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {activeEntity ? (
            <div className="bg-white rounded-3xl border-2 border-b-[6px] border-gray-200 overflow-hidden">
              {/* Entity header */}
              <div className="p-8 pb-0">
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                    <Building2 className="h-7 w-7 text-blue-700" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-blue-700 uppercase tracking-tight">{activeEntity.name}</h2>
                    <p className="text-gray-600 font-medium text-sm">{activeEntity.description}</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
                  {TABS.map((t) => {
                    const Icon = t.icon
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 -mb-px transition-all",
                          tab === t.id
                            ? "border-blue-700 text-blue-700"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {t.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Tab content */}
              <div className="p-8 min-h-[300px]">

                {/* Marco Jurídico */}
                {tab === "juridico" && (
                  <div className="space-y-5">
                    <div className="p-5 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-blue-700" />
                        <span className="font-black text-blue-800 text-sm uppercase tracking-wide">{activeEntity.law.title}</span>
                      </div>
                      <p className="text-blue-900 text-sm leading-relaxed">{activeEntity.law.summary}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Normas Aplicables</p>
                        <ul className="space-y-1.5">
                          {activeEntity.law.norms.map((n) => (
                            <li key={n} className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                              <Scale className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                              {n}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Artículos Clave</p>
                        <ul className="space-y-1.5">
                          {activeEntity.law.articles.map((a) => (
                            <li key={a} className="flex items-start gap-2 text-sm font-semibold text-gray-700">
                              <FileSearch className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Órganos Internos */}
                {tab === "organos" && (
                  <div className="space-y-4">
                    {activeEntity.organs.map((organ) => (
                      <div key={organ.role} className="p-5 bg-gray-50 border-2 border-gray-200 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <UserCog className="h-4 w-4 text-blue-600" />
                          <span className="font-black text-gray-900">{organ.role}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{organ.desc}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reportería */}
                {tab === "reporteria" && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left pb-3 font-black text-gray-700 pr-4">Reporte</th>
                          <th className="text-left pb-3 font-black text-gray-700 pr-4">Plazo</th>
                          <th className="text-left pb-3 font-black text-gray-700">Umbral</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {activeEntity.reports.map((r) => (
                          <tr key={r.name} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 pr-4 font-semibold text-gray-800">{r.name}</td>
                            <td className="py-3 pr-4">
                              <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs whitespace-nowrap">
                                {r.deadline}
                              </span>
                            </td>
                            <td className="py-3 text-gray-600 text-xs">{r.threshold}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Obligaciones */}
                {tab === "obligaciones" && (
                  <div className="space-y-3">
                    {activeEntity.obligations.map((ob, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <div className="h-6 w-6 rounded-lg bg-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-white text-xs font-black">{i + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{ob.text}</p>
                          <p className="text-xs font-semibold text-blue-600 mt-0.5">Fundamento: {ob.law}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Study button */}
              <div className="px-8 pb-8 mt-auto">
                <Button
                  className="w-full py-6 text-lg font-black rounded-2xl bg-blue-700 hover:bg-blue-800 text-white border-b-4 border-blue-900 active:border-b-0 active:translate-y-1 transition-all"
                  onClick={handleStudy}
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  ESTUDIAR ESTE SECTOR
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 p-10 text-center space-y-4">
              <Building2 className="h-16 w-16 text-gray-300" />
              <div className="space-y-1">
                <h3 className="text-xl font-black text-gray-400 uppercase">Selecciona un Sector</h3>
                <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto">
                  Explora las regulaciones específicas que cada entidad debe cumplir ante la CNBV.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}