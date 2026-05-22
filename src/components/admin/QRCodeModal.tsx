"use client"

import * as React from "react"
import {
  X, Download, Copy, CheckCircle2, Loader2, QrCode,
  Sparkles, Calendar, RefreshCw, ChevronDown, ChevronUp,
  Clock, AlertTriangle, Trash2, Infinity, Users,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

// ─── Types ────────────────────────────────────────────────────────────────────
interface QRCode {
  id: string
  token: string
  label: string | null
  expires_at: string
  premium_until: string
  max_uses: number | null
  use_count: number
  activated_by: string | null
  activated_at: string | null
  activated_name?: string | null
  created_at: string
}

interface Redemption {
  id: string
  user_id: string
  full_name: string | null
  redeemed_at: string
}

interface QRCodeModalProps {
  siteUrl: string
  onClose: () => void
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric", month: "short", year: "numeric",
  })
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("es-MX", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  })
}

function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)   return "ahora mismo"
  if (mins < 60)  return `hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `hace ${hrs} h`
  const days = Math.floor(hrs / 24)
  if (days < 7)   return `hace ${days} día${days > 1 ? "s" : ""}`
  return fmtDate(iso)
}

function getPremiumLabel(code: QRCode): string {
  const days = Math.round(
    (new Date(code.premium_until).getTime() - new Date(code.created_at).getTime()) / 86_400_000
  )
  if (days >= 365) { const y = Math.round(days / 365); return `${y} año${y > 1 ? "s" : ""} Premium` }
  if (days >= 28)  { const m = Math.round(days / 30);  return `${m} ${m === 1 ? "mes" : "meses"} Premium` }
  return `${days} días Premium`
}

// ─── Config parsers ───────────────────────────────────────────────────────────
function parseMaxUses(raw: string): number | null {
  const n = parseInt(raw, 10)
  return isNaN(n) || n <= 0 ? null : n
}
function parsePremiumDays(raw: string): number {
  const n = parseInt(raw, 10)
  return isNaN(n) || n < 1 ? 61 : Math.min(n, 3650)
}
function parseExpiresHrs(raw: string): number {
  const n = parseInt(raw, 10)
  return isNaN(n) || n < 1 ? 24 : Math.min(n, 8760)
}

// ─── SVG card builder ─────────────────────────────────────────────────────────
async function buildCardDataUrl(redeemUrl: string, premiumLabel: string): Promise<string> {
  const QRCodeLib = (await import("qrcode")).default

  const qrDataUrl: string = await QRCodeLib.toDataURL(redeemUrl, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 360,
    color: { dark: "#111827", light: "#FFFFFF" },
  })

  const W = 480, H = 720

  function iso(tx: number, ty: number, sz: number) {
    const s = sz / 64
    return `
      <g transform="translate(${tx},${ty}) scale(${s})">
        <rect x="2" y="2" width="60" height="60" rx="14" fill="#0B0D10"/>
        <g fill="#004FAE">
          <circle cx="20" cy="20" r="3.5"/>
          <circle cx="32" cy="20" r="3.5"/>
          <circle cx="44" cy="20" r="3.5"/>
          <circle cx="20" cy="32" r="3.5"/>
          <circle cx="20" cy="44" r="3.5"/>
          <circle cx="32" cy="44" r="3.5"/>
          <circle cx="44" cy="44" r="3.5"/>
        </g>
        <rect x="28" y="28" width="20" height="8" rx="4" fill="#FFFFFF"/>
      </g>`
  }

  // Header logo: 88×88 centered
  const headerLogoSz = 88
  const headerLogoX = 240 - headerLogoSz / 2  // = 196
  const headerLogoY = 22

  // QR frame — slightly taller card, same horizontal position
  const qrX = 90, qrY = 306, qrSize = 300

  // Logo inside QR center: 64×64 (safe with H correction at ~21% coverage)
  const logoInQR = 64
  const liX = qrX + qrSize / 2 - logoInQR / 2   // = 208
  const liY = qrY + qrSize / 2 - logoInQR / 2   // = 438
  const bgPad = 8
  const bgX = liX - bgPad, bgY = liY - bgPad
  const bgSz = logoInQR + bgPad * 2               // = 80

  const svg = `<svg xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <defs>
      <linearGradient id="bg" x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%"   stop-color="#1B38F0"/>
        <stop offset="48%"  stop-color="#0F1FCC"/>
        <stop offset="100%" stop-color="#030A6E"/>
      </linearGradient>
      <radialGradient id="topGlow" cx="50%" cy="0%" r="55%" fx="50%" fy="0%">
        <stop offset="0%"   stop-color="#3D5CFF" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="#3D5CFF" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glowTR" cx="100%" cy="0%" r="60%">
        <stop offset="0%"   stop-color="#5571FF" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="#5571FF" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glowBL" cx="0%" cy="100%" r="55%">
        <stop offset="0%"   stop-color="#0A2FD0" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="#0A2FD0" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="qrFrame" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#eef2ff"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" rx="28" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" rx="28" fill="url(#topGlow)"/>
    <rect width="${W}" height="${H}" rx="28" fill="url(#glowTR)"/>
    <rect width="${W}" height="${H}" rx="28" fill="url(#glowBL)"/>
    <g stroke="rgba(255,255,255,0.04)" stroke-width="1">
      <line x1="0"         y1="${H*0.27}" x2="${W}"         y2="${H*0.27}"/>
      <line x1="0"         y1="${H*0.57}" x2="${W}"         y2="${H*0.57}"/>
      <line x1="${W*0.33}" y1="0"         x2="${W*0.33}"   y2="${H}"/>
      <line x1="${W*0.67}" y1="0"         x2="${W*0.67}"   y2="${H}"/>
    </g>
    ${iso(headerLogoX, headerLogoY, headerLogoSz)}
    <text x="${W/2}" y="152" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="32" font-weight="900" fill="white" letter-spacing="-0.8">Certifik PLD</text>
    <text x="${W/2}" y="174" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="11" font-weight="600" fill="rgba(255,255,255,0.38)" letter-spacing="3.8">CNBV · PLD/FT</text>
    <line x1="80" y1="193" x2="${W-80}" y2="193" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <text x="${W/2}" y="218" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="24" font-weight="800" fill="white" letter-spacing="-0.4">Tu acceso Premium</text>
    <text x="${W/2}" y="248" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="24" font-weight="800" fill="rgba(160,185,255,0.92)" letter-spacing="-0.4">te espera.</text>
    <text x="${W/2}" y="275" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="13.5" font-weight="400" fill="rgba(255,255,255,0.48)">Escanea y prepárate para tu</text>
    <text x="${W/2}" y="293" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="13.5" font-weight="400" fill="rgba(255,255,255,0.48)">certificación PLD/FT hoy</text>
    <rect x="${qrX}" y="${qrY+5}" width="${qrSize}" height="${qrSize}" rx="22"
      fill="rgba(0,0,20,0.38)"/>
    <rect x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" rx="22"
      fill="url(#qrFrame)"/>
    <image x="${qrX+10}" y="${qrY+10}" width="${qrSize-20}" height="${qrSize-20}"
      href="${qrDataUrl}" preserveAspectRatio="xMidYMid meet"/>
    <rect x="${bgX}" y="${bgY}" width="${bgSz}" height="${bgSz}" rx="9" fill="white"/>
    ${iso(liX, liY, logoInQR)}
    <rect x="74"  y="${qrY+qrSize+16}" width="148" height="30" rx="15"
      fill="rgba(50,80,255,0.22)" stroke="rgba(120,150,255,0.35)" stroke-width="1"/>
    <text x="148" y="${qrY+qrSize+36}" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="11" font-weight="700" fill="rgba(180,205,255,0.92)">${premiumLabel}</text>
    <rect x="258" y="${qrY+qrSize+16}" width="148" height="30" rx="15"
      fill="rgba(16,185,129,0.14)" stroke="rgba(52,211,153,0.32)" stroke-width="1"/>
    <text x="332" y="${qrY+qrSize+36}" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="11" font-weight="700" fill="rgba(110,231,183,0.88)">Acceso Completo</text>
  </svg>`

  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
    const url  = URL.createObjectURL(blob)
    const img  = new Image()
    img.onload = () => {
      const c   = document.createElement("canvas")
      c.width   = W * 2
      c.height  = H * 2
      const ctx = c.getContext("2d")!
      ctx.scale(2, 2)
      ctx.drawImage(img, 0, 0, W, H)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL("image/png"))
    }
    img.onerror = reject
    img.src = url
  })
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function QRCodeModal({ siteUrl, onClose }: QRCodeModalProps) {
  // ── Generator form state ────────────────────────────────────────────────────
  const [generating,      setGenerating]      = React.useState(false)
  const [generateError,   setGenerateError]   = React.useState<string | null>(null)
  const [label,           setLabel]           = React.useState("")
  const [maxUsesRaw,      setMaxUsesRaw]      = React.useState("1")
  const [premiumDaysRaw,  setPremiumDaysRaw]  = React.useState("61")
  const [expiresHrsRaw,   setExpiresHrsRaw]   = React.useState("24")
  // ── Codes list ──────────────────────────────────────────────────────────────
  const [codes,           setCodes]           = React.useState<QRCode[]>([])
  const [loadingCodes,    setLoadingCodes]    = React.useState(true)
  const [showHistory,     setShowHistory]     = React.useState(false)
  const [deletingId,      setDeletingId]      = React.useState<string | null>(null)
  // ── Reactivation ────────────────────────────────────────────────────────────
  const [reactivatingId,      setReactivatingId]      = React.useState<string | null>(null)
  const [reactivateHrsRaw,    setReactivateHrsRaw]    = React.useState("24")
  const [reactivateResetUses, setReactivateResetUses] = React.useState(false)
  const [reactivating,        setReactivating]        = React.useState(false)
  const [reactivateError,     setReactivateError]     = React.useState<string | null>(null)
  // ── Active code ─────────────────────────────────────────────────────────────
  const [activeCode,      setActiveCode]      = React.useState<QRCode | null>(null)
  const [cardDataUrl,     setCardDataUrl]     = React.useState<string | null>(null)
  const [buildingCard,    setBuildingCard]    = React.useState(false)
  const [copied,          setCopied]          = React.useState(false)
  // ── Redemptions panel ───────────────────────────────────────────────────────
  const [redemptions,        setRedemptions]        = React.useState<Redemption[]>([])
  const [loadingRedemptions, setLoadingRedemptions] = React.useState(false)

  // ── Auth helper ─────────────────────────────────────────────────────────────
  async function getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase().auth.getSession()
    return session?.access_token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }
      : { "Content-Type": "application/json" }
  }

  const redeemUrl = activeCode ? `${siteUrl}/redeem?token=${activeCode.token}` : ""

  // ── Load codes on mount ─────────────────────────────────────────────────────
  React.useEffect(() => { fetchCodes() }, [])

  // ── Rebuild card when active code changes ───────────────────────────────────
  React.useEffect(() => {
    if (!activeCode) return
    setBuildingCard(true)
    setCardDataUrl(null)
    buildCardDataUrl(redeemUrl, getPremiumLabel(activeCode))
      .then(setCardDataUrl)
      .catch(console.error)
      .finally(() => setBuildingCard(false))
  }, [activeCode, redeemUrl])

  // ── Fetch redemptions when active code changes ──────────────────────────────
  React.useEffect(() => {
    if (!activeCode) { setRedemptions([]); return }
    let cancelled = false
    setLoadingRedemptions(true)
    setRedemptions([])
    ;(async () => {
      try {
        const h = await getAuthHeaders()
        const res = await fetch(
          `/api/admin/qr-codes/redemptions?code_id=${activeCode.id}`,
          { headers: h }
        )
        if (!cancelled && res.ok) {
          setRedemptions((await res.json()).redemptions ?? [])
        }
      } catch (e) { console.error(e) }
      finally { if (!cancelled) setLoadingRedemptions(false) }
    })()
    return () => { cancelled = true }
  }, [activeCode?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ──────────────────────────────────────────────────────────────────
  async function fetchCodes() {
    setLoadingCodes(true)
    try {
      const h = await getAuthHeaders()
      const res = await fetch("/api/admin/qr-codes", { headers: h })
      if (res.ok) setCodes((await res.json()).codes ?? [])
    } catch (e) { console.error(e) }
    finally { setLoadingCodes(false) }
  }

  async function handleGenerate() {
    setGenerating(true)
    setGenerateError(null)
    try {
      const maxUses      = parseMaxUses(maxUsesRaw)
      const premiumDays  = parsePremiumDays(premiumDaysRaw)
      const expiresHours = parseExpiresHrs(expiresHrsRaw)

      const h = await getAuthHeaders()
      const res = await fetch("/api/admin/qr-codes", {
        method: "POST",
        headers: h,
        body: JSON.stringify({
          label,
          max_uses:              maxUses === null ? 0 : maxUses,
          premium_duration_days: premiumDays,
          expires_in_hours:      expiresHours,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`)
      setCodes(prev => [data.code, ...prev])
      setActiveCode(data.code)
      setLabel("")
    } catch (err: unknown) {
      setGenerateError(err instanceof Error ? err.message : "Error generando código")
    } finally {
      setGenerating(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este código QR? Esta acción no se puede deshacer.")) return
    setDeletingId(id)
    try {
      const h = await getAuthHeaders()
      await fetch("/api/admin/qr-codes", {
        method: "DELETE",
        headers: h,
        body: JSON.stringify({ id }),
      })
      setCodes(prev => prev.filter(c => c.id !== id))
      if (activeCode?.id === id) { setActiveCode(null); setRedemptions([]) }
    } catch (e) { console.error(e) }
    finally { setDeletingId(null) }
  }

  function cancelReactivate() {
    setReactivatingId(null)
    setReactivateHrsRaw("24")
    setReactivateResetUses(false)
    setReactivateError(null)
  }

  async function handleReactivate(id: string) {
    setReactivating(true)
    setReactivateError(null)
    try {
      const hrs = parseExpiresHrs(reactivateHrsRaw)
      const h = await getAuthHeaders()
      const res = await fetch("/api/admin/qr-codes", {
        method: "PATCH",
        headers: h,
        body: JSON.stringify({
          id,
          expires_in_hours: hrs,
          reset_uses: reactivateResetUses,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`)
      // Update the code in the list + active code if needed
      setCodes(prev => prev.map(c => c.id === id ? data.code : c))
      if (activeCode?.id === id) setActiveCode(data.code)
      cancelReactivate()
    } catch (err: unknown) {
      setReactivateError(err instanceof Error ? err.message : "Error reactivando código")
    } finally {
      setReactivating(false)
    }
  }

  function handleDownload() {
    if (!cardDataUrl || !activeCode) return
    const a = document.createElement("a")
    a.href     = cardDataUrl
    a.download = `certifik-premium-${activeCode.token.slice(0, 8)}.png`
    a.click()
  }

  async function handleCopy() {
    if (!redeemUrl) return
    await navigator.clipboard.writeText(redeemUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  // ── Status / label helpers ───────────────────────────────────────────────────
  function codeStatus(code: QRCode) {
    const fullyUsed = code.max_uses !== null && code.use_count >= code.max_uses
    const expired   = !fullyUsed && new Date(code.expires_at) < new Date()
    return { fullyUsed, expired, active: !fullyUsed && !expired }
  }

  function usesLabel(code: QRCode) {
    return code.max_uses === null
      ? `${code.use_count} / ∞`
      : `${code.use_count} / ${code.max_uses}`
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#080D28] border border-white/10 shadow-2xl">

        {/* Close */}
        <button onClick={onClose}
          className="shimmer-btn absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label="Cerrar">
          <X className="h-4 w-4 text-white" />
        </button>

        <div className="p-6 space-y-5">

          {/* ── Header ── */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <QrCode className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Códigos QR Premium</h2>
              <p className="text-xs text-white/50">Genera y personaliza accesos Premium para Certifik PLD</p>
            </div>
          </div>

          {/* ── Generator form ── */}
          <div className="space-y-3">

            {/* Label + Generate */}
            <div className="flex gap-2">
              <Input
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="Etiqueta opcional (ej. Evento IMEF Mayo)"
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-indigo-500"
                onKeyDown={e => e.key === "Enter" && !generating && handleGenerate()}
              />
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="shimmer-btn flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl px-5 shrink-0 transition-colors"
              >
                {generating
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <><Sparkles className="h-4 w-4" />Generar</>}
              </button>
            </div>

            {/* ── Configuration panel ── */}
            <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-4 space-y-3">
              <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest">
                Configuración del código
              </p>
              <div className="grid grid-cols-3 gap-4">

                {/* 1 · Número de usos */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-white/55 flex items-center gap-1.5">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-[9px] font-black shrink-0">1</span>
                    Núm. de usos
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={maxUsesRaw}
                    onChange={e => setMaxUsesRaw(e.target.value)}
                    placeholder="1"
                    className="bg-white/5 border-white/10 text-white text-sm rounded-lg h-9 focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-white/28 leading-tight">
                    Escribe la cantidad.<br/>
                    <span className="text-indigo-400/70">0 = ilimitado</span>
                  </p>
                </div>

                {/* 2 · Duración del acceso premium */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-white/55 flex items-center gap-1.5">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-[9px] font-black shrink-0">2</span>
                    Acceso premium
                  </label>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min="1"
                      value={premiumDaysRaw}
                      onChange={e => setPremiumDaysRaw(e.target.value)}
                      placeholder="61"
                      className="bg-white/5 border-white/10 text-white text-sm rounded-lg h-9 focus:border-indigo-500"
                    />
                    <span className="text-white/35 text-xs font-semibold shrink-0">días</span>
                  </div>
                  <p className="text-[10px] text-white/28 leading-tight">
                    Días de acceso.<br/>
                    <span className="text-emerald-400/70">30=1m · 61=2m · 90=3m</span>
                  </p>
                </div>

                {/* 3 · Expiración del código QR */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-white/55 flex items-center gap-1.5">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-[9px] font-black shrink-0">3</span>
                    Expiración del QR
                  </label>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min="1"
                      value={expiresHrsRaw}
                      onChange={e => setExpiresHrsRaw(e.target.value)}
                      placeholder="24"
                      className="bg-white/5 border-white/10 text-white text-sm rounded-lg h-9 focus:border-indigo-500"
                    />
                    <span className="text-white/35 text-xs font-semibold shrink-0">hrs</span>
                  </div>
                  <p className="text-[10px] text-white/28 leading-tight">
                    Horas activo el QR.<br/>
                    <span className="text-amber-400/70">24=1d · 168=1sem</span>
                  </p>
                </div>

              </div>
            </div>

            {generateError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />{generateError}
              </div>
            )}
          </div>

          {/* ── Active code panel ── */}
          {activeCode && (
            <div className="space-y-4">

              {/* Card preview */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0F1FCC] to-[#030A6E] border border-white/10 flex items-center justify-center" style={{ minHeight: 340 }}>
                {buildingCard && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#080D28]/60 backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                  </div>
                )}
                {cardDataUrl && !buildingCard && (
                  <img src={cardDataUrl} alt="QR Premium Card"
                    className="w-full max-w-[260px] mx-auto drop-shadow-2xl"
                    style={{ imageRendering: "crisp-edges" }} />
                )}
              </div>

              {/* Meta strip */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white/5 rounded-xl p-2.5 space-y-0.5">
                  <p className="text-white/35 uppercase tracking-wide text-[9px] font-semibold">Premium hasta</p>
                  <p className="text-white font-bold flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-indigo-400 shrink-0" />
                    {fmtDate(activeCode.premium_until)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-2.5 space-y-0.5">
                  <p className="text-white/35 uppercase tracking-wide text-[9px] font-semibold">QR expira</p>
                  <p className="text-white font-bold flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-400 shrink-0" />
                    {fmtDateTime(activeCode.expires_at)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-2.5 space-y-0.5">
                  <p className="text-white/35 uppercase tracking-wide text-[9px] font-semibold">Usos</p>
                  <p className="text-white font-bold flex items-center gap-1">
                    {activeCode.max_uses === null
                      ? <><Infinity className="h-3 w-3 text-emerald-400 shrink-0" />{activeCode.use_count} / ∞</>
                      : <>{activeCode.use_count} / {activeCode.max_uses}</>}
                  </p>
                </div>
              </div>

              {/* ── Redemptions (usage) panel ── */}
              <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] overflow-hidden">
                {/* Panel header */}
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest">
                      Canjes
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-black",
                      activeCode.use_count > 0
                        ? "bg-indigo-500/20 text-indigo-300"
                        : "bg-white/5 text-white/30"
                    )}>
                      {activeCode.use_count}
                      {activeCode.max_uses !== null && ` / ${activeCode.max_uses}`}
                    </span>
                  </div>
                  {loadingRedemptions && (
                    <Loader2 className="h-3.5 w-3.5 text-white/30 animate-spin" />
                  )}
                </div>

                {/* Panel body */}
                <div className="px-3.5 py-3 space-y-2 max-h-52 overflow-y-auto">
                  {!loadingRedemptions && redemptions.length === 0 && (
                    <p className="text-white/25 text-xs text-center py-3">
                      Sin canjes aún — comparte el código para ver actividad aquí.
                    </p>
                  )}

                  {redemptions.map((r, i) => (
                    <div key={r.id} className="flex items-center justify-between gap-3 py-1">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Index avatar */}
                        <span className="h-6 w-6 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-black flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm text-white/80 font-medium truncate">
                            {r.full_name ?? <span className="italic text-white/35">Sin nombre</span>}
                          </p>
                          <p className="text-[10px] text-white/30 font-mono truncate">
                            {r.user_id.slice(0, 14)}…
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-white/35 shrink-0 whitespace-nowrap">
                        {fmtRelative(r.redeemed_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Link preview */}
              <div className="bg-white/5 rounded-xl px-3 py-2">
                <span className="text-white/30 text-xs font-mono truncate block">{redeemUrl}</span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  disabled={!cardDataUrl || buildingCard}
                  className="shimmer-btn flex-1 flex items-center justify-center gap-1.5 rounded-xl h-11 bg-white text-slate-900 text-sm font-bold hover:bg-white/92 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Descargar PNG
                </button>
                <button
                  onClick={handleCopy}
                  className="shimmer-btn flex-1 flex items-center justify-center gap-1.5 rounded-xl h-11 bg-white/10 border border-white/20 text-white text-sm font-bold hover:bg-white/15 transition-colors"
                >
                  {copied
                    ? <><CheckCircle2 className="h-4 w-4 text-emerald-400" />¡Copiado!</>
                    : <><Copy className="h-4 w-4" />Copiar link</>}
                </button>
              </div>
            </div>
          )}

          {/* ── History ── */}
          <div className="border-t border-white/10 pt-4">
            <button
              onClick={() => setShowHistory(v => !v)}
              className="flex items-center justify-between w-full text-sm font-bold text-white/70 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5" />
                Historial de códigos ({codes.length})
              </span>
              {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showHistory && (
              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
                {loadingCodes && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 text-white/30 animate-spin" />
                  </div>
                )}
                {!loadingCodes && codes.length === 0 && (
                  <p className="text-white/30 text-xs text-center py-4">Sin códigos generados aún.</p>
                )}
                {!loadingCodes && codes.map(code => {
                  const { fullyUsed, expired } = codeStatus(code)
                  const isActive = activeCode?.id === code.id
                  const canReactivate = fullyUsed || expired
                  const isExpandedReactivate = reactivatingId === code.id
                  return (
                    <div key={code.id} className="space-y-0">
                      <div
                        className={cn(
                          "group flex items-start gap-2 rounded-xl p-3 border transition-all text-xs",
                          isExpandedReactivate
                            ? "rounded-b-none border-b-0 border-emerald-500/30 bg-emerald-500/5"
                            : isActive
                              ? "border-indigo-500/60 bg-indigo-500/10"
                              : canReactivate
                                ? "border-white/5 bg-white/[0.03] opacity-55"
                                : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/[0.08]"
                        )}
                      >
                        {/* Clickable info area — any code can be selected to view details */}
                        <button
                          onClick={() => setActiveCode(code)}
                          className="flex-1 min-w-0 text-left"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-white/60 truncate">{code.token.slice(0, 14)}…</span>
                            <span className={cn(
                              "shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold",
                              fullyUsed ? "bg-amber-500/15 text-amber-400"   :
                              expired   ? "bg-red-500/15   text-red-400"     :
                                          "bg-indigo-500/15 text-indigo-400"
                            )}>
                              {fullyUsed ? "Agotado" : expired ? "Expirado" : "Activo"}
                            </span>
                            {/* Use count badge */}
                            <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">
                              <Users className="h-2.5 w-2.5" />
                              {usesLabel(code)}
                            </span>
                            <span className="shrink-0 text-white/25 text-[10px]">{getPremiumLabel(code)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-white/35 flex-wrap">
                            {code.label && <span className="text-white/50">{code.label}</span>}
                            <span>{fmtDate(code.created_at)}</span>
                            {code.activated_name && (
                              <span className="text-emerald-400/70">→ {code.activated_name}</span>
                            )}
                          </div>
                        </button>

                        {/* Reactivate button — only for expired/exhausted codes */}
                        {canReactivate && (
                          <button
                            onClick={() =>
                              isExpandedReactivate
                                ? cancelReactivate()
                                : (setReactivatingId(code.id), setReactivateError(null))
                            }
                            title={isExpandedReactivate ? "Cancelar reactivación" : "Reactivar código"}
                            className={cn(
                              "shimmer-btn shrink-0 h-7 w-7 rounded-lg flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100",
                              isExpandedReactivate
                                ? "text-emerald-400 bg-emerald-500/15 opacity-100"
                                : "text-white/25 hover:text-emerald-400 hover:bg-emerald-500/10"
                            )}
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(code.id)}
                          disabled={deletingId === code.id}
                          title="Eliminar código"
                          className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          {deletingId === code.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>

                      {/* ── Inline reactivation panel ── */}
                      {isExpandedReactivate && (
                        <div className="rounded-b-xl border border-t-0 border-emerald-500/30 bg-emerald-500/5 px-3 pb-3 pt-2.5 space-y-2.5">
                          <p className="text-[10px] font-black text-emerald-400/80 uppercase tracking-widest flex items-center gap-1.5">
                            <RefreshCw className="h-3 w-3" />
                            Reactivar código
                          </p>

                          {/* Duration input */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-white/45 shrink-0">Extender QR</span>
                              <Input
                                type="number"
                                min="1"
                                value={reactivateHrsRaw}
                                onChange={e => setReactivateHrsRaw(e.target.value)}
                                className="bg-white/5 border-white/10 text-white text-sm rounded-lg h-8 w-20 focus:border-emerald-500 focus:ring-emerald-500/20"
                              />
                              <span className="text-[11px] text-white/45 shrink-0">horas</span>
                            </div>
                            <span className="text-white/20 text-xs hidden sm:inline">
                              {parseExpiresHrs(reactivateHrsRaw) < 24
                                ? `${parseExpiresHrs(reactivateHrsRaw)}h`
                                : parseExpiresHrs(reactivateHrsRaw) < 168
                                  ? `${Math.round(parseExpiresHrs(reactivateHrsRaw) / 24)}d`
                                  : `${Math.round(parseExpiresHrs(reactivateHrsRaw) / 168)}sem`}
                            </span>
                          </div>

                          {/* Reset uses checkbox — only relevant if code was exhausted */}
                          {fullyUsed && (
                            <label className="flex items-center gap-2 cursor-pointer w-fit">
                              <input
                                type="checkbox"
                                checked={reactivateResetUses}
                                onChange={e => setReactivateResetUses(e.target.checked)}
                                className="rounded accent-emerald-500 h-3.5 w-3.5"
                              />
                              <span className="text-[11px] text-white/50">
                                Reiniciar contador de usos
                                <span className="text-white/25 ml-1">
                                  ({code.use_count}/{code.max_uses ?? "∞"} → 0)
                                </span>
                              </span>
                            </label>
                          )}

                          {reactivateError && (
                            <div className="flex items-center gap-1.5 text-[11px] text-red-400 bg-red-500/10 rounded-lg px-2.5 py-1.5">
                              <AlertTriangle className="h-3 w-3 shrink-0" />{reactivateError}
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex gap-2 pt-0.5">
                            <button
                              onClick={() => handleReactivate(code.id)}
                              disabled={reactivating}
                              className="shimmer-btn flex items-center justify-center gap-1.5 rounded-lg h-8 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors"
                            >
                              {reactivating
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <><RefreshCw className="h-3.5 w-3.5" />Reactivar</>}
                            </button>
                            <button
                              onClick={cancelReactivate}
                              disabled={reactivating}
                              className="px-3 rounded-lg h-8 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 text-xs font-semibold transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
