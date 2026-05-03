"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { Lock, BookOpen, Timer, ShieldCheck, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildAuthHeaders } from "@/lib/auth-client";

const REASONS: Record<string, { title: string; description: string; icon: typeof Lock }> = {
  quiz_limit: {
    title: "Has alcanzado el límite de preguntas gratuitas",
    description: "Tu plan de prueba incluye 15 preguntas del banco. Desbloquea acceso ilimitado para prepararte a fondo.",
    icon: BookOpen,
  },
  simulacro_limit: {
    title: "Ya usaste tu simulacro de prueba",
    description: "El plan gratuito incluye 1 simulacro de 15 preguntas. Desbloquea simulacros ilimitados de 60 preguntas — como el examen real.",
    icon: Timer,
  },
  spaced_repetition: {
    title: "Repetición espaciada solo en Premium",
    description: "El sistema de repaso inteligente SM-2 está disponible exclusivamente para usuarios Premium.",
    icon: Zap,
  },
};

function UpgradeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const reasonKey = searchParams.get("reason") ?? "quiz_limit";
  const reason = REASONS[reasonKey] ?? REASONS.quiz_limit;
  const Icon = reason.icon;

  async function handleCheckout(plan: "individual" | "corporativo") {
    setLoading(true);
    try {
      const headers = await buildAuthHeaders({ "Content-Type": "application/json" });
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers,
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">

        {/* Reason banner */}
        <div className="bg-white rounded-3xl border-2 border-amber-200 p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-amber-100 flex items-center justify-center">
            <Icon className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">{reason.title}</h1>
          <p className="text-slate-600 max-w-md mx-auto">{reason.description}</p>
        </div>

        {/* Exam reality check */}
        <div className="bg-blue-900 rounded-2xl p-6 text-center text-white">
          <p className="text-lg font-bold mb-1">
            ¿Cuántas preguntas tiene el examen real CNBV?
          </p>
          <p className="text-5xl font-black text-yellow-400 my-3">60</p>
          <p className="text-blue-200 text-sm">
            Practica sin límites. Simula el examen completo. Certifícate.
          </p>
        </div>

        {/* Plans */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Individual */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-black text-slate-900">Premium Individual</h2>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-blue-600">$2,999</span>
              <span className="text-sm text-slate-500 font-bold">MXN</span>
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              {[
                "Simulacros ilimitados de 60 preguntas",
                "Banco completo de preguntas",
                "Repetición espaciada SM-2",
                "Chatbot IA regulatorio ilimitado",
                "Progreso y analíticas",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => handleCheckout("individual")}
              disabled={loading}
              className="w-full py-5 font-black text-base bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              {loading ? "Procesando…" : "Comprar Premium"}
              <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
          </div>

          {/* Corporativo */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-6 space-y-4 text-white shadow-sm">
            <h2 className="text-lg font-black">Licencia Corporativa</h2>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-yellow-400">$9,999</span>
              <span className="text-sm text-blue-200 font-bold">MXN</span>
            </div>
            <ul className="space-y-2 text-sm text-blue-100">
              {[
                "Todo lo de Premium Individual",
                "5 usuarios simultáneos",
                "Dashboard de equipo",
                "Facturación corporativa",
                "Soporte prioritario",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => handleCheckout("corporativo")}
              disabled={loading}
              className="w-full py-5 font-black text-base bg-yellow-400 hover:bg-yellow-300 text-blue-900 rounded-xl"
            >
              {loading ? "Procesando…" : "Contratar Corporativo"}
              <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-slate-500 hover:text-slate-700 font-medium underline underline-offset-4"
          >
            Volver al dashboard
          </button>
        </div>

      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
    }>
      <UpgradeContent />
    </Suspense>
  );
}
