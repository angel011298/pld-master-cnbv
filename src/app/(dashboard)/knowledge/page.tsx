"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Search, Library, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

type DocumentRecord = {
  id: string
  name: string
  file_type: string
  page_count: number
  file_size_bytes: number
  is_global: boolean
  created_at: string
}

export default function KnowledgeBase() {
  const [search, setSearch] = React.useState("")
  const [documents, setDocuments] = React.useState<DocumentRecord[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true)
      try {
        const sb = supabase()
        const { data } = await sb
          .from("documents")
          .select("id, name, file_type, page_count, file_size_bytes, is_global, created_at")
          .order("created_at", { ascending: false })
        setDocuments((data ?? []) as DocumentRecord[])
      } finally {
        setLoading(false)
      }
    }

    loadDocuments()
  }, [])

  const filteredDocuments = documents.filter((document) =>
    document.name.toLowerCase().includes(search.trim().toLowerCase())
  )

  const handleDownloadMetadata = (record: DocumentRecord) => {
    const blob = new Blob([JSON.stringify(record, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${record.name.replace(/[^\w.-]+/g, "-")}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8">
      <div className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:p-8">
        <Library className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 text-slate-50 opacity-50" />
        <div className="relative z-10 space-y-2">
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            <Library className="h-8 w-8 text-blue-600" /> Base de Conocimiento
          </h1>
          <p className="max-w-xl font-medium text-slate-500">
            Biblioteca regulatoria conectada a los documentos reales guardados en Supabase.
          </p>
        </div>
        <div className="relative z-10 w-full md:w-96">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por nombre de documento..."
            className="h-14 rounded-2xl border-2 border-slate-200 pl-12 text-base font-medium shadow-sm transition-colors focus-visible:border-blue-500 focus-visible:ring-0"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm font-bold text-slate-500">
          Cargando documentos reales...
        </div>
      )}

      {!loading && filteredDocuments.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
          <Library className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <h2 className="font-black text-slate-800">No hay documentos para mostrar</h2>
          <p className="mt-1 text-sm text-slate-500">Cuando se ingesten documentos reales aparecerán aquí.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="flex h-full flex-col overflow-hidden rounded-3xl border-2 border-b-4 border-slate-200 bg-white shadow-sm transition-colors hover:border-slate-300">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white bg-blue-100 shadow-sm">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-black leading-tight text-slate-800">
                  {document.name}
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col space-y-4 bg-slate-50/30 p-5">
              <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-500">
                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  Tipo
                  <p className="mt-1 text-sm font-black text-slate-800">{document.file_type}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  Páginas
                  <p className="mt-1 text-sm font-black text-slate-800">{document.page_count}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  Alcance
                  <p className="mt-1 text-sm font-black text-slate-800">{document.is_global ? "Global" : "Personal"}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  Alta
                  <p className="mt-1 text-sm font-black text-slate-800">{new Date(document.created_at).toLocaleDateString("es-MX")}</p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => handleDownloadMetadata(document)}
                className="mt-auto h-10 rounded-xl border-2 border-slate-200 bg-white font-bold text-slate-600 shadow-none transition-colors hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700"
              >
                <Download className="mr-2 h-4 w-4" /> Descargar ficha
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
