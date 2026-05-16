"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * /auth/callback — Punto de entrada único para todos los flujos OAuth (Google, etc.)
 *
 * Flujo PKCE (activo):
 *   Google redirige a /auth/callback?code=XXX[&next=/ruta]
 *   1. Leemos el `code` del query string
 *   2. Llamamos exchangeCodeForSession(code) — intercambia el code + code_verifier
 *      almacenado en localStorage por un access_token + refresh_token reales
 *   3. La sesión queda persistida en localStorage con autoRefreshToken activo
 *   4. Redirigimos al usuario a la ruta `next` (o /dashboard por defecto)
 *
 * Si por cualquier razón no hay `code` (URL mal formada, reintento), simplemente
 * intentamos getSession() como fallback antes de mostrar error.
 */
function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const run = async () => {
      const sb = supabase();
      const next = searchParams?.get("next") || "/dashboard";

      // ── PKCE: intercambiar el code por tokens ──────────────────────────
      const code = searchParams?.get("code");
      if (code) {
        const { error } = await sb.auth.exchangeCodeForSession(code);
        if (!error) {
          // Sesión establecida correctamente → redirigir
          router.replace(next);
          return;
        }
        // Si el exchange falló, NO redirigir a error todavía: el code pudo
        // haberse consumido en otra pestaña o reintento, pero la sesión
        // pudo haber quedado almacenada. Verificamos antes de declarar fallo.
        console.warn("[auth/callback] exchangeCodeForSession warning:", error.message);
      }

      // ── Fallback: verificar si ya hay sesión activa ────────────────────
      // Aplica tanto cuando no hay code (re-visita) como cuando el exchange
      // falló por code consumido / race condition entre pestañas.
      await new Promise((r) => setTimeout(r, 200));
      const { data: { session } } = await sb.auth.getSession();
      if (session) {
        router.replace(next);
      } else {
        router.replace("/?error=auth_failed");
      }
    };

    run().catch(() => router.replace("/?error=auth_failed"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-600">
          Finalizando inicio de sesión…
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
