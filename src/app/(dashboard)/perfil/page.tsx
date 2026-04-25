"use client"

import * as React from "react"
import {
  Settings,
  Share2,
  Flame,
  Zap,
  Target,
  BookOpen,
  Clock,
  Download,
  History,
  Unlock,
  Crown,
  ArrowRight,
  AlertTriangle,
  Save,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUserProfile } from "@/hooks/useUserProfile"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const LEVEL_XP = 1000

function getInitials(name: string | null, email: string | null) {
  const source = name || email || "Usuario"
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function getLeague(totalXp: number) {
  if (totalXp >= 10000) return "Liga Diamante"
  if (totalXp >= 5000) return "Liga Platino"
  if (totalXp >= 2000) return "Liga Oro"
  if (totalXp >= 500) return "Liga Plata"
  return "Liga Bronce"
}

export default function PerfilPage() {
  const { profile, loading, refetch } = useUserProfile()
  const [isEditing, setIsEditing] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [shareStatus, setShareStatus] = React.useState<string | null>(null)
  const [form, setForm] = React.useState({ fullName: "", examDate: "" })

  React.useEffect(() => {
    setForm({
      fullName: profile?.fullName ?? "",
      examDate: profile?.examDate ?? "",
    })
  }, [profile?.fullName, profile?.examDate])

  const totalXp = profile?.totalXp ?? 0
  const streak = profile?.currentStreak ?? 0
  const level = Math.floor(totalXp / LEVEL_XP) + 1
  const levelProgress = totalXp % LEVEL_XP
  const isPremium = profile?.effectiveTier === "premium"
  const answeredQuestions = profile?.answeredQuestions ?? 0
  const correctAnswers = profile?.correctAnswers ?? 0
  const precision = answeredQuestions > 0 ? Math.round((correctAnswers / answeredQuestions) * 100) : null
  const readiness = profile?.passProbability ?? null
  const examDate = profile?.examDate ? new Date(`${profile.examDate}T00:00:00`) : null
  const daysLeft = examDate
    ? Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null
  const league = getLeague(totalXp)
  const displayName = profile?.fullName || profile?.email || "Usuario Certifik"
  const profileUrl =
    typeof window !== "undefined" ? `${window.location.origin}/perfil` : "https://certifik.app/perfil"

  const recentDates = React.useMemo(() => {
    const activeDates = new Set(profile?.lastStudyDates ?? [])
    return Array.from({ length: 60 }, (_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (59 - index))
      const key = date.toISOString().slice(0, 10)
      return { key, active: activeDates.has(key) }
    })
  }, [profile?.lastStudyDates])

  const handleSaveSettings = async () => {
    if (!profile?.userId) return
    setSaving(true)
    try {
      const sb = supabase()
      const { error } = await sb.from("user_profiles").upsert(
        {
          user_id: profile.userId,
          full_name: form.fullName.trim() || null,
          exam_date: form.examDate || null,
        },
        { onConflict: "user_id" }
      )
      if (error) throw error
      await refetch()
      setIsEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleShare = async () => {
    const text = `${displayName} está preparando su certificación PLD/FT en Certifik PLD. Nivel ${level}, ${totalXp.toLocaleString()} XP.`
    try {
      if (navigator.share) {
        await navigator.share({ title: "Perfil Certifik PLD", text, url: profileUrl })
      } else {
        await navigator.clipboard.writeText(`${text} ${profileUrl}`)
      }
      setShareStatus("Perfil listo para compartir")
    } catch {
      setShareStatus("No se pudo compartir en este navegador")
    } finally {
      window.setTimeout(() => setShareStatus(null), 3000)
    }
  }

  const handleDownloadSummary = () => {
    const summary = {
      nombre: displayName,
      email: profile?.email,
      cliente: profile?.publicCustomerId,
      nivel: level,
      liga: league,
      xp: totalXp,
      racha: streak,
      reactivos: answeredQuestions,
      precision,
      probabilidadAprobacion: readiness,
      fechaExamen: profile?.examDate,
      plan: profile?.effectiveTier,
      generadoEn: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "perfil-certifik-pld.json"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleCheckout = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "individual" }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  if (loading) {
    return (
      <div className="flex p-8 justify-center">
        <Zap className="h-8 w-8 animate-pulse text-blue-500" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="md:hidden sticky top-0 z-40 mb-4 flex items-center justify-between rounded-b-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <span className="font-black text-orange-600">{streak}</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <span className="font-black text-yellow-600">{totalXp.toLocaleString()} XP</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <div className="relative rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="absolute right-4 top-4 flex gap-2">
              <button
                onClick={handleShare}
                className="rounded-full bg-slate-50 p-2 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                aria-label="Compartir perfil"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsEditing((value) => !value)}
                className="rounded-full bg-slate-50 p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                aria-label="Ajustes de perfil"
              >
                {isEditing ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative mt-4 mb-4 inline-block">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={displayName}
                  className="mx-auto h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg"
                />
              ) : (
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-blue-50 text-3xl font-black text-blue-700 shadow-lg">
                  {getInitials(profile?.fullName ?? null, profile?.email ?? null)}
                </div>
              )}
              <div className="absolute -bottom-3 -right-2 rounded-full border-2 border-white bg-yellow-400 px-3 py-1 text-xs font-black text-yellow-900 shadow-sm">
                Nivel {level}
              </div>
            </div>

            <h1 className="text-2xl font-black text-slate-900">{displayName}</h1>
            <p className="mb-2 text-sm font-bold text-slate-500">{profile?.email}</p>
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
              <Crown className="h-3 w-3" /> {league}
            </div>
            {shareStatus && <p className="mt-3 text-xs font-bold text-blue-600">{shareStatus}</p>}

            {isEditing && (
              <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
                <label className="block text-xs font-black uppercase tracking-wide text-slate-500">
                  Nombre visible
                </label>
                <Input
                  value={form.fullName}
                  onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                  placeholder="Tu nombre"
                />
                <label className="block text-xs font-black uppercase tracking-wide text-slate-500">
                  Fecha de examen
                </label>
                <Input
                  type="date"
                  value={form.examDate}
                  onChange={(event) => setForm((current) => ({ ...current, examDate: event.target.value }))}
                />
                <Button onClick={handleSaveSettings} disabled={saving} className="w-full font-bold">
                  <Save className="h-4 w-4" /> Guardar ajustes
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Racha Actual", value: `${streak}`, icon: Flame, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" },
              { label: "XP Total", value: totalXp.toLocaleString(), icon: Zap, color: "text-yellow-500", bg: "bg-yellow-50", border: "border-yellow-100" },
              { label: "Precisión", value: precision === null ? "Sin datos" : `${precision}%`, icon: Target, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
              { label: "Reactivos", value: answeredQuestions.toLocaleString(), icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
            ].map((stat) => (
              <div key={stat.label} className={cn("flex flex-col items-start rounded-2xl border-2 p-4", stat.bg, stat.border)}>
                <stat.icon className={cn("mb-2 h-5 w-5", stat.color)} />
                <span className={cn("text-2xl font-black", stat.color)}>{stat.value}</span>
                <span className="mt-1 text-xs font-bold text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-black text-slate-800">
              <History className="h-5 w-5 text-indigo-500" /> Historial de actividad
            </h3>
            <div className="mb-6 flex flex-wrap gap-1">
              {recentDates.map((date) => (
                <div
                  key={date.key}
                  title={date.key}
                  className={cn("h-3 w-3 rounded-sm", date.active ? "bg-emerald-500" : "bg-slate-100")}
                />
              ))}
            </div>
            <Button
              variant="outline"
              onClick={handleDownloadSummary}
              className="w-full justify-between border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
            >
              Descargar resumen real <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-7">
          {!isPremium && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 p-6 text-white shadow-xl">
              <Crown className="absolute -right-4 -top-4 h-32 w-32 text-white opacity-10" />
              <div className="relative z-10">
                <h3 className="mb-2 flex items-center gap-2 text-xl font-black">
                  <Unlock className="h-5 w-5 text-yellow-400" /> Desbloquea tu potencial
                </h3>
                <p className="mb-4 max-w-md text-sm text-blue-100">
                  Activa Premium para liberar módulos avanzados, simuladores ilimitados y funciones extendidas.
                </p>
                <Button onClick={handleCheckout} className="rounded-xl bg-yellow-400 font-black text-blue-900 hover:bg-yellow-300">
                  Hazte Premium <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:p-8">
            <div className="relative flex shrink-0 items-center justify-center">
              <svg className="h-32 w-32 -rotate-90">
                <circle cx="64" cy="64" r="52" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray="326"
                  strokeDashoffset={readiness === null ? 326 : 326 - (326 * readiness) / 100}
                  className={readiness !== null && readiness > 70 ? "text-emerald-500" : "text-amber-500"}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-800">{readiness === null ? "--" : `${readiness}%`}</span>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="mb-1 text-2xl font-black text-slate-900">Probabilidad de Aprobación</h2>
              <p className="mb-4 text-sm font-medium text-slate-500">
                {readiness === null
                  ? "Aún no hay predicción registrada en tu perfil."
                  : "Basado en los datos actuales de tu perfil."}
              </p>

              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <Clock className="h-8 w-8 shrink-0 text-blue-600" />
                <div>
                  <p className="text-xs font-bold uppercase text-blue-600">Cuenta Regresiva</p>
                  <p className="text-lg font-black text-blue-900">
                    {daysLeft === null ? "Configura tu fecha de examen" : `Faltan ${Math.max(daysLeft, 0)} días para tu examen`}
                  </p>
                </div>
              </div>

              <Button variant="outline" className="w-full border-red-200 bg-red-50 font-bold text-red-600 hover:bg-red-100 md:w-auto">
                <AlertTriangle className="mr-2 h-4 w-4" /> Ver mis áreas débiles
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-black text-slate-800">
              <Target className="h-5 w-5 text-rose-500" /> Progreso real
            </h3>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-600">
                  <span>Nivel {level}</span>
                  <span>{levelProgress}/{LEVEL_XP} XP</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${(levelProgress / LEVEL_XP) * 100}%` }} />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-black uppercase text-slate-500">Cliente</p>
                  <p className="mt-1 font-bold text-slate-900">{profile?.publicCustomerId ?? "Pendiente de perfil"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-black uppercase text-slate-500">Plan activo</p>
                  <p className="mt-1 font-bold text-slate-900">{isPremium ? "Premium" : "Free"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
