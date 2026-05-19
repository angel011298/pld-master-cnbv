"use client"

import * as React from "react"
import {
  X, Download, Copy, CheckCircle2, Loader2, QrCode,
  Sparkles, Calendar, RefreshCw, ChevronDown, ChevronUp,
  Clock, AlertTriangle, Trash2, Infinity,
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
  max_uses: number | null   // null = unlimited
  use_count: number
  activated_by: string | null
  activated_at: string | null
  activated_name?: string | null
  created_at: string
}

interface QRCodeModalProps {
  siteUrl: string
  onClose: () => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

// ─── SVG card builder ─────────────────────────────────────────────────────────
// Renders a Revolut-style card (480×680) as PNG data URL.
// Logo: exact Certifik PLD isotype (matches favicon) at top AND inside QR center.
async function buildCardDataUrl(redeemUrl: string): Promise<string> {
  const QRCodeLib = (await import("qrcode")).default

  // H error-correction (30% tolerance) is required to overlay the logo without breaking scan
  const qrDataUrl: string = await QRCodeLib.toDataURL(redeemUrl, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 360,
    color: { dark: "#111827", light: "#FFFFFF" },
  })

  const W = 480, H = 680

  // ── Isotype helper (matches Logo.tsx viewBox="0 0 64 64") ────────────────
  // Returns inline SVG group for the Certifik isotype at position (tx,ty), scaled to `sz` px.
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

  // Header logo: 64×64 centered at x=240, top at y=34
  const headerLogoX = 240 - 32  // = 208
  const headerLogoY = 34

  // QR frame
  const qrX = 90, qrY = 288, qrSize = 300
  // Logo in QR center: 44×44, centered in QR
  const logoInQR = 44
  const liX = qrX + qrSize / 2 - logoInQR / 2  // 240 - 22 = 218
  const liY = qrY + qrSize / 2 - logoInQR / 2  // 438 - 22 = 416
  // White background behind QR-center logo: 56×56
  const bgPad = 6
  const bgX = liX - bgPad, bgY = liY - bgPad
  const bgSz = logoInQR + bgPad * 2

  const svg = `<svg xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <defs>
      <!-- Revolut-style royal-blue-to-navy gradient -->
      <linearGradient id="bg" x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%"   stop-color="#1B38F0"/>
        <stop offset="48%"  stop-color="#0F1FCC"/>
        <stop offset="100%" stop-color="#030A6E"/>
      </linearGradient>
      <!-- Top-center radial brightness (Revolut glow) -->
      <radialGradient id="topGlow" cx="50%" cy="0%" r="55%" fx="50%" fy="0%">
        <stop offset="0%"   stop-color="#3D5CFF" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="#3D5CFF" stop-opacity="0"/>
      </radialGradient>
      <!-- Side ambient glows -->
      <radialGradient id="glowTR" cx="100%" cy="0%" r="60%">
        <stop offset="0%"   stop-color="#5571FF" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="#5571FF" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glowBL" cx="0%" cy="100%" r="55%">
        <stop offset="0%"   stop-color="#0A2FD0" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="#0A2FD0" stop-opacity="0"/>
      </radialGradient>
      <!-- QR frame gradient -->
      <linearGradient id="qrFrame" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#eef2ff"/>
      </linearGradient>
    </defs>

    <!-- Card background -->
    <rect width="${W}" height="${H}" rx="28" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" rx="28" fill="url(#topGlow)"/>
    <rect width="${W}" height="${H}" rx="28" fill="url(#glowTR)"/>
    <rect width="${W}" height="${H}" rx="28" fill="url(#glowBL)"/>

    <!-- Subtle grid lines -->
    <g stroke="rgba(255,255,255,0.04)" stroke-width="1">
      <line x1="0"    y1="${H*0.27}" x2="${W}"  y2="${H*0.27}"/>
      <line x1="0"    y1="${H*0.57}" x2="${W}"  y2="${H*0.57}"/>
      <line x1="${W*0.33}" y1="0"    x2="${W*0.33}" y2="${H}"/>
      <line x1="${W*0.67}" y1="0"    x2="${W*0.67}" y2="${H}"/>
    </g>

    <!-- ── Header logo (exact favicon isotype, 64×64) ── -->
    ${iso(headerLogoX, headerLogoY, 64)}

    <!-- Wordmark -->
    <text x="${W/2}" y="124" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="27" font-weight="800" fill="white" letter-spacing="-0.6">Certifik</text>
    <text x="${W/2}" y="144" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="10" font-weight="600" fill="rgba(255,255,255,0.35)" letter-spacing="3.6">PLD · CNBV</text>

    <!-- Divider -->
    <line x1="80" y1="163" x2="${W-80}" y2="163" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>

    <!-- Headline -->
    <text x="${W/2}" y="204" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="22" font-weight="800" fill="white" letter-spacing="-0.3">Tu acceso Premium</text>
    <text x="${W/2}" y="231" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="22" font-weight="800" fill="rgba(160,185,255,0.92)" letter-spacing="-0.3">te espera.</text>

    <!-- Slogan (split into 2 lines to avoid overflow) -->
    <text x="${W/2}" y="259" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="12.5" font-weight="400" fill="rgba(255,255,255,0.46)">Escanea y prepárate para tu</text>
    <text x="${W/2}" y="276" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="12.5" font-weight="400" fill="rgba(255,255,255,0.46)">certificación PLD/FT hoy</text>

    <!-- QR frame shadow -->
    <rect x="${qrX}" y="${qrY+5}" width="${qrSize}" height="${qrSize}" rx="22"
      fill="rgba(0,0,20,0.38)"/>
    <!-- QR frame -->
    <rect x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" rx="22"
      fill="url(#qrFrame)"/>
    <!-- QR image -->
    <image x="${qrX+10}" y="${qrY+10}" width="${qrSize-20}" height="${qrSize-20}"
      href="${qrDataUrl}" preserveAspectRatio="xMidYMid meet"/>

    <!-- Logo overlay in QR center: white pad then isotype -->
    <rect x="${bgX}" y="${bgY}" width="${bgSz}" height="${bgSz}" rx="9" fill="white"/>
    ${iso(liX, liY, logoInQR)}

    <!-- Badges -->
    <rect x="74"  y="${qrY+qrSize+16}" width="148" height="30" rx="15"
      fill="rgba(50,80,255,0.22)" stroke="rgba(120,150,255,0.35)" stroke-width="1"/>
    <text x="148" y="${qrY+qrSize+36}" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="11" font-weight="700" fill="rgba(180,205,255,0.92)">2 meses Premium</text>

    <rect x="258" y="${qrY+qrSize+16}" width="148" height="30" rx="15"
      fill="rgba(16,185,129,0.14)" stroke="rgba(52,211,153,0.32)" stroke-width="1"/>
    <text x="332" y="${qrY+qrSize+36}" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="11" font-weight="700" fill="rgba(110,231,183,0.88)">Acceso Completo</text>

  </svg>`

  // Convert SVG → 2× PNG via canvas
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

// ─── Uses selector options ────────────────────────────────────────────────────
const USE_OPTIONS: { label: string; value: number | null }[] = [
  { label: "1 uso",     value: 1    },
  { label: "5 usos",    value: 5    },
  { label: "10 usos",   value: 10   },
  { label: "25 usos",   value: 25   },
  { label: "∞",         value: null },
]

// ─── Modal ────────────────────────────────────────────────────────────────────
export function QRCodeModal({ siteUrl, onClose }: QRCodeModalProps) {
  const [generating,     setGenerating]     = React.useState(false)
  const [generateError,  setGenerateError]  = React.useState<string | null>(null)
  const [label,          setLabel]          = React.useState("")
  const [maxUses,        setMaxUses]        = React.useState<number | null>(1)
  const [codes,          setCodes]          = React.useState<QRCode[]>([])
  const [loadingCodes,   setLoadingCodes]   = React.useState(true)
  const [activeCode,     setActiveCode]     = React.useState<QRCode | null>(null)
  const [cardDataUrl,    setCardDataUrl]    = React.useState<string | null>(null)
  const [buildingCard,   setBuildingCard]   = React.useState(false)
  const [copied,         setCopied]         = React.useState(false)
  const [showHistory,    setShowHistory]    = React.useState(false)
  const [deletingId,     setDeletingId]     = React.useState<string | null>(null)

  // ── Auth helper ─────────────────────────────────────────────────────────────
  async function getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase().auth.getSession()
    return session?.access_token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }
      : { "Content-Type": "application/json" }
  }

  const redeemUrl = activeCode ? `${siteUrl}/redeem?token=${activeCode.token}` : ""

  React.useEffect(() => { fetchCodes() }, [])

  React.useEffect(() => {
    if (!activeCode) return
    setBuildingCard(true)
    setCardDataUrl(null)
    buildCardDataUrl(redeemUrl)
      .then(setCardDataUrl)
      .catch(console.error)
      .finally(() => setBuildingCard(false))
  }, [activeCode, redeemUrl])

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
      const h = await getAuthHeaders()
      const res = await fetch("/api/admin/qr-codes", {
        method: "POST",
        headers: h,
        // Send 0 to signal "unlimited" (API maps 0 → null)
        body: JSON.stringify({ label, max_uses: maxUses === null ? 0 : maxUses }),
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
      if (activeCode?.id === id) setActiveCode(null)
    } catch (e) { console.error(e) }
    finally { setDeletingId(null) }
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

  // ── Status helpers ───────────────────────────────────────────────────────────
  function codeStatus(code: QRCode) {
    const fullyUsed = code.max_uses !== null && code.use_count >= code.max_uses
    const expired   = !fullyUsed && new Date(code.expires_at) < new Date()
    return { fullyUsed, expired, active: !fullyUsed && !expired }
  }

  function usesLabel(code: QRCode) {
    if (code.max_uses === null) return `${code.use_count} / ∞`
    return `${code.use_count} / ${code.max_uses}`
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

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <QrCode className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Códigos QR Premium</h2>
              <p className="text-xs text-white/50">Genera accesos de 2 meses · expiran en 24 h</p>
            </div>
          </div>

          {/* ── Generator form ── */}
          <div className="space-y-3">
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

            {/* Uses selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-white/40 font-medium shrink-0">Usos:</span>
              {USE_OPTIONS.map(opt => (
                <button
                  key={String(opt.value)}
                  onClick={() => setMaxUses(opt.value)}
                  className={cn(
                    "shimmer-btn h-7 px-3 rounded-full text-xs font-bold border transition-all",
                    maxUses === opt.value
                      ? "bg-indigo-600 border-indigo-400 text-white"
                      : "bg-white/5 border-white/15 text-white/60 hover:text-white hover:border-white/30"
                  )}
                >
                  {opt.label === "∞" ? <span className="flex items-center gap-1"><Infinity className="h-3 w-3" /> Ilimitado</span> : opt.label}
                </button>
              ))}
            </div>

            {generateError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />{generateError}
              </div>
            )}
          </div>

          {/* ── Active code card ── */}
          {activeCode && (
            <div className="space-y-4">
              {/* Preview container */}
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
                  <p className="text-white/35 uppercase tracking-wide text-[9px] font-semibold">Expira en</p>
                  <p className="text-white font-bold flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-400 shrink-0" />
                    {fmtDateTime(activeCode.expires_at)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-2.5 space-y-0.5">
                  <p className="text-white/35 uppercase tracking-wide text-[9px] font-semibold">Usos máx.</p>
                  <p className="text-white font-bold flex items-center gap-1">
                    {activeCode.max_uses === null
                      ? <><Infinity className="h-3 w-3 text-emerald-400 shrink-0" />Ilimitado</>
                      : <>{activeCode.max_uses} {activeCode.max_uses === 1 ? "uso" : "usos"}</>}
                  </p>
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
                  const { fullyUsed, expired, active } = codeStatus(code)
                  const isActive = activeCode?.id === code.id
                  return (
                    <div
                      key={code.id}
                      className={cn(
                        "group flex items-start gap-2 rounded-xl p-3 border transition-all text-xs",
                        isActive
                          ? "border-indigo-500/60 bg-indigo-500/10"
                          : fullyUsed || expired
                            ? "border-white/5 bg-white/[0.03] opacity-55"
                            : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/[0.08]"
                      )}
                    >
                      {/* Main info — click to set active */}
                      <button
                        onClick={() => active && setActiveCode(code)}
                        disabled={!active}
                        className="flex-1 min-w-0 text-left"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-white/60 truncate">{code.token.slice(0, 14)}…</span>
                          <span className={cn(
                            "shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold",
                            fullyUsed ? "bg-amber-500/15 text-amber-400"  :
                            expired   ? "bg-red-500/15   text-red-400"    :
                                        "bg-indigo-500/15 text-indigo-400"
                          )}>
                            {fullyUsed ? "Agotado" : expired ? "Expirado" : "Activo"}
                          </span>
                          <span className="shrink-0 text-white/35">{usesLabel(code)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-white/35 flex-wrap">
                          {code.label && <span className="text-white/50">{code.label}</span>}
                          <span>{fmtDate(code.created_at)}</span>
                          {code.activated_name && (
                            <span className="text-emerald-400/70">→ {code.activated_name}</span>
                          )}
                        </div>
                      </button>

                      {/* Delete button */}
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
