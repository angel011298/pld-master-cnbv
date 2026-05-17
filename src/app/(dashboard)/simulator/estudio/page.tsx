"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const FORMATS = [
  {
    id: "multiple_choice",
    label: "Opción Múltiple",
    emoji: "📝",
    description: "4 opciones, una correcta. El formato principal del examen CENEVAL.",
    count: "349+",
    color: "border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50",
    badge: "bg-indigo-100 text-indigo-700",
  },
  {
    id: "true_false",
    label: "Verdadero / Falso",
    emoji: "✅",
    description: "Afirmaciones sobre normas CNBV, GAFI y LFPIORPI. Rápido y efectivo.",
    count: "117+",
    color: "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "flashcard",
    label: "Flashcards",
    emoji: "🃏",
    description: "Voltea la tarjeta para ver la definición. Ideal para memorizar conceptos.",
    count: "64+",
    color: "border-violet-200 hover:border-violet-400 hover:bg-violet-50",
    badge: "bg-violet-100 text-violet-700",
  },
  {
    id: "case_study",
    label: "Casos Prácticos",
    emoji: "🏛️",
    description: "Escenarios reales del sector financiero. Aplica la norma en contexto.",
    count: "16+",
    color: "border-amber-200 hover:border-amber-400 hover:bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
  },
  {
    id: "fill_blank",
    label: "Completar Texto",
    emoji: "✏️",
    description: "Elige la palabra que completa correctamente el enunciado normativo.",
    count: "31+",
    color: "border-sky-200 hover:border-sky-400 hover:bg-sky-50",
    badge: "bg-sky-100 text-sky-700",
  },
  {
    id: "crossword",
    label: "Crucigrama",
    emoji: "🔤",
    description: "Lee las pistas y escribe las palabras. Consolida el vocabulario técnico.",
    count: "8+",
    color: "border-rose-200 hover:border-rose-400 hover:bg-rose-50",
    badge: "bg-rose-100 text-rose-700",
  },
  {
    id: "word_search",
    label: "Sopa de Letras",
    emoji: "🔍",
    description: "Localiza los términos clave del PLD/FT en la cuadrícula interactiva.",
    count: "8+",
    color: "border-orange-200 hover:border-orange-400 hover:bg-orange-50",
    badge: "bg-orange-100 text-orange-700",
  },
] as const;

const DIFICULTADES = [
  { id: "all", label: "Todas" },
  { id: "basico", label: "Básico" },
  { id: "intermedio", label: "Intermedio" },
  { id: "avanzado", label: "Avanzado" },
] as const;

const BLOQUES = [
  { id: "all", label: "Todos" },
  { id: "1", label: "1. Marco Legal" },
  { id: "2", label: "2. Definiciones" },
  { id: "3", label: "3. KYC" },
  { id: "4", label: "4. Reportes" },
  { id: "5", label: "5. UNE" },
  { id: "6", label: "6. Sanciones" },
  { id: "7", label: "7. Tipologías" },
  { id: "8", label: "8. GAFI" },
] as const;

export default function EstudioLandingPage() {
  const [dificultad, setDificultad] = React.useState<string>("all");
  const [bloque, setBloque] = React.useState<string>("all");

  const buildHref = (formatId: string) => {
    const qs = new URLSearchParams();
    if (bloque !== "all") qs.set("bloque", bloque);
    if (dificultad !== "all") qs.set("dificultad", dificultad);
    const q = qs.toString();
    return `/simulator/estudio/${formatId}${q ? `?${q}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Back */}
      <Link
        href="/simulator"
        className="mb-6 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Simulador
      </Link>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Modo Estudio
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Elige un formato para practicar con el banco de {" "}
          <span className="font-semibold text-slate-700">593+ reactivos</span>{" "}
          generados especialmente para el examen CENEVAL PLD/FT.
        </p>
      </header>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border-2 border-slate-100 bg-slate-50 p-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide w-full sm:w-auto">
            Bloque:
          </span>
          {BLOQUES.map((b) => (
            <button
              key={b.id}
              onClick={() => setBloque(b.id)}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-semibold transition-all border",
                bloque === b.id
                  ? "border-slate-700 bg-slate-700 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
              )}
            >
              {b.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide w-full sm:w-auto">
            Dificultad:
          </span>
          {DIFICULTADES.map((d) => (
            <button
              key={d.id}
              onClick={() => setDificultad(d.id)}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-semibold transition-all border",
                dificultad === d.id
                  ? "border-slate-700 bg-slate-700 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Format cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FORMATS.map((f) => (
          <Link
            key={f.id}
            href={buildHref(f.id)}
            className={cn(
              "group flex flex-col rounded-2xl border-2 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md",
              f.color
            )}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-2xl">{f.emoji}</span>
              <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold", f.badge)}>
                {f.count} reactivos
              </span>
            </div>
            <h2 className="text-base font-black text-slate-900">{f.label}</h2>
            <p className="mt-1 text-xs text-slate-500 flex-1">{f.description}</p>
            <div className="mt-4 flex items-center text-xs font-bold text-slate-700">
              Practicar ahora
              <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>

      {/* Tip */}
      <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-xs text-indigo-700">
        <span className="font-bold">💡 Tip:</span> Practica primero con{" "}
        <strong>Opción múltiple</strong> (formato principal del CENEVAL) y complementa con{" "}
        <strong>Flashcards</strong> para memorizar definiciones clave.
      </div>
    </div>
  );
}
