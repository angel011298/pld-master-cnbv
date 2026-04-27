"use client"

import React from "react"
import { Check, Lock, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUserProfile } from "@/hooks/useUserProfile"

interface Module {
  id: string
  title: string
  isPremium: boolean
  icon: React.ReactNode
}

// Temario estrictamente alineado a la Guía PLD/FT_CNBV (Omitiendo Módulo 0)
const modules: Module[] = [
  { id: "1", title: "Módulo 1: Conocimientos básicos en materia de PLD/FT", isPremium: false, icon: <Star className="h-6 w-6" /> },
  { id: "2", title: "Módulo 2: Conocimientos técnicos en materia de PLD/FT", isPremium: true, icon: <Lock className="h-6 w-6" /> },
  { id: "3", title: "Módulo 3: Conocimientos de auditoría, supervisión y enfoque basado en riesgos en materia de PLD/FT", isPremium: true, icon: <Lock className="h-6 w-6" /> },
]

export function LearningPath() {
  const { profile } = useUserProfile()
  const isPremium = profile?.effectiveTier === "premium"

  return (
    <div className="flex flex-col items-center gap-16 py-12 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-black text-foreground mb-4 uppercase tracking-tighter">Ruta CNBV 2026</h1>
        <p className="text-muted-foreground text-lg font-medium opacity-80">Domina los pilares de la guía de certificación paso a paso</p>
      </div>

      {modules.map((module, index) => {
        const isLocked = module.isPremium && !isPremium

        return (
        <div key={module.id} className="relative flex flex-col items-center">
          <button
            className={cn(
              "z-10 h-28 w-28 rounded-full border-b-[8px] transition-all flex items-center justify-center shadow-xl",
              isLocked
                ? "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed border-b-[4px]"
                : "bg-primary border-primary/60 text-white hover:bg-primary/95 active:border-b-0 active:translate-y-2"
            )}
            disabled={isLocked}
          >
            {isLocked ? module.icon : <Check className="h-12 w-12 stroke-[4px]" />}
          </button>

          <div className={cn(
            "mt-6 px-8 py-4 rounded-3xl text-center shadow-sm font-black text-xl border-2 transition-all max-w-md",
            isLocked ? "bg-gray-50 text-gray-300 border-gray-200" : "bg-white text-foreground border-border card-premium"
          )}>
            {module.title}
          </div>

          {index < modules.length - 1 && (
            <div className={cn(
              "absolute -bottom-16 left-1/2 -translate-x-1/2 w-4 h-16 -z-0 rounded-full",
              isLocked ? "bg-gray-100" : "bg-primary/20"
            )} />
          )}
        </div>
        )
      })}
    </div>
  )
}