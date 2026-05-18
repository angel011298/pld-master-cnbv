"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  BookOpen,
  Zap,
  Trophy,
  Target,
  AlertTriangle,
  Flame,
  RotateCcw,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

// ── Constants ──────────────────────────────────────────────────────────────────

const FORMATO_LABELS: Record<string, string> = {
  multiple_choice: "Opción Múltiple",
  flashcard:       "Flashcards",
  true_false:      "V / F",
  case_study:      "Casos",
  fill_blank:      "Completar",
  crossword:       "Crucigrama",
  word_search:     "Sopa de Letras",
};

const BLOQUE_NAMES: Record<number, string> = {
  1: "Marco Legal", 2: "Definiciones", 3: "KYC",       4: "Reportes",
  5: "UNE",         6: "Sanciones",    7: "Tipologías", 8: "GAFI",
};

const BLOQUE_SHORT: Record<number, string> = {
  1: "M.Legal", 2: "Defin.", 3: "KYC",  4: "Rep.",
  5: "UNE",     6: "Sanc.", 7: "Tipol.", 8: "GAFI",
};

const CHART_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#f43f5e",
  "#0ea5e9", "#8b5cf6", "#ec4899", "#f97316",
];

// ── Types ──────────────────────────────────────────────────────────────────────

interface Summary {
  total_sessions:           number;
  total_questions_answered: number;
  accuracy_percentage:      number;
  favorite_formato:         string | null;
  weakest_bloque:           number | null;
  sessions_this_week:       number;
  streak_days:              number;
  last_session_at:          string | null;
  total_xp:                 number;
  current_streak:           number;
  failed_questions_count:   number;
}

interface SessionPoint {
  session_number:   number;
  score_percentage: number;
  formato:          string;
  date:             string;
}

interface FormatoStat {
  formato:              string;
  session_count:        number;
  questions_answered:   number;
  accuracy_percentage:  number;
}

interface BloqueStat {
  bloque:              number;
  session_count:       number;
  accuracy_percentage: number;
}

interface TimeByFormato {
  formato:       string;
  total_minutes: number;
}

interface RecentSession {
  id:               string;
  created_at:       string;
  formato:          string;
  bloque:           number | null;
  total_questions:  number;
  correct_count:    number;
  score_percentage: number;
  duration_seconds: number;
  xp_earned:        number;
}

interface StatsData {
  summary:         Summary;
  session_chart:   SessionPoint[];
  by_formato:      FormatoStat[];
  by_bloque:       BloqueStat[];
  time_by_formato: TimeByFormato[];
  recent_sessions: RecentSession[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6 animate-pulse">
      <div className="h-4 w-28 rounded bg-slate-200" />
      <div className="h-7 w-56 rounded bg-slate-200" />
      {/* Hero */}
      <div className="h-36 w-full rounded-2xl bg-slate-200" />
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-slate-200" />
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-72 rounded-2xl bg-slate-200" />
        ))}
      </div>
      {/* Table */}
      <div className="h-64 rounded-2xl bg-slate-200" />
    </div>
  );
}

function EmptyChart({ message = "Sin datos disponibles aún" }: { message?: string }) {
  return (
    <div className="flex h-48 items-center justify-center text-center">
      <p className="text-sm text-slate-400 max-w-[180px]">{message}</p>
    </div>
  );
}

function StatCard({
  icon, label, value, subvalue, colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subvalue?: string;
  colorClass: string;
}) {
  return (
    <div className="rounded-xl border-2 border-slate-100 bg-white p-4 flex flex-col gap-2.5">
      <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", colorClass)}>
        {icon}
      </div>
      <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
      <div>
        <p className="text-xs font-bold text-slate-600">{label}</p>
        {subvalue && <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{subvalue}</p>}
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-slate-100 bg-white p-5">
      <h3 className="text-sm font-bold text-slate-700 mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ─── Recharts custom tooltips (typed to avoid `any`) ──────────────────────────

type TooltipPayloadItem = {
  value: number;
  name: string;
  color?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
};

type RechartTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
};

function LineTooltip({ active, payload, label }: RechartTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as SessionPoint | undefined;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs space-y-0.5">
      <p className="font-bold text-slate-700">Sesión {label}</p>
      <p className="font-semibold text-indigo-600">{point?.score_percentage ?? 0}% aciertos</p>
      {point?.formato && (
        <p className="text-slate-400">{FORMATO_LABELS[point.formato] ?? point.formato}</p>
      )}
      {point?.date && <p className="text-slate-400">{formatDate(point.date)}</p>}
    </div>
  );
}

function FormatoBarTooltip({ active, payload }: RechartTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as (FormatoStat & { label: string }) | undefined;
  if (!d) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs space-y-0.5">
      <p className="font-bold text-slate-700">{d.label}</p>
      <p className="text-slate-600">{d.questions_answered.toLocaleString()} reactivos</p>
      <p className="text-slate-400">{d.session_count} sesiones · {d.accuracy_percentage}% aciertos</p>
    </div>
  );
}

function BloqueBarTooltip({ active, payload }: RechartTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as (BloqueStat & { label: string }) | undefined;
  if (!d) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs space-y-0.5">
      <p className="font-bold text-slate-700">{BLOQUE_NAMES[d.bloque] ?? `Bloque ${d.bloque}`}</p>
      <p className="font-semibold text-emerald-600">{d.accuracy_percentage}% aciertos</p>
      <p className="text-slate-400">{d.session_count} sesión{d.session_count !== 1 ? "es" : ""}</p>
    </div>
  );
}

function PieTooltip({
  active, payload,
  totalMinutes,
}: RechartTooltipProps & { totalMinutes: number }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as { name: string; value: number } | undefined;
  if (!d) return null;
  const pct = totalMinutes > 0 ? Math.round((d.value / totalMinutes) * 100) : 0;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs space-y-0.5">
      <p className="font-bold text-slate-700">{d.name}</p>
      <p className="text-slate-600">{d.value} min</p>
      <p className="text-slate-400">{pct}% del total</p>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function EstadisticasPage() {
  const [data, setData] = React.useState<StatsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadStats = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase().auth.getSession();
      const token = sessionData.session?.access_token ?? "";
      const res = await fetch("/api/study/sessions/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error cargando estadísticas");
      setData((await res.json()) as StatsData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { loadStats(); }, [loadStats]);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <p className="text-slate-500 text-sm mb-3">{error}</p>
        <button
          onClick={loadStats}
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { summary, session_chart, by_formato, by_bloque, time_by_formato, recent_sessions } = data;

  // Derived display values
  const weakBloqueLabel = summary.weakest_bloque
    ? BLOQUE_NAMES[summary.weakest_bloque] ?? `Bloque ${summary.weakest_bloque}`
    : null;

  const weakAccuracy = summary.weakest_bloque
    ? (by_bloque.find((b) => b.bloque === summary.weakest_bloque)?.accuracy_percentage ?? null)
    : null;

  // Enrich chart data with display labels (pre-calculated in API, enriched here only with labels)
  const formatoChartData = by_formato.map((f) => ({
    ...f,
    label: FORMATO_LABELS[f.formato] ?? f.formato,
  }));

  const bloqueChartData = by_bloque
    .filter((b) => b.session_count > 0)
    .map((b) => ({
      ...b,
      label: BLOQUE_SHORT[b.bloque] ?? `B${b.bloque}`,
    }));

  const pieData = time_by_formato.map((t) => ({
    name: FORMATO_LABELS[t.formato] ?? t.formato,
    value: t.total_minutes,
  }));

  const totalMinutes = time_by_formato.reduce((s, t) => s + t.total_minutes, 0);
  const hasNoSessions = summary.total_sessions === 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      {/* ── Back ── */}
      <Link
        href="/simulator/estudio"
        className="flex w-fit items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Modo Estudio
      </Link>

      {/* ── Page title ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Estadísticas de Estudio
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Tu progreso acumulado para el examen CENEVAL PLD/FT
          </p>
        </div>

        {/* ── Revisar fallidas CTA ── */}
        {summary.failed_questions_count > 0 && (
          <Link
            href="/simulator/estudio/revisar-fallidas"
            className="flex shrink-0 items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-amber-600 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Revisar fallidas
            <span className="ml-0.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[11px] font-black tabular-nums">
              {summary.failed_questions_count}
            </span>
          </Link>
        )}
      </div>

      {/* ── Hero Card ─────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white shadow-sm">
        <p className="mb-5 text-xs font-bold uppercase tracking-wider text-white/60">
          Progreso General
        </p>
        <div className="grid grid-cols-3 gap-4 sm:gap-8">
          <div>
            <p className="text-4xl font-black leading-none">
              {summary.accuracy_percentage > 0
                ? `${summary.accuracy_percentage}%`
                : "—"}
            </p>
            <p className="mt-1.5 text-xs text-white/70 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Precisión global
            </p>
          </div>
          <div>
            <p className="text-4xl font-black leading-none">
              {summary.total_questions_answered.toLocaleString("es-MX")}
            </p>
            <p className="mt-1.5 text-xs text-white/70 flex items-center gap-1">
              <BookOpen className="h-3 w-3" /> Reactivos estudiados
            </p>
          </div>
          <div>
            <p className="text-4xl font-black leading-none">
              {(summary.total_xp ?? 0).toLocaleString("es-MX")}
            </p>
            <p className="mt-1.5 text-xs text-white/70 flex items-center gap-1">
              <Zap className="h-3 w-3" /> XP acumulados
            </p>
          </div>
        </div>
        {summary.last_session_at && (
          <p className="mt-5 text-[11px] text-white/40">
            Última sesión: {formatDate(summary.last_session_at)}
          </p>
        )}
      </div>

      {/* ── 4 Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Trophy className="h-5 w-5" />}
          label="Sesiones completadas"
          value={summary.total_sessions}
          subvalue={`${summary.sessions_this_week} esta semana`}
          colorClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Promedio de aciertos"
          value={`${summary.accuracy_percentage}%`}
          subvalue={
            summary.favorite_formato
              ? `Favorito: ${FORMATO_LABELS[summary.favorite_formato] ?? summary.favorite_formato}`
              : undefined
          }
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Bloque débil"
          value={summary.weakest_bloque ? `B${summary.weakest_bloque}` : "—"}
          subvalue={
            weakBloqueLabel && weakAccuracy != null
              ? `${weakBloqueLabel}: ${weakAccuracy}%`
              : "Sin suficientes datos"
          }
          colorClass="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={<Flame className="h-5 w-5" />}
          label="Racha actual"
          value={`${summary.current_streak} días`}
          subvalue={
            summary.streak_days > 0
              ? `Récord: ${summary.streak_days} días`
              : "¡Empieza hoy!"
          }
          colorClass="bg-rose-50 text-rose-600"
        />
      </div>

      {/* ── Charts / Empty State ───────────────────────────────────────────────── */}
      {hasNoSessions ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-14 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <p className="font-bold text-slate-500">Aún no tienes sesiones de estudio</p>
          <p className="mt-1 text-sm text-slate-400">
            Completa al menos una sesión para ver tus gráficas y tendencias
          </p>
          <Link
            href="/simulator/estudio"
            className="mt-5 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
          >
            Ir a Modo Estudio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Chart 1: Accuracy por sesión (LineChart) ── */}
          <ChartCard title="📈 Accuracy por sesión (últimas 20)">
            {session_chart.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <LineChart
                  data={session_chart}
                  margin={{ top: 5, right: 8, left: -22, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="session_number"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: "Sesión", position: "insideBottom", offset: -2, fontSize: 10, fill: "#cbd5e1" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickFormatter={(v) => `${v}%`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<LineTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="score_percentage"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ fill: "#6366f1", r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#6366f1", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* ── Chart 2: Reactivos por formato (BarChart) ── */}
          <ChartCard title="📚 Reactivos por formato">
            {formatoChartData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart
                  data={formatoChartData}
                  margin={{ top: 5, right: 8, left: -22, bottom: 36 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<FormatoBarTooltip />} />
                  <Bar dataKey="questions_answered" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {formatoChartData.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* ── Chart 3: Desempeño por bloque (BarChart) ── */}
          <ChartCard title="🗂️ Desempeño por bloque (% aciertos)">
            {bloqueChartData.length === 0 ? (
              <EmptyChart message="Estudia con filtro de bloque para ver datos aquí" />
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart
                  data={bloqueChartData}
                  margin={{ top: 5, right: 8, left: -22, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickFormatter={(v) => `${v}%`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<BloqueBarTooltip />} />
                  <Bar
                    dataKey="accuracy_percentage"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  >
                    {bloqueChartData.map((b, idx) => (
                      <Cell
                        key={idx}
                        fill={
                          b.accuracy_percentage >= 80
                            ? "#10b981"  // emerald – strong
                            : b.accuracy_percentage >= 60
                            ? "#f59e0b"  // amber – ok
                            : "#f43f5e"  // rose – weak
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* ── Chart 4: Tiempo por formato (PieChart) ── */}
          <ChartCard title="⏱️ Tiempo dedicado por formato">
            {pieData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="40%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={CHART_COLORS[idx % CHART_COLORS.length]}
                        strokeWidth={0}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={
                      <PieTooltip totalMinutes={totalMinutes} />
                    }
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-[11px] text-slate-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            {totalMinutes > 0 && (
              <p className="mt-2 text-center text-xs text-slate-400">
                {totalMinutes >= 60
                  ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}min totales`
                  : `${totalMinutes} min totales`}
              </p>
            )}
          </ChartCard>
        </div>
      )}

      {/* ── Recent Sessions Table ─────────────────────────────────────────────── */}
      {recent_sessions.length > 0 && (
        <div className="rounded-2xl border-2 border-slate-100 bg-white overflow-hidden">
          {/* Table header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">📋 Últimas 10 sesiones</h3>
            <span className="text-xs text-slate-400">{recent_sessions.length} sesiones</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-[11px] text-slate-500 font-semibold uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Formato</th>
                  <th className="px-4 py-3 text-center">Bloque</th>
                  <th className="px-4 py-3 text-center">Preguntas</th>
                  <th className="px-4 py-3 text-center">Aciertos</th>
                  <th className="px-4 py-3 text-center">%</th>
                  <th className="px-4 py-3 text-center">Tiempo</th>
                </tr>
              </thead>
              <tbody>
                {recent_sessions.map((s, i) => {
                  const pct = s.score_percentage;
                  const pctColor =
                    pct >= 80 ? "text-emerald-600 font-black"
                    : pct >= 60 ? "text-amber-600 font-bold"
                    : "text-red-500 font-bold";

                  return (
                    <tr
                      key={s.id}
                      className={cn(
                        "border-t border-slate-50 text-xs transition-colors hover:bg-indigo-50/30",
                        i % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      )}
                    >
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {formatDate(s.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 whitespace-nowrap">
                          {FORMATO_LABELS[s.formato] ?? s.formato}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-500">
                        {s.bloque ? (
                          <span
                            className="font-semibold text-slate-700"
                            title={BLOQUE_NAMES[s.bloque]}
                          >
                            B{s.bloque}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-700">
                        {s.total_questions}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">
                        {s.correct_count}
                      </td>
                      <td className={cn("px-4 py-3 text-center", pctColor)}>
                        {pct}%
                      </td>
                      <td className="px-4 py-3 text-center text-slate-500 font-mono">
                        {formatDuration(s.duration_seconds)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer note */}
          <div className="px-5 py-3 border-t border-slate-100 text-[11px] text-slate-400 text-right">
            Solo se muestran sesiones completadas
          </div>
        </div>
      )}
    </div>
  );
}
