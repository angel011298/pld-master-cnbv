"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle2, Loader2, ShieldAlert, Sparkles, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Logo } from "@/components/Logo"

type State = "idle" | "checking" | "redeeming" | "success" | "error" | "unauthenticated"

// useSearchParams requires a Suspense boundary — inner component does the real work
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

function RedeemPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") ?? ""

  const [state, setState] = React.useState<State>("idle")
  const [message, setMessage] = React.useState("")
  const [premiumUntil, setPremiumUntil] = React.useState<string | null>(null)
  const [hasSession, setHasSession] = React.useState<boolean | null>(null)

  // Check auth on mount
  React.useEffect(() => {
    const sb = supabase()
    sb.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session?.user)
    })
  }, [])

  // Auto-redeem once we know the user is authenticated and token is in URL
  React.useEffect(() => {
    if (hasSession && token && state === "idle") {
      handleRedeem()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSession, token])

  const handleRedeem = async () => {
    if (!token) {
      setState("error")
      setMessage("No se encontró ningún código en la URL.")
      return
    }

    setState("redeeming")
    try {
      const { data: { session } } = await supabase().auth.getSession()
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ token }),
      })
      const data = await res.json()

      if (!res.ok) {
        setState("error")
        setMessage(data.error ?? "Error al canjear el código.")
      } else {
        setState("success")
        setPremiumUntil(data.premiumUntil ?? null)
        setMessage(data.message ?? "¡Acceso Premium activado!")
      }
    } catch {
      setState("error")
      setMessage("Error de conexión. Inténtalo de nuevo.")
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-MX", {
      day: "numeric", month: "long", year: "numeric",
    })

  // Loading auth check
  if (hasSession === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#07091A] to-[#1A0533] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-white/40 animate-spin" />
      </div>
    )
  }

  // Not logged in → show login prompt
  if (hasSession === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#07091A] to-[#1A0533] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center space-y-6">
          <Logo variant="mono-white" size={32} className="mx-auto" />
          <div>
            <h1 className="text-2xl font-black text-white">Acceso Premium</h1>
            <p className="text-white/60 text-sm mt-2 leading-relaxed">
              Tienes un código de acceso Premium. Inicia sesión para activarlo.
            </p>
          </div>
          <Button
            onClick={() => router.push(`/?redirect=/redeem?token=${encodeURIComponent(token)}`)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl h-12"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Iniciar sesión y activar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07091A] to-[#1A0533] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center space-y-6">
          <Logo variant="mono-white" size={32} className="mx-auto" />

          {/* Loading */}
          {(state === "idle" || state === "checking" || state === "redeeming") && (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 text-indigo-400 animate-spin mx-auto" />
              <p className="text-white/80 font-medium">Activando tu acceso Premium…</p>
            </div>
          )}

          {/* Success */}
          {state === "success" && (
            <div className="space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">¡Listo!</h2>
                <p className="text-white/70 text-sm mt-1 leading-relaxed">{message}</p>
              </div>
              {premiumUntil && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center justify-center gap-2 text-indigo-300">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-bold">Acceso Premium activo</span>
                  </div>
                  <p className="text-white/50 text-xs">
                    Válido hasta el {formatDate(premiumUntil)}
                  </p>
                </div>
              )}
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl h-12"
              >
                Ir a mi Dashboard
              </Button>
            </div>
          )}

          {/* Error */}
          {state === "error" && (
            <div className="space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto">
                <ShieldAlert className="h-8 w-8 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">No se pudo activar</h2>
                <p className="text-white/60 text-sm mt-1 leading-relaxed">{message}</p>
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

        <p className="text-center text-white/20 text-xs mt-6">
          certifikpld.mx · PLD/FT CNBV
        </p>
      </div>
    </div>
  )
}
