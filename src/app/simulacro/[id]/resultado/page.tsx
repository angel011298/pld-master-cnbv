"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy, Clock, ChevronRight, BookOpen, RotateCcw, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildAuthHeaders } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase";
import { formatTime } from "@/lib/simulacro-config";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TopicResult {
  key: string;
  label: string;
  slug: string;
  correct: number;
  total: number;
  pct: number;
}

interface HistoryRow {
  id: string;
  score: number | null;
  correct_answers: number | null;
  total_questions: number | null;
  completed_at: string | null;
  duracion_seg: number | null;
}

interface ResultData {
  session: {
    id: string;
    score: number | null;
    correct_answers: number | null;
    total_questions: number | null;
    duracion_seg: number | null;
    completed_at: string | null;
  };
  byTopic: TopicResult[];
  history: HistoryRow[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function semaforo(pct: number) {
  if (pct >= 80) return { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", label: "Excelente" };
  if (pct >= 50) return { dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50 border-amber-200",   label: "Regular"   };
  return               { dot: "bg-red-500",       text: "text-red-700",     bg: "bg-red-50 border-red-200",       label: "Débil"     };
}

function scoreGrade(pct: number) {
  if (pct >= 80) return { label: "Aprobado",     color: "text-emerald-600" };
  if (pct >= 60) return { label: "Cerca",        color: "text-amber-600"   };
  return               { label: "A repasar",     color: "text-red-600"     };
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResultadoPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [data, setData] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase().auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/"); return; }
    });
  }, [router]);

  useEffect(() => {
    if (!sessionId) return;
    buildAuthHeaders()
      .then((headers) =>
        fetch(`/api/simulacro/result?session_id=${sessionId}`, { headers })
      )
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Error al cargar resultados");
        setData(json as ResultData);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-600 font-semibold">{error ?? "No se encontraron resultados."}</p>
        <Button onClick={() => router.push("/simulacro")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al simulacro
        </Button>
      </div>
    );
  }

  const { session, byTopic, history } = data;
  const correct = session.correct_answers ?? 0;
  const total = session.total_questions ?? 60;
  const scorePct = session.score != null ? Math.round(session.score) : 0;
  const grade = scoreGrade(scorePct);

  // Top 3 weakest topics (by pct, ascending)
  const weakTopics = [...byTopic]
    .filter((t) => t.total > 0)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          <Button onClick={() => router.push("/simulacro")} variant="ghost" size="sm" className="text-slate-500 gap-1">
            <ArrowLeft className="h-4 w-4" /> Nuevo simulacro
          </Button>
        </div>

        {/* ── Score hero ── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
            <Trophy className="h-10 w-10 text-amber-500" />
          </div>
          <h1 className="text-4xl font-black text-slate-900">{correct}<span className="text-slate-400 text-2xl font-bold">/{total}</span></h1>
          <p className={cn("text-5xl font-black mt-1", grade.color)}>{scorePct}%</p>
          <p className={cn("text-lg font-bold mt-1", grade.color)}>{grade.label}</p>
          {session.duracion_seg != null && (
            <p className="text-sm text-slate-400 mt-3 flex items-center justify-center gap-1.5">
              <Clock className="h-4 w-4" /> Duración: {formatTime(session.duracion_seg)}
            </p>
          )}
        </div>

        {/* ── By-topic table ── */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-black text-slate-800">Aciertos por tema</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {byTopic.map((t) => {
              const s = semaforo(t.pct);
              return (
                <div key={t.key} className="flex items-center gap-4 px-5 py-3.5">
                  {/* Dot */}
                  <span className={cn("h-3 w-3 rounded-full shrink-0", s.dot)} />
                  {/* Label */}
                  <span className="text-sm font-semibold text-slate-800 flex-1 min-w-0 truncate">
                    {t.label}
                  </span>
                  {/* Progress bar */}
                  <div className="hidden sm:block w-24 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", t.pct >= 80 ? "bg-emerald-500" : t.pct >= 50 ? "bg-amber-400" : "bg-red-500")}
                      style={{ width: `${t.pct}%` }}
                    />
                  </div>
                  {/* Score */}
                  <span className={cn("text-sm font-black min-w-[60px] text-right", s.text)}>
                    {t.correct}/{t.total} ({t.pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Weak topics ── */}
        {weakTopics.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-black text-slate-800">Top 3 temas a reforzar</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {weakTopics.map((t, i) => {
                const s = semaforo(t.pct);
                return (
                  <div key={t.key} className={cn("flex items-center gap-4 px-5 py-4 border-l-4", s.bg.split(" ")[0] === "bg-red-50" ? "border-l-red-400" : s.bg.split(" ")[0] === "bg-amber-50" ? "border-l-amber-400" : "border-l-emerald-400")}>
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <span className="text-slate-600 text-sm font-black">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{t.label}</p>
                      <p className={cn("text-xs font-semibold", s.text)}>{t.correct}/{t.total} — {t.pct}%</p>
                    </div>
                    <Link href={`/estudiar/${t.slug}`}>
                      <Button size="sm" variant="outline" className="shrink-0 gap-1 font-bold text-xs">
                        <BookOpen className="h-3.5 w-3.5" /> Repasar
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── History ── */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-black text-slate-800">Últimos simulacros</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {history.map((h) => {
                const pct = h.score != null ? Math.round(h.score) : null;
                const isCurrent = h.id === sessionId;
                return (
                  <div key={h.id} className={cn("flex items-center justify-between px-5 py-3", isCurrent && "bg-blue-50/60")}>
                    <div className="flex items-center gap-3">
                      {isCurrent && <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Actual</span>}
                      <span className="text-sm text-slate-600">{fmtDate(h.completed_at)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-500 hidden sm:inline">
                        {h.correct_answers ?? "—"}/{h.total_questions ?? 60}
                      </span>
                      {h.duracion_seg != null && (
                        <span className="text-slate-400 text-xs hidden sm:inline">
                          <Clock className="inline h-3 w-3 mr-0.5" />{formatTime(h.duracion_seg)}
                        </span>
                      )}
                      <span className={cn("font-black min-w-[44px] text-right", pct != null ? scoreGrade(pct).color : "text-slate-400")}>
                        {pct != null ? `${pct}%` : "—"}
                      </span>
                      {!isCurrent && (
                        <Link href={`/simulacro/${h.id}/resultado`}>
                          <ChevronRight className="h-4 w-4 text-slate-400 hover:text-blue-500" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex gap-3 pb-8">
          <Button onClick={() => router.push("/simulacro")} className="flex-1 font-bold bg-blue-600 hover:bg-blue-700 text-white py-5">
            <RotateCcw className="mr-2 h-4 w-4" /> Nuevo Simulacro
          </Button>
          <Button onClick={() => router.push("/dashboard")} variant="outline" className="flex-1 font-bold py-5">
            Ir al Dashboard
          </Button>
        </div>

      </div>
    </div>
  );
}
