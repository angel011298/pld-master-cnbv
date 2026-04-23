"use client"

import * as React from "react"
import { Shield, Mail, Lock, Phone, User, Calendar, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RegisterIndividual() {
  const [loading, setLoading] = React.useState(false)

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Aquí se enviaría el código de 6 dígitos (OTP) vía Supabase Auth
      // Tras confirmar, redirigimos a Stripe:
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "individual" }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <Shield className="h-10 w-10 text-blue-600 mx-auto mb-3" />
          <h2 className="text-2xl font-black text-slate-900">Crea tu Cuenta</h2>
          <p className="text-sm text-slate-500 mt-1">Premium Individual B2C</p>
        </div>

        <Button variant="outline" className="w-full mb-6 font-bold h-12">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5 mr-2" />
          Continuar con Google
        </Button>

        <div className="relative flex items-center py-2 mb-6">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 uppercase">O registro manual</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <form onSubmit={handleCheckout} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input required placeholder="Nombre Completo" className="pl-10 h-12 rounded-xl bg-slate-50" />
          </div>
          
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input required type="email" placeholder="Correo electrónico" className="pl-10 h-12 rounded-xl bg-slate-50" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input required type="password" placeholder="Contraseña" className="pl-10 h-12 rounded-xl bg-slate-50" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input required type="password" placeholder="Confirmar" className="pl-10 h-12 rounded-xl bg-slate-50" />
            </div>
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input required type="tel" placeholder="Teléfono de contacto" className="pl-10 h-12 rounded-xl bg-slate-50" />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <select required className="w-full pl-10 h-12 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none text-slate-700">
              <option value="" disabled selected>Fecha en que presentas el examen</option>
              <option value="2026-06-27">27 de junio de 2026</option>
              <option value="2026-10-24">24 de octubre de 2026</option>
            </select>
          </div>

          <p className="text-xs text-slate-500 text-center mb-4 mt-2">
            Se te enviará un código de 6 dígitos a tu correo para confirmar tu identidad.
          </p>

          <Button type="submit" disabled={loading} className="w-full h-14 text-lg font-black rounded-xl bg-blue-600 hover:bg-blue-700">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Pagar $2,999 MXN"}
          </Button>
        </form>
      </div>
    </div>
  )
}