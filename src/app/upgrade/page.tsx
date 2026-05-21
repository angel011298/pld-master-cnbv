"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Timer, ShieldCheck, ChevronRight,
  Zap, Flame, ArrowLeft,
} from "lucide-react";
import { buildAuthHeaders } from "@/lib/auth-client";
import { PRICING, PLAN_LABELS } from "@/lib/pricing";

const EARLY_BIRD = process.env.NEXT_PUBLIC_EARLY_BIRD_ACTIVE === "true";

// ─── Reason copy ──────────────────────────────────────────────────────────────

const REASONS: Record<string, { title: string; description: string; icon: typeof BookOpen }> = {
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

// ─── Animated border button ───────────────────────────────────────────────────
// A conic gradient spins behind a 1.5 px inset gap, creating a "light sweep"
// effect around the button border.

function AnimatedBorderButton({
  children,
  onClick,
  disabled,
  variant = "indigo",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "indigo" | "gold";
}) {
  const conic =
    variant === "gold"
      ? "conic-gradient(from 0deg, transparent 20%, #F59E0B 42%, #FEF9C3 50%, #F59E0B 58%, transparent 80%)"
      : "conic-gradient(from 0deg, transparent 20%, #6366F1 42%, #C7D2FE 50%, #6366F1 58%, transparent 80%)";

  const btnBg =
    variant === "gold"
      ? "bg-[#1a2a70] hover:bg-[#1e3280] text-yellow-300"
      : "bg-[#0e1737] hover:bg-[#141f4a] text-white";

  return (
    <div className="relative rounded-xl overflow-hidden p-[1.5px]">
      {/* Spinning conic gradient layer */}
      <motion.div
        className="absolute inset-[-100%] pointer-events-none"
        style={{ background: conic }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
      />
      {/* Actual button sits on top */}
      <button
        onClick={onClick}
        disabled={disabled}
        className={`relative z-10 w-full py-4 font-black text-base rounded-[10px] flex items-center justify-center gap-2 transition-all
          disabled:opacity-50 disabled:cursor-not-allowed ${btnBg}`}
      >
        {children}
      </button>
    </div>
  );
}

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({
  planKey,
  highlighted,
  loadingPlan,
  onCheckout,
}: {
  planKey: "convocatoria" | "anual";
  highlighted?: boolean;
  loadingPlan: "convocatoria" | "anual" | null;
  onCheckout: (plan: "convocatoria" | "anual") => void;
}) {
  const info = PRICING[planKey];
  const displayPrice = EARLY_BIRD ? info.early : info.standard;
  const label = PLAN_LABELS[planKey];
  const isLoading = loadingPlan === planKey;
  const isDisabled = loadingPlan !== null;

  return (
    <div
      className={`rounded-2xl p-6 space-y-5 flex flex-col border ${
        highlighted
          ? "bg-gradient-to-br from-[#1B2A6B]/80 to-[#0D1540]/90 border-indigo-500/30 backdrop-blur-xl"
          : "bg-white/[0.05] border-white/[0.09] backdrop-blur-xl"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-black text-white">{label}</h2>
        {EARLY_BIRD && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 shrink-0">
            <Flame className="h-3 w-3" /> Early Bird
          </span>
        )}
      </div>

      {/* Price */}
      <div>
        <div className="flex items-baseline gap-1">
          <span
            className={`text-5xl font-black tabular-nums ${
              highlighted ? "text-yellow-400" : "text-white"
            }`}
          >
            ${displayPrice.toLocaleString("es-MX")}
          </span>
          <span className="text-sm font-bold text-white/40">MXN</span>
        </div>
        {EARLY_BIRD && (
          <p className="text-xs mt-0.5 text-white/30 line-through">
            ${info.standard.toLocaleString("es-MX")} precio regular
          </p>
        )}
        <p className="text-xs mt-1 font-medium text-white/40">
          Pago único · {info.months} meses de acceso
        </p>
      </div>

      {/* Features */}
      <ul className="space-y-2.5 flex-1">
        {PLAN_FEATURES.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-white/65">
            <ShieldCheck
              className={`h-4 w-4 shrink-0 mt-0.5 ${
                highlighted ? "text-yellow-400" : "text-indigo-400"
              }`}
            />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA — animated border button */}
      <AnimatedBorderButton
        variant={highlighted ? "gold" : "indigo"}
        onClick={() => !isDisabled && onCheckout(planKey)}
        disabled={isDisabled}
      >
        {isLoading ? (
          <span className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            Comprar {label} <ChevronRight className="h-5 w-5" />
          </>
        )}
      </AnimatedBorderButton>
    </div>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function UpgradeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<"convocatoria" | "anual" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reasonKey = searchParams.get("reason") ?? "quiz_limit";
  const reason = REASONS[reasonKey] ?? REASONS.quiz_limit;
  const Icon = reason.icon;

  async function handleCheckout(plan: "convocatoria" | "anual") {
    setLoadingPlan(plan);
    setError(null);

    try {
      // ① Verify the user is authenticated before hitting Stripe
      let headers: Record<string, string>;
      try {
        headers = (await buildAuthHeaders({
          "Content-Type": "application/json",
        })) as Record<string, string>;
      } catch {
        // Not logged in → send to register, then come back
        router.push("/register/individual?redirect=/upgrade");
        setLoadingPlan(null);
        return;
      }

      // ② Call the checkout API
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers,
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (data.url) {
        // ③ Redirect to Stripe-hosted checkout
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Error al procesar el pago. Intenta de nuevo.");
        setLoadingPlan(null);
      }
    } catch {
      setError("Error de conexión. Por favor intenta de nuevo.");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#090D26] bg-gradient-to-b from-[#0A0F2E] via-[#0D1850] to-[#060A18] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">

        {/* Back */}
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </button>

        {/* Reason banner */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 text-center"
        >
          <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center">
            <Icon className="h-8 w-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">{reason.title}</h1>
          <p className="text-white/45 max-w-md mx-auto text-sm leading-relaxed">
            {reason.description}
          </p>
        </motion.div>

        {/* 118 stat pill */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          className="bg-gradient-to-r from-indigo-600/25 to-purple-700/25 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6 text-center"
        >
          <p className="text-white/60 font-bold mb-1 text-sm">
            ¿Cuántas preguntas tiene el examen real CNBV?
          </p>
          <p className="text-7xl font-black text-yellow-400 my-3 tabular-nums leading-none">118</p>
          <p className="text-white/35 text-sm">
            Practica sin límites. Simula el examen completo. Certifícate.
          </p>
        </motion.div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plans */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="grid sm:grid-cols-2 gap-4"
        >
          <PlanCard
            planKey="convocatoria"
            loadingPlan={loadingPlan}
            onCheckout={handleCheckout}
          />
          <PlanCard
            planKey="anual"
            highlighted
            loadingPlan={loadingPlan}
            onCheckout={handleCheckout}
          />
        </motion.div>

        {/* Footer link */}
        <div className="text-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-xs text-white/20 hover:text-white/40 transition-colors font-medium"
          >
            Volver al dashboard
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UpgradePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-[#0A0F2E] to-[#060A18] flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-2 border-indigo-500/60 border-t-transparent animate-spin" />
        </div>
      }
    >
      <UpgradeContent />
    </Suspense>
  );
}
