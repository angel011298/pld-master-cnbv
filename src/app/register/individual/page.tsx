"use client"

import * as React from "react"
import { Mail, Lock, Phone, User, Calendar, Loader2, Trophy, Zap, Clock, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { AnimatedBorderButton } from "@/components/ui/animated-border-button"
import { Logo } from "@/components/Logo"

export default function RegisterIndividual() {
  const [loading, setLoading] = React.useState(false)
  const [googleLoading, setGoogleLoading] = React.useState(false)

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true)
      const { error } = await supabase().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
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
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* ── Panel izquierdo — paleta plataforma ─────────────────────────────── */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 p-12 text-white flex-col justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0A0F2E 0%, #0D1850 55%, #060A18 100%)" }}
      >
        {/* Dot grid texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(#ffffff 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }}
        />

        <div className="relative z-10">
          {/* Logo isotype — grande y visible */}
          <div className="mb-10">
            <Logo variant="isotype" size={96} />
          </div>

          <h1 className="text-4xl font-black mb-2 leading-tight">
            Por qué elegir
          </h1>
          <h2 className="text-4xl font-black mb-10 leading-tight text-white">
            Certifik PLD
          </h2>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="mt-0.5 bg-white/10 border border-white/10 p-2.5 rounded-xl h-11 w-11 flex items-center justify-center shrink-0">
                <Zap className="text-cyan-400 h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base mb-1">Años luz de Check PLD o 360EDUCA</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  Olvídate de leer PDFs aburridos o ver videos de 3 horas. Nuestra gamificación interactiva hace que retengas la información un 60% más rápido.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-0.5 bg-white/10 border border-white/10 p-2.5 rounded-xl h-11 w-11 flex items-center justify-center shrink-0">
                <Trophy className="text-cyan-400 h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base mb-1">Especialización Total CNBV</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  A diferencia de plataformas generalistas, nosotros estamos 100% enfocados en la estructura exacta del examen CENEVAL/CNBV mexicano.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-0.5 bg-white/10 border border-white/10 p-2.5 rounded-xl h-11 w-11 flex items-center justify-center shrink-0">
                <Clock className="text-cyan-400 h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base mb-1">IA Chatbot 24/7 Integrado</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  Resolvemos dudas de artículos específicos al instante. Sin esperar a que un instructor te responda por correo días después.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Panel derecho — formulario ──────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 py-12 lg:p-12 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-slate-100">

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900">Crea tu Cuenta</h2>
            <p className="text-sm text-slate-500 mt-2">
              Completa tu registro para desbloquear el acceso Premium.
            </p>
          </div>

          {/* Google */}
          <AnimatedBorderButton
            variant="cyan"
            wrapperClassName="rounded-xl w-full mb-6"
            className="w-full font-bold h-12 rounded-[10px] bg-white hover:bg-slate-50 text-slate-800 border border-slate-200"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
                Continuar con Google
              </>
            )}
          </AnimatedBorderButton>

          {/* Divider */}
          <div className="relative flex items-center py-2 mb-6">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 uppercase">
              O registro manual
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* Form */}
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
              <select
                required
                className="w-full pl-10 h-12 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-slate-400 appearance-none text-slate-700"
              >
                <option value="" disabled>Fecha en que presentas el examen</option>
                <option value="2026-06-27">27 de junio de 2026</option>
                <option value="2026-10-24">24 de octubre de 2026</option>
              </select>
            </div>

            {/* Info box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex gap-3 items-start">
              <CheckCircle className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 font-medium">
                Al crear tu cuenta, serás redirigido de forma segura al portal de pago para{" "}
                <strong>desbloquear todas las funciones y beneficios</strong>.
              </p>
            </div>

            {/* Submit — black + white animated border */}
            <AnimatedBorderButton
              type="submit"
              variant="white"
              wrapperClassName="rounded-xl w-full mt-2"
              className="w-full h-14 text-lg font-black rounded-[10px] bg-black hover:bg-neutral-800 text-white"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Crear cuenta y Pagar"
              )}
            </AnimatedBorderButton>
          </form>
        </div>
      </div>
    </div>
  )
}
