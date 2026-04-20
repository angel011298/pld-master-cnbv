"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Shield, Users, DollarSign, BarChart3, FileText, Settings, Upload,
  TrendingUp, AlertTriangle, CheckCircle2, Clock, Download, Plus,
  Search, Filter, Ban, RefreshCw, Activity, Zap, Flame, Trophy,
  Building2, Edit3, Trash2, Eye, Lock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

const SUPER_ADMIN_EMAIL = "553angelortiz@gmail.com"

type AdminTab = "cms" | "ventas" | "usuarios" | "analytics" | "logs"

const TABS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: "cms", label: "Gestión de Contenido", icon: FileText },
  { id: "ventas", label: "Ventas / Stripe", icon: DollarSign },
  { id: "usuarios", label: "Usuarios & B2B", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "logs", label: "Auditoría & Logs", icon: Activity },
]

// ─── Mock data ────────────────────────────────────────────────────
const MOCK_USERS = [
  { email: "usuario1@banco.com", name: "Ana García", xp: 4200, streak: 12, tier: "premium", examDate: "2026-06-27" },
  { email: "usuario2@sofom.mx", name: "Carlos López", xp: 1800, streak: 5, tier: "free", examDate: "2026-10-24" },
  { email: "usuario3@fintech.io", name: "María Torres", xp: 8750, streak: 31, tier: "premium", examDate: "2026-06-27" },
  { email: "usuario4@cnbv.mx", name: "Roberto Díaz", xp: 320, streak: 2, tier: "free", examDate: "2026-10-24" },
]

const MOCK_TRANSACTIONS = [
  { id: "pi_001", amount: 2999, currency: "MXN", status: "succeeded", customer: "ana@banco.com", date: "2026-04-18" },
  { id: "pi_002", amount: 4995, currency: "MXN", status: "succeeded", customer: "corp@empresa.mx", date: "2026-04-17" },
  { id: "pi_003", amount: 2999, currency: "MXN", status: "failed", customer: "test@user.com", date: "2026-04-16" },
  { id: "pi_004", amount: 2999, currency: "MXN", status: "refunded", customer: "refund@user.com", date: "2026-04-15" },
]

const MOCK_QUESTIONS = [
  { id: "q001", text: "¿Cuál es el umbral para reportes en efectivo?", area: "Reportería", sector: "Banca", correct: "$10,000 USD" },
  { id: "q002", text: "¿Quién supervisa PLD/FT en Fintechs?", area: "Marco Jurídico", sector: "Fintech", correct: "CNBV" },
  { id: "q003", text: "¿Qué es el EBR?", area: "Prevención", sector: "General", correct: "Enfoque Basado en Riesgo" },
]

export default function AdminPage() {
  const [email, setEmail] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [tab, setTab] = React.useState<AdminTab>("cms")
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    const sb = supabase()
    sb.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (email !== SUPER_ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="h-20 w-20 rounded-3xl bg-red-100 flex items-center justify-center">
          <Lock className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-gray-900">Acceso Restringido</h1>
        <p className="text-gray-500 max-w-sm">
          Este panel solo es accesible para el Super Administrador de la plataforma.
        </p>
        <Button variant="outline" onClick={() => window.location.href = "/"} className="text-gray-700">
          Volver al Dashboard
        </Button>
      </div>
    )
  }

  const filteredUsers = MOCK_USERS.filter(
    (u) => u.email.includes(search) || u.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-blue-700 flex items-center justify-center">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900">Dashboard Maestro</h1>
          <p className="text-gray-500 text-sm">Super Admin · {email}</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "MRR", value: "$17,994", sub: "MXN / mes", icon: TrendingUp, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "B2B Sales", value: "$9,990", sub: "2 licencias corp.", icon: Building2, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "Usuarios", value: "4", sub: "2 premium · 2 free", icon: Users, color: "text-indigo-700", bg: "bg-indigo-50" },
          { label: "Reactivos", value: "2,543", sub: "banco de preguntas", icon: FileText, color: "text-yellow-700", bg: "bg-yellow-50" },
        ].map((kpi) => (
          <motion.div key={kpi.label} whileHover={{ scale: 1.02 }}>
            <Card className="border-2 border-gray-200">
              <CardContent className="py-5">
                <div className={`h-9 w-9 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
                <p className="text-xs font-bold text-gray-500 mt-0.5">{kpi.label}</p>
                <p className="text-xs text-gray-400">{kpi.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-bold whitespace-nowrap border-b-2 -mb-px transition-all ${
                  tab === t.id ? "border-blue-700 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── CMS ── */}
      {tab === "cms" && (
        <div className="space-y-6">
          {/* Questions */}
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Banco de Reactivos
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-1 text-gray-700 border-gray-300">
                  <Upload className="h-4 w-4" /> Carga CSV/JSON
                </Button>
                <Button size="sm" className="gap-1 bg-blue-700 hover:bg-blue-800 text-white">
                  <Plus className="h-4 w-4" /> Nueva Pregunta
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {MOCK_QUESTIONS.map((q) => (
                  <div key={q.id} className="flex items-start justify-between gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{q.text}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">{q.area}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full">{q.sector}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Biblioteca de Documentos (Admin)
              </CardTitle>
              <Button size="sm" className="gap-1 bg-indigo-700 hover:bg-indigo-800 text-white">
                <Upload className="h-4 w-4" /> Subir Documento
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {["LFPIORPI 2024", "Disposiciones CNBV Banca v3.2", "Guía EBR 2024"].map((doc, i) => (
                <div key={doc} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-semibold text-gray-800">{doc}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">v{i + 1}.0</span>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-indigo-600">
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 mt-2 pt-2 border-t">
                Al actualizar un documento, los usuarios recibirán una notificación automática.
              </p>
            </CardContent>
          </Card>

          {/* Sector Editor */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Settings className="h-5 w-5 text-emerald-600" />
                Configurador de Sectores
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["Banca Múltiple", "SOFOM ENR", "Fintech (IFC/IFPE)", "SOCAP/SOFIPO", "Casa de Bolsa"].map((s) => (
                <Button key={s} variant="outline" className="h-auto py-3 flex-col gap-1 text-gray-700 border-gray-300 hover:border-blue-400">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span className="text-xs font-bold">{s}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── VENTAS ── */}
      {tab === "ventas" && (
        <div className="space-y-6">
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                Log de Transacciones (Stripe)
              </CardTitle>
              <Button size="sm" variant="outline" className="gap-1 text-gray-700 border-gray-300">
                <Download className="h-4 w-4" /> Exportar CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      {["ID", "Monto", "Estado", "Cliente", "Fecha", "Acciones"].map((h) => (
                        <th key={h} className="text-left pb-3 font-black text-gray-700 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {MOCK_TRANSACTIONS.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4 font-mono text-xs text-gray-500">{tx.id}</td>
                        <td className="py-3 pr-4 font-black text-gray-900">${tx.amount.toLocaleString()} {tx.currency}</td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-black ${
                            tx.status === "succeeded" ? "bg-emerald-100 text-emerald-700" :
                            tx.status === "failed" ? "bg-red-100 text-red-600" :
                            "bg-gray-100 text-gray-600"
                          }`}>{tx.status}</span>
                        </td>
                        <td className="py-3 pr-4 text-gray-700 text-xs">{tx.customer}</td>
                        <td className="py-3 pr-4 text-gray-400 text-xs">{tx.date}</td>
                        <td className="py-3">
                          <Button size="sm" variant="ghost" className="text-xs text-gray-500 hover:text-blue-600">
                            Reembolso
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Settings className="h-5 w-5 text-yellow-600" />
                Cupones y Promociones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input placeholder="CERTIFIK2026" className="rounded-xl border-2 border-gray-200 text-gray-800 placeholder:text-gray-400" />
                <Input placeholder="% o $ descuento" className="rounded-xl border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 w-40" />
                <Button className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-black shrink-0">
                  <Plus className="h-4 w-4 mr-1" /> Crear
                </Button>
              </div>
              {["CERTIFIK2026 — 20% off", "BANCO2026 — $500 MXN", "LAUNCH50 — 50% off"].map((c) => (
                <div key={c} className="flex items-center justify-between p-3 rounded-xl bg-yellow-50 border border-yellow-200">
                  <span className="text-sm font-bold text-yellow-800">{c}</span>
                  <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── USUARIOS ── */}
      {tab === "usuarios" && (
        <div className="space-y-6">
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Directorio de Usuarios
              </CardTitle>
              <Button size="sm" className="gap-1 bg-blue-700 hover:bg-blue-800 text-white">
                <Plus className="h-4 w-4" /> Alta Manual
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por correo o nombre..."
                  className="pl-9 rounded-xl border-2 border-gray-200 text-gray-800 placeholder:text-gray-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                {filteredUsers.map((u) => (
                  <div key={u.email} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-white transition-colors">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <span className="text-blue-700 font-black text-sm">{u.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-1 text-xs font-bold text-yellow-600">
                        <Zap className="h-3.5 w-3.5" />{u.xp.toLocaleString()} XP
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
                        <Flame className="h-3.5 w-3.5" />{u.streak}d
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                        u.tier === "premium" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"
                      }`}>{u.tier}</span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600" title="Impersonate">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-red-500" title="Suspender">
                        <Ban className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-yellow-600" title="Reset password">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── ANALYTICS ── */}
      {tab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-black text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-red-500" />
                  Mapa de Calor de Conocimiento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { topic: "Reportes de Operaciones Inusuales", fail: 78 },
                  { topic: "Umbrales en efectivo", fail: 65 },
                  { topic: "EBR — Clasificación de Riesgo", fail: 61 },
                  { topic: "Plazos de reportería", fail: 54 },
                ].map((item) => (
                  <div key={item.topic} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-gray-700">
                      <span className="truncate">{item.topic}</span>
                      <span className="text-red-500 shrink-0 ml-2">{item.fail}% fallan</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: `${item.fail}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-black text-gray-900 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Métricas de Retención
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Racha promedio", value: "8.3 días" },
                  { label: "Hora pico de estudio", value: "8–9 PM" },
                  { label: "Sesiones / semana", value: "4.2 / usuario" },
                  { label: "Tasa de retención (30d)", value: "68%" },
                ].map((m) => (
                  <div key={m.label} className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">{m.label}</span>
                    <span className="text-sm font-black text-gray-900">{m.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-black text-gray-900 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  Leaderboard Global
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {MOCK_USERS.sort((a, b) => b.xp - a.xp).map((u, i) => (
                  <div key={u.email} className="flex items-center gap-3 p-2 rounded-lg">
                    <span className="text-sm font-black text-gray-400 w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{u.name}</p>
                    </div>
                    <span className="text-sm font-black text-yellow-600">{u.xp.toLocaleString()} XP</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── LOGS ── */}
      {tab === "logs" && (
        <div className="space-y-6">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-600" />
                Logs de Actividad del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-xs">
                {[
                  { time: "2026-04-20 10:32:01", level: "INFO", msg: "Usuario ana@banco.com completó módulo: Marco Jurídico" },
                  { time: "2026-04-20 10:28:45", level: "WARN", msg: "Chatbot IA: pregunta sin respuesta sobre 'CFDI 5.0 y PLD'" },
                  { time: "2026-04-20 10:15:22", level: "INFO", msg: "Pregunta q003 editada por admin: 553angelortiz@gmail.com" },
                  { time: "2026-04-20 09:55:11", level: "INFO", msg: "Pago exitoso: pi_002 — $4,995 MXN — corp@empresa.mx" },
                  { time: "2026-04-20 09:41:03", level: "ERROR", msg: "Webhook Stripe falló: pi_003 — customer no existe" },
                  { time: "2026-04-20 09:30:00", level: "INFO", msg: "Token IA: 12,430 tokens usados en sesión (OpenAI GPT-4o)" },
                ].map((log, i) => (
                  <div key={i} className={`flex gap-3 p-3 rounded-lg border ${
                    log.level === "ERROR" ? "bg-red-50 border-red-200" :
                    log.level === "WARN" ? "bg-yellow-50 border-yellow-200" :
                    "bg-gray-50 border-gray-200"
                  }`}>
                    <span className="text-gray-400 shrink-0">{log.time}</span>
                    <span className={`font-black shrink-0 ${
                      log.level === "ERROR" ? "text-red-600" :
                      log.level === "WARN" ? "text-yellow-600" :
                      "text-emerald-600"
                    }`}>[{log.level}]</span>
                    <span className="text-gray-700">{log.msg}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Estado del Sistema IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { service: "Vercel (Next.js)", status: "operational", latency: "234ms" },
                { service: "Supabase (DB + Auth)", status: "operational", latency: "45ms" },
                { service: "Google Gemini (RAG)", status: "operational", latency: "812ms" },
                { service: "Stripe (Pagos)", status: "operational", latency: "321ms" },
              ].map((svc) => (
                <div key={svc.service} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-bold text-gray-800">{svc.service}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{svc.latency}</span>
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {svc.status}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
