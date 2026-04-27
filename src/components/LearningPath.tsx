"use client"

import React from "react"
import { Check, Lock, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUserProfile } from "@/hooks/useUserProfile"
import { CNBV_SYLLABUS } from "@/lib/constants"

export function LearningPath() {
  const { profile } = useUserProfile()
  const isPremium = profile?.effectiveTier === "premium"

  return (
    <div className="flex flex-col items-center gap-16 py-12 w-full max-w-4xl mx-auto px-4">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-black text-foreground mb-4 uppercase tracking-tighter">Ruta CNBV 2026</h1>
        <p className="text-muted-foreground text-lg font-medium opacity-80">
          Temario oficial desglosado paso a paso conforme a la guía.
        </p>
      </div>

      {CNBV_SYLLABUS.map((mod, index) => {
        // Módulo 1 es gratis, los demás requieren premium
        const isLocked = index > 0 && !isPremium

        return (
          <div key={mod.id} className="relative flex flex-col items-center w-full">
            <button
              className={cn(
                "z-10 h-24 w-24 rounded-full border-b-[8px] transition-all flex items-center justify-center shadow-xl mb-4",
                isLocked
                  ? "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed border-b-[4px]"
                  : "bg-primary border-primary/60 text-white hover:bg-primary/95 active:border-b-0 active:translate-y-2"
              )}
              disabled={isLocked}
            >
              {isLocked ? <Lock className="h-10 w-10" /> : index === 0 ? <Star className="h-10 w-10" /> : <Check className="h-10 w-10 stroke-[4px]" />}
            </button>

            {/* Tarjeta con el TEMARIO DESGLOSADO */}
            <div className={cn(
              "p-8 rounded-3xl text-left shadow-md border-2 transition-all w-full md:w-[600px]",
              isLocked ? "bg-gray-50 text-gray-400 border-gray-200" : "bg-white text-foreground border-primary/30"
            )}>
              <h3 className="font-black text-xl md:text-2xl mb-4 border-b pb-2">{mod.module}</h3>
              <ul className="space-y-3">
                {mod.topics.map((topic, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm md:text-base font-semibold">
                    <div className={cn("mt-1.5 h-2 w-2 rounded-full shrink-0", isLocked ? "bg-gray-300" : "bg-primary")} />
                    {topic}
                  </li>
                ))}
              </ul>
            </div>

            {index < CNBV_SYLLABUS.length - 1 && (
              <div className={cn(
                "absolute -bottom-16 left-1/2 -translate-x-1/2 w-3 h-16 -z-0 rounded-full",
                isLocked ? "bg-gray-100" : "bg-primary/20"
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}