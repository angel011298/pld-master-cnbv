"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Scale, BookOpen, Download, ExternalLink, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Simulamos la base de datos de documentos oficiales
const DOCUMENTS = [
  {
    category: "Leyes y Reglamentos",
    icon: Scale,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    items: [
      { title: "Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita (LFPIORPI)", date: "Actualizado 2024" },
      { title: "Ley de Instituciones de Crédito (Art. 115)", date: "Actualizado 2024" },
      { title: "Ley para Regular las Instituciones de Tecnología Financiera", date: "Actualizado 2024" },
    ]
  },
  {
    category: "Disposiciones de Carácter General",
    icon: FileText,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    items: [
      { title: "DCG aplicables a las Instituciones de Crédito (Banca Múltiple)", date: "Resolución Modificatoria 2023" },
      { title: "DCG aplicables a las SOFOM ENR", date: "Resolución Modificatoria 2023" },
      { title: "DCG aplicables a las Instituciones de Tecnología Financiera", date: "Resolución Modificatoria 2023" },
    ]
  },
  {
    category: "Guías y Mejores Prácticas",
    icon: BookOpen,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    items: [
      { title: "Guía para la elaboración de la Metodología de Evaluación de Riesgos", date: "CNBV - 2022" },
      { title: "Guía de Enfoque Basado en Riesgo (EBR)", date: "GAFI" },
      { title: "Tipologías de Lavado de Dinero en México", date: "UIF - 2023" },
    ]
  }
]

export default function KnowledgeBase() {
  const [search, setSearch] = React.useState("")

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-3xl border-2 border-b-[6px] border-gray-200 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase text-primary">Base de Conocimiento</h1>
          <p className="text-muted-foreground font-medium">Biblioteca regulatoria oficial. Consulta las leyes y guías para tu examen.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="Buscar documento..." 
            className="pl-10 rounded-2xl border-2 h-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de Documentos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {DOCUMENTS.map((section) => (
          <Card key={section.category} className="border-2 border-b-[6px] border-gray-200 rounded-3xl flex flex-col h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${section.bgColor}`}>
                  <section.icon className={`h-6 w-6 ${section.color}`} />
                </div>
                <CardTitle className="text-xl font-black leading-tight tracking-tight">{section.category}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4">
              <div className="space-y-3 flex-1">
                {section.items.filter(i => i.title.toLowerCase().includes(search.toLowerCase())).map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary/30 transition-colors group">
                    <p className="text-sm font-bold text-gray-800 leading-snug mb-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <p className="text-xs font-semibold text-muted-foreground mb-3">{item.date}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" className="w-full text-xs font-bold bg-white border shadow-sm hover:bg-gray-50">
                        <ExternalLink className="h-3 w-3 mr-1.5" /> Leer
                      </Button>
                      <Button variant="outline" size="sm" className="px-3 border-gray-200 text-gray-500 hover:text-primary">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}