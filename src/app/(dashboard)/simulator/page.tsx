"use client";

import * as React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Zap,
  Clock,
  FileText,
  ArrowRight,
  BookOpen,
  FlipHorizontal,
  Pencil,
  ToggleLeft,
} from "lucide-react";
import { QuizSimulator } from "@/components/QuizSimulator";

type Mode = "selector" | "practica";

export default function SimulatorPage() {
  const [mode, setMode] = React.useState<Mode>("selector");

  if (mode === "practica") {
    return (
      <div className="flex-1 px-4">
        <button
          onClick={() => setMode("selector")}
          className="mb-4 text-sm text-neutral-500 hover:text-neutral-700"
        >
          ← Volver a opciones
        </button>
        <QuizSimulator />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Simulador
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Elige cómo quieres entrenar para tu certificación CNBV PLD/FT
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {/* ── Modo Estudio (full width, hero card) ── */}
        <Link
          href="/simulator/estudio"
          className="group flex flex-col rounded-2xl border-2 border-indigo-600 bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white shadow-sm transition-all duration-200 hover:shadow-lg"
        >
          <div className="flex items-start justify-between">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
              <BookOpen className="h-6 w-6" />
            </div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
              ✨ 593+ reactivos
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight">Modo Estudio</h2>
          <p className="mt-1 text-sm text-white/80">
            Practica con todos los formatos: flashcards, opción múltiple, V/F,
            casos prácticos, completar texto, crucigramas y sopa de letras.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {[
              { icon: <FlipHorizontal className="h-3 w-3" />, label: "Flashcards" },
              { icon: <FileText className="h-3 w-3" />, label: "Opción múltiple" },
              { icon: <ToggleLeft className="h-3 w-3" />, label: "V / F" },
              { icon: <Pencil className="h-3 w-3" />, label: "Completar" },
            ].map((t) => (
              <span
                key={t.label}
                className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1"
              >
                {t.icon} {t.label}
              </span>
            ))}
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1">
              + más formatos
            </span>
          </div>
          <div className="mt-5 flex items-center text-sm font-bold">
            Ir al Modo Estudio
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* ── Bottom row: CENEVAL + Práctica rápida ── */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* ── Simulacro CENEVAL Oficial ── */}
          <Link
            href="/simulator/cenval"
            className="group flex flex-col rounded-2xl border-2 border-neutral-900 bg-neutral-900 p-6 text-white shadow-sm transition-all duration-200 hover:shadow-lg"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">
              Simulacro CENEVAL Oficial
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Examen completo de 118 reactivos en condiciones reales.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
                <FileText className="h-3 w-3" /> 118 preguntas
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
                <Clock className="h-3 w-3" /> 4 horas
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
                Nivel avanzado
              </span>
            </div>
            <div className="mt-auto pt-6 flex items-center text-sm font-semibold">
              Iniciar simulacro
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* ── Práctica rápida ── */}
          <button
            onClick={() => setMode("practica")}
            className="group flex flex-col rounded-2xl border-2 border-neutral-200 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:border-brand-300 hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
              <Zap className="h-6 w-6 text-brand-600" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-900">
              Práctica rápida
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              5 preguntas sobre un tema y dificultad específicos. Ideal para
              calentar.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-700">
                5 preguntas
              </span>
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-700">
                Sin tiempo límite
              </span>
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-700">
                Tema configurable
              </span>
            </div>
            <div className="mt-auto pt-6 flex items-center text-sm font-semibold text-brand-700">
              Comenzar práctica
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
