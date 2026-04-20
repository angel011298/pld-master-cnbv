import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Scale, BookOpen, FileSearch, Download, ExternalLink } from "lucide-react"

const LIBRARY = [
  {
    category: "Leyes",
    icon: Scale,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    docs: [
      { name: "Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita (LFPIORPI)", updated: "2024-01-15", pages: 42 },
      { name: "Ley de Instituciones de Crédito (LIC) — Art. 115", updated: "2024-03-01", pages: 18 },
      { name: "Ley para Regular las Instituciones de Tecnología Financiera (LRITF)", updated: "2024-02-10", pages: 56 },
      { name: "Ley General de Organizaciones y Actividades Auxiliares del Crédito (LGOAC)", updated: "2024-01-20", pages: 38 },
    ],
  },
  {
    category: "Disposiciones",
    icon: FileSearch,
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    docs: [
      { name: "Disposiciones de Carácter General — Banca Múltiple (CNBV)", updated: "2025-06-01", pages: 94 },
      { name: "Disposiciones de Carácter General — SOFOM ENR (CNBV)", updated: "2025-04-15", pages: 67 },
      { name: "Disposiciones de Carácter General — IFC/IFPE (CNBV)", updated: "2025-03-20", pages: 72 },
      { name: "Disposiciones de Carácter General — SOCAP/SOFIPO (CNBV)", updated: "2025-02-28", pages: 58 },
    ],
  },
  {
    category: "Guías",
    icon: BookOpen,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    docs: [
      { name: "Guía de Enfoque Basado en Riesgos (EBR) — CNBV 2024", updated: "2024-04-10", pages: 31 },
      { name: "Manual de Criterios para el Llenado de Reportes Regulatorios", updated: "2024-05-05", pages: 48 },
      { name: "40 Recomendaciones del GAFI — Versión 2023", updated: "2023-10-01", pages: 88 },
      { name: "Guía Metodológica para la Evaluación Nacional de Riesgos (ENR)", updated: "2024-07-01", pages: 112 },
    ],
  },
]

export default function KnowledgeBase() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Biblioteca de Conocimiento</h1>
        <p className="text-gray-600 mt-1">
          Consulta las leyes, disposiciones y guías oficiales para tu certificación PLD/FT.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {LIBRARY.map((section) => {
          const Icon = section.icon
          return (
            <Card key={section.category} className="shadow-sm border-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  <div className={`h-9 w-9 rounded-xl ${section.bg} ${section.border} border flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${section.color}`} />
                  </div>
                  {section.category}
                </CardTitle>
                <CardDescription className="text-gray-500">
                  {section.docs.length} documentos disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.docs.map((doc) => (
                    <li
                      key={doc.name}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-white transition-all group"
                    >
                      <FileText className={`h-5 w-5 ${section.color} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2">{doc.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Actualizado: {new Date(doc.updated).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })} · {doc.pages} pág.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" className="gap-1 text-gray-700 hover:text-gray-900 border-gray-300">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Leer
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1 text-gray-700 hover:text-gray-900 border-gray-300">
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
