"use client"

import * as React from "react"
import {
  X, Download, Copy, CheckCircle2, Loader2, QrCode,
  Sparkles, Calendar, RefreshCw, ChevronDown, ChevronUp, Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────
interface QRCode {
  id: string
  token: string
  label: string | null
  expires_at: string
  premium_until: string
  activated_by: string | null
  activated_at: string | null
  activated_name?: string | null
  created_at: string
}

interface QRCodeModalProps {
  siteUrl: string       // e.g. "https://certifikpld.mx"
  onClose: () => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric", month: "short", year: "numeric",
  })
}

// Build the dark SVG card that wraps the QR code — Revolut aesthetic
async function buildCardDataUrl(redeemUrl: string): Promise<string> {
  const QRCodeLib = (await import("qrcode")).default

  // 1. Generate raw QR as data URL (white modules on transparent bg)
  const qrDataUrl: string = await QRCodeLib.toDataURL(redeemUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 340,
    color: { dark: "#111827", light: "#FFFFFF" },
  })

  // 2. Build full card as SVG (480 × 720)
  const W = 480, H = 720

  // The isotype mark redrawn as inline SVG shapes
  const isotypeSvg = `
    <rect x="208" y="44" width="64" height="64" rx="14" fill="white" opacity="0.95"/>
    <circle cx="223" cy="59" r="4.5" fill="#0B1560"/>
    <circle cx="240" cy="59" r="4.5" fill="#0B1560"/>
    <circle cx="257" cy="59" r="4.5" fill="#0B1560"/>
    <circle cx="223" cy="76" r="4.5" fill="#0B1560"/>
    <circle cx="223" cy="93" r="4.5" fill="#0B1560"/>
    <circle cx="240" cy="93" r="4.5" fill="#0B1560"/>
    <circle cx="257" cy="93" r="4.5" fill="#0B1560"/>
    <rect x="236" y="71" width="26" height="10" rx="5" fill="white"/>
  `

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#06071A"/>
        <stop offset="55%" stop-color="#0D0A2E"/>
        <stop offset="100%" stop-color="#1C0838"/>
      </linearGradient>
      <linearGradient id="glowA" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="glowB" x1="100%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#a855f7" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="qrFrame" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#f1f5f9"/>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="18" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="${W}" height="${H}" rx="28" fill="url(#bg)"/>

    <!-- Glow orbs -->
    <circle cx="${W + 40}" cy="-40" r="280" fill="url(#glowA)"/>
    <circle cx="-60" cy="${H + 40}" r="240" fill="url(#glowB)"/>

    <!-- Subtle grid lines -->
    <g stroke="rgba(255,255,255,0.025)" stroke-width="1">
      <line x1="0" y1="180" x2="${W}" y2="180"/>
      <line x1="0" y1="360" x2="${W}" y2="360"/>
      <line x1="0" y1="540" x2="${W}" y2="540"/>
      <line x1="160" y1="0" x2="160" y2="${H}"/>
      <line x1="320" y1="0" x2="320" y2="${H}"/>
    </g>

    <!-- Logo isotype -->
    ${isotypeSvg}

    <!-- Wordmark -->
    <text x="${W / 2}" y="140" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="26" font-weight="800" fill="white" letter-spacing="-0.5">Certifik</text>
    <text x="${W / 2}" y="160" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="10" font-weight="600" fill="rgba(255,255,255,0.38)" letter-spacing="3.5">PLD · CNBV</text>

    <!-- Divider -->
    <line x1="80" y1="180" x2="${W - 80}" y2="180" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

    <!-- Headline -->
    <text x="${W / 2}" y="224" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="22" font-weight="800" fill="white" letter-spacing="-0.3">Tu acceso Premium</text>
    <text x="${W / 2}" y="252" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="22" font-weight="800" fill="rgba(167,139,250,0.9)" letter-spacing="-0.3">te espera.</text>

    <text x="${W / 2}" y="282" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="13" font-weight="400" fill="rgba(255,255,255,0.48)" letter-spacing="0.1">
      Escanea y comienza a certificarte hoy
    </text>

    <!-- QR code frame with subtle shadow -->
    <rect x="90" y="306" width="300" height="300" rx="22"
      fill="rgba(0,0,0,0.4)" transform="translate(0,4)"/>
    <rect x="90" y="306" width="300" height="300" rx="22" fill="url(#qrFrame)"/>

    <!-- QR image (embedded base64) -->
    <image x="100" y="316" width="280" height="280" href="${qrDataUrl}"
      preserveAspectRatio="xMidYMid meet"/>

    <!-- Badges row -->
    <rect x="86" y="628" width="134" height="30" rx="15"
      fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.3)" stroke-width="1"/>
    <text x="153" y="648" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="11" font-weight="700" fill="rgba(167,139,250,0.9)">2 meses Premium</text>

    <rect x="260" y="628" width="134" height="30" rx="15"
      fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.25)" stroke-width="1"/>
    <text x="327" y="648" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="11" font-weight="700" fill="rgba(110,231,183,0.85)">Acceso Completo</text>

    <!-- Footer -->
    <line x1="80" y1="674" x2="${W - 80}" y2="674" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    <text x="${W / 2}" y="698" text-anchor="middle"
      font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"
      font-size="10" font-weight="400" fill="rgba(255,255,255,0.2)" letter-spacing="1">
      certifikpld.mx
    </text>
  </svg>`

  // 3. Convert SVG → PNG via canvas (browser API)
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = W * 2   // 2× for retina
      canvas.height = H * 2
      const ctx = canvas.getContext("2d")!
      ctx.scale(2, 2)
      ctx.drawImage(img, 0, 0, W, H)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL("image/png"))
    }
    img.onerror = reject
    img.src = url
  })
}

// ─── Modal Component ──────────────────────────────────────────────────────────
export function QRCodeModal({ siteUrl, onClose }: QRCodeModalProps) {
  const [generating, setGenerating] = React.useState(false)
  const [label, setLabel] = React.useState("")
  const [codes, setCodes] = React.useState<QRCode[]>([])
  const [loadingCodes, setLoadingCodes] = React.useState(true)
  const [activeCode, setActiveCode] = React.useState<QRCode | null>(null)
  const [cardDataUrl, setCardDataUrl] = React.useState<string | null>(null)
  const [buildingCard, setBuildingCard] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [showHistory, setShowHistory] = React.useState(false)

  const redeemUrl = activeCode
    ? `${siteUrl}/redeem?token=${activeCode.token}`
    : ""

  // Load existing codes on mount
  React.useEffect(() => {
    fetchCodes()
  }, [])

  // Build card image whenever the active code changes
  React.useEffect(() => {
    if (!activeCode) return
    setBuildingCard(true)
    setCardDataUrl(null)
    buildCardDataUrl(redeemUrl)
      .then(setCardDataUrl)
      .catch(console.error)
      .finally(() => setBuildingCard(false))
  }, [activeCode, redeemUrl])

  async function fetchCodes() {
    setLoadingCodes(true)
    try {
      const res = await fetch("/api/admin/qr-codes")
      if (res.ok) {
        const data = await res.json()
        setCodes(data.codes ?? [])
      }
    } finally {
      setLoadingCodes(false)
    }
  }

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch("/api/admin/qr-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      })
      if (!res.ok) throw new Error("Error generando código")
      const data = await res.json()
      const newCode: QRCode = data.code
      setCodes((prev) => [newCode, ...prev])
      setActiveCode(newCode)
      setLabel("")
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  function handleDownload() {
    if (!cardDataUrl || !activeCode) return
    const a = document.createElement("a")
    a.href = cardDataUrl
    a.download = `certifik-premium-${activeCode.token.slice(0, 8)}.png`
    a.click()
  }

  async function handleCopy() {
    if (!redeemUrl) return
    await navigator.clipboard.writeText(redeemUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0A0F2E] border border-white/10 shadow-2xl">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4 text-white" />
        </button>

        <div className="p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <QrCode className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Códigos QR Premium</h2>
              <p className="text-xs text-white/50">Genera accesos de 2 meses para compartir</p>
            </div>
          </div>

          {/* Generator form */}
          <div className="flex gap-2">
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Etiqueta opcional (ej. Evento IMEF Mayo)"
              className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-indigo-500"
              onKeyDown={(e) => e.key === "Enter" && !generating && handleGenerate()}
            />
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-5 shrink-0"
            >
              {generating
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <><Sparkles className="h-4 w-4 mr-1.5" />Generar</>}
            </Button>
          </div>

          {/* Active card preview */}
          {activeCode && (
            <div className="space-y-4">
              {/* Card preview */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#06071A] to-[#1C0838] border border-white/10 flex items-center justify-center"
                style={{ minHeight: 340 }}>

                {buildingCard && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                  </div>
                )}

                {cardDataUrl && !buildingCard && (
                  <img
                    src={cardDataUrl}
                    alt="QR Premium Card"
                    className="w-full max-w-xs mx-auto"
                    style={{ imageRendering: "crisp-edges" }}
                  />
                )}
              </div>

              {/* Meta info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white/5 rounded-xl p-3 space-y-0.5">
                  <p className="text-white/40 font-medium uppercase tracking-wide text-[10px]">Premium hasta</p>
                  <p className="text-white font-bold flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-indigo-400" />
                    {fmtDate(activeCode.premium_until)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 space-y-0.5">
                  <p className="text-white/40 font-medium uppercase tracking-wide text-[10px]">Código expira</p>
                  <p className="text-white font-bold flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-400" />
                    {fmtDate(activeCode.expires_at)}
                  </p>
                </div>
              </div>

              {/* Link preview */}
              <div className="bg-white/5 rounded-xl px-3 py-2 flex items-center gap-2">
                <span className="text-white/30 text-xs truncate flex-1 font-mono">{redeemUrl}</span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleDownload}
                  disabled={!cardDataUrl || buildingCard}
                  className="flex-1 bg-white text-[#0A0F2E] hover:bg-white/90 font-bold rounded-xl h-11"
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  Descargar PNG
                </Button>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10 rounded-xl h-11"
                >
                  {copied
                    ? <><CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-400" />¡Copiado!</>
                    : <><Copy className="h-4 w-4 mr-1.5" />Copiar link</>}
                </Button>
              </div>
            </div>
          )}

          {/* History toggle */}
          <div className="border-t border-white/10 pt-4">
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="flex items-center justify-between w-full text-sm font-bold text-white/70 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5" />
                Historial de códigos ({codes.length})
              </span>
              {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showHistory && (
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                {loadingCodes && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 text-white/30 animate-spin" />
                  </div>
                )}
                {!loadingCodes && codes.length === 0 && (
                  <p className="text-white/30 text-xs text-center py-4">Sin códigos generados aún.</p>
                )}
                {!loadingCodes && codes.map((code) => {
                  const used = !!code.activated_by
                  const expired = !used && new Date(code.expires_at) < new Date()
                  return (
                    <button
                      key={code.id}
                      onClick={() => !used && setActiveCode(code)}
                      className={cn(
                        "w-full text-left rounded-xl p-3 border transition-all text-xs",
                        activeCode?.id === code.id
                          ? "border-indigo-500/60 bg-indigo-500/10"
                          : used || expired
                            ? "border-white/5 bg-white/[0.03] opacity-50 cursor-default"
                            : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/[0.08] cursor-pointer"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-white/60 truncate">{code.token.slice(0, 12)}…</span>
                        <span className={cn(
                          "shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold",
                          used ? "bg-emerald-500/15 text-emerald-400" :
                          expired ? "bg-red-500/15 text-red-400" :
                          "bg-indigo-500/15 text-indigo-400"
                        )}>
                          {used ? "Canjeado" : expired ? "Expirado" : "Activo"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-white/35">
                        {code.label && <span>{code.label}</span>}
                        <span>{fmtDate(code.created_at)}</span>
                        {used && code.activated_name && (
                          <span className="text-emerald-400/70">→ {code.activated_name}</span>
                        )}
                      </div>
                    </button>
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
