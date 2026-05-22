"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen, ClipboardList, AlertTriangle, FileText, Scale,
  Star, Layers, ArrowLeft, Trophy, Zap, CheckCircle, XCircle, ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { buildAuthHeaders } from "@/lib/auth-client";
import { QuizCard, QuizCardSkeleton } from "@/components/quiz/QuizCard";
import type { QuizQuestion } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AchievementToast } from "@/components/AchievementToast";
import type { Achievement } from "@/components/AchievementToast";

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Normalised shape returned by /api/lesson/questions.
 * Source table: question_bank (id bigint, bloque int, status "active").
 * The API normalises both option formats and converts correct_answer to 0-based index.
 */
interface QuizBankRow {
  id: number;               // bigint (question_bank.id)
  pregunta: string;
  opciones: string[];       // always an array (normalised server-side)
  respuesta_correcta: number; // 0-based index (normalised server-side)
  explicacion: string;
  fuente: string;
  tema: string;
  dificultad: string;
}

interface TopicMeta {
  name: string;
  description: string;
  // tema: the pld_topic ENUM key stored in the DB  (equals the URL slug)
  tema: string;
  icon: React.ComponentType<{ className?: string }>;
}

type LessonState = "inicio" | "cargando" | "leccion" | "resultados";

interface LessonResults {
  correct: number;
  total: number;
  xp: number;
}

// ── Topic catalogue ───────────────────────────────────────────────────────────
// IMPORTANT: `tema` must match the pld_topic ENUM key stored in quiz_bank.tema
// (i.e. the same short key used as the URL slug: /estudiar/tipologias → "tipologias")

const TOPIC_MAP: Record<string, TopicMeta> = {
  tipologias: {
    name: "BLOQUE 1: El Lavado de Dinero y el Financiamiento al Terrorismo",
    description:
      "Conceptos, etapas y penas del Lavado de Dinero y Financiamiento al Terrorismo según el Código Penal Federal.",
    tema: "tipologias",
    icon: BookOpen,
  },
  gafi: {
    name: "BLOQUE 2: Organismos y Foros Internacionales que Participan en PLD y FT",
    description:
      "GAFI, sus 40 Recomendaciones, Grupo Egmont y otros organismos internacionales clave en ALD/CFT.",
    tema: "gafi",
    icon: Layers,
  },
  sanciones: {
    name: "BLOQUE 3: Detección y Gestión de Riesgos en Materia de PLD/FT",
    description:
      "Enfoque Basado en Riesgos, tipologías de LD/FT, señales de alerta y listas de personas bloqueadas.",
    tema: "sanciones",
    icon: AlertTriangle,
  },
  kyc_cdd: {
    name: "BLOQUE 4: Prevención y Combate del LD/FT en el Sistema Financiero Mexicano",
    description:
      "Políticas KYC/CDD, Oficial de Cumplimiento, Comité de Comunicación y Control y sistemas automatizados.",
    tema: "kyc_cdd",
    icon: ClipboardList,
  },
  reportes_cnbv: {
    name: "BLOQUE 5: Régimen de Prevención del LD/FT en el Sistema Financiero Mexicano",
    description:
      "Reportes de Operaciones Relevantes, Inusuales e Internas Preocupantes; sanciones y confidencialidad.",
    tema: "reportes_cnbv",
    icon: FileText,
  },
  marco_legal: {
    name: "BLOQUE 6: Nociones de la Ley FPIORPI",
    description:
      "Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita y actividades vulnerables.",
    tema: "marco_legal",
    icon: Scale,
  },
  une: {
    name: "BLOQUE 7: Auditoría en Materia de PLD/FT",
    description:
      "Auditoría interna y externa del programa de PLD/FT, supervisión de la CNBV y evaluación mutua del GAFI.",
    tema: "une",
    icon: Star,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Converts a normalised QuizBankRow (from the API) into a QuizQuestion for
 * the QuizCard component, randomising the option order.
 */
function bankRowToQuestion(row: QuizBankRow, seqId: number): QuizQuestion {
  const labels = ["A)", "B)", "C)", "D)"];
  // Shuffle the original option indices [0,1,2,3] so displayed order is random
  const indices = shuffleArray([0, 1, 2, 3].slice(0, row.opciones.length));
  const options = indices.map(
    (origIdx, pos) => `${labels[pos]} ${row.opciones[origIdx]}`
  );
  // The correct answer is the option whose original index was row.respuesta_correcta
  const correctPos = indices.indexOf(row.respuesta_correcta);
  return {
    id: seqId,
    question_id: undefined, // QuizQuestion.question_id is number|undefined; we pass the uuid separately
    question: row.pregunta,
    options,
    answer: options[correctPos] ?? options[0],
    justification: `${row.explicacion}${row.fuente ? ` (Fuente: ${row.fuente})` : ""}`,
    source: "bank",
  };
}

function motivationalMessage(score: number): string {
  if (score >= 90) return "¡Excelente! Dominas este tema a la perfección.";
  if (score >= 70) return "¡Muy bien! Sigue practicando para alcanzar la excelencia.";
  if (score >= 50) return "Buen intento. Repasa los conceptos clave y vuelve a intentarlo.";
  return "¡Sigue adelante! Con práctica constante dominarás este tema.";
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LeccionPage() {
  const params = useParams();
  const router = useRouter();
  const temaSlug = params.tema as string;
  const topicInfo = TOPIC_MAP[temaSlug];

  const [lessonState, setLessonState] = useState<LessonState>("inicio");
  const [dueCount, setDueCount] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<LessonResults | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [currentAchievementIndex, setCurrentAchievementIndex] = useState(0);

  // Keep bigint IDs for answer tracking (separate from QuizQuestion.id which is a seq number)
  const questionUuidsRef = useRef<number[]>([]);

  // Refs avoid stale-closure issues in async callbacks
  const correctRef = useRef(0);
  const xpRef = useRef(0);
  const sessionIdRef = useRef<string | null>(null);
  const questionStartRef = useRef(Date.now());

  // ── Fetch pending review count on mount ────────────────────────────────────
  useEffect(() => {
    if (!topicInfo) return;
    (async () => {
      try {
        const headers = await buildAuthHeaders();
        const res = await fetch(`/api/lesson/questions?tema=${temaSlug}`, {
          headers,
        });
        if (res.ok) {
          const data: { dueIds?: string[] } = await res.json();
          setDueCount((data.dueIds ?? []).length);
        } else {
          setDueCount(0);
        }
      } catch {
        setDueCount(0);
      }
    })();
  }, [topicInfo, temaSlug]);

  // ── Start lesson ───────────────────────────────────────────────────────────
  const startLesson = useCallback(async () => {
    if (!topicInfo) return;
    setLessonState("cargando");

    try {
      // Auth check
      const sb = supabase();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }

      // Fetch questions via server API (uses supabaseAdmin — bypasses RLS,
      // handles both opcion_a/b/c/d and opciones[] schema variants)
      const headers = await buildAuthHeaders({ "Content-Type": "application/json" });
      const res = await fetch(`/api/lesson/questions?tema=${temaSlug}`, {
        headers,
      });

      if (!res.ok) {
        console.error("[startLesson] API error:", await res.text());
        setLessonState("inicio");
        return;
      }

      const { questions: bankRows, dueIds }: { questions: QuizBankRow[]; dueIds: number[] } =
        await res.json();

      if (bankRows.length === 0) {
        setLessonState("inicio");
        return;
      }

      const dueSet = new Set<number>(dueIds);

      // Due reviews first, then new questions – capped at 10
      const ordered = [
        ...shuffleArray(bankRows.filter((r) => dueSet.has(r.id))),
        ...shuffleArray(bankRows.filter((r) => !dueSet.has(r.id))),
      ].slice(0, 10);

      if (ordered.length === 0) {
        setLessonState("inicio");
        return;
      }

      const quizQuestions = ordered.map((row, i) => bankRowToQuestion(row, i + 1));
      // Store uuids in the same order so handleAnswer can look them up
      questionUuidsRef.current = ordered.map((r) => r.id);

      // Create exam session
      const { data: session } = await sb
        .from("exam_sessions")
        .insert({
          user_id: user.id,
          exam_type: "repaso",
          total_questions: quizQuestions.length,
        })
        .select("id")
        .single();

      // Update streak (fire-and-forget)
      fetch("/api/streak", { method: "POST", headers }).catch(console.error);

      // Reset counters
      correctRef.current = 0;
      xpRef.current = 0;
      questionStartRef.current = Date.now();
      sessionIdRef.current = session?.id ?? null;

      setQuestions(quizQuestions);
      setCurrentIndex(0);
      setResults(null);
      setLessonState("leccion");
    } catch (err) {
      console.error("[startLesson] error:", err);
      setLessonState("inicio");
    }
  }, [topicInfo, temaSlug, router]);

  // ── Handle answer ──────────────────────────────────────────────────────────
  const handleAnswer = useCallback(
    async (isCorrect: boolean, _questionId?: number, selectedOption?: string) => {
      if (isCorrect) correctRef.current++;
      xpRef.current += isCorrect ? 10 : 3;

      // Use the bigint ID stored at the matching index
      const questionUuid = questionUuidsRef.current[currentIndex];
      if (questionUuid === undefined) return;

      const elapsed = Math.round((Date.now() - questionStartRef.current) / 1000);
      try {
        const headers = await buildAuthHeaders({ "Content-Type": "application/json" });
        fetch("/api/answer", {
          method: "POST",
          headers,
          body: JSON.stringify({
            session_id: sessionIdRef.current,
            question_id: questionUuid,
            opcion_elegida: selectedOption?.charAt(0) ?? null,
            es_correcta: isCorrect,
            tiempo_respuesta_seg: elapsed,
          }),
        }).catch(console.error);
      } catch {
        // session expired – continue lesson anyway
      }
    },
    [currentIndex]
  );

  // ── Navigate ───────────────────────────────────────────────────────────────
  const handleNext = useCallback(async () => {
    const next = currentIndex + 1;

    if (next >= questions.length) {
      // Close the exam session
      const sid = sessionIdRef.current;
      if (sid) {
        const sb = supabase();
        const finalCorrect = correctRef.current;
        const finalTotal = questions.length;
        sb.from("exam_sessions")
          .update({
            estado: "completado",
            correct_answers: finalCorrect,
            score:
              finalTotal > 0
                ? Number(((finalCorrect / finalTotal) * 100).toFixed(2))
                : 0,
            completed_at: new Date().toISOString(),
          })
          .eq("id", sid)
          .then(({ error }) => {
            if (error) console.error("Failed to close session:", error);
          });
      }
      setResults({ correct: correctRef.current, total: questions.length, xp: xpRef.current });
      setLessonState("resultados");

      // Check achievements
      try {
        const headers = await buildAuthHeaders({ "Content-Type": "application/json" });
        const res = await fetch("/api/achievements/check", {
          method: "POST",
          headers,
        });
        const data = await res.json();
        if (res.ok && data.unlocked && data.unlocked.length > 0) {
          setUnlockedAchievements(data.unlocked);
          setCurrentAchievementIndex(0);
        }
      } catch (err) {
        console.error("Error checking achievements:", err);
      }
    } else {
      setCurrentIndex(next);
      questionStartRef.current = Date.now();
    }
  }, [currentIndex, questions.length]);

  // ── Topic not found ────────────────────────────────────────────────────────
  if (!topicInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Tema no encontrado</h1>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>
    );
  }

  const TopicIcon = topicInfo.icon;
  const progress = questions.length > 0 ? (currentIndex / questions.length) * 100 : 0;

  // ── Inicio ─────────────────────────────────────────────────────────────────
  if (lessonState === "inicio") {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col gap-6">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="sm"
          className="self-start gap-2 text-slate-500"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>

        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
            <TopicIcon className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{topicInfo.name}</h1>
            <p className="text-sm text-slate-500 mt-1">{topicInfo.description}</p>
          </div>
        </div>

        {/* Pending reviews counter */}
        <div className="rounded-2xl border-2 border-blue-100 bg-blue-50 p-5 flex items-center gap-4">
          <div className="text-center min-w-[64px]">
            <p className="text-3xl font-black text-blue-700">
              {dueCount === null ? "…" : dueCount}
            </p>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wide">
              pendientes
            </p>
          </div>
          <div className="border-l border-blue-200 pl-4">
            <p className="text-sm font-semibold text-blue-800">
              Repasos vencidos en este tema
            </p>
            <p className="text-xs text-blue-500 mt-0.5">
              {dueCount === null
                ? "Calculando…"
                : dueCount > 0
                ? "Se priorizarán al inicio de la lección."
                : "¡Al día! Practicarás preguntas nuevas."}
            </p>
          </div>
        </div>

        {/* Info list */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
            Esta lección incluye
          </p>
          {[
            "10 preguntas seleccionadas inteligentemente",
            "Repasos vencidos primero, luego preguntas nuevas",
            "+10 XP por correcta · +3 XP por incorrecta",
            "SM-2: ajusta automáticamente el intervalo de repaso",
          ].map((text) => (
            <div key={text} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>

        <Button
          onClick={startLesson}
          className="w-full py-6 text-lg font-black rounded-2xl bg-blue-600 hover:bg-blue-700 text-white border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
        >
          Comenzar lección <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    );
  }

  // ── Cargando ───────────────────────────────────────────────────────────────
  if (lessonState === "cargando") {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-blue-500 rounded-full animate-pulse" />
          </div>
          <p className="text-sm text-slate-400 text-center">
            Preparando tu lección…
          </p>
        </div>
        <QuizCardSkeleton />
      </div>
    );
  }

  // ── Lección ────────────────────────────────────────────────────────────────
  if (lessonState === "leccion") {
    const q = questions[currentIndex];
    return (
      <div className="max-w-2xl mx-auto py-6 px-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TopicIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-bold text-slate-700 truncate max-w-[200px]">
              {topicInfo.name}
            </span>
          </div>
          <Badge variant="outline" className="text-xs font-bold shrink-0">
            {currentIndex + 1} / {questions.length}
          </Badge>
        </div>

        <Progress value={progress} className="h-2" />

        {q && (
          <QuizCard
            key={currentIndex}
            question={q}
            onAnswer={handleAnswer}
            onNext={handleNext}
          />
        )}
      </div>
    );
  }

  // ── Resultados ─────────────────────────────────────────────────────────────
  if (lessonState === "resultados" && results) {
    const score =
      results.total > 0
        ? Math.round((results.correct / results.total) * 100)
        : 0;
    const incorrect = results.total - results.correct;

    return (
      <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col gap-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
            <Trophy className="h-10 w-10 text-amber-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Lección completada
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {motivationalMessage(score)}
          </p>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Puntaje",
              value: `${score}%`,
              color: score >= 70 ? "text-emerald-600" : "text-orange-500",
              bg:
                score >= 70
                  ? "bg-emerald-50 border-emerald-100"
                  : "bg-orange-50 border-orange-100",
            },
            {
              label: "Correctas",
              value: `${results.correct}/${results.total}`,
              color: "text-blue-600",
              bg: "bg-blue-50 border-blue-100",
            },
            {
              label: "XP ganado",
              value: `+${results.xp}`,
              color: "text-amber-600",
              bg: "bg-amber-50 border-amber-100",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl border ${stat.bg} p-4 text-center`}
            >
              <p className={`text-2xl font-black ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* XP breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
            Desglose de XP
          </p>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Respuestas correctas
            </div>
            <span className="font-bold text-emerald-600">
              {results.correct} × 10 = +{results.correct * 10} XP
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <XCircle className="h-4 w-4 text-red-400" />
              Respuestas incorrectas
            </div>
            <span className="font-bold text-slate-500">
              {incorrect} × 3 = +{incorrect * 3} XP
            </span>
          </div>
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-sm font-black">
            <div className="flex items-center gap-2 text-slate-800">
              <Zap className="h-4 w-4 text-amber-500" /> Total
            </div>
            <span className="text-amber-600">+{results.xp} XP</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={startLesson}
            className="flex-1 font-bold"
          >
            Repetir lección
          </Button>
          <Button
            onClick={() => router.push("/dashboard")}
            className="flex-1 font-bold bg-blue-600 hover:bg-blue-700 text-white"
          >
            Continuar <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Achievement toasts (rendered on top of results) ────────────────────────
  const currentAchievement = unlockedAchievements[currentAchievementIndex] || null;
  return (
    <>
      <AchievementToast
        achievement={currentAchievement}
        onClose={() => {
          if (currentAchievementIndex < unlockedAchievements.length - 1) {
            setCurrentAchievementIndex(currentAchievementIndex + 1);
          } else {
            setUnlockedAchievements([]);
            setCurrentAchievementIndex(0);
          }
        }}
      />
    </>
  );
}
