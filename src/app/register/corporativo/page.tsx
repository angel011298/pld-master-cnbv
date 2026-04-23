"use client"

import * as React from "react"
import { Shield, Building2, Mail, Users, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RegisterCorporativo() {
  const [loading, setLoading] = React.useState(false)
  const [emails, setEmails] = React.useState(["", "", "", "", ""])

  const updateEmail = (idx: number, val: string) => {
    setEmails(prev => prev.map((e, i) => i === idx ? val : e))
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "b2b", invites: emails.filter(e => e) }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-yellow-400 flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-7 w-7 text-blue-900" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Configuración de Licencia</h2>
          <p className="text-sm text-slate-500 mt-1">Ingresa los datos fiscales y asigna tus plazas.</p>
        </div>

        <form onSubmit={handleCheckout} className="space-y-8">
          {/* Datos Fiscales */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" /> 1. Datos para Facturación (Deducible)
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Input required placeholder="RFC" className="h-12 rounded-xl bg-slate-50 uppercase" />
              <Input required placeholder="Razón Social o Nombre Completo" className="h-12 rounded-xl bg-slate-50" />
              <Input required placeholder="Nombre del Equipo o Departamento" className="h-12 rounded-xl bg-slate-50 md:col-span-2" />
            </div>
          </div>

          {/* Plazas */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" /> 2. Correos a invitar (5 Plazas)
            </h3>
            <div className="space-y-3">
              {emails.map((email, idx) => (
                <div key={idx} className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="email" 
                    placeholder={`correo${idx + 1}@tuempresa.com`} 
                    value={email}
                    onChange={(e) => updateEmail(idx, e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200" 
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 font-medium bg-blue-50 p-3 rounded-lg text-blue-700">
              💡 No tienes que llenar todos ahora. Los usuarios recibirán un enlace para crear su contraseña y aceptar el rastreo de progreso.
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-14 text-lg font-black rounded-xl bg-yellow-400 text-blue-900 hover:bg-yellow-300">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Pagar $4,995 MXN (IVA Incluido)"}
          </Button>
        </form>
      </div>
    </div>
  )
}