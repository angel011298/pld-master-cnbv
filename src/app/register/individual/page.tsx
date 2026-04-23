"use client"

import * as React from "react"
import { Shield, Mail, Lock, Phone, User, Calendar, Loader2, Trophy, Zap, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase" // <-- Importamos tu cliente de Supabase

export default function RegisterIndividual() {
  const [loading, setLoading] = React.useState(false)
  const [googleLoading, setGoogleLoading] = React.useState(false)

  // Función para manejar el login con Google
  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true)
      const { error } = await supabase().auth.signInWithOAuth({
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
        body: JSON.stringify({ type: "individual" }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Lado Izquierdo - Beneficios */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 bg-blue-900 p-12 text-white flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 2px, transparent 2px)", backgroundSize: "30px 30px" }}></div>
        
        <div className="relative z-10">
          <Shield className="h-16 w-16 text-yellow-400 mb-8" />
          <h1 className="text-4xl font-black mb-6 leading-tight">Por qué elegir <br/><span className="text-yellow-400">Certifik PLD</span></h1>
          
          <div className="space-y-8 mt-10">
            <div className="flex gap-4">
              <div className="mt-1 bg-blue-800 p-2 rounded-lg h-10 w-10 flex items-center justify-center shrink-0">
                <Zap className="text-yellow-400 h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Años luz de Check PLD o 360EDUCA</h3>
                <p className="text-blue-200 text-sm leading-relaxed">Olvídate de leer PDFs aburridos o ver videos de 3 horas. Nuestra gamificación interactiva hace que retengas la información un 60% más rápido.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1 bg-blue-800 p-2 rounded-lg h-10 w-10 flex items-center justify-center shrink-0">
                <Trophy className="text-yellow-400 h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Especialización Total CNBV</h3>
                <p className="text-blue-200 text-sm leading-relaxed">A diferencia de plataformas generalistas, nosotros estamos 100% enfocados en la estructura exacta del examen CENEVAL/CNBV mexicano.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1 bg-blue-800 p-2 rounded-lg h-10 w-10 flex items-center justify-center shrink-0">
                <Clock className="text-yellow-400 h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">IA Chatbot 24/7 Integrado</h3>
                <p className="text-blue-200 text-sm leading-relaxed">Resolvemos dudas de artículos específicos al instante. Sin esperar a que un instructor te responda por correo días después.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-6 py-12 lg:p-12">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900">Crea tu Cuenta Individual</h2>
            <p className="text-sm text-slate-500 mt-2">Completa tu registro para desbloquear el acceso Premium.</p>
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
              <select required className="w-full pl-10 h-12 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-blue-500 appearance-none text-slate-700">
                <option value="" disabled selected>Fecha en que presentas el examen</option>
                <option value="2026-06-27">27 de junio de 2026</option>
                <option value="2026-10-24">24 de octubre de 2026</option>
              </select>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl mt-6 border border-blue-100 flex gap-3 items-start">
              <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 font-medium">
                Al crear tu cuenta, serás redirigido de forma segura al portal de pago para <strong>desbloquear todas las funciones y beneficios</strong>.
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-14 text-lg font-black rounded-xl bg-blue-600 hover:bg-blue-700 mt-2">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Crear cuenta y Pagar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}