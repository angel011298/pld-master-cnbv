"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Shield, Building2, Users, Mail, Plus, Trash2, ArrowLeft, CheckCircle2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

const SEATS = 5

const FEATURES = [
  "5 usuarios premium simultáneos",
  "Dashboard de progreso grupal",
  "Facturación corporativa CFDI 4.0",
  "Acceso a todos los módulos y reactivos",
  "Chatbot IA regulatorio ilimitado",
  "Soporte prioritario vía WhatsApp",
  "Reporte mensual de avance por usuario",
]

export default function CorporativoPage() {
  const [emails, setEmails] = React.useState<string[]>(["", "", "", "", ""])
  const [submitted, setSubmitted] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  function updateEmail(idx: number, val: string) {
    setEmails((prev) => prev.map((e, i) => (i === idx ? val : e)))
  }

  async function handleCheckout() {
    const valid = emails.filter((e) => e.includes("@"))
    if (valid.length < 1) {
      setError("Ingresa al menos 1 correo electrónico válido.")
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "b2b", seats: SEATS, invites: valid }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setSubmitted(true)
      }
    } catch {
      setError("Error al procesar. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-10 shadow-2xl text-center max-w-md">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 mb-2">¡Licencia Corporativa Activada!</h2>
          <p className="text-gray-600">Los correos registrados recibirán invitaciones para activar su cuenta premium.</p>
          <Link href="/" className="mt-6 block">
            <Button className="w-full py-5 font-black rounded-2xl bg-blue-600 text-white">Ir al Dashboard</Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back */}
        <Link href="/onboarding" className="flex items-center gap-2 text-blue-300 hover:text-white transition-colors mb-6 font-bold">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-yellow-400 flex items-center justify-center">
            <Shield className="h-7 w-7 text-blue-900" />
          </div>
          <div>
            <span className="text-white font-black text-2xl">Certifik PLD</span>
            <p className="text-blue-300 text-sm font-medium">Licencia Corporativa B2B</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Features */}
          <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-yellow-400" />
              <span className="text-white font-black">Plan Corporativo</span>
            </div>
            <div className="text-center mb-5">
              <span className="text-4xl font-black text-yellow-300">$4,995</span>
              <span className="text-blue-300 text-sm block">MXN IVA incluido</span>
              <span className="text-blue-200 text-xs mt-1 block">{SEATS} usuarios · Acceso 12 meses</span>
            </div>
            <ul className="space-y-2">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-blue-200">
                  <Zap className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Email form */}
          <div className="md:col-span-3 bg-white rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <h2 className="font-black text-gray-900">Designar {SEATS} usuarios</h2>
                <p className="text-xs text-gray-500">Recibirán un link de invitación premium</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {emails.map((email, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-black text-blue-700 shrink-0">
                    {idx + 1}
                  </div>
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder={`correo${idx + 1}@empresa.com`}
                      value={email}
                      onChange={(e) => updateEmail(idx, e.target.value)}
                      className="pl-9 rounded-xl border-2 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  {email && (
                    <button onClick={() => updateEmail(idx, "")} className="text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 text-xs text-blue-700 font-medium">
              💡 Al estilo Spotify Familiar: cada usuario recibirá un correo con su link de activación personal.
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <Button
              className="w-full py-6 text-lg font-black rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-blue-900 border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? "Procesando..." : "💳 Contratar por $4,995 MXN"}
            </Button>
            <p className="text-center text-xs text-gray-400 mt-3">Pago seguro vía Stripe · Factura CFDI 4.0 disponible</p>
          </div>
        </div>
      </div>
    </div>
  )
}
