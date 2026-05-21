"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import {
  Lock,
  BookOpen,
  Timer,
  ShieldCheck,
  ChevronRight,
  Zap,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildAuthHeaders } from "@/lib/auth-client";
import { PRICING, PLAN_LABELS } from "@/lib/pricing";

// Leemos el flag desde la variable pública para que funcione en el cliente
const EARLY_BIRD = process.env.NEXT_PUBLIC_EARLY_BIRD_ACTIVE === "true";

const REASONS: Record<string, { title: string; description: string; icon: typeof Lock }> = {
  quiz_limit: {
    title: "Has alcanzado el límite de preguntas gratuitas",
    description:
      "Tu plan de prueba incluye 15 preguntas del banco. Desbloquea acceso ilimitado para prepararte a fondo.",
    icon: BookOpen,
  },
  simulacro_limit: {
    title: "Ya usaste tu simulacro de prueba",
    description:
      "El plan gratuito incluye 1 simulacro de 15 preguntas. Desbloquea simulacros ilimitados — como el examen real.",
    icon: Timer,
  },
  spaced_repetition: {
    title: "Repetición espaciada solo en Premium",
    description:
      "El sistema de repaso inteligente SM-2 está disponible exclusivamente para usuarios Premium.",
    icon: Zap,
  },
};

const PLAN_FEATURES = [
  "Simulacros ilimitados tipo examen CNBV",
  "Banco completo de +1,000 reactivos",
  "Repetición espaciada SM-2",
  "Chatbot IA regulatorio ilimitado",
  "Progreso y analíticas por bloque",
];

function PlanCard({
  planKey,
  highlighted,
  loading,
  onCheckout,
}: {
  planKey: "convocatoria" | "anual";
  highlighted?: boolean;
  loading: boolean;
  onCheckout: (plan: "convocatoria" | "anual") => void;
}) {
  const info = PRICING[planKey];
  const displayPrice = EARLY_BIRD ? info.early : info.standard;
  const label = PLAN_LABELS[planKey];

  return (
    <div
      className={`rounded-2xl p-6 space-y-4 shadow-sm ${
        highlighted
          ? "bg-blue-900 text-white"
          : "bg-white border border-slate-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h2 className={`text-lg font-black ${highlighted ? "text-white" : "text-slate-900"}`}>
          {label}
        </h2>
        {EARLY_BIRD && (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 shrink-0">
            <Flame className="h-3 w-3" /> Early Bird
          </span>
        )}
      </div>

      {/* Price */}
      <div>
        <div className="flex items-baseline gap-1">
          <span
            className={`text-4xl font-black tabular-nums ${
              highlighted ? "text-yellow-400" : "text-blue-600"
            }`}
          >
            ${displayPrice.toLocaleString("es-MX")}
          </span>
          <span className={`text-sm font-bold ${highlighted ? "text-blue-200" : "text-slate-500"}`}>
            MXN
          </span>
        </div>
        {EARLY_BIRD && (
          <p className={`text-xs mt-0.5 line-through ${highlighted ? "text-blue-300" : "text-slate-400"}`}>
            ${info.standard.toLocaleString("es-MX")} precio regular
          </p>
        )}
        <p className={`text-xs mt-1 font-medium ${highlighted ? "text-blue-200" : "text-slate-500"}`}>
          Pago único · {info.months} meses de acceso
        </p>
      </div>

      {/* Features */}
      <ul className="space-y-2">
        {PLAN_FEATURES.map((f) => (
          <li
            key={f}
            className={`flex items-start gap-2 text-sm ${
              highlighted ? "text-blue-100" : "text-slate-700"
            }`}
          >
            <ShieldCheck
              className={`h-4 w-4 shrink-0 mt-0.5 ${
                highlighted ? "text-yellow-400" : "text-emerald-500"
              }`}
            />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        onClick={() => onCheckout(planKey)}
        disabled={loading}
        className={`w-full py-5 font-black text-base rounded-xl ${
          highlighted
            ? "bg-yellow-400 hover:bg-yellow-300 text-blue-900"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {loading ? "Procesando…" : `Comprar ${label}`}
        <ChevronRight className="ml-1 h-5 w-5" />
      </Button>
    </div>
  );
}

function UpgradeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const reasonKey = searchParams.get("reason") ?? "quiz_limit";
  const reason = REASONS[reasonKey] ?? REASONS.quiz_limit;
  const Icon = reason.icon;

  async function handleCheckout(plan: "convocatoria" | "anual") {
    setLoading(true);
    try {
      const headers = await buildAuthHeaders({ "Content-Type": "application/json" });
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers,
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
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

        {/* Exam context */}
        <div className="bg-blue-900 rounded-2xl p-6 text-center text-white">
          <p className="text-lg font-bold mb-1">¿Cuántas preguntas tiene el examen real CNBV?</p>
          <p className="text-5xl font-black text-yellow-400 my-3">118</p>
          <p className="text-blue-200 text-sm">
            Practica sin límites. Simula el examen completo. Certifícate.
          </p>
        </div>

        {/* Plans */}
        <div className="grid sm:grid-cols-2 gap-4">
          <PlanCard
            planKey="convocatoria"
            loading={loading}
            onCheckout={handleCheckout}
          />
          <PlanCard
            planKey="anual"
            highlighted
            loading={loading}
            onCheckout={handleCheckout}
          />
        </div>

        {/* Back */}
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <UpgradeContent />
    </Suspense>
  );
}
