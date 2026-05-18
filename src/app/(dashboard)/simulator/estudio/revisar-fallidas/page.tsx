"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Star,
  BookOpen,
  Loader2,
  Zap,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { FlashcardStudy } from "@/components/study/FlashcardStudy";
import { MultipleChoiceStudy } from "@/components/study/MultipleChoiceStudy";
import { TrueFalseStudy } from "@/components/study/TrueFalseStudy";
import { FillBlankStudy } from "@/components/study/FillBlankStudy";
import { CrosswordStudy } from "@/components/study/CrosswordStudy";
import { WordSearchStudy } from "@/components/study/WordSearchStudy";
import { type StudyMeta } from "@/hooks/useStudySession";
import { generateGrid, type WordSearchGrid } from "@/lib/word-search-utils";

// ── Constants ─────────────────────────────────────────────────────────────────

const FORMATO_LABELS: Record<string, string> = {
  multiple_choice: "Opción Múltiple",
  flashcard:       "Flashcards",
  true_false:      "Verdadero / Falso",
  case_study:      "Casos Prácticos",
  fill_blank:      "Completar Texto",
  crossword:       "Crucigrama",
  word_search:     "Sopa de Letras",
};

const FORMATO_EMOJI: Record<string, string> = {
  multiple_choice: "📝",
  flashcard:       "🃏",
  true_false:      "✅",
  case_study:      "🏛️",
  fill_blank:      "✏️",
  crossword:       "🔤",
  word_search:     "🔍",
};

const BLOQUE_NAMES: Record<number, string> = {
  1: "Marco Legal PLD/FT",
  2: "Definiciones",
  3: "KYC / Identificación",
  4: "Reportes a CNBV",
  5: "Estructura UNE",
  6: "Sanciones y Listas",
  7: "Tipologías y Op. Sospechosas",
  8: "40 Recomendaciones GAFI",
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface StudyQuestion {
  id: number;
  bloque: number;
  dificultad: string;
  formato: string;
  stem: string;
  options: string[] | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  correct_answer: Record<string, any>;
  explanation: string;
  source_document: string;
}

interface FormatoGroup {
  formato: string;
  count: number;
}

interface BloqueGroup {
  bloque: number;
  count: number;
}

interface FailedData {
  questions: StudyQuestion[];
  total: number;
  by_formato: FormatoGroup[];
  by_bloque: BloqueGroup[];
}

type Phase = "loading" | "filter" | "study" | "results" | "empty";

interface Results {
  correct: number;
  total: number;
  baseXp: number;
  bonusXp: number;
}

// XP formula must match the complete endpoint's calcXp
function calcXp(correctCount: number, totalCount: number): number {
  const raw = 5 + correctCount * 3;
  const accuracy = totalCount > 0 ? correctCount / totalCount : 0;
  const bonus = accuracy >= 0.8 ? 10 : 0;
  return Math.min(raw + bonus, 300);
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function RevisarFallidasPage() {
  const router = useRouter();

  const [phase, setPhase]             = React.useState<Phase>("loading");
  const [failedData, setFailedData]   = React.useState<FailedData | null>(null);
  const [selectedFormato, setSelectedFormato] = React.useState<string>("");
  const [selectedBloque, setSelectedBloque]   = React.useState<string>("all");
  const [results, setResults]         = React.useState<Results | null>(null);
  const [preGeneratedGrids, setPreGeneratedGrids] = React.useState<Record<number, WordSearchGrid>>({});

  // ── Load failed questions on mount ────────────────────────────────────────
  React.useEffect(() => {
    const load = async () => {
      try {
        const { data: sessionData } = await supabase().auth.getSession();
        const token = sessionData.session?.access_token ?? "";
        const res = await fetch("/api/study/sessions/failed-questions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error cargando preguntas fallidas");
        const data = (await res.json()) as FailedData;

        if (data.total === 0) {
          setPhase("empty");
          return;
        }

        setFailedData(data);

        // Auto-select format if there's only one
        if (data.by_formato.length === 1) {
          setSelectedFormato(data.by_formato[0].formato);
        }

        setPhase("filter");
      } catch {
        setPhase("empty");
      }
    };
    load();
  }, []);

  // ── Pre-generate word_search grids when format switches ───────────────────
  React.useEffect(() => {
    if (selectedFormato !== "word_search" || !failedData) return;

    const wordSearchQuestions = failedData.questions.filter(
      (q) => q.formato === "word_search"
    );
    const grids: Record<number, WordSearchGrid> = {};
    for (const q of wordSearchQuestions) {
      const words = q.correct_answer?.words ?? [];
      if (Array.isArray(words) && words.length > 0) {
        grids[q.id] = generateGrid(words);
      }
    }
    setPreGeneratedGrids(grids);
  }, [selectedFormato, failedData]);

  // ── Derived: questions to study ────────────────────────────────────────────
  const filteredQuestions = React.useMemo(() => {
    if (!failedData) return [];
    return failedData.questions
      .filter((q) => {
        const matchFormato = !selectedFormato || q.formato === selectedFormato;
        const matchBloque  = selectedBloque === "all" || q.bloque === parseInt(selectedBloque);
        return matchFormato && matchBloque;
      })
      .slice(0, 20);
  }, [failedData, selectedFormato, selectedBloque]);

  // ── Study meta for session tracking ───────────────────────────────────────
  const studyMeta: StudyMeta = React.useMemo(() => ({
    formato:    selectedFormato || "multiple_choice",
    bloque:     selectedBloque !== "all" ? parseInt(selectedBloque) : null,
    dificultad: null,
  }), [selectedFormato, selectedBloque]);

  // ── On study finish: credit 1.5x XP bonus ─────────────────────────────────
  const handleFinish = React.useCallback(async (correct: number, total: number) => {
    // Base XP already credited by completeSession → /api/study/sessions/:id/complete
    // Credit the extra 0.5x as a review bonus
    const baseXp   = calcXp(correct, total);
    const bonusXp  = Math.round(baseXp * 0.5);

    const { data: sessionData } = await supabase().auth.getSession();
    const token = sessionData.session?.access_token ?? "";

    try {
      await fetch("/api/update-xp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          xpGained:  bonusXp,
          correct:   true,
          topic:     "Repaso de errores",
        }),
      });
    } catch {
      // Non-critical — results still show
    }

    setResults({ correct, total, baseXp, bonusXp });
    setPhase("results");
  }, []);

  const handleRestart = () => {
    setResults(null);
    setPreGeneratedGrids({});
    setSelectedBloque("all");
    // Keep format selection; go back to filter
    setPhase("filter");
  };

  const pct = results ? Math.round((results.correct / results.total) * 100) : 0;

  // ── Available bloques from currently-selected formato ─────────────────────
  const availableBloques = React.useMemo(() => {
    if (!failedData) return [];
    const bloques = new Map<number, number>();
    for (const q of failedData.questions) {
      if (!selectedFormato || q.formato === selectedFormato) {
        bloques.set(q.bloque, (bloques.get(q.bloque) ?? 0) + 1);
      }
    }
    return [...bloques.entries()]
      .map(([bloque, count]) => ({ bloque, count }))
      .sort((a, b) => a.bloque - b.bloque);
  }, [failedData, selectedFormato]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Back button */}
      <button
        onClick={() => {
          if (phase === "study") { handleRestart(); return; }
          if (phase === "results") { handleRestart(); return; }
          router.push("/estudio/estadisticas");
        }}
        className="mb-6 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {phase === "study" || phase === "results" ? "Reiniciar" : "Mis estadísticas"}
      </button>

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100">
          <RotateCcw className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900">Revisar tus errores</h1>
          <p className="text-sm text-slate-500">
            Reactivos que fallaste en los últimos 30 días · XP ×1.5
          </p>
        </div>
      </div>

      {/* ── LOADING PHASE ── */}
      {phase === "loading" && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm text-slate-500">Cargando tus errores recientes…</p>
        </div>
      )}

      {/* ── EMPTY PHASE ── */}
      {phase === "empty" && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-14 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400 mb-3" />
          <p className="font-bold text-slate-700">¡Sin errores recientes!</p>
          <p className="mt-1 text-sm text-slate-400">
            No tienes preguntas fallidas en los últimos 30 días. ¡Sigue así!
          </p>
          <button
            onClick={() => router.push("/simulator/estudio")}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Ir a Modo Estudio
          </button>
        </div>
      )}

      {/* ── FILTER PHASE ── */}
      {phase === "filter" && failedData && (
        <div className="flex flex-col gap-5">
          {/* Summary pill */}
          <div className="flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 w-fit px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-sm font-semibold text-amber-800">
              {failedData.total} pregunta{failedData.total !== 1 ? "s" : ""} para repasar
            </span>
          </div>

          {/* Format selector */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-5">
            <p className="text-sm font-bold text-slate-700 mb-3">
              Selecciona un formato <span className="font-normal text-slate-400">(requerido)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {failedData.by_formato.map(({ formato, count }) => (
                <button
                  key={formato}
                  onClick={() => {
                    setSelectedFormato(formato);
                    setSelectedBloque("all"); // reset bloque on format change
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-all",
                    selectedFormato === formato
                      ? "border-amber-500 bg-amber-50 text-amber-800"
                      : "border-slate-200 text-slate-600 hover:border-slate-400"
                  )}
                >
                  <span>{FORMATO_EMOJI[formato] ?? "📋"}</span>
                  <span>{FORMATO_LABELS[formato] ?? formato}</span>
                  <span className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-black tabular-nums",
                    selectedFormato === formato
                      ? "bg-amber-200 text-amber-800"
                      : "bg-slate-100 text-slate-500"
                  )}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bloque selector — only shown once format is chosen and multiple bloques exist */}
          {selectedFormato && availableBloques.length > 1 && (
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-5">
              <p className="text-sm font-bold text-slate-700 mb-3">Bloque temático</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedBloque("all")}
                  className={cn(
                    "rounded-xl border-2 px-3 py-1.5 text-xs font-semibold transition-all",
                    selectedBloque === "all"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-600 hover:border-slate-400"
                  )}
                >
                  Todos
                </button>
                {availableBloques.map(({ bloque, count }) => (
                  <button
                    key={bloque}
                    onClick={() => setSelectedBloque(String(bloque))}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-semibold transition-all",
                      selectedBloque === String(bloque)
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 text-slate-600 hover:border-slate-400"
                    )}
                  >
                    <span>B{bloque}. {BLOQUE_NAMES[bloque]?.split(" ").slice(0, 2).join(" ")}</span>
                    <span className={cn(
                      "rounded-full px-1.5 text-[10px] font-black",
                      selectedBloque === String(bloque) ? "text-white/70" : "text-slate-400"
                    )}>
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Start button */}
          <div className="flex flex-col gap-2">
            {selectedFormato && filteredQuestions.length === 0 && (
              <p className="text-center text-sm text-slate-400">
                No hay preguntas con los filtros seleccionados
              </p>
            )}
            <button
              disabled={!selectedFormato || filteredQuestions.length === 0}
              onClick={() => setPhase("study")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-black text-white shadow-sm transition-colors",
                selectedFormato && filteredQuestions.length > 0
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              )}
            >
              <RotateCcw className="h-5 w-5" />
              {selectedFormato
                ? `Comenzar repaso · ${filteredQuestions.length} pregunta${filteredQuestions.length !== 1 ? "s" : ""}`
                : "Selecciona un formato para comenzar"}
            </button>
            <p className="text-center text-xs text-amber-600 font-semibold">
              ✦ Bonus XP ×1.5 por repasar errores
            </p>
          </div>
        </div>
      )}

      {/* ── STUDY PHASE ── */}
      {phase === "study" && filteredQuestions.length > 0 && (
        <div>
          {selectedFormato === "flashcard" && (
            <FlashcardStudy
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              questions={filteredQuestions as any}
              onFinish={handleFinish}
              studyMeta={studyMeta}
            />
          )}
          {selectedFormato === "multiple_choice" && (
            <MultipleChoiceStudy
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              questions={filteredQuestions as any}
              onFinish={handleFinish}
              studyMeta={studyMeta}
            />
          )}
          {selectedFormato === "case_study" && (
            <MultipleChoiceStudy
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              questions={filteredQuestions as any}
              onFinish={handleFinish}
              isCaseStudy
              studyMeta={studyMeta}
            />
          )}
          {selectedFormato === "true_false" && (
            <TrueFalseStudy
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              questions={filteredQuestions as any}
              onFinish={handleFinish}
              studyMeta={studyMeta}
            />
          )}
          {selectedFormato === "fill_blank" && (
            <FillBlankStudy
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              questions={filteredQuestions as any}
              onFinish={handleFinish}
              studyMeta={studyMeta}
            />
          )}
          {selectedFormato === "crossword" && (
            <CrosswordStudy
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              questions={filteredQuestions as any}
              onFinish={handleFinish}
              studyMeta={studyMeta}
            />
          )}
          {selectedFormato === "word_search" && (
            <WordSearchStudy
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              questions={filteredQuestions as any}
              onFinish={handleFinish}
              studyMeta={studyMeta}
              preGeneratedGrids={preGeneratedGrids}
            />
          )}
        </div>
      )}

      {/* ── RESULTS PHASE ── */}
      {phase === "results" && results && (
        <div className="flex flex-col items-center gap-6 py-4">
          {/* Score circle */}
          <div className="relative flex h-36 w-36 items-center justify-center">
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="44"
                fill="none"
                stroke={pct >= 70 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 276.46} 276.46`}
              />
            </svg>
            <div className="text-center">
              <p className="text-3xl font-black text-slate-900">{pct}%</p>
              <p className="text-xs text-slate-500">{results.correct}/{results.total}</p>
            </div>
          </div>

          {/* Trophy / message */}
          <div className="text-center">
            {pct >= 80 ? (
              <>
                <Trophy className="mx-auto h-10 w-10 text-amber-400 mb-2" />
                <p className="text-xl font-black text-slate-900">¡Errores dominados!</p>
                <p className="text-sm text-slate-500 mt-1">Estás listo para el examen</p>
              </>
            ) : pct >= 60 ? (
              <>
                <Star className="mx-auto h-10 w-10 text-indigo-400 mb-2" />
                <p className="text-xl font-black text-slate-900">¡Buen repaso!</p>
                <p className="text-sm text-slate-500 mt-1">Sigue repasando para reforzar</p>
              </>
            ) : (
              <>
                <RotateCcw className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                <p className="text-xl font-black text-slate-900">Repasa de nuevo</p>
                <p className="text-sm text-slate-500 mt-1">La repetición es clave para recordar</p>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
            {[
              { label: "Correctas",    value: results.correct,                  color: "text-emerald-600" },
              { label: "Incorrectas",  value: results.total - results.correct,  color: "text-red-500" },
              { label: "Total",        value: results.total,                    color: "text-slate-700" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border-2 border-slate-100 bg-white p-3 text-center">
                <p className={cn("text-2xl font-black", s.color)}>{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* XP breakdown */}
          <div className="w-full max-w-sm rounded-2xl bg-amber-50 border-2 border-amber-100 p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-700 mb-3">
              XP ganados · Bonus repaso ×1.5
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">XP base</span>
              <span className="font-bold text-slate-800">+{results.baseXp} XP</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-amber-700 font-semibold">✦ Bonus repaso (×0.5)</span>
              <span className="font-bold text-amber-700">+{results.bonusXp} XP</span>
            </div>
            <div className="border-t border-amber-200 pt-2 flex items-center justify-between">
              <span className="font-black text-slate-900">Total acreditado</span>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="font-black text-amber-600 text-lg">
                  +{results.baseXp + results.bonusXp} XP
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full max-w-sm">
            <button
              onClick={handleRestart}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="h-4 w-4" /> Otro repaso
            </button>
            <button
              onClick={() => router.push("/simulator/estudio")}
              className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
            >
              Modo Estudio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
