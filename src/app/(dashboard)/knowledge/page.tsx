"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Scale, BookOpen, Download, ExternalLink, Search, Library } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Simulamos la base de datos de documentos oficiales
const DOCUMENTS = [
  {
    category: "Leyes y Reglamentos",
    icon: Scale,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-200",
    items: [
      { title: "Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita (LFPIORPI)", date: "Actualizado 2024" },
      { title: "Ley de Instituciones de Crédito (Art. 115)", date: "Actualizado 2024" },
      { title: "Ley para Regular las Instituciones de Tecnología Financiera", date: "Actualizado 2024" },
    ]
  },
  {
    category: "Disposiciones Generales",
    icon: FileText,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    borderColor: "border-emerald-200",
    items: [
      { title: "DCG aplicables a las Instituciones de Crédito (Banca Múltiple)", date: "Resolución Modificatoria 2023" },
      { title: "DCG aplicables a las SOFOM ENR", date: "Resolución Modificatoria 2023" },
      { title: "DCG aplicables a las Instituciones de Tecnología Financiera", date: "Resolución Modificatoria 2023" },
    ]
  },
  {
    category: "Guías y Tipologías",
    icon: BookOpen,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-200",
    items: [
      { title: "Guía para la elaboración de la Metodología de Evaluación de Riesgos", date: "CNBV - 2022" },
      { title: "Guía de Enfoque Basado en Riesgo (EBR)", date: "GAFI - 2021" },
      { title: "Tipologías de Lavado de Dinero en México", date: "UIF - 2023" },
    ]
  }
]

export default function KnowledgeBase() {
  const [search, setSearch] = React.useState("")

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 space-y-8">
      
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <Library className="absolute -right-8 -top-8 h-48 w-48 text-slate-50 opacity-50 pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Library className="h-8 w-8 text-blue-600" /> Base de Conocimiento
          </h1>
          <p className="text-slate-500 font-medium max-w-xl">
            Biblioteca regulatoria oficial. Consulta, lee y descarga el marco normativo indispensable para tu certificación CNBV.
          </p>
        </div>
        <div className="relative w-full md:w-96 z-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Buscar por nombre de ley, artículo o tema..." 
            className="pl-12 rounded-2xl border-2 border-slate-200 h-14 font-medium focus-visible:ring-0 focus-visible:border-blue-500 transition-colors shadow-sm text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de Documentos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {DOCUMENTS.map((section) => (
          <Card key={section.category} className="border-2 border-b-4 border-slate-200 rounded-3xl flex flex-col h-full bg-white overflow-hidden hover:border-slate-300 transition-colors shadow-sm">
            
            <CardHeader className={`pb-4 border-b border-slate-100 bg-gradient-to-b from-${section.bgColor}/50 to-white`}>
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${section.bgColor} border border-white shadow-sm`}>
                  <section.icon className={`h-6 w-6 ${section.color}`} />
                </div>
                <CardTitle className="text-lg font-black leading-tight text-slate-800">
                  {section.category}
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-5 flex flex-col space-y-4 bg-slate-50/30">
              <div className="flex flex-col gap-4 flex-1">
                {section.items.filter(i => i.title.toLowerCase().includes(search.toLowerCase())).map((item, index) => (
                  
                  // Tarjeta individual del documento
                  <div key={index} className="flex flex-col h-full p-4 bg-white rounded-2xl border-2 border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group">
                    <div className="flex-1 mb-4">
                      <p className="text-sm font-bold text-slate-800 leading-snug mb-1.5 group-hover:text-blue-700 transition-colors line-clamp-3">
                        {item.title}
                      </p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {item.date}
                      </p>
                    </div>
                    
                    {/* Botones de acción simétricos */}
                    <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-50">
                      <Button 
                        variant="outline" 
                        className="flex-1 h-10 bg-white text-slate-600 border-2 border-slate-200 hover:border-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold shadow-none rounded-xl transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" /> Leer
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-10 w-10 shrink-0 border-2 border-slate-200 text-slate-500 hover:text-blue-700 hover:border-blue-600 hover:bg-blue-50 shadow-none rounded-xl transition-colors"
                        title="Descargar PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                ))}
                
                {/* Mensaje de estado vacío en caso de que la búsqueda no coincida */}
                {section.items.filter(i => i.title.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl">
                    <Search className="h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-500">No se encontraron resultados en esta categoría.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}