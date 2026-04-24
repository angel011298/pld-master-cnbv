"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  Settings, Share2, Flame, Zap, Target, BookOpen, Clock, 
  Download, History, Lock, Unlock, Crown, ArrowRight, ShieldCheck,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useUserProfile } from "@/hooks/useUserProfile"
import { cn } from "@/lib/utils"

// Logros Gamificados (Mock mixto con lógica UI)
const ACHIEVEMENTS = [
  { id: 1, title: "Guardián del DOF", desc: "Lee 5 artículos de las Disposiciones Generales.", icon: BookOpen, unlocked: true, reward: 50 },
  { id: 2, title: "Ojo de Halcón", desc: "Responde 20 preguntas seguidas sobre Operaciones Inusuales.", icon: Target, unlocked: true, reward: 100 },
  { id: 3, title: "Imparable", desc: "Alcanza una racha de 14 días consecutivos.", icon: Flame, unlocked: false, reward: 150 },
  { id: 4, title: "Caza-Tipologías", desc: "Completa el módulo 5 al 100%.", icon: ShieldCheck, unlocked: false, reward: 200 },
]

export default function PerfilPage() {
  const { profile, loading } = useUserProfile()

  // Datos del perfil global
  const totalXp = profile?.totalXp ?? 0
  const streak = profile?.currentStreak ?? 0
  const isPremium = profile?.tier === 'premium'
  const level = Math.floor(totalXp / 1000) + 1

  // Mock de estadísticas de aprendizaje
  const precision = 82 // Porcentaje de acierto global
  const reactivos = 458 // Preguntas contestadas de 2500
  const examDate = new Date('2026-06-27')
  const daysLeft = Math.ceil((examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const readiness = 75 // Probabilidad de aprobación

  const handleCheckout = async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "individual" }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (e) {
      console.error("Error iniciando pago", e)
    }
  }

  if (loading) return <div className="p-8 flex justify-center"><Zap className="animate-pulse h-8 w-8 text-blue-500" /></div>

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 relative">
      
      {/* MOBILE STICKY BAR: Racha y XP siempre visibles al hacer scroll en celular */}
      <div className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 p-3 flex justify-between items-center rounded-b-2xl shadow-sm mb-4">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <span className="font-black text-orange-600">{streak}</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <span className="font-black text-yellow-600">{totalXp} XP</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: Identidad y Estadísticas (4/12) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* HEADER: Identidad */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center relative">
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-full transition-colors">
                <Share2 className="h-4 w-4" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
                <Settings className="h-4 w-4" />
              </button>
            </div>
            
            <div className="relative inline-block mt-4 mb-4">
              {/* Avatar Placeholder */}
              <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center border-4 border-white shadow-lg mx-auto">
                <span className="text-4xl">🦉</span>
              </div>
              <div className="absolute -bottom-3 -right-2 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full border-2 border-white shadow-sm">
                Nivel {level}
              </div>
            </div>
            
            <h1 className="text-2xl font-black text-slate-900">Carlos Mendoza</h1>
            <p className="text-sm font-bold text-slate-500 mb-2">Aspirante a Oficial de Cumplimiento</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-200">
              <Crown className="h-3 w-3" /> Liga Oro
            </div>
          </div>

          {/* ESTADÍSTICAS RÁPIDAS (Grid) */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Racha Actual", value: `${streak}`, icon: Flame, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" },
              { label: "XP Total", value: `${totalXp}`, icon: Zap, color: "text-yellow-500", bg: "bg-yellow-50", border: "border-yellow-100" },
              { label: "Precisión", value: `${precision}%`, icon: Target, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
              { label: "Reactivos", value: `${reactivos}`, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
            ].map((stat) => (
              <div key={stat.label} className={cn("p-4 rounded-2xl border-2 flex flex-col items-start cursor-pointer hover:scale-105 transition-transform", stat.bg, stat.border)}>
                <stat.icon className={cn("h-5 w-5 mb-2", stat.color)} />
                <span className={cn("text-2xl font-black", stat.color)}>{stat.value}</span>
                <span className="text-xs font-bold text-slate-500 mt-1">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* HISTORIAL Y CERTIFICADOS (Actividad) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-500" /> Historial Profesional
            </h3>
            {/* Mapa de Calor (Simulado CSS) */}
            <div className="flex flex-wrap gap-1 mb-6">
              {Array.from({ length: 60 }).map((_, i) => (
                <div key={i} className={`h-3 w-3 rounded-sm ${Math.random() > 0.6 ? 'bg-emerald-400' : Math.random() > 0.8 ? 'bg-emerald-600' : 'bg-slate-100'}`} />
              ))}
            </div>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-between font-bold text-slate-600 border-slate-200 hover:bg-slate-50">
                Descargar Constancia (PDF) <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between font-bold text-slate-600 border-slate-200 hover:bg-slate-50">
                Historial de Simuladores <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA: Readiness, Gamificación y Upsell (7/12) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* UPSELL BANNER (Solo visible si es Free Tier) */}
          {!isPremium && (
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
              <Crown className="absolute -right-4 -top-4 h-32 w-32 text-white opacity-10 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                  <Unlock className="h-5 w-5 text-yellow-400" /> Desbloquea tu potencial
                </h3>
                <p className="text-sm text-blue-100 mb-4 max-w-md">
                  Estás usando el modo limitado. Hazte Premium para acceder a +2,000 preguntas tipo CENEVAL y al Chatbot IA explicativo.
                </p>
                <Button onClick={handleCheckout} className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-black rounded-xl">
                  👑 Hazte Premium por $2,999
                </Button>
              </div>
            </div>
          )}

          {/* EL MEDIDOR DE "READINESS" (Killer Feature) */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="52" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                <circle 
                  cx="64" cy="64" r="52" stroke="currentColor" strokeWidth="12" fill="transparent" 
                  strokeDasharray="326" strokeDashoffset={326 - (326 * readiness) / 100} 
                  className={readiness > 70 ? "text-emerald-500" : "text-amber-500"} 
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-800">{readiness}%</span>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-black text-slate-900 mb-1">Probabilidad de Aprobación</h2>
              <p className="text-slate-500 font-medium text-sm mb-4">Basado en tu precisión y avance del temario.</p>
              
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3 mb-4">
                <Clock className="h-8 w-8 text-blue-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase">Cuenta Regresiva</p>
                  <p className="text-lg font-black text-blue-900">Faltan {daysLeft} días para tu examen</p>
                </div>
              </div>

              <Button variant="outline" className="w-full md:w-auto font-bold text-red-600 border-red-200 bg-red-50 hover:bg-red-100">
                <AlertTriangle className="h-4 w-4 mr-2" /> Ver mis áreas débiles
              </Button>
            </div>
          </div>

          {/* LOGROS E INSIGNIAS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-rose-500" /> Logros y Medallas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ACHIEVEMENTS.map((ach) => (
                <div key={ach.id} className={cn("p-4 rounded-2xl border-2 flex gap-4 transition-all hover:bg-slate-50 cursor-pointer", ach.unlocked ? "border-slate-200" : "border-dashed border-slate-200 bg-slate-50/50 grayscale opacity-60")}>
                  <div className={cn("h-12 w-12 rounded-full flex items-center justify-center shrink-0", ach.unlocked ? "bg-amber-100 text-amber-600" : "bg-slate-200 text-slate-400")}>
                    <ach.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">{ach.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ach.desc}</p>
                    <p className="text-[10px] font-black uppercase text-yellow-600 mt-2">Recompensa: +{ach.reward} XP</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LEADERBOARD (Liga) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" /> Liga Oro - Top Semanal
              </h3>
              <Button variant="link" className="text-blue-600 font-bold p-0">Ver Liga Completa</Button>
            </div>
            
            <div className="space-y-2">
              {[
                { pos: 4, name: "Ana P.", xp: 2100, isMe: false },
                { pos: 5, name: "Tú", xp: 2050, isMe: true },
                { pos: 6, name: "Roberto M.", xp: 1980, isMe: false },
              ].map((user) => (
                <div key={user.pos} className={cn("flex items-center justify-between p-3 rounded-xl border", user.isMe ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-transparent border-transparent")}>
                  <div className="flex items-center gap-4">
                    <span className={cn("font-black w-4 text-center", user.isMe ? "text-blue-600" : "text-slate-400")}>{user.pos}</span>
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs">👤</div>
                    <span className={cn("font-bold text-sm", user.isMe ? "text-blue-900" : "text-slate-700")}>{user.name}</span>
                  </div>
                  <span className={cn("font-black text-sm", user.isMe ? "text-blue-700" : "text-slate-500")}>{user.xp} XP</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}