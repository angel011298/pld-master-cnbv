"use client";

import * as React from "react";
import {
  Database,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const BLOQUES = [
  { id: 1, name: "Marco Legal PLD/FT", short: "Marco Legal" },
  { id: 2, name: "Definiciones", short: "Definiciones" },
  { id: 3, name: "KYC / Identificación", short: "KYC" },
  { id: 4, name: "Reportes a CNBV", short: "Reportes" },
  { id: 5, name: "Estructura UNE", short: "UNE" },
  { id: 6, name: "Sanciones y Listas", short: "Sanciones" },
  { id: 7, name: "Tipologías y Op. Sospechosas", short: "Tipologías" },
  { id: 8, name: "40 Recomendaciones GAFI", short: "40 GAFI" },
];

const FORMATOS = [
  { id: "multiple_choice", label: "Opción múltiple" },
  { id: "true_false", label: "V/F" },
  { id: "flashcard", label: "Flashcards" },
  { id: "case_study", label: "Casos prácticos" },
  { id: "fill_blank", label: "Completar texto" },
  { id: "crossword", label: "Crucigramas" },
  { id: "word_search", label: "Sopa de letras" },
];

const DIFICULTADES = [
  { id: "basico", label: "Básico", color: "bg-emerald-100 text-emerald-700" },
  { id: "intermedio", label: "Intermedio", color: "bg-amber-100 text-amber-700" },
  { id: "avanzado", label: "Avanzado", color: "bg-red-100 text-red-700" },
];

const TARGET_PER_CELL = 5; // visual target per cell — adjust to taste

type ProgressRow = {
  bloque: number;
  dificultad: string;
  formato: string;
  active_count: number;
  total_count: number;
};

type Job = {
  id: number;
  bloque: number;
  dificultad: string;
  formato: string;
  target_count: number;
  generated_count: number;
  status: string;
  error: string | null;
  created_at: string;
};

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

export function QuestionBankAdmin() {
  const [progress, setProgress] = React.useState<ProgressRow[]>([]);
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [selectedBloque, setSelectedBloque] = React.useState<number>(1);
  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState<string | null>(null);
  const [batchCount, setBatchCount] = React.useState(5);

  const load = React.useCallback(async () => {
    try {
      const res = await authFetch("/api/admin/generate-batch");
      const data = await res.json();
      setProgress(data.progress || []);
      setJobs(data.jobs || []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const getCount = (bloque: number, formato: string, dificultad: string): number => {
    return (
      progress.find(
        (p) =>
          p.bloque === bloque &&
          p.formato === formato &&
          p.dificultad === dificultad
      )?.active_count || 0
    );
  };

  const handleGenerate = async (
    bloque: number,
    formato: string,
    dificultad: string
  ) => {
    const cellKey = `${bloque}-${formato}-${dificultad}`;
    setGenerating(cellKey);
    try {
      const res = await authFetch("/api/admin/generate-batch", {
        method: "POST",
        body: JSON.stringify({ bloque, formato, dificultad, count: batchCount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error de generación");
      await load();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setGenerating(null);
    }
  };

  const totalByBloque = (bloque: number) =>
    progress
      .filter((p) => p.bloque === bloque)
      .reduce((s, p) => s + p.active_count, 0);

  const grandTotal = progress.reduce((s, p) => s + p.active_count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const currentBloque = BLOQUES.find((b) => b.id === selectedBloque);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
            <Database className="h-5 w-5 text-indigo-600" />
            Banco de Reactivos CENEVAL
          </h2>
          <p className="text-sm text-slate-500">
            Genera reactivos por bloque / formato / dificultad usando Claude
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-slate-900">
            {grandTotal.toLocaleString("es-MX")}
          </p>
          <p className="text-xs text-slate-500 uppercase tracking-wide">
            Reactivos activos
          </p>
        </div>
      </div>

      {/* Bloque selector pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {BLOQUES.map((b) => {
          const isActive = b.id === selectedBloque;
          const count = totalByBloque(b.id);
          return (
            <button
              key={b.id}
              onClick={() => setSelectedBloque(b.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all",
                isActive
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
              )}
            >
              <span>
                {b.id}. {b.short}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums",
                  isActive ? "bg-white/15" : "bg-slate-100 text-slate-700"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Batch count control */}
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <label className="text-xs font-semibold text-slate-600">
          Reactivos por click:
        </label>
        <div className="flex gap-1">
          {[1, 3, 5, 10, 15].map((n) => (
            <button
              key={n}
              onClick={() => setBatchCount(n)}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-bold transition-colors",
                batchCount === n
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              )}
            >
              +{n}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-slate-500">
          {currentBloque?.name}
        </span>
      </div>

      {/* Matrix: formato rows × dificultad columns */}
      <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b-2 border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                Formato
              </th>
              {DIFICULTADES.map((d) => (
                <th
                  key={d.id}
                  className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-600"
                >
                  {d.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FORMATOS.map((f, idx) => (
              <tr
                key={f.id}
                className={cn(
                  "border-b border-slate-100",
                  idx === FORMATOS.length - 1 && "border-b-0"
                )}
              >
                <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                  {f.label}
                </td>
                {DIFICULTADES.map((d) => {
                  const count = getCount(selectedBloque, f.id, d.id);
                  const cellKey = `${selectedBloque}-${f.id}-${d.id}`;
                  const isGenerating = generating === cellKey;
                  const isFull = count >= TARGET_PER_CELL * 10;
                  return (
                    <td key={d.id} className="px-3 py-3 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span
                          className={cn(
                            "min-w-[3rem] rounded-full px-3 py-1 text-sm font-bold tabular-nums",
                            count > 0 ? d.color : "bg-slate-100 text-slate-400"
                          )}
                        >
                          {count}
                        </span>
                        <button
                          onClick={() =>
                            handleGenerate(selectedBloque, f.id, d.id)
                          }
                          disabled={!!generating || isFull}
                          className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isGenerating ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Sparkles className="h-3 w-3" />
                          )}
                          +{batchCount}
                        </button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent jobs */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Clock className="h-4 w-4" />
            Trabajos recientes
          </h3>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {jobs.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-slate-400">
              Aún no se han ejecutado trabajos de generación.
            </p>
          ) : (
            jobs.map((j) => (
              <div
                key={j.id}
                className="flex items-center gap-3 border-b border-slate-50 px-5 py-3 last:border-b-0"
              >
                {j.status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                ) : j.status === "failed" ? (
                  <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                ) : (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-amber-500" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800">
                    Bloque {j.bloque}
                    <ChevronRight className="inline h-3 w-3 mx-1 text-slate-300" />
                    {j.formato}
                    <ChevronRight className="inline h-3 w-3 mx-1 text-slate-300" />
                    {j.dificultad}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {j.generated_count}/{j.target_count} generados
                    {j.error && (
                      <span className="ml-2 text-red-600">— {j.error}</span>
                    )}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-slate-400">
                  {new Date(j.created_at).toLocaleString("es-MX", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CLI hint */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
        <p className="mb-1 font-semibold text-slate-800">
          💡 Para llenado masivo (recomendado para 1,000+ reactivos):
        </p>
        <code className="block rounded bg-slate-900 p-2.5 text-[11px] text-emerald-400 font-mono">
          npm run generate-bank
        </code>
        <p className="mt-2 text-[11px] text-slate-500">
          Ejecuta el script CLI con tus credenciales locales. Llena el banco
          completo de forma desatendida. Requiere NEXT_PUBLIC_SUPABASE_URL,
          SUPABASE_SERVICE_ROLE_KEY y ANTHROPIC_API_KEY en .env.local.
        </p>
      </div>
    </div>
  );
}
