"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Zap, Flame } from "lucide-react";
import type { ProgressOverviewResponse } from "@/app/api/progress/overview/route";

export default function ProgresoPage() {
  const router = useRouter();
  const [data, setData] = useState<ProgressOverviewResponse | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch("/api/progress/overview");
        if (!res.ok) {
          router.push("/");
          return;
        }
        setData(await res.json());
      } catch (err) {
        console.error("Error fetching progress:", err);
      } finally {
        setCargando(false);
      }
    };

    fetchProgress();
  }, [router]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Cargando progreso...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Error cargando progreso</div>
      </div>
    );
  }

  const getCardBg = (accuracy: number | null) => {
    if (accuracy === null) return "bg-slate-100 border-slate-300";
    if (accuracy >= 80) return "bg-emerald-50 border-emerald-300";
    if (accuracy >= 60) return "bg-amber-50 border-amber-300";
    return "bg-red-50 border-red-300";
  };

  const getAccuracyColor = (accuracy: number | null) => {
    if (accuracy === null) return "text-slate-500";
    if (accuracy >= 80) return "text-emerald-700";
    if (accuracy >= 60) return "text-amber-700";
    return "text-red-700";
  };

  const getProgressBarColor = (accuracy: number | null) => {
    if (accuracy === null) return "bg-slate-300";
    if (accuracy >= 80) return "bg-emerald-500";
    if (accuracy >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-black text-slate-900 mb-4">Mapa de Progreso</h1>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs font-medium text-slate-500 mb-1">XP Total</div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-lg font-bold text-slate-900">{data.total_xp}</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs font-medium text-slate-500 mb-1">Racha</div>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-lg font-bold text-slate-900">{data.current_streak}</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs font-medium text-slate-500 mb-1">Simulacros</div>
              <div className="text-lg font-bold text-slate-900">{data.simulacros_completados}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs font-medium text-slate-500 mb-1">Promedio</div>
              <div className="text-lg font-bold text-slate-900">
                {data.score_promedio_simulacros ?? "-"}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Dominio por Tema</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.topics.map(topic => (
            <div
              key={topic.tema}
              className={`border-2 rounded-lg p-4 transition-all hover:shadow-md ${getCardBg(topic.accuracy)}`}
            >
              {/* Topic Name */}
              <h3 className="font-bold text-slate-900 mb-3 text-sm">{topic.label}</h3>

              {/* Accuracy */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-2xl font-black ${getAccuracyColor(topic.accuracy)}`}>
                    {topic.accuracy !== null ? `${topic.accuracy}%` : "-"}
                  </span>
                  {topic.accuracy !== null && (
                    <span className="text-xs font-medium text-slate-600">
                      {topic.total_answered} preguntas
                    </span>
                  )}
                </div>
                {topic.accuracy !== null && (
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressBarColor(topic.accuracy)}`}
                      style={{ width: `${topic.accuracy}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Pending Reviews */}
              {topic.pending_reviews_today > 0 && (
                <div className="bg-blue-100 rounded px-2 py-1 mb-4 text-xs font-medium text-blue-700">
                  {topic.pending_reviews_today} para hoy
                </div>
              )}

              {/* Study Button */}
              <Link
                href={`/estudiar/${topic.tema}`}
                className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm gap-1"
              >
                Estudiar
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
