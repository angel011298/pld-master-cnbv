"use client"

import * as React from "react"
import { Shield, User, Calendar, Lock, CheckSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function InviteAcceptance() {
  const [loading, setLoading] = React.useState(false)

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Tras verificar en BD, se redirige a /dashboard
    setTimeout(() => window.location.href = "/dashboard", 1500)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Has sido invitado a Certifik PLD</h2>
          <p className="text-sm text-slate-500 mt-2">
            Tu empresa te ha otorgado una licencia Premium. Completa tu perfil para acceder.
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input required placeholder="Nombre Completo" className="pl-10 h-12 rounded-xl bg-slate-50" />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input required type="password" placeholder="Crea tu contraseña" className="pl-10 h-12 rounded-xl bg-slate-50" />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <select required className="w-full pl-10 h-12 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-blue-500 appearance-none text-slate-700">
              <option value="" disabled selected>Fecha en que presentas el examen</option>
              <option value="2026-06-27">27 de junio de 2026</option>
              <option value="2026-10-24">24 de octubre de 2026</option>
            </select>
          </div>

          <label className="flex items-start gap-3 mt-6 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
            <input required type="checkbox" className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300" />
            <span className="text-xs text-slate-600 font-medium">
              Acepto que mi progreso, calificaciones y racha de estudio sean visibles para el administrador de mi equipo (Quien pagó la licencia).
            </span>
          </label>

          <Button type="submit" disabled={loading} className="w-full h-14 text-lg font-black rounded-xl bg-blue-600 hover:bg-blue-700 mt-4">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Activar mi cuenta y entrar"}
          </Button>
        </form>
      </div>
    </div>
  )
}