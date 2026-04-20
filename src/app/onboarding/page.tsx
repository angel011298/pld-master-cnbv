"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { GraduationCap, Building2, Shield, ArrowRight, Star, Zap } from "lucide-react"
import Link from "next/link"

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" },
  }),
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-14 w-14 rounded-2xl bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/30">
            <Shield className="h-8 w-8 text-blue-900" />
          </div>
          <span className="text-3xl font-black text-white tracking-tight">Certifik PLD</span>
        </div>
        <p className="text-blue-200 text-lg font-medium max-w-md mx-auto">
          La plataforma #1 para certificarte en PLD/FT ante la CNBV
        </p>
        <div className="flex items-center justify-center gap-6 mt-4">
          {["+2,500 preguntas", "Estilo Duolingo", "Examen 2026"].map((badge) => (
            <span
              key={badge}
              className="text-xs font-bold text-yellow-300 bg-yellow-400/10 border border-yellow-400/30 px-3 py-1 rounded-full"
            >
              {badge}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Option cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* Option 1: Individual */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <Link href="/onboarding/individual">
            <div className="group relative bg-white rounded-3xl p-8 border-4 border-b-[8px] border-blue-100 hover:border-yellow-400 hover:border-b-yellow-500 transition-all duration-200 cursor-pointer hover:-translate-y-1 shadow-xl hover:shadow-yellow-400/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 group-hover:bg-yellow-400 transition-colors">
                  <GraduationCap className="h-7 w-7 text-white" />
                </div>
                <div>
                  <span className="inline-block text-xs font-black uppercase tracking-widest text-yellow-600 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full mb-2">
                    Individual
                  </span>
                  <h2 className="text-xl font-black text-gray-900 leading-tight">
                    Prepárate para tu examen de Certificación en PLD/FT por la CNBV
                  </h2>
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                {[
                  "Ruta personalizada por fecha de examen",
                  "30 reactivos de bienvenida (+50 XP)",
                  "Simulador estilo CENEVAL",
                  "Chatbot IA regulatorio",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Star className="h-4 w-4 text-yellow-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-blue-700">$2,999 <span className="text-sm font-medium text-gray-500">MXN IVA inc.</span></span>
                <div className="flex items-center gap-1 text-sm font-black text-blue-600 group-hover:text-yellow-600 transition-colors">
                  Comenzar <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Option 2: B2B */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <Link href="/onboarding/corporativo">
            <div className="group relative bg-gradient-to-br from-indigo-900 to-blue-900 rounded-3xl p-8 border-4 border-b-[8px] border-indigo-700 hover:border-yellow-400 hover:border-b-yellow-500 transition-all duration-200 cursor-pointer hover:-translate-y-1 shadow-xl hover:shadow-yellow-400/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-14 w-14 rounded-2xl bg-yellow-400 flex items-center justify-center shrink-0">
                  <Building2 className="h-7 w-7 text-blue-900" />
                </div>
                <div>
                  <span className="inline-block text-xs font-black uppercase tracking-widest text-yellow-300 bg-yellow-400/20 border border-yellow-400/30 px-2 py-0.5 rounded-full mb-2">
                    Corporativo
                  </span>
                  <h2 className="text-xl font-black text-white leading-tight">
                    Certifik PLD — Licencia Corporativa B2B
                  </h2>
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                {[
                  "5 usuarios premium incluidos",
                  "Dashboard de seguimiento grupal",
                  "Facturación corporativa (CFDI 4.0)",
                  "Soporte prioritario por WhatsApp",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm font-medium text-blue-200">
                    <Zap className="h-4 w-4 text-yellow-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-yellow-300">$4,995 <span className="text-sm font-medium text-blue-300">MXN IVA inc.</span></span>
                <div className="flex items-center gap-1 text-sm font-black text-yellow-400">
                  Ver planes <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-blue-400 text-sm mt-10 text-center"
      >
        ¿Ya tienes cuenta?{" "}
        <Link href="/" className="text-yellow-400 font-bold hover:underline">
          Ir al dashboard →
        </Link>
      </motion.p>
    </div>
  )
}
