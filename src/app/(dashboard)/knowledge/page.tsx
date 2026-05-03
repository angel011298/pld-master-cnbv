"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Lock, BookOpen, File } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

const SUPER_ADMIN_EMAIL = "553angelortiz@gmail.com"

interface Document {
  id: string
  name: string
  file_type: string
  page_count: number
  created_at: string
}

export default function KnowledgePage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sb = supabase()
        const { data: { user } } = await sb.auth.getUser()

        const authorized = user?.email === SUPER_ADMIN_EMAIL
        setIsAuthorized(authorized)

        if (!authorized) {
          setLoading(false)
          return
        }

        // Si está autorizado, cargar documentos globales
        const { data, error } = await sb
          .from("documents")
          .select("id, name, file_type, page_count, created_at")
          .eq("is_global", true)
          .order("created_at", { ascending: false })

        if (!error && data) {
          setDocuments(data)
        }
      } catch (err) {
        console.error("Auth check error:", err)
        setIsAuthorized(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-slate-600 font-medium">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="max-w-md text-center">
          <div className="bg-red-50 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">403 - Acceso Denegado</h1>
          <p className="text-slate-600 mb-6">
            No tienes permiso para acceder a la Base de Conocimiento. Este módulo está restringido a administradores.
          </p>
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 rounded-lg p-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">Base de Conocimiento</h1>
              <p className="text-slate-500 mt-1">Documentos globales y recursos de PLD/FT</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {documents.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <div className="bg-slate-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
              <File className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">No hay documentos globales disponibles aún.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {documents.length} Documento{documents.length !== 1 ? "s" : ""} Global{documents.length !== 1 ? "es" : ""}
            </h2>
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 shrink-0">
                    <File className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">{doc.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span>{doc.file_type.toUpperCase()}</span>
                      <span>📄 {doc.page_count} página{doc.page_count !== 1 ? "s" : ""}</span>
                      <span>{new Date(doc.created_at).toLocaleDateString("es-MX")}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
