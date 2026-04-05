"use client"

import * as React from "react"
import { 
  Building2, 
  ShieldCheck, 
  FileSearch, 
  Scale, 
  Users, 
  ArrowRight,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const ENTITY_TYPES = [
  { 
    id: "banca", 
    name: "Banca Múltipla", 
    description: "Instituciones de crédito con mayores exigencias de reporteo.",
    obligations: ["Oficial de Cumplimiento", "Comité de Comunicación y Control", "EBR Avanzado"],
    reports: ["R01 (Inusuales)", "R14 (Internas preocupantes)", "R12 (24 Horas)"],
    law: "LIC y Disposiciones de Carácter General (Art. 115)"
  },
  { 
    id: "sofom", 
    name: "SOFOM ENR", 
    description: "Sociedades Financieras de Objeto Múltiple No Reguladas.",
    obligations: ["Manual de PLD/FT", "Certificación CNBV", "Matriz de Riesgo Simplificada"],
    reports: ["Reportes Trimestrales", "Relevantes > 7,500 USD"],
    law: "LGOAC y Disposiciones Técnicas"
  },
  { 
    id: "fintech", 
    name: "Fintech (ITP/IFPE)", 
    description: "Instituciones de Tecnología Financiera y modelos novedosos.",
    obligations: ["Activos Virtuales", "Geolocalización", "Onboarding Digital"],
    reports: ["Reportes de Activos Virtuales", "24 Horas"],
    law: "Ley para Regular las Instituciones de Tecnología Financiera"
  },
  { 
    id: "socap", 
    name: "SOCAP/SOFIPO", 
    description: "Sociedades Cooperativas y Financieras Populares.",
    obligations: ["Niveles de Operación I-IV", "Identificación Proporcional"],
    reports: ["Reportes Mensuales", "Efectivo"],
    law: "LRASCAP / LACP"
  },
  { 
    id: "casa-bolsa", 
    name: "Casa de Bolsa", 
    description: "Intermediarios del mercado de valores.",
    obligations: ["Conocimiento del Cliente (KYC)", "Perfil Versado"],
    reports: ["Reportes de Mercado", "Operaciones en Bloque"],
    law: "Ley del Mercado de Valores"
  }
]

export default function EntitiesPage() {
  const [search, setSearch] = React.useState("")
  const [selected, setSelected] = React.useState<string | null>(null)

  const filtered = ENTITY_TYPES.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.description.toLowerCase().includes(search.toLowerCase())
  )

  const activeEntity = ENTITY_TYPES.find(e => e.id === selected)

  return (
    <div className="container mx-auto py-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-3xl border-2 border-b-[8px] border-black/5 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase text-primary">Explorador de Entidades</h1>
          <p className="text-muted-foreground font-medium italic">Filtra por sector para conocer el marco normativo y obligaciones específicas.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Buscar entidad (ej. SOFOM)..." 
            className="pl-10 rounded-2xl border-2 focus:border-primary h-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entity List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest px-2">Sectores Disponibles</h2>
          <div className="space-y-3">
            {filtered.map((entity) => (
              <button
                key={entity.id}
                onClick={() => setSelected(entity.id)}
                className={cn(
                  "w-full text-left p-6 rounded-3xl transition-all duration-200 border-2",
                  selected === entity.id 
                    ? "bg-primary text-white border-primary border-b-[8px] translate-y-[-2px] shadow-lg shadow-primary/20" 
                    : "bg-white border-black/5 hover:border-primary/30 hover:bg-primary/[0.02]"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black uppercase tracking-tight">{entity.name}</span>
                  <Building2 className={cn("h-5 w-5", selected === entity.id ? "text-white" : "text-primary")} />
                </div>
                <p className={cn("text-xs leading-relaxed line-clamp-1 opacity-80 font-medium")}>
                  {entity.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Details View */}
        <div className="lg:col-span-2">
          {activeEntity ? (
            <div className="bg-white rounded-[2rem] border-2 border-b-[10px] border-black/5 p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-primary uppercase">{activeEntity.name}</h2>
                  <p className="text-muted-foreground font-medium">{activeEntity.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-black uppercase text-secondary">
                    <Scale className="h-4 w-4" />
                    Marco Jurídico
                  </div>
                  <div className="p-5 bg-secondary/5 border-2 border-secondary/10 rounded-2xl text-sm font-bold text-secondary-foreground">
                    {activeEntity.law}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-black uppercase text-primary">
                    <Users className="h-4 w-4" />
                    Órganos Internos
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeEntity.obligations.map(o => (
                      <span key={o} className="px-3 py-1.5 bg-primary/5 text-primary text-xs font-black rounded-lg border border-primary/10">
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-dashed">
                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <FileSearch className="h-5 w-5 text-accent" />
                  Reportería y Obligaciones
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeEntity.reports.map(r => (
                    <div key={r} className="p-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl text-xs font-black text-center flex flex-col items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                      {r}
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full btn-primary-pushable py-8 text-xl font-black rounded-2xl">
                ESTUDIAR ESTE SECTOR
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-zinc-50/50 rounded-[2rem] border-2 border-dashed border-zinc-200 p-10 text-center space-y-4">
              <Building2 className="h-16 w-16 text-zinc-300" />
              <div className="space-y-1">
                <h3 className="text-xl font-black text-zinc-400 uppercase">Selecciona un Sector</h3>
                <p className="text-sm text-zinc-400 font-medium max-w-xs mx-auto italic">Explora las regulaciones específicas que cada entidad debe cumplir ante la CNBV.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
