"use client"

import React from "react"
import { Check, Lock, Play, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface Module {
  id: string
  title: string
  status: "completed" | "current" | "locked"
  icon: React.ReactNode
}

const modules: Module[] = [
  { id: "1", title: "Fundamentos e Instituciones Internacionales", status: "completed", icon: <Star className="h-6 w-6" /> },
  { id: "2", title: "Marco Jurídico Mexicano (Leyes y Disposiciones)", status: "current", icon: <Play className="h-6 w-6" /> },
  { id: "3", title: "Prevención y Gestión de Riesgos (EBR)", status: "locked", icon: <Lock className="h-6 w-6" /> },
  { id: "4", title: "Auditoría y Supervisión", status: "locked", icon: <Lock className="h-6 w-6" /> },
  { id: "5", title: "Tipologías e Inteligencia Financiera", status: "locked", icon: <Lock className="h-6 w-6" /> },
]

export function LearningPath() {
  return (
    <div className="flex flex-col items-center gap-16 py-12 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-black text-foreground mb-4 uppercase tracking-tighter">Ruta CNBV 2026</h1>
        <p className="text-muted-foreground text-lg font-medium opacity-80">Domina los pilares de la certificación paso a paso</p>
      </div>

      {modules.map((module, index) => (
        <div key={module.id} className="relative flex flex-col items-center">
          {/* Node Button */}
          <button
            className={cn(
              "z-10 h-28 w-28 rounded-full border-b-[8px] transition-all flex items-center justify-center shadow-xl",
              module.status === "completed" 
                ? "bg-primary border-primary/60 text-white hover:bg-primary/95 active:border-b-0 active:translate-y-2" 
                : module.status === "current"
                ? "bg-secondary border-secondary/60 text-white hover:bg-secondary/95 animate-pulse active:border-b-0 active:translate-y-2 shadow-secondary/30"
                : "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed border-b-[4px]"
            )}
            disabled={module.status === "locked"}
          >
            {module.status === "completed" ? <Check className="h-12 w-12 stroke-[4px]" /> : module.icon}
          </button>

          {/* Module Label */}
          <div className={cn(
            "mt-6 px-8 py-4 rounded-3xl text-center shadow-sm font-black text-xl border-2 transition-all",
            module.status === "locked" 
              ? "bg-gray-50 text-gray-300 border-gray-200" 
              : "bg-white text-foreground border-border card-premium"
          )}>
            {module.title}
          </div>

          {/* Connector Line */}
          {index < modules.length - 1 && (
            <div className={cn(
              "absolute -bottom-16 left-1/2 -translate-x-1/2 w-4 h-16 -z-0 rounded-full",
              module.status === "completed" ? "bg-primary/20" : "bg-gray-100"
            )} />
          )}
        </div>
      ))}
    </div>
  )
}
