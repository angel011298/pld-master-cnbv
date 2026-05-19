"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  CheckCircle2, Loader2, ShieldAlert, Sparkles, LogIn,
  Mail, Lock, Eye, EyeOff, ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { Logo } from "@/components/Logo"
import { cn } from "@/lib/utils"

type RedeemState = "idle" | "redeeming" | "success" | "error"

// useSearchParams requires Suspense
export default function RedeemPageWrapper() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#07091A] to-[#1A0533] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-white/40 animate-spin" />
      </div>
    }>
      <RedeemPage />
    </React.Suspense>
  )
}

// ─── Google icon SVG ──────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
function RedeemPage() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const token        = searchParams.get("token") ?? ""

  // ── Auth state ───────────────────────────────────────────────────────────
  const [hasSession,     setHasSession]     = React.useState<boolean | null>(null)
  const [authMode,       setAuthMode]       = React.useState<"login" | "signup">("login")
  const [authEmail,      setAuthEmail]      = React.useState("")
  const [authPassword,   setAuthPassword]   = React.useState("")
  const [showPw,         setShowPw]         = React.useState(false)
  const [authLoading,    setAuthLoading]    = React.useState(false)
  const [authError,      setAuthError]      = React.useState<string | null>(null)

  // ── Redeem state ─────────────────────────────────────────────────────────
  const [redeemState,  setRedeemState]  = React.useState<RedeemState>("idle")
  const [redeemMsg,    setRedeemMsg]    = React.useState("")
  const [premiumUntil, setPremiumUntil] = React.useState<string | null>(null)

  // ── 1. Initial session check ─────────────────────────────────────────────
  React.useEffect(() => {
    supabase().auth.getSession().then(({ data }) => {
      setHasSession(!!data.session?.user)
    })
  }, [])

  // ── 2. Listen for auth state changes (covers email/password + OAuth return)
  React.useEffect(() => {
    const { data: { subscription } } = supabase().auth.onAuthStateChange((_event, session) => {
      if (session) {
        setHasSession(true)
        // Check for a pending token stored before OAuth redirect
        const pending = typeof window !== "undefined"
          ? localStorage.getItem("pendingPremiumToken")
          : null
        if (pending && !token) {
          localStorage.removeItem("pendingPremiumToken")
          router.replace(`/redeem?token=${pending}`)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [router, token])

  // ── 3. Auto-redeem once authenticated with a token in URL ────────────────
  React.useEffect(() => {
    if (hasSession && token && redeemState === "idle") {
      handleRedeem()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSession, token])

  // ── Redeem API call ───────────────────────────────────────────────────────
  const handleRedeem = async () => {
    if (!token) {
      setRedeemState("error")
      setRedeemMsg("No se encontró ningún código en la URL.")
      return
    }
    setRedeemState("redeeming")
    try {
      const { data: { session } } = await supabase().auth.getSession()
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok) {
        setRedeemState("error")
        setRedeemMsg(data.error ?? "Error al canjear el código.")
      } else {
        setRedeemState("success")
        setPremiumUntil(data.premiumUntil ?? null)
        setRedeemMsg(data.message ?? "¡Acceso Premium activado!")
      }
    } catch {
      setRedeemState("error")
      setRedeemMsg("Error de conexión. Inténtalo de nuevo.")
    }
  }

  // ── Auth handlers ─────────────────────────────────────────────────────────
  const handleGoogleAuth = async () => {
    setAuthLoading(true)
    setAuthError(null)
    // Store token so the OAuth redirect can pick it up via onAuthStateChange
    if (token && typeof window !== "undefined") {
      localStorage.setItem("pendingPremiumToken", token)
    }
    const redirectTo = typeof window !== "undefined"
      ? `${window.location.origin}/redeem?token=${encodeURIComponent(token)}`
      : undefined
    await supabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    })
    // Note: page will navigate away; no finally needed
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError(null)
    try {
      if (authMode === "login") {
        const { error } = await supabase().auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        })
        if (error) setAuthError(error.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos."
          : error.message)
        // onAuthStateChange fires on success → sets hasSession(true) → auto-redeems
      } else {
        const { error } = await supabase().auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
        })
        if (error) {
          setAuthError(error.message)
        } else {
          // Try immediate sign-in (works if email confirmation is disabled)
          const { error: signInErr } = await supabase().auth.signInWithPassword({
            email: authEmail.trim(),
            password: authPassword,
          })
          if (signInErr) {
            setAuthError("Confirma tu correo para continuar.")
          }
          // onAuthStateChange handles the rest
        }
      }
    } catch {
      setAuthError("Error de conexión. Inténtalo de nuevo.")
    } finally {
      setAuthLoading(false)
    }
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-MX", {
      day: "numeric", month: "long", year: "numeric",
    })

  // ── Loading initial auth check ────────────────────────────────────────────
  if (hasSession === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#07091A] to-[#1A0533] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-white/40 animate-spin" />
      </div>
    )
  }

  // ── Not authenticated → inline auth ──────────────────────────────────────
  if (hasSession === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#07091A] to-[#1A0533] flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-5">
          {/* Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <Logo variant="mono-white" size={32} className="mx-auto" />
              <h1 className="text-2xl font-black text-white mt-3">Acceso Premium</h1>
              <p className="text-white/55 text-sm leading-relaxed">
                Ingresa o crea tu cuenta para activar tu acceso Premium.
              </p>
            </div>

            {/* Google OAuth */}
            <button
              onClick={handleGoogleAuth}
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-xl h-12 transition-colors disabled:opacity-60"
            >
              {authLoading
                ? <Loader2 className="h-5 w-5 animate-spin" />
                : <><GoogleIcon /><span>Continuar con Google</span></>}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-xs">o con correo</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Email / Password form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  required
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-indigo-500"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="Contraseña"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-9 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {authError && (
                <p className="text-red-400 text-xs flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0" />{authError}
                </p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl h-12 transition-colors disabled:opacity-60"
              >
                {authLoading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <><LogIn className="h-4 w-4" />{authMode === "login" ? "Ingresar y activar" : "Crear cuenta y activar"}</>}
              </button>
            </form>

            {/* Toggle mode */}
            <p className="text-center text-white/35 text-xs">
              {authMode === "login" ? "¿Eres nuevo?" : "¿Ya tienes cuenta?"}{" "}
              <button
                onClick={() => { setAuthMode(m => m === "login" ? "signup" : "login"); setAuthError(null) }}
                className={cn("font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-2")}
              >
                {authMode === "login" ? "Crea tu cuenta aquí" : "Inicia sesión"}
              </button>
            </p>
          </div>

          <p className="text-center text-white/20 text-xs">certifikpld.mx · PLD/FT CNBV</p>
        </div>
      </div>
    )
  }

  // ── Authenticated → show redeem status ────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07091A] to-[#1A0533] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center space-y-6">
          <Logo variant="mono-white" size={32} className="mx-auto" />

          {/* Loading / redeeming */}
          {(redeemState === "idle" || redeemState === "redeeming") && (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 text-indigo-400 animate-spin mx-auto" />
              <p className="text-white/80 font-medium">Activando tu acceso Premium…</p>
            </div>
          )}

          {/* Success */}
          {redeemState === "success" && (
            <div className="space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">¡Listo!</h2>
                <p className="text-white/70 text-sm mt-1 leading-relaxed">{redeemMsg}</p>
              </div>
              {premiumUntil && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center justify-center gap-2 text-indigo-300">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-bold">Acceso Premium activo</span>
                  </div>
                  <p className="text-white/50 text-xs">Válido hasta el {fmtDate(premiumUntil)}</p>
                </div>
              )}
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl h-12 gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                Ir a mi Dashboard
              </Button>
            </div>
          )}

          {/* Error */}
          {redeemState === "error" && (
            <div className="space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto">
                <ShieldAlert className="h-8 w-8 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">No se pudo activar</h2>
                <p className="text-white/60 text-sm mt-1 leading-relaxed">{redeemMsg}</p>
              </div>
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
                className="w-full border-white/20 text-white/80 hover:bg-white/5 rounded-xl h-12"
              >
                Ir al Dashboard
              </Button>
            </div>
          )}
        </div>
        <p className="text-center text-white/20 text-xs mt-6">certifikpld.mx · PLD/FT CNBV</p>
      </div>
    </div>
  )
}
