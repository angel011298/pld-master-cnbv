"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function EquipoLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    supabase().auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push("/"); return; }

      // El plan corporativo fue descontinuado; redirigir siempre al dashboard
      router.push("/dashboard");
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="font-black text-slate-900">Panel Corporativo</span>
          </div>
        </div>
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 font-medium hidden sm:block">
          Volver al dashboard
        </Link>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
