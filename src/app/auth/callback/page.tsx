"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const run = async () => {
      const sb = supabase();

      // Implicit flow: el access_token viene en el hash (#access_token=...).
      // Supabase con detectSessionInUrl=true lo procesa automáticamente al inicializar.
      // Esperamos un microtick para que se complete y luego verificamos.
      await new Promise((r) => setTimeout(r, 100));

      const { data: { session } } = await sb.auth.getSession();

      const next = searchParams?.get("next") || "/dashboard";

      if (session) {
        router.replace(next);
      } else {
        router.replace("/?error=auth_failed");
      }
    };

    run().catch(() => {
      router.replace("/?error=auth_failed");
    });
  }, [router, searchParams]);

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
