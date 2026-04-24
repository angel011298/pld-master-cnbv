"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Shield, User, Building2, ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase" // Importamos el cliente

export default function OnboardingPage() {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [googleLoading, setGoogleLoading] = React.useState(false)

  // Función para Iniciar Sesión con Correo/Contraseña
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase().auth.signInWithPassword({ email, password })
    if (!error) {
      window.location.href = "/dashboard"
    } else {
      alert("Error al iniciar sesión: Verifica que tu correo y contraseña sean correctos.")
      setLoading(false)
    }
  }

  // Función para Iniciar Sesión con Google
  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    const { error } = await supabase().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
    if (error) {
      alert("Error iniciando sesión con Google: " + error.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* BARRA SUPERIOR: INICIO DE SESIÓN */}
      <nav className="w-full bg-white border-b border-slate-200 py-4 px-6 flex flex-col lg:flex-row justify-between items-center gap-4 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-900" />
          <span className="font-black text-xl text-slate-900">Certifik PLD</span>
        </div>
        
        <form onSubmit={handleLogin} className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <span className="text-sm font-bold text-slate-600 hidden xl:block mr-2">Acceso a Alumnos:</span>
          
          <input 
            type="email" 
            placeholder="Tu correo" 
            className="h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full sm:w-48 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full sm:w-48 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button disabled={loading} type="submit" className="h-10 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 w-full sm:w-auto transition-colors flex justify-center items-center">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
            </button>
            <button disabled={googleLoading} type="button" onClick={handleGoogleLogin} className="h-10 px-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2 w-full sm:w-auto transition-colors">
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Google</span>
            </button>
          </div>
        </form>
      </nav>

      {/* CONTENIDO PRINCIPAL Y PLANES */}
      <div className="flex flex-col items-center justify-center py-12 px-4 flex-1">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-900 text-yellow-400 mb-6 shadow-lg">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Comienza tu preparación
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
            La plataforma definitiva para tu certificación CNBV. Selecciona tu modalidad para comenzar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl">
          
          {/* Plan Individual */}
          <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-100 relative overflow-hidden flex flex-col">
            <User className="h-12 w-12 text-blue-600 mb-6" />
            <h2 className="text-2xl font-black text-slate-900 mb-2">Premium Individual</h2>
            
            {/* CORRECCIÓN 1: PRECIO Y MARKETING MEJORADO */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-blue-600">$2,999</span>
              <span className="text-slate-500 text-sm font-bold">MXN / pago único</span>
            </div>
            
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              Asegura tu éxito con acceso total e ilimitado a todas las herramientas premium. 
              <strong className="text-blue-700"> Pago único sin mensualidades sorpresa</strong>, garantizando tu acceso hasta el día después de presentar tu examen.
            </p>
            
            <ul className="space-y-4 mb-8 flex-1">
              {[
                "Exámenes Simuladores de Examen tipo CENEVAL",
                "Ejercicios interactivos: Crucigramas, Sopa de letras, Completar texto y Relación de conceptos",
                "Chatbot de IA regulatorio ilimitado",
                "Progreso y analíticas de estudio personalizadas"
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>
            
            {/* BOTONES DE LA TARJETA INDIVIDUAL */}
            <div className="flex flex-col gap-3 mt-auto">
              <Link href="/trial" className="block w-full">
                <button className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg">
                  Comenzar Prueba Gratis <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/register/individual" className="block w-full">
                <button className="w-full py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-bold hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  Registro Directo Seguro <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Plan Corporativo */}
          <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-3xl p-8 shadow-xl border-2 border-transparent relative overflow-hidden text-white flex flex-col">
            <Building2 className="h-12 w-12 text-yellow-400 mb-6" />
            <h2 className="text-2xl font-black mb-2">Licencia Corporativa</h2>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-yellow-400">$9,999</span>
              <span className="text-blue-200 text-sm font-bold">MXN / anual</span>
            </div>
            
            <p className="text-blue-200 mb-6 text-sm">Para Bancos, SOFOMES y Fintechs que certifican a su equipo (5 plazas incluidas).</p>
            
            <ul className="space-y-4 mb-8 flex-1">
              {[
                "Acceso Premium completo para 5 usuarios simultáneos",
                "Dashboard administrativo de progreso grupal",
                "Facturación corporativa CFDI 4.0 automatizada",
                "Soporte prioritario y reportes mensuales"
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-blue-50">{feature}</span>
                </li>
              ))}
            </ul>
            
            {/* BOTÓN DE LA TARJETA CORPORATIVA */}
            <div className="flex flex-col gap-3 mt-auto">
              <Link href="/register/corporativo" className="block w-full">
                <button className="w-full py-4 rounded-xl bg-yellow-400 text-blue-900 font-black hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 shadow-lg">
                  Contratar Licencia Corporativa <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}