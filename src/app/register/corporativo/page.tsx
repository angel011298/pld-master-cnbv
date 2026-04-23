"use client"

import * as React from "react"
import { Building2, Mail, Lock, Phone, User, Loader2, CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase" // <-- Importamos tu cliente de Supabase

export default function RegisterCorporativo() {
  const [loading, setLoading] = React.useState(false)
  const [googleLoading, setGoogleLoading] = React.useState(false)

  // Función para manejar el login con Google
  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/welcome`, // O a donde quieras redirigir tras el login
        }
      })
      if (error) throw error
    } catch (error) {
      console.error("Error iniciando sesión con Google:", error)
      setGoogleLoading(false)
    }
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "corporativo" }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Lado Izquierdo - Beneficios Corporativos */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 bg-slate-900 p-12 text-white flex-col justify-center relative overflow-hidden">
        <div className="relative z-10">
          <Building2 className="h-16 w-16 text-emerald-400 mb-8" />
          <h1 className="text-4xl font-black mb-6 leading-tight">Certifica a tu equipo con <br/><span className="text-emerald-400">Licencia Corporativa</span></h1>
          
          <div className="space-y-6 mt-10 text-slate-300">
            <div className="flex gap-4 items-center">
              <CheckCircle className="text-emerald-400 h-6 w-6 shrink-0" />
              <p className="font-medium">Acceso Premium para 5 usuarios simultáneos.</p>
            </div>
            <div className="flex gap-4 items-center">
              <CheckCircle className="text-emerald-400 h-6 w-6 shrink-0" />
              <p className="font-medium">Panel de administración para medir el progreso del equipo.</p>
            </div>
            <div className="flex gap-4 items-center">
              <CheckCircle className="text-emerald-400 h-6 w-6 shrink-0" />
              <p className="font-medium">Facturación automatizada (CFDI 4.0) para tu entidad.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-6 py-12 lg:p-12">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900">Registro de Entidad</h2>
            <p className="text-sm text-slate-500 mt-2">Crea la cuenta administradora para tu empresa.</p>
          </div>

          {/* BOTÓN DE GOOGLE AHORA ES FUNCIONAL */}
          <Button 
            onClick={handleGoogleLogin} 
            disabled={googleLoading}
            variant="outline" 
            className="w-full mb-6 font-bold h-12 rounded-xl relative overflow-hidden group"
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
                Continuar con Google
              </>
            )}
          </Button>

          <div className="relative flex items-center py-2 mb-6">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 uppercase">O usar correo corporativo</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4">
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input required placeholder="Nombre de la Entidad (Banco, Sofom, Fintech)" className="pl-10 h-12 rounded-xl bg-slate-50" />
            </div>

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input required placeholder="Nombre del Administrador" className="pl-10 h-12 rounded-xl bg-slate-50" />
            </div>
            
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input required type="email" placeholder="Correo corporativo" className="pl-10 h-12 rounded-xl bg-slate-50" />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input required type="password" placeholder="Contraseña de administrador" className="pl-10 h-12 rounded-xl bg-slate-50" />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input required type="tel" placeholder="Teléfono de la empresa" className="pl-10 h-12 rounded-xl bg-slate-50" />
            </div>

            <div className="bg-slate-50 p-4 rounded-xl mt-6 border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-700">Total a pagar:</span>
                <span className="text-xl font-black text-emerald-600">$9,999 MXN</span>
              </div>
              <p className="text-xs text-slate-500">
                Al continuar, serás redirigido a la pasarela de pago segura. Podrás solicitar tu factura CFDI al finalizar.
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-14 text-lg font-black rounded-xl bg-slate-900 hover:bg-slate-800 text-white mt-2">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Proceder al Pago Seguro"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}