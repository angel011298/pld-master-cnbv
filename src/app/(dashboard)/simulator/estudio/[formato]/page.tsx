"use client";

import * as React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Trophy,
  RotateCcw,
  Star,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FlashcardStudy } from "@/components/study/FlashcardStudy";
import { MultipleChoiceStudy } from "@/components/study/MultipleChoiceStudy";
import { TrueFalseStudy } from "@/components/study/TrueFalseStudy";
import { FillBlankStudy } from "@/components/study/FillBlankStudy";
import { CrosswordStudy } from "@/components/study/CrosswordStudy";
import { WordSearchStudy } from "@/components/study/WordSearchStudy";
import { type StudyMeta } from "@/hooks/useStudySession";
import { generateGrid, type WordSearchGrid } from "@/lib/word-search-utils";

const FORMAT_META: Record<string, { label: string; emoji: string; description: string }> = {
  flashcard: { label: "Flashcards", emoji: "🃏", description: "Voltea las tarjetas y repasa definiciones clave" },
  multiple_choice: { label: "Opción múltiple", emoji: "📝", description: "4 opciones, una correcta. ¡Pon a prueba tu conocimiento!" },
  true_false: { label: "Verdadero / Falso", emoji: "✅", description: "Afirmaciones sobre la norma. ¿Verdadero o falso?" },
  case_study: { label: "Casos prácticos", emoji: "🏛️", description: "Escenarios reales del PLD/FT. Aplica lo que sabes." },
  fill_blank: { label: "Completar texto", emoji: "✏️", description: "Elige la palabra que completa correctamente el enunciado." },
  crossword: { label: "Crucigrama", emoji: "🔤", description: "Descubre las palabras con base en las pistas legales." },
  word_search: { label: "Sopa de letras", emoji: "🔍", description: "Encuentra los términos del PLD/FT en la cuadrícula." },
};

const BLOQUES = [
  { id: 1, name: "Marco Legal PLD/FT" },
  { id: 2, name: "Definiciones" },
  { id: 3, name: "KYC / Identificación" },
  { id: 4, name: "Reportes a CNBV" },
  { id: 5, name: "Estructura UNE" },
  { id: 6, name: "Sanciones y Listas" },
  { id: 7, name: "Tipologías y Op. Sospechosas" },
  { id: 8, name: "40 Recomendaciones GAFI" },
];

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

type Phase = "config" | "loading" | "study" | "results";

interface ResultsData {
  correct: number;
  total: number;
}

export default function EstudioFormatoPage() {
  const params = useParams<{ formato: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const formato = params.formato;
  const meta = FORMAT_META[formato];

  const [phase, setPhase] = React.useState<Phase>("config");
  const [bloque, setBloque] = React.useState(searchParams.get("bloque") ?? "all");
  const [dificultad, setDificultad] = React.useState(searchParams.get("dificultad") ?? "all");
  const [questionCount, setQuestionCount] = React.useState(10);
  const [questions, setQuestions] = React.useState<StudyQuestion[]>([]);
  const [results, setResults] = React.useState<ResultsData | null>(null);
  const [preGeneratedGrids, setPreGeneratedGrids] = React.useState<Record<number, WordSearchGrid>>({});

  if (!meta) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <p>Formato desconocido: {formato}</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-indigo-600 underline">
          Volver
        </button>
      </div>
    );
  }

  const handleStart = async () => {
    setPhase("loading");
    try {
      const qs = new URLSearchParams({
        formato,
        bloque,
        dificultad,
        limit: String(questionCount),
      });
      const res = await fetch(`/api/study/questions?${qs.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error cargando preguntas");
      if (!data.questions?.length) throw new Error("No hay preguntas disponibles para esos filtros");
      setQuestions(data.questions);
      setPhase("study");
    } catch (err) {
      alert((err as Error).message);
      setPhase("config");
    }
  };

  const handleFinish = (correct: number, total: number) => {
    // XP is credited by the study component via /api/study/sessions/:id/complete
    setResults({ correct, total });
    setPhase("results");
  };

  // Build studyMeta from the user-selected filters, resolved once questions load
  const studyMeta: StudyMeta = React.useMemo(() => ({
    formato,
    bloque: bloque !== "all" ? parseInt(bloque, 10) : null,
    dificultad: dificultad !== "all" ? dificultad : null,
  }), [formato, bloque, dificultad]);

  const handleRestart = () => {
    setPhase("config");
    setResults(null);
    setQuestions([]);
    setPreGeneratedGrids({});
  };

  // Pre-generate grids for word_search questions in background
  React.useEffect(() => {
    if (formato !== "word_search" || questions.length === 0) return;

    const generateGridsAsync = async () => {
      const grids: Record<number, WordSearchGrid> = {};
      for (const q of questions) {
        const words = q.correct_answer?.words ?? [];
        if (Array.isArray(words) && words.length > 0) {
          grids[q.id] = generateGrid(words);
        }
      }
      setPreGeneratedGrids(grids);
    };

    generateGridsAsync();
  }, [questions, formato]);

  const pct = results ? Math.round((results.correct / results.total) * 100) : 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Back button */}
      <button
        onClick={() => phase === "config" ? router.push("/simulator/estudio") : handleRestart()}
        className="mb-6 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {phase === "config" ? "Modo Estudio" : "Reiniciar"}
      </button>

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-3xl">{meta.emoji}</span>
        <div>
          <h1 className="text-xl font-black text-slate-900">{meta.label}</h1>
          <p className="text-sm text-slate-500">{meta.description}</p>
        </div>
      </div>

      {/* ── CONFIG PHASE ── */}
      {phase === "config" && (
        <div className="flex flex-col gap-5">
          {/* Bloque selector */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-5">
            <p className="text-sm font-bold text-slate-700 mb-3">Bloque temático</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setBloque("all")}
                className={cn(
                  "rounded-xl border-2 px-3 py-1.5 text-xs font-semibold transition-all",
                  bloque === "all" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:border-slate-400"
                )}
              >
                Todos
              </button>
              {BLOQUES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBloque(String(b.id))}
                  className={cn(
                    "rounded-xl border-2 px-3 py-1.5 text-xs font-semibold transition-all",
                    bloque === String(b.id) ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:border-slate-400"
                  )}
                >
                  {b.id}. {b.name.split(" ").slice(0, 2).join(" ")}
                </button>
              ))}
            </div>
          </div>

          {/* Dificultad */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-5">
            <p className="text-sm font-bold text-slate-700 mb-3">Dificultad</p>
            <div className="flex gap-2">
              {[
                { id: "all", label: "Todas" },
                { id: "basico", label: "Básico", color: "bg-emerald-50 border-emerald-400 text-emerald-700" },
                { id: "intermedio", label: "Intermedio", color: "bg-amber-50 border-amber-400 text-amber-700" },
                { id: "avanzado", label: "Avanzado", color: "bg-red-50 border-red-400 text-red-700" },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDificultad(d.id)}
                  className={cn(
                    "flex-1 rounded-xl border-2 py-2 text-xs font-bold transition-all",
                    dificultad === d.id
                      ? d.color ?? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-5">
            <p className="text-sm font-bold text-slate-700 mb-3">Cantidad de preguntas</p>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={cn(
                    "flex-1 rounded-xl border-2 py-2 text-sm font-bold transition-all",
                    questionCount === n ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:border-slate-300"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-base font-black text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <BookOpen className="h-5 w-5" />
            Comenzar sesión
          </button>
        </div>
      )}

      {/* ── LOADING PHASE ── */}
      {phase === "loading" && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500">Cargando preguntas…</p>
        </div>
      )}

      {/* ── STUDY PHASE ── */}
      {phase === "study" && questions.length > 0 && (
        <div>
          {formato === "flashcard" && (
            <FlashcardStudy
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              questions={questions as any}
              onFinish={handleFinish}
              studyMeta={studyMeta}
            />
          )}
          {(formato === "multiple_choice") && (
            <MultipleChoiceStudy
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              questions={questions as any}
              onFinish={handleFinish}
              studyMeta={studyMeta}
            />
          )}
          {formato === "case_study" && (
            <MultipleChoiceStudy
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              questions={questions as any}
              onFinish={handleFinish}
              isCaseStudy
              studyMeta={studyMeta}
            />
          )}
          {formato === "true_false" && (
            <TrueFalseStudy
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              questions={questions as any}
              onFinish={handleFinish}
              studyMeta={studyMeta}
            />
          )}
          {formato === "fill_blank" && (
            <FillBlankStudy
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              questions={questions as any}
              onFinish={handleFinish}
              studyMeta={studyMeta}
            />
          )}
          {formato === "crossword" && (
            <CrosswordStudy
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              questions={questions as any}
              onFinish={handleFinish}
              studyMeta={studyMeta}
            />
          )}
          {formato === "word_search" && (
            <WordSearchStudy
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              questions={questions as any}
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
                <p className="text-xl font-black text-slate-900">¡Excelente!</p>
                <p className="text-sm text-slate-500 mt-1">Dominas este formato</p>
              </>
            ) : pct >= 60 ? (
              <>
                <Star className="mx-auto h-10 w-10 text-indigo-400 mb-2" />
                <p className="text-xl font-black text-slate-900">¡Buen trabajo!</p>
                <p className="text-sm text-slate-500 mt-1">Sigue practicando para mejorar</p>
              </>
            ) : (
              <>
                <BookOpen className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                <p className="text-xl font-black text-slate-900">Sigue estudiando</p>
                <p className="text-sm text-slate-500 mt-1">La práctica constante te llevará al éxito</p>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
            {[
              { label: "Correctas", value: results.correct, color: "text-emerald-600" },
              { label: "Incorrectas", value: results.total - results.correct, color: "text-red-500" },
              { label: "Total", value: results.total, color: "text-slate-700" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border-2 border-slate-100 bg-white p-3 text-center">
                <p className={cn("text-2xl font-black", s.color)}>{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* XP awarded */}
          <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">
            <CheckCircle2 className="h-4 w-4" />
            +{Math.max(5, results.correct * 3)} XP registrados
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 w-full max-w-sm">
            <button
              onClick={handleRestart}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="h-4 w-4" /> Otra sesión
            </button>
            <button
              onClick={() => router.push("/simulator/estudio")}
              className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
            >
              Cambiar formato
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
