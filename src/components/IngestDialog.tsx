"use client"

import * as React from "react"
import { Upload, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function IngestDialog() {
  const [file, setFile] = React.useState<File | null>(null)
  const [status, setStatus] = React.useState<"idle" | "uploading" | "success" | "error">("idle")
  const [message, setMessage] = React.useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
      setStatus("idle")
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setStatus("uploading")
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setStatus("success")
        setMessage(`¡Éxito! Se generaron ${data.chunks} fragmentos de conocimiento.`)
      } else {
        throw new Error(data.error || "Fallo en la ingesta")
      }
    } catch (err: unknown) {
      setStatus("error")
      const message = err instanceof Error ? err.message : "Error desconocido";
      setMessage(message)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border-dashed border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Ingesta de Documentos
        </CardTitle>
        <CardDescription>
          Sube tus archivos PDF (Leyes, Guías CNBV) para entrenar a tu Tutor IA.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full items-center gap-1.5">
          <Input 
            id="pdf" 
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange}
            disabled={status === "uploading"}
          />
        </div>

        {status === "uploading" && (
          <div className="flex items-center gap-2 text-sm text-blue-600 animate-pulse font-medium">
            <Loader2 className="h-4 w-4 animate-spin" />
            Procesando documento y generando embeddings...
          </div>
        )}

        {status === "success" && (
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            {message}
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
            <AlertCircle className="h-4 w-4" />
            {message}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleUpload} 
          disabled={!file || status === "uploading" || status === "success"}
        >
          {status === "uploading" ? "Subiendo..." : "Comenzar Indexación"}
        </Button>
      </CardFooter>
    </Card>
  )
}
