"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Clock,
  FileText,
  AlertTriangle,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { AnimatedBorderButton } from "@/components/ui/animated-border-button";
import { supabase } from "@/lib/supabase";

async function authFetch(url: string, init?: RequestInit) {
  const sb = supabase();
  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session?.access_token) throw new Error("No autenticado");
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
      Authorization: `Bearer ${session.access_token}`,
    },
  });
}

type PastSession = {
  id: string;
  fecha: string;
  score: number | null;
  estado: string;
  total_questions: number;
  correct_answers: number;
};

export default function CenvalIntroPage() {
  const router = useRouter();
  const [starting, setStarting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pastSessions, setPastSessions] = React.useState<PastSession[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const sb = supabase();
        const {
          data: { session },
        } = await sb.auth.getSession();
        if (!session?.user) return;
        const { data } = await sb
          .from("exam_sessions")
          .select("id, fecha, score, estado, total_questions, correct_answers")
          .eq("user_id", session.user.id)
          .eq("exam_type", "ceneval")
          .order("created_at", { ascending: false })
          .limit(5);
        setPastSessions((data ?? []) as PastSession[]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleStart = async () => {
    setStarting(true);
    setError(null);
    try {
      const res = await authFetch("/api/exam/start", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar");
      router.push(`/simulator/cenval/${data.session_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setStarting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <button
        onClick={() => router.push("/simulator")}
        className="mb-4 text-sm text-neutral-500 hover:text-neutral-700"
      >
        ← Volver
      </button>

      {/* ── Hero ── */}
      <div className="rounded-2xl bg-neutral-900 p-8 text-white shadow-lg">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
          <GraduationCap className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Simulacro CENEVAL Oficial
        </h1>
        <p className="mt-2 text-sm text-white/70">
          Examen completo en condiciones reales de evaluación.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/5 p-3">
            <FileText className="mb-1.5 h-4 w-4 text-white/60" />
            <p className="text-xl font-bold tracking-tight">118</p>
            <p className="text-[11px] text-white/60">preguntas</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <Clock className="mb-1.5 h-4 w-4 text-white/60" />
            <p className="text-xl font-bold tracking-tight">4h</p>
            <p className="text-[11px] text-white/60">duración</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <GraduationCap className="mb-1.5 h-4 w-4 text-white/60" />
            <p className="text-xl font-bold tracking-tight">70%</p>
            <p className="text-[11px] text-white/60">aprobatorio</p>
          </div>
        </div>
      </div>

      {/* ── Reglas ── */}
      <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50/60 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
          <div className="text-sm text-orange-900">
            <p className="mb-2 font-semibold">Antes de iniciar:</p>
            <ul className="space-y-1 list-disc pl-5">
              <li>Una vez iniciado, el cronómetro corre incluso si cierras la pestaña.</li>
              <li>Solo puedes tener un simulacro activo a la vez.</li>
              <li>Las respuestas se guardan automáticamente al seleccionar opción.</li>
              <li>Puedes navegar entre preguntas y cambiar respuestas hasta finalizar.</li>
              <li>El examen termina manualmente o cuando expiran las 4 horas.</li>
            </ul>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <AnimatedBorderButton
        variant="cyan"
        wrapperClassName="rounded-2xl w-full mt-6"
        className="w-full px-6 py-4 text-base font-semibold rounded-[14px] bg-neutral-900 hover:bg-neutral-800 text-white shadow-lg"
        onClick={handleStart}
        disabled={starting}
      >
        {starting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Iniciando...
          </>
        ) : (
          <>
            Iniciar simulacro CENEVAL
            <ChevronRight className="h-5 w-5" />
          </>
        )}
      </AnimatedBorderButton>

      {/* ── Sesiones previas ── */}
      <div className="mt-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Tus simulacros anteriores
        </h2>
        {loading ? (
          <div className="rounded-xl border border-neutral-100 bg-white p-4 text-center text-sm text-neutral-400">
            Cargando…
          </div>
        ) : pastSessions.length === 0 ? (
          <div className="rounded-xl border border-neutral-100 bg-white p-6 text-center text-sm text-neutral-500">
            Aún no has presentado ningún simulacro CENEVAL.
          </div>
        ) : (
          <div className="space-y-2">
            {pastSessions.map((s) => (
              <a
                key={s.id}
                href={
                  s.estado === "completado"
                    ? `/simulator/cenval/${s.id}/resultado`
                    : `/simulator/cenval/${s.id}`
                }
                className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white p-4 shadow-sm transition-colors hover:border-neutral-300"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {new Date(s.fecha).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {s.estado === "completado"
                      ? `${s.correct_answers}/${s.total_questions} correctas`
                      : "En progreso"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {s.score != null && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        s.score >= 70
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {s.score.toFixed(1)}%
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
