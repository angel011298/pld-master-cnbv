"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload, CheckCircle2, Loader2, AlertCircle, FolderOpen,
  FileText, RefreshCw, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { buildAuthHeaders } from "@/lib/auth-client"

interface DriveFileItem {
  id: string
  name: string
  size: number
  sizeLabel: string
  eligible: boolean
  reason: string | null
}

interface FileImportState {
  status: "idle" | "importing" | "done" | "error"
  message: string
}

type ActiveTab = "folder" | "local"

export function IngestDialog({ onImportDone }: { onImportDone?: () => void }) {
  const [activeTab, setActiveTab] = React.useState<ActiveTab>("folder")

  // --- Folder import state ---
  const [folderUrl, setFolderUrl] = React.useState("")
  const [scanning, setScanning] = React.useState(false)
  const [scanError, setScanError] = React.useState("")
  const [driveFiles, setDriveFiles] = React.useState<DriveFileItem[]>([])
  const [slotsAvailable, setSlotsAvailable] = React.useState(0)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [importStates, setImportStates] = React.useState<Record<string, FileImportState>>({})
  const [importing, setImporting] = React.useState(false)

  // --- Local file state ---
  const [file, setFile] = React.useState<File | null>(null)
  const [localStatus, setLocalStatus] = React.useState<"idle" | "uploading" | "success" | "error">("idle")
  const [localMessage, setLocalMessage] = React.useState("")

  const handleScanFolder = async () => {
    if (!folderUrl.trim()) return
    setScanning(true)
    setScanError("")
    setDriveFiles([])
    setSelected(new Set())
    setImportStates({})

    try {
      const headers = await buildAuthHeaders({ "Content-Type": "application/json" })
      const res = await fetch("/api/list-drive-folder", {
        method: "POST",
        headers,
        body: JSON.stringify({ folderUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al escanear carpeta")
      setDriveFiles(data.files ?? [])
      setSlotsAvailable(data.slotsAvailable ?? 0)
    } catch (err: unknown) {
      setScanError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setScanning(false)
    }
  }

  const toggleSelect = (id: string, eligible: boolean) => {
    if (!eligible) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (next.size < slotsAvailable) {
          next.add(id)
        }
      }
      return next
    })
  }

  const handleImportSelected = async () => {
    if (selected.size === 0) return
    setImporting(true)

    const filesToImport = driveFiles.filter((f) => selected.has(f.id))

    for (const f of filesToImport) {
      setImportStates((prev) => ({ ...prev, [f.id]: { status: "importing", message: "" } }))
      try {
        const headers = await buildAuthHeaders({ "Content-Type": "application/json" })
        const res = await fetch("/api/ingest-drive", {
          method: "POST",
          headers,
          body: JSON.stringify({ fileId: f.id, fileName: f.name }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? "Error")
        const verb = data.updated ? "Actualizado" : "Importado"
        setImportStates((prev) => ({
          ...prev,
          [f.id]: { status: "done", message: `${verb} · ${data.chunks} fragmentos` },
        }))
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error desconocido"
        setImportStates((prev) => ({ ...prev, [f.id]: { status: "error", message: msg } }))
      }
    }

    setImporting(false)
    onImportDone?.()
  }

  const importedCount = Object.values(importStates).filter((s) => s.status === "done").length
  const errorCount = Object.values(importStates).filter((s) => s.status === "error").length
  const totalProgress = selected.size > 0 ? Math.round(((importedCount + errorCount) / selected.size) * 100) : 0

  const handleLocalUpload = async () => {
    if (!file) return
    setLocalStatus("uploading")
    const formData = new FormData()
    formData.append("file", file)
    try {
      const headers = await buildAuthHeaders()
      const res = await fetch("/api/ingest", { method: "POST", headers, body: formData })
      const data = await res.json()
      if (res.ok) {
        setLocalStatus("success")
        setLocalMessage(`¡Éxito! Se generaron ${data.chunks} fragmentos de conocimiento.`)
        onImportDone?.()
      } else {
        throw new Error(data.error ?? "Fallo en la ingesta")
      }
    } catch (err: unknown) {
      setLocalStatus("error")
      setLocalMessage(err instanceof Error ? err.message : "Error desconocido")
    }
  }

  return (
    <Card className="w-full border-2">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Upload className="h-5 w-5" />
          Importar Documentos
        </CardTitle>
        <CardDescription>PDFs de leyes y guías CNBV para entrenar al Tutor IA</CardDescription>

        {/* Tabs */}
        <div className="flex gap-1 mt-2 p-1 bg-muted rounded-xl w-fit">
          {(["folder", "local"] as ActiveTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab ? "bg-background shadow text-foreground" : "text-muted-foreground"
              }`}
            >
              {tab === "folder" ? "📁 Carpeta Drive" : "💻 Archivo Local"}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          {activeTab === "folder" ? (
            <motion.div
              key="folder"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {/* Folder URL input */}
              <div className="flex gap-2">
                <Input
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={folderUrl}
                  onChange={(e) => setFolderUrl(e.target.value)}
                  disabled={scanning || importing}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleScanFolder}
                  disabled={!folderUrl.trim() || scanning || importing}
                  className="shrink-0"
                >
                  {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderOpen className="h-4 w-4" />}
                  <span className="ml-1">{scanning ? "Escaneando..." : "Escanear"}</span>
                </Button>
              </div>

              {scanError && (
                <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {scanError}
                </div>
              )}

              {/* File list */}
              {driveFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase">
                    <span>{driveFiles.length} PDFs encontrados · {slotsAvailable} slots disponibles</span>
                    {selected.size > 0 && (
                      <span className="text-primary">{selected.size} seleccionados</span>
                    )}
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {driveFiles.map((f) => {
                      const state = importStates[f.id]
                      const isSelected = selected.has(f.id)
                      const isDone = state?.status === "done"
                      const isErr = state?.status === "error"
                      const isImporting = state?.status === "importing"

                      return (
                        <motion.div
                          key={f.id}
                          layout
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                            !f.eligible
                              ? "opacity-40 cursor-not-allowed border-gray-100 bg-gray-50"
                              : isDone
                              ? "border-green-300 bg-green-50"
                              : isErr
                              ? "border-red-300 bg-red-50"
                              : isSelected
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-primary/50"
                          }`}
                          onClick={() => !isDone && !isErr && toggleSelect(f.id, f.eligible)}
                        >
                          {/* Checkbox */}
                          <div className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                            isDone ? "bg-green-500 border-green-500" :
                            isErr ? "bg-red-500 border-red-500" :
                            isSelected ? "bg-primary border-primary" : "border-gray-300"
                          }`}>
                            {(isSelected || isDone) && !isErr && <CheckCircle2 className="h-3 w-3 text-white" />}
                            {isErr && <X className="h-3 w-3 text-white" />}
                          </div>

                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{f.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {f.sizeLabel}
                              {f.reason && <span className="ml-2 text-red-500">{f.reason}</span>}
                              {state?.message && (
                                <span className={`ml-2 ${isDone ? "text-green-600" : "text-red-500"}`}>
                                  · {state.message}
                                </span>
                              )}
                            </p>
                          </div>

                          {isImporting && <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />}
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Import button + progress */}
                  {importing && (
                    <div className="space-y-1">
                      <Progress value={totalProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center">
                        {importedCount}/{selected.size} importados
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full font-bold"
                    onClick={handleImportSelected}
                    disabled={selected.size === 0 || importing}
                  >
                    {importing ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" />Importando...</>
                    ) : (
                      <><RefreshCw className="h-4 w-4 mr-2" />Importar {selected.size > 0 ? `${selected.size} PDFs` : "Seleccionados"}</>
                    )}
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="local"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <Input
                id="pdf"
                type="file"
                accept=".pdf"
                onChange={(e) => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setLocalStatus("idle") } }}
                disabled={localStatus === "uploading"}
              />

              {localStatus === "uploading" && (
                <div className="flex items-center gap-2 text-sm text-blue-600 animate-pulse font-medium">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando documento y generando embeddings...
                </div>
              )}
              {localStatus === "success" && (
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" />{localMessage}
                </div>
              )}
              {localStatus === "error" && (
                <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                  <AlertCircle className="h-4 w-4" />{localMessage}
                </div>
              )}

              <Button
                className="w-full font-bold"
                onClick={handleLocalUpload}
                disabled={!file || localStatus === "uploading" || localStatus === "success"}
              >
                {localStatus === "uploading" ? "Subiendo..." : "Comenzar Indexación"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
