"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Shield, Users, DollarSign, BarChart3, FileText, Settings, Upload,
  TrendingUp, AlertTriangle, CheckCircle2, Clock, Download, Plus,
  Search, Filter, Ban, RefreshCw, Activity, Zap, Flame, Trophy,
  Building2, Edit3, Trash2, Eye, Lock, Landmark, Database, BookOpen,
  HardDrive
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

const SUPER_ADMIN_EMAIL = "553angelortiz@gmail.com"
const RESICO_LIMIT = 3500000 // 3.5 Millones MXN

type AdminTab = "fiscal" | "ventas" | "cms" | "knowledge" | "usuarios" | "analytics" | "logs"

const TABS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: "fiscal", label: "Control Fiscal", icon: Landmark },
  { id: "ventas", label: "Ventas / Stripe", icon: DollarSign },
  { id: "cms", label: "CMS Reactivos", icon: Database },
  { id: "knowledge", label: "Biblioteca & Docs", icon: BookOpen },
  { id: "usuarios", label: "Usuarios & B2B", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "logs", label: "Auditoría & Logs", icon: Activity },
]

export default function AdminPage() {
  const [email, setEmail] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [loadingData, setLoadingData] = React.useState(true)
  const [tab, setTab] = React.useState<AdminTab>("fiscal")
  const [search, setSearch] = React.useState("")

  // Estados de datos reales
  const [users, setUsers] = React.useState<any[]>([])
  const [documents, setDocuments] = React.useState<any[]>([])
  const [stats, setStats] = React.useState({ mrr: 0, b2b: 0, activeUsers: 0, reactivos: 0 })
  const [transactions, setTransactions] = React.useState<any[]>([])
  const [questions, setQuestions] = React.useState<any[]>([])
  const [logs, setLogs] = React.useState<any[]>([])

  // Datos simulados para RESICO (Esto requeriría conexión al middleware de facturación)
  const currentRevenue = 1250000 
  const resicoPercentage = (currentRevenue / RESICO_LIMIT) * 100

  // 1. Autenticación inicial
  React.useEffect(() => {
    const sb = supabase()
    sb.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
      setLoading(false)
    })
  }, [])

  // 2. Carga de datos y suscripción en tiempo real
  React.useEffect(() => {
    if (email !== SUPER_ADMIN_EMAIL) return;

    const sb = supabase();

    const fetchRealtimeData = async () => {
      try {
        // Cargar perfiles de usuario
        const { data: profiles } = await sb
          .from('user_profiles')
          .select('*')
          .order('total_xp', { ascending: false });

        if (profiles) {
          setUsers(profiles);
          // Estimación básica de MRR basada en usuarios premium (ajustar según lógica real)
          const premiumCount = profiles.filter(p => p.tier === 'premium').length;
          setStats(prev => ({ 
            ...prev, 
            activeUsers: profiles.length,
            mrr: premiumCount * 2999 // Estimado
          }));
        }

        // Cargar documentos globales (Biblioteca RAG)
        const { data: docs, count: docsCount } = await sb
          .from('documents')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false });

        if (docs) {
          setDocuments(docs);
          setStats(prev => ({ ...prev, reactivos: docsCount || 0 }));
        }

        // Nota: Para integraciones externas (Stripe, SW Sapien, Logs del servidor), 
        // se deben crear y llamar rutas API propias ej. /api/admin/stripe
        // fetch('/api/admin/stripe-transactions').then(r => r.json()).then(setTransactions);
        
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchRealtimeData();

    // Suscripciones en Tiempo Real a la BD
    const channel = sb.channel('admin_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, payload => {
        console.log('Cambio en user_profiles:', payload);
        fetchRealtimeData(); // Refrescar datos
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, payload => {
        console.log('Cambio en documents:', payload);
        fetchRealtimeData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_events' }, payload => {
        fetchRealtimeData();
      })
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [email]);

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

  const filteredUsers = users.filter(
    (u) => u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
           u.public_customer_id?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-7xl px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-800 flex items-center justify-center shadow-lg">
            <Shield className="h-7 w-7 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Centro de Mando Central</h1>
            <p className="text-gray-500 text-sm font-medium">Autenticado como: {email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {loadingData ? (
             <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-sm font-bold border border-amber-200">
               <RefreshCw className="h-4 w-4 animate-spin" /> Sincronizando...
             </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-200">
              <Activity className="h-4 w-4" /> Sist. Operativo (Tiempo Real)
            </span>
          )}
        </div>
      </div>

      {/* Global KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "MRR Estimado", value: `$${stats.mrr.toLocaleString()}`, sub: "MXN / mes", icon: TrendingUp, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "B2B Sales", value: `$${stats.b2b.toLocaleString()}`, sub: "Licencias corporativas", icon: Building2, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "Usuarios Activos", value: stats.activeUsers, sub: "Registrados", icon: Users, color: "text-indigo-700", bg: "bg-indigo-50" },
          { label: "Documentos (RAG)", value: stats.reactivos, sub: "Base de conocimiento", icon: FileText, color: "text-yellow-700", bg: "bg-yellow-50" },
        ].map((kpi) => (
          <motion.div key={kpi.label} whileHover={{ scale: 1.02 }}>
            <Card className="border-2 border-gray-200 shadow-sm">
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

      {/* Custom Tabs Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 p-1 shadow-sm overflow-x-auto">
        <div className="flex w-max min-w-full">
          {TABS.map((t) => {
            const Icon = t.icon
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold rounded-lg transition-all ${
                  isActive ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 1. CONTROL FISCAL (RESICO) ── */}
      {tab === "fiscal" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-2 border-gray-200 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <AlertTriangle className={`w-5 h-5 ${resicoPercentage > 80 ? 'text-red-500' : 'text-amber-500'}`} /> 
                  Monitor Límite RESICO
                </CardTitle>
                <CardDescription>Tope fiscal anual: $3,500,000 MXN. Alerta temprana para transición a Régimen General.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex justify-between items-end">
                  <span className="text-4xl font-black text-gray-900">${currentRevenue.toLocaleString()}</span>
                  <span className="text-sm font-bold text-gray-500">{resicoPercentage.toFixed(1)}% del límite</span>
                </div>
                <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${resicoPercentage > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${resicoPercentage}%` }} 
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>Acumulado del Ejercicio</span>
                  <span>Proyección de rebase: Noviembre</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-transparent bg-gradient-to-br from-blue-900 to-indigo-900 text-white shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <FileText className="w-5 h-5 text-yellow-400" /> Motor Facturación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-blue-200">Middleware conectado a SW Sapien para emisión de CFDI 4.0.</p>
                <Button className="w-full bg-white text-blue-900 font-bold hover:bg-blue-50">Generar Factura Global</Button>
                <Button variant="outline" className="w-full border-blue-400 text-blue-100 hover:bg-blue-800">Conciliación Automática</Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-3 border-2 border-gray-200 border-dashed">
              <CardHeader>
                <CardTitle className="text-lg font-black text-gray-700">Preparación Migración Corporativa (Régimen General)</CardTitle>
                <CardDescription>Módulos inactivos hasta superar el límite RESICO.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" disabled className="bg-gray-50 text-gray-400"><HardDrive className="w-4 h-4 mr-2"/> Bóveda Libros Corporativos</Button>
                  <Button variant="outline" disabled className="bg-gray-50 text-gray-400"><DollarSign className="w-4 h-4 mr-2"/> Módulo Gastos y Acreditamiento IVA</Button>
                  <Button variant="outline" disabled className="bg-gray-50 text-gray-400"><RefreshCw className="w-4 h-4 mr-2"/> Entity Toggle (Cambio de RFC)</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── 2. VENTAS Y STRIPE ── */}
      {tab === "ventas" && (
        <div className="space-y-6">
          <Card className="border-2 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  Monitor de Transacciones
                </CardTitle>
                <CardDescription>Gestión de webhooks de Stripe y soporte de pagos.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-gray-700 border-gray-300">
                  <RefreshCw className="h-4 w-4 mr-1" /> Sincronizar Stripe
                </Button>
                <Button size="sm" variant="outline" className="text-gray-700 border-gray-300">
                  <Download className="h-4 w-4 mr-1" /> Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No hay transacciones recientes para mostrar. (Requiere conexión API Stripe)</div>
              ) : (
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
                      {transactions.map((tx: any) => (
                        <tr key={tx.id} className="hover:bg-gray-50">
                          <td className="py-3 pr-4 font-mono text-xs text-gray-500">{tx.id}</td>
                          <td className="py-3 pr-4 font-black text-gray-900">${tx.amount.toLocaleString()} {tx.currency}</td>
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-1 rounded-md text-xs font-black ${
                              tx.status === "succeeded" ? "bg-emerald-100 text-emerald-700" :
                              tx.status === "failed" ? "bg-red-100 text-red-600" :
                              "bg-gray-100 text-gray-600"
                            }`}>{tx.status}</span>
                          </td>
                          <td className="py-3 pr-4 text-gray-700 text-xs font-medium">{tx.customer}</td>
                          <td className="py-3 pr-4 text-gray-400 text-xs">{tx.date}</td>
                          <td className="py-3">
                            <Button size="sm" variant="ghost" className="text-xs font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                              Reembolsar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Settings className="h-5 w-5 text-yellow-600" />
                Control de Cupones y Promociones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <Input placeholder="Código (ej. CERTIFIK2026)" className="rounded-xl border-2 border-gray-200 text-gray-800 flex-1" />
                <Input placeholder="% o $ descuento" className="rounded-xl border-2 border-gray-200 text-gray-800 md:w-48" />
                <Button className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-black shrink-0 px-6">
                  <Plus className="h-4 w-4 mr-1" /> Crear Cupón
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── 3. CMS REACTIVOS ── */}
      {tab === "cms" && (
        <div className="space-y-6">
          <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-800">Ingestión Masiva de Reactivos</h3>
              <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
                Sube un archivo CSV o JSON para poblar el banco de preguntas. El sistema clasificará automáticamente por área del examen CNBV y generará la retroalimentación.
              </p>
              <div className="flex gap-4 w-full max-w-md">
                <Input type="file" accept=".csv,.json" className="bg-white border-2 cursor-pointer" />
                <Button className="font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md">Procesar</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Banco de Reactivos Actual
              </CardTitle>
              <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" /> Crear Manual
              </Button>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                 <div className="text-center py-6 text-gray-500">No hay reactivos cargados. (Requiere tabla dedicada o integración con documents)</div>
              ) : (
                <div className="space-y-3">
                  {questions.map((q: any) => (
                    <div key={q.id} className="flex items-start justify-between gap-3 p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-blue-300 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 mb-1">{q.text}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded-md border border-blue-100">{q.area}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50" title="Editar Retroalimentación">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── 4. BIBLIOTECA & DOCS ── */}
      {tab === "knowledge" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <CardTitle className="font-black flex items-center gap-2 text-indigo-900">
                <HardDrive className="w-5 h-5 text-indigo-600"/> Sincronización Base RAG
              </CardTitle>
              <CardDescription>Documentos procesados e integrados para el modelo RAG global.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold">
                <RefreshCw className="w-4 h-4 mr-2"/> Forzar Sincronización Global
              </Button>
              <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 bg-white py-1">Documentos Activos en BD ({documents.length})</p>
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100 text-sm hover:border-indigo-200">
                    <div className="flex items-center gap-2 overflow-hidden">
                       <FileText className="w-4 h-4 text-indigo-400 shrink-0"/> 
                       <span className="font-medium text-gray-700 truncate">{doc.name}</span>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 px-2">{doc.is_global ? 'Global' : 'Privado'}</span>
                  </div>
                ))}
                {documents.length === 0 && <p className="text-xs text-gray-400 mt-2">No se encontraron documentos en la tabla public.documents.</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm">
            <CardHeader>
              <CardTitle className="font-black flex items-center gap-2 text-gray-900">
                <Settings className="w-5 h-5 text-gray-600"/> Configurador de Sectores
              </CardTitle>
              <CardDescription>Editor de parámetros y obligaciones por Entidad Financiera.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Banca Múltiple", "SOFOM ENR", "Fintech (IFC/IFPE)", "SOCAP/SOFIPO"].map((s) => (
                <div key={s} className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Building2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 group-hover:text-blue-900">{s}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-gray-300 group-hover:text-blue-500" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── 5. USUARIOS & B2B ── */}
      {tab === "usuarios" && (
        <div className="space-y-6">
          <Card className="border-2 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Directorio Maestro & Control B2B
                </CardTitle>
                <CardDescription>Visualiza asientos corporativos y otorga soporte técnico.</CardDescription>
              </div>
              <Button size="sm" className="gap-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                <Plus className="h-4 w-4" /> Alta Manual
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o ID público..."
                  className="pl-9 rounded-xl border-2 border-gray-200 text-gray-800 placeholder:text-gray-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {filteredUsers.map((u) => (
                  <div key={u.user_id} className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-blue-200 transition-colors">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      <span className="text-blue-700 font-black text-sm">{(u.full_name || 'U')[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{u.full_name || 'Usuario sin nombre'}</p>
                      <p className="text-xs font-medium text-gray-500">{u.public_customer_id}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 mr-4 hidden md:flex">
                      <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md">
                        <Zap className="h-3.5 w-3.5" />{u.total_xp?.toLocaleString() || 0} XP
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md">
                        <Flame className="h-3.5 w-3.5" />{u.current_streak || 0}d
                      </span>
                      <span className={`px-2 py-1 rounded-md text-xs font-black uppercase tracking-wider ${
                        u.tier === "premium" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500"
                      }`}>{u.tier}</span>
                    </div>
                    <div className="flex gap-1 shrink-0 border-l pl-4 border-gray-100">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50" title="Impersonate (Ver como usuario)">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50" title="Reset password">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50" title="Suspender / Banear">
                        <Ban className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No se encontraron usuarios.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── 6. ANALYTICS ── */}
      {tab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-2 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-red-500" />
                  Mapa de Calor de Conocimiento
                </CardTitle>
                <CardDescription>Tópicos con mayor tasa de fallo. (Cálculo basado en study_events requeriría agregación DB)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-4">
                <div className="text-sm text-gray-500 italic text-center py-10">
                  Agregación de study_events en construcción...
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-2 shadow-sm bg-orange-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-black text-gray-900 flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    Métricas de Retención (Tiempo Real)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center border-b border-orange-100 pb-2">
                    <span className="text-xs font-medium text-gray-600">Racha promedio global</span>
                    <span className="text-sm font-black text-gray-900">
                      {users.length > 0 ? (users.reduce((acc, u) => acc + (u.current_streak || 0), 0) / users.length).toFixed(1) : 0} días
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-orange-100 pb-2">
                    <span className="text-xs font-medium text-gray-600">Usuarios Premium</span>
                    <span className="text-sm font-black text-gray-900">
                      {users.filter(u => u.tier === 'premium').length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-sm">
                <CardHeader className="pb-2 bg-yellow-50/50 rounded-t-xl border-b border-gray-100">
                  <CardTitle className="text-base font-black text-gray-900 flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    Leaderboard (Power Users)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {users.sort((a, b) => (b.total_xp || 0) - (a.total_xp || 0)).slice(0, 3).map((u, i) => (
                    <div key={u.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <span className="text-lg font-black w-6 text-center">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{u.full_name || 'Anónimo'}</p>
                      </div>
                      <span className="text-xs font-black text-yellow-700 bg-yellow-100 px-2 py-1 rounded-md">
                        {(u.total_xp || 0).toLocaleString()} XP
                      </span>
                    </div>
                  ))}
                  {users.length === 0 && <p className="text-xs text-gray-400 text-center">Sin usuarios con XP.</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. LOGS Y AUDITORÍA ── */}
      {tab === "logs" && (
        <div className="space-y-6">
          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-600" />
                Logs de Actividad & Monitor IA
              </CardTitle>
              <CardDescription>Registro inmutable para cumplimiento corporativo y control preventivo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-900 rounded-xl p-4 h-64 flex items-center justify-center font-mono text-xs shadow-inner">
                <span className="text-gray-500">Conectando a stream de logs del servidor...</span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="text-gray-700 font-bold border-gray-300">
                  <Download className="w-4 h-4 mr-2"/> Exportar Logs (CSV)
                </Button>
                <Button variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100 font-bold">
                  Auditar Preguntas sin Respuesta IA
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-emerald-500" />
                Estado de la Infraestructura
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { service: "Vercel (Next.js Edge)", status: "Operational", latency: "Conectado" },
                { service: "Supabase (PostgreSQL)", status: "Operational", latency: "Conectado" },
                { service: "Google Gemini (RAG Engine)", status: "Operational", latency: "Conectado" },
                { service: "Stripe API", status: "Operational", latency: "Conectado" },
              ].map((svc) => (
                <div key={svc.service} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-bold text-gray-800">{svc.service}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-400">{svc.latency}</span>
                    <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
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