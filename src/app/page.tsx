"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Shield, User, Building2, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-12 px-4">
      {/* Encabezado */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-900 text-yellow-400 mb-6 shadow-lg">
          <Shield className="h-8 w-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          Certifik PLD
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
          La plataforma definitiva para tu certificación CNBV. Selecciona tu modalidad para comenzar.
        </p>
      </div>

      {/* Planes / Onboarding */}
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* B2C - Individual */}
        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-100 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">B2C</div>
          <User className="h-12 w-12 text-blue-600 mb-6" />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Premium Individual</h2>
          <p className="text-slate-500 mb-6 text-sm">Para profesionales independientes que buscan asegurar su certificación.</p>
          
          <ul className="space-y-4 mb-8 flex-1">
            {[
              "Simulador de examen con 25 preguntas por módulo",
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
          
          <Link href="/register/individual" className="block w-full mt-auto">
            <button className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
              Comenzar Registro <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </motion.div>

        {/* B2B - Corporativo */}
        <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-3xl p-8 shadow-xl border-2 border-transparent relative overflow-hidden text-white flex flex-col">
          <div className="absolute top-0 right-0 bg-yellow-400 text-blue-900 text-xs font-bold px-4 py-1.5 rounded-bl-xl">B2B</div>
          <Building2 className="h-12 w-12 text-yellow-400 mb-6" />
          <h2 className="text-2xl font-black mb-2">Licencia Corporativa</h2>
          <p className="text-blue-200 mb-6 text-sm">Para Bancos, SOFOMES y Fintechs que certifican a su equipo (5 plazas).</p>
          
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
          
          <Link href="/register/corporativo" className="block w-full mt-auto">
            <button className="w-full py-4 rounded-xl bg-yellow-400 text-blue-900 font-black hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2">
              Contratar Licencia B2B <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}