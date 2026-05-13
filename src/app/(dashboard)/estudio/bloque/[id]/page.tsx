"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  ArrowLeft, BookOpen, Scale, Map, Brain, Lightbulb, Gamepad2,
  GraduationCap, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Clock, Trophy, Zap, RotateCcw, ArrowRight, Target, FileText, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CNBV_SYLLABUS } from "@/lib/constants";
import { buildAuthHeaders } from "@/lib/auth-client";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ContentItem {
  id: number;
  bloque: number;
  tema: string;
  subtema: string;
  tipo: string;
  contenido: Record<string, unknown>;
  fuente_detallada: string;
  orden: number;
}

interface Ejercicio {
  id: number;
  bloque: number;
  tema: string;
  tipo: string;
  titulo: string;
  instrucciones: string;
  contenido: Record<string, unknown>;
  solucion: Record<string, unknown>;
  dificultad: string;
  tiempo_estimado: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const BLOQUE_TEMA_MAP: Record<string, string> = {
  "1": "tipologias",
  "2": "gafi",
  "3": "sanciones",
  "4": "kyc_cdd",
  "5": "reportes_cnbv",
  "6": "marco_legal",
  "7": "une",
};

const TIPO_META: Record<string, { label: string; badgeClass: string; Icon: React.ComponentType<{ className?: string }> }> = {
  explicacion:      { label: "Explicación",      badgeClass: "bg-blue-100 text-blue-800 border-blue-200",   Icon: BookOpen },
  fundamento_legal: { label: "Fundamento Legal", badgeClass: "bg-purple-100 text-purple-800 border-purple-200", Icon: Scale },
  mapa_conceptual:  { label: "Mapa Conceptual",  badgeClass: "bg-teal-100 text-teal-800 border-teal-200",   Icon: Map },
  diagrama:         { label: "Diagrama",          badgeClass: "bg-orange-100 text-orange-800 border-orange-200", Icon: Brain },
  resumen:          { label: "Resumen",           badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200", Icon: Lightbulb },
};

const DIFICULTAD_CLASS: Record<string, string> = {
  basico:   "bg-emerald-100 text-emerald-700 border-emerald-200",
  medio:    "bg-yellow-100 text-yellow-700 border-yellow-200",
  avanzado: "bg-red-100 text-red-700 border-red-200",
};

// ── Theory rendering ─────────────────────────────────────────────────────────

// Exhaustive field-name lists so SmartItem recognises virtually every data shape
const SMART_TITLE_KEYS = [
  "nombre","instrumento","termino","titulo","evento","concepto","recomendacion",
  "tipo_riesgo","modelo","paso","categoria","pilar","articulo","modalidad",
  "campo","entidad","organo","accion","aspecto","componente","elemento",
  "actividad","documento","principio","obligacion","tipologia","dimension",
  "herramienta","sector","fraccion","naturaleza","organismo","funcion_principal",
  "norma","criterio","indicador","medida","area","rol","fase","nivel",
];
const SMART_DESC_KEYS = [
  "descripcion","definicion","texto","detalle","explicacion","pena",
  "valor","funcion","resultado","efecto","importancia","relevancia",
  "razon","nota","aplicacion_mexico","texto_oficial_parafraseado",
  "fundamento_mexico","contenido","observacion","implicacion","resumen",
];
const SMART_TAG_KEYS = [
  "fecha","fuente","riesgo","fundamento","importancia_examen","numero",
  "año","regulador","marco_legal","autoridad","plazo","umbral_aviso",
  "tipo","clasificacion","nivel_riesgo","grado",
];

/** Renders a single item from a list — handles strings, objects, and anything else generically */
function SmartItem({ item }: { item: unknown }) {
  if (typeof item === "string") {
    return (
      <li className="flex items-start gap-2 text-sm text-slate-700">
        <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
        {item}
      </li>
    );
  }
  if (typeof item === "object" && item !== null) {
    const obj = item as Record<string, unknown>;
    const mainKey = SMART_TITLE_KEYS.find((k) => typeof obj[k] === "string");
    const descKey = SMART_DESC_KEYS.find((k) => typeof obj[k] === "string" && k !== mainKey);
    const tagKey  = SMART_TAG_KEYS.find((k) => obj[k] !== undefined && k !== mainKey && k !== descKey);

    // If we found at least one meaningful key, render structured card
    if (mainKey || descKey) {
      return (
        <li className="rounded-lg border border-slate-200 bg-white p-3">
          {!!tagKey && (
            <span className="inline-block mb-1 text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded uppercase tracking-wider">
              {String(obj[tagKey])}
            </span>
          )}
          {!!mainKey && <p className="font-bold text-sm text-slate-900">{String(obj[mainKey])}</p>}
          {!!descKey  && <p className="text-sm text-slate-600 mt-1 leading-relaxed">{String(obj[descKey])}</p>}
          {/* Secondary fields */}
          {Object.entries(obj)
            .filter(([k, v]) =>
              k !== mainKey && k !== descKey && k !== tagKey &&
              k !== "tipo" && k !== "color" &&
              (typeof v === "string" || typeof v === "number") && String(v).length < 200
            )
            .slice(0, 3)
            .map(([k, v]) => (
              <p key={k} className="text-xs text-slate-500 mt-0.5">
                <span className="font-semibold capitalize">{k.replace(/_/g, " ")}:</span> {String(v)}
              </p>
            ))
          }
        </li>
      );
    }

    // Fully generic fallback — render all string/number key-value pairs
    const entries = Object.entries(obj).filter(
      ([k, v]) => k !== "tipo" && k !== "color" && (typeof v === "string" || typeof v === "number")
    );
    if (entries.length > 0) {
      return (
        <li className="rounded-lg border border-slate-200 bg-white p-3 space-y-1">
          {entries.map(([k, v]) => (
            <div key={k} className="flex gap-2 text-sm">
              <span className="font-bold text-slate-700 shrink-0 capitalize min-w-[80px]">
                {k.replace(/_/g, " ")}:
              </span>
              <span className="text-slate-600">{String(v)}</span>
            </div>
          ))}
        </li>
      );
    }
  }
  return null;
}

// Helper: render a columnas/filas table
function ColFila({ columnas, filas, titulo }: {
  columnas: string[];
  filas: unknown[][];
  titulo?: string;
}) {
  return (
    <div>
      {titulo && <p className="text-sm font-bold text-slate-800 mb-2">{titulo}</p>}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-800 text-white">
              {columnas.map((col, i) => <th key={i} className="px-3 py-2 text-left font-black">{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                {(Array.isArray(fila) ? fila : [fila]).map((cell, j) => (
                  <td key={j} className="px-3 py-2 border-b border-slate-100 text-slate-700">{String(cell ?? "")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// All known array field names that contain list-renderable items
const LIST_FIELDS = [
  // original
  "elementos","items","principios","pasos","hitos","modelos","categorias",
  "condiciones","caracteristicas","obligaciones","riesgos","lecciones",
  "contribuciones","documentos","fuentes",
  // added from analysis
  "elementos_clave","organismos","resoluciones","datos","listas","bloques",
  "dimensiones","componentes","usos","tipologias_frecuentes","componentes_metodologia",
  "diferencias","modalidades","datos_generales","funciones","funciones_pld",
  "rol_pld","integrantes_principales","tipologias","amenazas_principales",
  "sectores_mas_vulnerables","brechas","elementos_minimos","niveles",
  "documentos_requeridos","grados","reportes","infracciones","objetivos",
  "modalidades_alcance","criterios_mayor_supervision","tipos","secciones",
  "lineamientos","tipos_muestreo","actividades","umbrales_restriccion","flujo",
  "tratados","descripciones","dnfbps","funciones_uif","modelos_uif","recomendaciones",
  "cuatro_elementos_cdd","momentos_aplicacion","dos_elementos","pasos_proceso",
  "aspectos","actores","criterios","indicadores","medidas","mecanismos",
  "instrumentos","normas","pilares","señales","señales_alerta","alertas",
  "obligaciones_principales","restricciones","tipos_operacion","formas",
];

/** Renders a single block from contenido.cuerpo[] — handles 100+ block types */
function CuerpoBlock({ block }: { block: Record<string, unknown> }) {
  const tipo   = block.tipo as string;
  const titulo = typeof block.titulo === "string" ? block.titulo : undefined;
  const texto  = typeof block.texto  === "string" ? block.texto  : undefined;

  // ── Dato clave ──
  if (tipo === "dato_clave" && texto) {
    return (
      <div className="rounded-lg bg-amber-50 border-l-4 border-amber-400 p-3">
        <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider mb-1">📌 Dato Clave</p>
        <p className="text-sm text-slate-800 leading-relaxed">{texto}</p>
      </div>
    );
  }

  // ── Penas / sanciones ──
  if (tipo === "penas" || tipo === "penas_ft") {
    const sanciones = (block.sanciones as Record<string, unknown>[]) ?? [];
    return (
      <div>
        {titulo && <p className="text-sm font-bold text-slate-800 mb-2">{titulo}</p>}
        <div className="space-y-2">
          {sanciones.map((s, i) => (
            <div key={i} className="rounded-lg border border-red-200 bg-red-50 p-3">
              {!!s.modalidad   && <p className="text-[10px] font-black text-red-700 uppercase tracking-wider">{String(s.modalidad)}</p>}
              {!!s.pena        && <p className="text-sm font-bold text-red-900">{String(s.pena)}</p>}
              {!!s.fundamento  && <p className="text-xs text-red-600 mt-0.5">{String(s.fundamento)}</p>}
              {!!s.descripcion && <p className="text-xs text-slate-600 mt-1">{String(s.descripcion)}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Hito / Evolución histórica (timeline) — hito type OR evolucion_historica ──
  const timelineItems = (
    tipo === "hito" ? (block.items as Record<string, unknown>[]) :
    tipo === "evolucion_historica" ? (block.hitos as Record<string, unknown>[]) :
    null
  );
  if (timelineItems) {
    return (
      <div>
        {titulo && <p className="text-sm font-bold text-slate-800 mb-3">{titulo}</p>}
        <div className="relative pl-5 border-l-2 border-blue-300 space-y-4 mt-1">
          {timelineItems.map((item, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[21px] top-1 h-4 w-4 rounded-full bg-blue-500 border-2 border-white" />
              {!!(item.año ?? item.fecha) && (
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider">
                  {String(item.año ?? item.fecha)}
                </p>
              )}
              {!!(item.evento ?? item.nombre) && (
                <p className="text-sm font-bold text-slate-800">{String(item.evento ?? item.nombre)}</p>
              )}
              {!!item.descripcion && (
                <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{String(item.descripcion)}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Glosario ──
  if (tipo === "glosario" || Array.isArray(block.terminos)) {
    const terminos = (block.terminos as Record<string, unknown>[]) ?? [];
    return (
      <div className="space-y-2">
        {titulo && <p className="text-sm font-bold text-slate-800 mb-1">{titulo}</p>}
        {terminos.map((t, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-start gap-2 flex-wrap mb-1.5">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-black rounded">{String(t.termino ?? "")}</span>
              {!!t.fuente && <span className="text-xs text-slate-400 italic">{String(t.fuente)}</span>}
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{String(t.definicion ?? t.descripcion ?? "")}</p>
          </div>
        ))}
      </div>
    );
  }

  // ── Etapas ──
  if (tipo === "etapas" || Array.isArray(block.etapas)) {
    const etapas = (block.etapas as Record<string, unknown>[]) ?? [];
    const CMAP: Record<string, string> = {
      rojo:    "border-red-400 bg-red-50",
      naranja: "border-orange-400 bg-orange-50",
      verde:   "border-emerald-400 bg-emerald-50",
      azul:    "border-blue-400 bg-blue-50",
      amarillo:"border-yellow-400 bg-yellow-50",
    };
    return (
      <div className="space-y-3">
        {titulo && <p className="text-sm font-bold text-slate-800">{titulo}</p>}
        {etapas.map((etapa, i) => (
          <div key={i} className={cn("rounded-xl border-2 p-4", CMAP[etapa.color as string] ?? "border-slate-300 bg-slate-50")}>
            <div className="flex items-center gap-2 mb-2">
              {etapa.numero !== undefined && (
                <span className="h-6 w-6 rounded-full bg-slate-800 text-white text-xs font-black flex items-center justify-center shrink-0">
                  {String(etapa.numero)}
                </span>
              )}
              <p className="font-black text-sm text-slate-900">{String(etapa.nombre ?? etapa.etapa ?? "")}</p>
            </div>
            {!!etapa.descripcion && <p className="text-sm text-slate-700 mb-2">{String(etapa.descripcion)}</p>}
            {Array.isArray(etapa.mecanismos_comunes) && (etapa.mecanismos_comunes as string[]).length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-black text-slate-600 uppercase tracking-wider mb-1">Mecanismos comunes:</p>
                <ul className="space-y-0.5">
                  {(etapa.mecanismos_comunes as string[]).map((m, j) => (
                    <li key={j} className="text-xs text-slate-600 flex gap-1"><span>•</span>{m}</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(etapa.senales_alerta) && (etapa.senales_alerta as string[]).length > 0 && (
              <div className="rounded-lg bg-white/70 border border-orange-200 p-2">
                <p className="text-xs font-black text-orange-700 uppercase tracking-wider mb-1">⚠ Señales de Alerta:</p>
                <ul className="space-y-0.5">
                  {(etapa.senales_alerta as string[]).map((s, j) => (
                    <li key={j} className="text-xs text-orange-700 flex gap-1"><span>•</span>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // ── Tables (cuadro_comparativo, tabla, tabla_tipos_visita, diferencia_clave, etc.) ──
  if (
    tipo === "cuadro_comparativo" || tipo === "tabla" || tipo === "tabla_tipos_visita" ||
    tipo === "diferencia_clave" || tipo === "tres_lineas_comparativo" ||
    (Array.isArray(block.columnas) && Array.isArray(block.filas))
  ) {
    const columnas = (block.columnas as string[]) ?? [];
    const filas    = (block.filas as unknown[][]) ?? [];
    // Handle nested cuadro_comparativo inside diferencia_sistemas etc.
    const nested = block.cuadro_comparativo as { columnas: string[]; filas: unknown[][] } | undefined;
    if (nested?.columnas && nested?.filas) {
      return (
        <div className="space-y-3">
          {titulo && <p className="text-sm font-bold text-slate-800 mb-2">{titulo}</p>}
          {texto && <p className="text-sm text-slate-700 mb-2">{texto}</p>}
          <ColFila columnas={nested.columnas} filas={nested.filas as unknown[][]} />
        </div>
      );
    }
    return <ColFila columnas={columnas} filas={filas} titulo={titulo} />;
  }

  // ── datos_generales — campo/valor key:value pairs (high-fidelity table) ──
  if (tipo === "datos_generales" && Array.isArray(block.items)) {
    const rows = block.items as Record<string, unknown>[];
    return (
      <div>
        {titulo && <p className="text-sm font-bold text-slate-800 mb-2">{titulo}</p>}
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          {rows.map((row, i) => (
            <div key={i} className={cn("flex gap-0 text-sm", i % 2 === 0 ? "bg-white" : "bg-slate-50")}>
              <div className="min-w-[40%] max-w-[50%] px-3 py-2 font-bold text-slate-700 border-r border-slate-200">
                {String(row.campo ?? row.nombre ?? row.concepto ?? "")}
              </div>
              <div className="flex-1 px-3 py-2 text-slate-600">
                {String(row.valor ?? row.descripcion ?? row.texto ?? "")}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── seccion — container with nested sub-blocks ──
  if (tipo === "seccion" && Array.isArray(block.contenido)) {
    const subBlocks = block.contenido as Record<string, unknown>[];
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
        {titulo && (
          <div className="bg-slate-700 text-white px-4 py-2">
            <p className="text-sm font-black">{titulo}</p>
          </div>
        )}
        <div className="p-4 space-y-4">
          {subBlocks.map((sub, i) => (
            <CuerpoBlock key={i} block={sub} />
          ))}
        </div>
      </div>
    );
  }

  // ── Generic list: iterate all known array field names ──
  for (const field of LIST_FIELDS) {
    const arr = block[field];
    if (Array.isArray(arr) && arr.length > 0) {
      return (
        <div>
          {titulo && <p className="text-sm font-bold text-slate-800 mb-2">{titulo}</p>}
          {texto   && <p className="text-sm text-slate-600 mb-2">{texto}</p>}
          <ul className="space-y-2">
            {(arr as unknown[]).map((item, i) => <SmartItem key={i} item={item} />)}
          </ul>
        </div>
      );
    }
  }

  // ── Generic text fallback (parrafo, introduccion, analogia, definicion_legal, etc.) ──
  const ejm      = typeof block.ejemplo   === "string" ? block.ejemplo   : undefined;
  const formula  = typeof block.formula   === "string" ? block.formula   : undefined;
  const antecede = typeof block.antecedente === "string" ? block.antecedente : undefined;
  const fundamento = typeof block.fundamento === "string" ? block.fundamento : undefined;
  const advertencia = typeof block.advertencia === "string" ? block.advertencia : undefined;
  return (
    <div className="space-y-2">
      {titulo && (
        <p className={cn(
          "font-bold text-sm",
          tipo === "definicion_legal" || tipo === "definicion" ? "text-purple-800" : "text-slate-800"
        )}>
          {titulo}
        </p>
      )}
      {texto     && <p className="text-sm text-slate-700 leading-relaxed">{texto}</p>}
      {antecede  && <p className="text-sm text-slate-600 italic leading-relaxed">{antecede}</p>}
      {fundamento && (
        <p className="text-xs text-purple-700 font-semibold">
          Fundamento: {fundamento}
        </p>
      )}
      {formula && (
        <div className="rounded bg-blue-50 border border-blue-200 px-3 py-2 font-mono text-sm text-blue-800">
          {formula}
        </div>
      )}
      {ejm && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
          <p className="text-[10px] font-black text-amber-700 uppercase mb-0.5">Ejemplo</p>
          <p className="text-xs text-slate-700">{ejm}</p>
        </div>
      )}
      {advertencia && (
        <div className="rounded-lg bg-orange-50 border border-orange-200 px-3 py-2">
          <p className="text-[10px] font-black text-orange-700 uppercase mb-0.5">⚠ Advertencia</p>
          <p className="text-xs text-slate-700">{advertencia}</p>
        </div>
      )}
    </div>
  );
}

// ── Top-level tipo renderers ───────────────────────────────────────────────────

function MapaConceptualRenderer({ c }: { c: Record<string, unknown> }) {
  const nodoCentral = String(c.nodo_central ?? "");
  const ramas = (c.ramas as Record<string, unknown>[]) ?? [];
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-black text-sm shadow-md">{nodoCentral}</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ramas.map((rama, i) => (
          <div key={i} className="rounded-xl border-2 border-teal-200 bg-teal-50 p-3">
            <p className="text-sm font-black text-teal-800 mb-2">{String(rama.concepto ?? "")}</p>
            <ul className="space-y-1">
              {((rama.subnodos as string[]) ?? []).map((sub, j) => (
                <li key={j} className="text-xs text-slate-700 flex items-start gap-1.5">
                  <span className="text-teal-500 font-black shrink-0">→</span>{sub}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiagramaRenderer({ c }: { c: Record<string, unknown> }) {
  const desc   = typeof c.descripcion === "string" ? c.descripcion : undefined;
  const nodos  = (c.nodos  as Record<string, unknown>[]) ?? [];
  const flechas = (c.flechas as Record<string, unknown>[]) ?? [];
  const CMAP: Record<string, string> = {
    rojo:    "bg-red-100 border-red-400 text-red-900",
    naranja: "bg-orange-100 border-orange-400 text-orange-900",
    verde:   "bg-emerald-100 border-emerald-400 text-emerald-900",
    azul:    "bg-blue-100 border-blue-400 text-blue-900",
    gris:    "bg-slate-100 border-slate-400 text-slate-900",
    amarillo:"bg-yellow-100 border-yellow-400 text-yellow-900",
  };
  return (
    <div className="space-y-3">
      {desc && <p className="text-xs text-slate-500 italic">{desc}</p>}
      <div className="flex flex-wrap items-start gap-2">
        {nodos.map((nodo, i) => {
          const cc = CMAP[nodo.color as string] ?? "bg-slate-100 border-slate-400 text-slate-900";
          const flecha = flechas.find((f) => f.de === nodo.id);
          const hasNext = i < nodos.length - 1;
          return (
            <div key={i} className="flex items-center gap-1">
              <div className={cn("rounded-xl border-2 p-3 min-w-[90px] max-w-[160px]", cc)}>
                <p className="text-xs font-black leading-tight">{String(nodo.etiqueta ?? "")}</p>
                {!!nodo.descripcion && <p className="text-[10px] mt-1 opacity-75 leading-snug">{String(nodo.descripcion)}</p>}
                {Array.isArray(nodo.ejemplos) && (nodo.ejemplos as string[]).slice(0, 2).map((e, j) => (
                  <p key={j} className="text-[9px] opacity-60 mt-0.5">• {e}</p>
                ))}
              </div>
              {hasNext && (
                <div className="flex flex-col items-center min-w-[28px]">
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                  {!!flecha?.etiqueta && (
                    <p className="text-[9px] text-slate-400 text-center max-w-[40px] leading-tight">{String(flecha.etiqueta)}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FundamentoLegalRenderer({ c }: { c: Record<string, unknown> }) {
  const instrumentos = (c.instrumentos as Record<string, unknown>[]) ?? [];
  return (
    <div className="space-y-4">
      {instrumentos.map((inst, i) => (
        <div key={i} className="rounded-xl border-2 border-purple-200 overflow-hidden">
          <div className="bg-purple-800 text-white px-4 py-2">
            <p className="text-sm font-black">{String(inst.nombre ?? "")}</p>
          </div>
          <div className="p-3 space-y-2">
            {((inst.articulos as Record<string, unknown>[]) ?? []).map((art, j) => (
              <div key={j} className="rounded-lg bg-purple-50 border border-purple-100 p-3">
                <p className="text-xs font-black text-purple-700 mb-1">{String(art.articulo ?? "")}</p>
                <p className="text-sm text-slate-700 leading-relaxed">{String(art.contenido ?? art.texto ?? "")}</p>
                {!!art.importancia_examen && (
                  <p className="text-[10px] mt-1 text-purple-600 font-semibold">
                    Importancia examen: {String(art.importancia_examen)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ResumenRenderer({ c }: { c: Record<string, unknown> }) {
  const puntos = (c.puntos_clave as string[]) ?? [];
  const preguntas = (c.preguntas_tipicas_examen as string[]) ?? [];
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {puntos.map((punto, i) => (
          <div key={i} className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 flex gap-3">
            <div className="shrink-0 h-6 w-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center mt-0.5">
              {i + 1}
            </div>
            <p className="text-sm text-slate-800 leading-relaxed">{punto}</p>
          </div>
        ))}
      </div>
      {preguntas.length > 0 && (
        <div>
          <p className="text-xs font-black text-blue-700 uppercase tracking-wider mb-2">
            🎯 Preguntas típicas del examen CENEVAL
          </p>
          <div className="space-y-2">
            {preguntas.map((q, i) => (
              <div key={i} className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 flex gap-2">
                <span className="text-blue-600 font-black text-sm shrink-0">Q{i + 1}.</span>
                <p className="text-sm text-slate-800">{q}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TheoryCard({ item }: { item: ContentItem }) {
  const [open, setOpen] = useState(true);
  const meta = TIPO_META[item.tipo] ?? { label: item.tipo, badgeClass: "bg-slate-100 text-slate-700 border-slate-200", Icon: FileText };
  const { Icon } = meta;
  const c = item.contenido;

  const renderContent = () => {
    switch (item.tipo) {
      case "mapa_conceptual":  return <MapaConceptualRenderer c={c} />;
      case "diagrama":         return <DiagramaRenderer c={c} />;
      case "fundamento_legal": return <FundamentoLegalRenderer c={c} />;
      case "resumen":          return <ResumenRenderer c={c} />;
      default: {
        // explicacion and any other type: iterate cuerpo[]
        const cuerpo = (c.cuerpo as Record<string, unknown>[]) ?? [];
        if (cuerpo.length > 0) {
          return (
            <div className="space-y-4">
              {cuerpo.map((block, i) => <CuerpoBlock key={i} block={block} />)}
            </div>
          );
        }
        // Fallback for unexpected structure
        const fallbackText = typeof c.descripcion === "string" ? c.descripcion : typeof c.texto === "string" ? c.texto : null;
        return fallbackText
          ? <p className="text-sm text-slate-700 leading-relaxed">{fallbackText}</p>
          : <p className="text-xs text-slate-400 italic">Sin contenido disponible</p>;
      }
    }
  };

  return (
    <Card className="border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <Icon className="h-4 w-4 text-slate-600" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-sm leading-tight truncate">
              {(c.titulo as string) || item.subtema}
            </p>
            <span className={cn("text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border", meta.badgeClass)}>
              {meta.label}
            </span>
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-slate-100 pt-3">
              {renderContent()}
              {item.fuente_detallada && (
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                  <Scale className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <p className="text-xs text-slate-500">{item.fuente_detallada}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ── Exercise sub-components ───────────────────────────────────────────────────

interface ExerciseWrapperProps {
  ejercicio: Ejercicio;
  onScore: (score: number) => void;
}

// — Verdadero o Falso —
function VerdaderoFalsoExercise({ ejercicio, onScore }: ExerciseWrapperProps) {
  const afirmaciones = (ejercicio.contenido.afirmaciones ?? []) as {
    numero: number;
    texto: string;
    respuesta_correcta: boolean;
  }[];

  const [answers, setAnswers] = useState<Record<number, boolean | null>>(
    Object.fromEntries(afirmaciones.map((a) => [a.numero, null]))
  );
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = Object.values(answers).every((v) => v !== null);

  const handleSubmit = () => {
    if (!allAnswered) return;
    setSubmitted(true);
    const correct = afirmaciones.filter((a) => answers[a.numero] === a.respuesta_correcta).length;
    onScore(Math.round((correct / afirmaciones.length) * 100));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600 italic">{ejercicio.instrucciones}</p>
      {afirmaciones.map((aff) => {
        const chosen = answers[aff.numero];
        const isCorrect = submitted && chosen === aff.respuesta_correcta;
        const isWrong = submitted && chosen !== null && chosen !== aff.respuesta_correcta;

        return (
          <div
            key={aff.numero}
            className={cn(
              "flex items-start gap-3 p-3 rounded-xl border-2 transition-colors",
              submitted
                ? isCorrect ? "border-emerald-300 bg-emerald-50" : isWrong ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"
                : "border-slate-200 bg-white"
            )}
          >
            <span className="shrink-0 w-5 h-5 rounded-full bg-slate-700 text-white text-xs font-black flex items-center justify-center mt-0.5">
              {aff.numero}
            </span>
            <p className="flex-1 text-sm text-slate-800 leading-relaxed">{aff.texto}</p>
            <div className="flex gap-2 shrink-0">
              {[true, false].map((val) => {
                const label = val ? "V" : "F";
                const isSelected = chosen === val;
                const showGreen = submitted && val === aff.respuesta_correcta;
                const showRed = submitted && isSelected && val !== aff.respuesta_correcta;
                return (
                  <button
                    key={label}
                    disabled={submitted}
                    onClick={() => setAnswers((prev) => ({ ...prev, [aff.numero]: val }))}
                    className={cn(
                      "w-8 h-8 rounded-lg text-sm font-black transition-all border-2",
                      showGreen ? "bg-emerald-500 text-white border-emerald-600" :
                      showRed   ? "bg-red-500 text-white border-red-600" :
                      isSelected ? "bg-blue-600 text-white border-blue-700" :
                      "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:border-slate-300"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {!submitted && (
        <Button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
        >
          Verificar Respuestas
        </Button>
      )}
      {submitted && (
        <SolucionPanel solucion={ejercicio.solucion} />
      )}
    </div>
  );
}

// — Completar —
function CompletarExercise({ ejercicio, onScore }: ExerciseWrapperProps) {
  const frases = (ejercicio.contenido.frases ?? []) as {
    numero: number;
    texto: string;
    opciones: string[];
    respuesta_correcta: number;
  }[];

  const [answers, setAnswers] = useState<Record<number, number | null>>(
    Object.fromEntries(frases.map((f) => [f.numero, null]))
  );
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = Object.values(answers).every((v) => v !== null);

  const handleSubmit = () => {
    if (!allAnswered) return;
    setSubmitted(true);
    const correct = frases.filter((f) => answers[f.numero] === f.respuesta_correcta).length;
    onScore(Math.round((correct / frases.length) * 100));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 italic">{ejercicio.instrucciones}</p>
      {frases.map((frase) => {
        const chosen = answers[frase.numero];
        const isCorrect = submitted && chosen === frase.respuesta_correcta;
        const isWrong = submitted && chosen !== null && chosen !== frase.respuesta_correcta;

        const blank = "_______";
        const parts = frase.texto.split(blank);

        return (
          <div
            key={frase.numero}
            className={cn(
              "p-4 rounded-xl border-2 transition-colors",
              submitted
                ? isCorrect ? "border-emerald-300 bg-emerald-50" : isWrong ? "border-red-300 bg-red-50" : "border-slate-200"
                : "border-slate-200 bg-white"
            )}
          >
            <p className="text-sm text-slate-800 mb-3 leading-relaxed font-medium">
              {parts[0]}
              <span className={cn(
                "inline-block px-2 py-0.5 mx-1 rounded border font-bold min-w-[80px] text-center",
                submitted && isCorrect ? "bg-emerald-200 border-emerald-400 text-emerald-800" :
                submitted && isWrong   ? "bg-red-200 border-red-400 text-red-800" :
                chosen !== null ? "bg-blue-100 border-blue-300 text-blue-800" :
                "bg-slate-100 border-dashed border-slate-400 text-slate-400"
              )}>
                {chosen !== null ? frase.opciones[chosen] : blank}
              </span>
              {parts[1]}
            </p>
            <div className="flex flex-wrap gap-2">
              {frase.opciones.map((opcion, idx) => {
                const isChosen = chosen === idx;
                const showGreen = submitted && idx === frase.respuesta_correcta;
                const showRed   = submitted && isChosen && idx !== frase.respuesta_correcta;
                return (
                  <button
                    key={idx}
                    disabled={submitted}
                    onClick={() => setAnswers((prev) => ({ ...prev, [frase.numero]: idx }))}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all",
                      showGreen ? "bg-emerald-500 text-white border-emerald-600" :
                      showRed   ? "bg-red-500 text-white border-red-600" :
                      isChosen  ? "bg-blue-600 text-white border-blue-700" :
                      "bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                    )}
                  >
                    {opcion}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {!submitted && (
        <Button onClick={handleSubmit} disabled={!allAnswered} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
          Verificar Respuestas
        </Button>
      )}
      {submitted && <SolucionPanel solucion={ejercicio.solucion} />}
    </div>
  );
}

// — Relacionar —
function RelacionarExercise({ ejercicio, onScore }: ExerciseWrapperProps) {
  const columnaA = (ejercicio.contenido.columna_a ?? []) as { id: number; concepto: string }[];
  const columnaB = (ejercicio.contenido.columna_b ?? []) as { id: string; definicion: string }[];
  const relaciones = (ejercicio.solucion.relaciones ?? []) as { concepto_id: number; definicion_id: string }[];

  const [selectedA, setSelectedA] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelectA = (id: number) => {
    if (submitted) return;
    setSelectedA((prev) => (prev === id ? null : id));
  };

  const handleSelectB = (id: string) => {
    if (submitted || selectedA === null) return;
    setMatches((prev) => ({ ...prev, [selectedA]: id }));
    setSelectedA(null);
  };

  const handleSubmit = () => {
    if (Object.keys(matches).length < columnaA.length) return;
    setSubmitted(true);
    const correct = relaciones.filter((r) => matches[r.concepto_id] === r.definicion_id).length;
    onScore(Math.round((correct / relaciones.length) * 100));
  };

  const correctMap = Object.fromEntries(relaciones.map((r) => [r.concepto_id, r.definicion_id]));

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 italic">{ejercicio.instrucciones}</p>
      {selectedA !== null && (
        <div className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
          ✦ Seleccionaste: <span className="text-blue-800">{columnaA.find((a) => a.id === selectedA)?.concepto}</span> — ahora haz clic en la definición correcta
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Column A */}
        <div className="space-y-2">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Conceptos</p>
          {columnaA.map((item) => {
            const matchedB = matches[item.id];
            const isSelected = selectedA === item.id;
            const isCorrect = submitted && correctMap[item.id] === matchedB;
            const isWrong   = submitted && matchedB && correctMap[item.id] !== matchedB;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectA(item.id)}
                disabled={submitted}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all",
                  isCorrect ? "border-emerald-400 bg-emerald-50 text-emerald-800" :
                  isWrong   ? "border-red-400 bg-red-50 text-red-800" :
                  isSelected ? "border-blue-500 bg-blue-50 text-blue-800 shadow-md" :
                  matchedB  ? "border-slate-400 bg-slate-100 text-slate-700" :
                  "border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50"
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  {item.concepto}
                  {matchedB && !submitted && (
                    <span className="text-[10px] font-black text-slate-500 shrink-0">vinculado</span>
                  )}
                  {isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                  {isWrong   && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                </span>
              </button>
            );
          })}
        </div>

        {/* Column B */}
        <div className="space-y-2">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Definiciones</p>
          {columnaB.map((item) => {
            const isLinked = Object.values(matches).includes(item.id);
            const canClick = selectedA !== null && !submitted;
            const correctConceptId = relaciones.find((r) => r.definicion_id === item.id)?.concepto_id;
            const isMatchedCorrectly = submitted && correctConceptId !== undefined && matches[correctConceptId] === item.id;
            const isMatchedWrong     = submitted && isLinked && !isMatchedCorrectly;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectB(item.id)}
                disabled={!canClick}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-xl border-2 text-sm transition-all",
                  isMatchedCorrectly ? "border-emerald-400 bg-emerald-50 text-emerald-800" :
                  isMatchedWrong     ? "border-red-400 bg-red-50 text-red-800" :
                  isLinked           ? "border-slate-400 bg-slate-100 text-slate-700" :
                  canClick           ? "border-dashed border-blue-400 bg-blue-50 text-slate-800 hover:bg-blue-100 cursor-pointer" :
                  "border-slate-200 bg-slate-50 text-slate-600"
                )}
              >
                {item.definicion}
              </button>
            );
          })}
        </div>
      </div>

      {!submitted && (
        <Button
          onClick={handleSubmit}
          disabled={Object.keys(matches).length < columnaA.length}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
        >
          Verificar Relaciones
        </Button>
      )}
      {submitted && (
        <div className="space-y-2">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Relaciones correctas:</p>
          {relaciones.map((r) => {
            const concept = columnaA.find((a) => a.id === r.concepto_id);
            const def     = columnaB.find((b) => b.id === r.definicion_id);
            return (
              <div key={r.concepto_id} className="flex items-center gap-2 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-bold">{concept?.concepto}</span>
                <ArrowRight className="h-3 w-3 text-emerald-500 shrink-0" />
                <span>{def?.definicion}</span>
              </div>
            );
          })}
          <SolucionPanel solucion={ejercicio.solucion} />
        </div>
      )}
    </div>
  );
}

// — Caso Práctico —
function CasoPracticoExercise({ ejercicio, onScore }: ExerciseWrapperProps) {
  const caso    = (ejercicio.contenido.caso    as string) ?? "";
  const pregunta = (ejercicio.contenido.pregunta as string) ?? "";
  const opciones = (ejercicio.contenido.opciones ?? []) as {
    letra: string;
    texto: string;
    es_correcta?: boolean;
  }[];
  const respuestaCorrecta = (ejercicio.solucion.respuesta_correcta as string) ?? "";

  const [chosen, setChosen] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!chosen) return;
    setSubmitted(true);
    onScore(chosen === respuestaCorrecta ? 100 : 0);
  };

  return (
    <div className="space-y-4">
      {/* Case */}
      {caso && (
        <div className="rounded-xl border-l-4 border-blue-500 bg-blue-50 p-4">
          <p className="text-xs font-black text-blue-700 uppercase tracking-wider mb-1">Caso Práctico</p>
          <p className="text-sm text-slate-800 leading-relaxed">{caso}</p>
        </div>
      )}
      {/* Question */}
      <p className="text-sm font-bold text-slate-900">{pregunta}</p>
      {/* Options */}
      <div className="space-y-2">
        {opciones.map((op) => {
          const isChosen  = chosen === op.letra;
          const showGreen = submitted && op.letra === respuestaCorrecta;
          const showRed   = submitted && isChosen && op.letra !== respuestaCorrecta;

          return (
            <button
              key={op.letra}
              disabled={submitted}
              onClick={() => setChosen(op.letra)}
              className={cn(
                "w-full text-left flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all",
                showGreen ? "border-emerald-400 bg-emerald-50 text-emerald-800" :
                showRed   ? "border-red-400 bg-red-50 text-red-800" :
                isChosen  ? "border-blue-500 bg-blue-50 text-blue-800 shadow-sm" :
                "border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50"
              )}
            >
              <span className={cn(
                "shrink-0 font-black h-6 w-6 rounded-lg flex items-center justify-center text-xs",
                showGreen ? "bg-emerald-500 text-white" :
                showRed   ? "bg-red-500 text-white" :
                isChosen  ? "bg-blue-600 text-white" :
                "bg-slate-200 text-slate-700"
              )}>
                {op.letra}
              </span>
              {op.texto}
            </button>
          );
        })}
      </div>

      {!submitted && (
        <Button onClick={handleSubmit} disabled={!chosen} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
          Confirmar Respuesta
        </Button>
      )}
      {submitted && <SolucionPanel solucion={ejercicio.solucion} />}
    </div>
  );
}

// — Solucion panel (shared) —
function SolucionPanel({ solucion }: { solucion: Record<string, unknown> }) {
  const explicacion     = solucion.explicacion     as string | undefined;
  const normaAplicable  = solucion.norma_aplicable as string | undefined;

  if (!explicacion && !normaAplicable) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
      <p className="text-xs font-black text-amber-700 uppercase tracking-wider">Explicación</p>
      {explicacion && <p className="text-sm text-slate-800 leading-relaxed">{explicacion}</p>}
      {normaAplicable && (
        <div className="flex items-start gap-2 pt-1 border-t border-amber-200">
          <Scale className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 font-semibold">{normaAplicable}</p>
        </div>
      )}
    </div>
  );
}

// — Exercise card wrapper —
function EjercicioCard({
  ejercicio,
  index,
  onScore,
  score,
}: {
  ejercicio: Ejercicio;
  index: number;
  onScore: (idx: number, score: number) => void;
  score: number | null;
}) {
  const [open, setOpen] = useState(false);
  const difClass = DIFICULTAD_CLASS[ejercicio.dificultad] ?? "bg-slate-100 text-slate-600";

  const renderExercise = () => {
    const props: ExerciseWrapperProps = {
      ejercicio,
      onScore: (s) => onScore(index, s),
    };

    switch (ejercicio.tipo) {
      case "verdadero_falso": return <VerdaderoFalsoExercise {...props} />;
      case "completar":       return <CompletarExercise {...props} />;
      case "relacionar":      return <RelacionarExercise {...props} />;
      case "caso_practico":   return <CasoPracticoExercise {...props} />;
      default:
        return (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <Gamepad2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-500">Ejercicio interactivo próximamente</p>
            <p className="text-xs text-slate-400 mt-1">Tipo: {ejercicio.tipo}</p>
          </div>
        );
    }
  };

  return (
    <Card className={cn(
      "border-2 overflow-hidden transition-colors",
      score !== null ? score >= 70 ? "border-emerald-300" : "border-orange-300" : "border-slate-200"
    )}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-4 p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className={cn(
          "shrink-0 h-9 w-9 rounded-xl flex items-center justify-center font-black text-sm",
          score !== null ? score >= 70 ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
          : "bg-slate-100 text-slate-600"
        )}>
          {score !== null ? (
            score >= 70 ? <CheckCircle2 className="h-5 w-5" /> : <RotateCcw className="h-4 w-4" />
          ) : index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-sm leading-tight">{ejercicio.titulo}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className={cn("text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border", difClass)}>
              {ejercicio.dificultad}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
              <Clock className="h-3 w-3" /> {ejercicio.tiempo_estimado} min
            </span>
            {score !== null && (
              <span className={cn("text-[10px] font-black px-1.5 py-0.5 rounded", score >= 70 ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700")}>
                {score}%
              </span>
            )}
          </div>
        </div>

        {open ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0 mt-1" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 mt-1" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 p-4">
              {renderExercise()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BloquePage() {
  const params  = useParams();
  const router  = useRouter();
  const bloqueId = params.id as string;
  const bloqueNum = parseInt(bloqueId, 10);

  const syllabus = CNBV_SYLLABUS[bloqueNum - 1];
  const temaSlug = BLOQUE_TEMA_MAP[bloqueId];

  const [content, setContent]   = useState<ContentItem[]>([]);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"teoria" | "ejercicios" | "practicar">("teoria");

  // Exercise scoring
  const [scores, setScores] = useState<Record<number, number>>({});
  const [xpAwarded, setXpAwarded] = useState(false);

  // Derived
  const completedCount = Object.keys(scores).length;
  const allDone = ejercicios.length > 0 && completedCount >= ejercicios.length;
  const avgScore = completedCount > 0
    ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / completedCount)
    : null;

  // Group content by subtema
  const subtemas = Array.from(new Set(content.map((c) => c.subtema)));
  const contentBySubtema = subtemas.map((sub) => ({
    subtema: sub,
    items: content.filter((c) => c.subtema === sub),
  }));

  useEffect(() => {
    if (!bloqueId || isNaN(bloqueNum)) return;
    setLoading(true);
    fetch(`/api/educational-content?bloque=${bloqueNum}`)
      .then((r) => r.json())
      .then((data) => {
        setContent(data.content ?? []);
        setEjercicios(data.ejercicios ?? []);
        if (data.contentError) setError(data.contentError);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [bloqueId, bloqueNum]);

  // Award XP when all exercises done
  const awardXp = useCallback(async () => {
    if (xpAwarded) return;
    setXpAwarded(true);
    confetti({ particleCount: 180, spread: 80, origin: { y: 0.6 } });
    try {
      const headers = await buildAuthHeaders({ "Content-Type": "application/json" });
      await fetch("/api/update-xp", {
        method: "POST",
        headers,
        body: JSON.stringify({
          xpGained: 50,
          correct: true,
          topic: syllabus?.module ?? `Bloque ${bloqueNum}`,
          difficulty: "Básico",
        }),
      });
    } catch {
      // XP award failed silently — non-blocking
    }
  }, [xpAwarded, syllabus, bloqueNum]);

  useEffect(() => {
    if (allDone && !xpAwarded) awardXp();
  }, [allDone, xpAwarded, awardXp]);

  const handleScore = useCallback((idx: number, score: number) => {
    setScores((prev) => ({ ...prev, [idx]: score }));
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────

  if (!syllabus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-xl font-bold text-slate-700">Bloque no encontrado</p>
        <Button onClick={() => router.push("/estudio")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Modo Estudio
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button onClick={() => router.push("/estudio")} variant="ghost" size="sm" className="gap-2 text-slate-500">
          <ArrowLeft className="h-4 w-4" /> Modo Estudio
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-white font-black text-lg">{bloqueNum}</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">{syllabus.module}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{syllabus.topics.length} temas · {ejercicios.length} ejercicios disponibles</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-full border border-slate-200 bg-white p-1 shadow-sm mb-6 w-fit">
        {[
          { id: "teoria",     label: "Contenido Teórico", Icon: BookOpen },
          { id: "ejercicios", label: "Ejercicios",         Icon: Gamepad2 },
          { id: "practicar",  label: "Practicar Quiz",     Icon: GraduationCap },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-all",
              activeTab === id ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <Card className="border-amber-200 bg-amber-50 p-6 text-center">
          <p className="font-bold text-amber-800">No se pudo cargar el contenido</p>
          <p className="text-sm text-amber-600 mt-1">{error}</p>
          <Button className="mt-3" onClick={() => router.push("/estudio")} variant="outline">Volver</Button>
        </Card>
      )}

      {/* TEORÍA TAB */}
      {!loading && !error && activeTab === "teoria" && (
        <AnimatePresence mode="wait">
          <motion.div key="teoria" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Syllabus topics */}
            <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Temas de este bloque</p>
              <div className="space-y-1.5">
                {syllabus.topics.map((t) => (
                  <div key={t} className="flex items-start gap-2">
                    <Target className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700 font-medium">{t}</p>
                  </div>
                ))}
              </div>
            </div>

            {contentBySubtema.length === 0 && !loading ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-600">Contenido en preparación</p>
                <p className="text-sm text-slate-400 mt-1">El material teórico de este bloque estará disponible pronto.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contentBySubtema.map(({ subtema, items }) => (
                  <div key={subtema}>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 px-1">{subtema}</p>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <TheoryCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* EJERCICIOS TAB */}
      {!loading && !error && activeTab === "ejercicios" && (
        <AnimatePresence mode="wait">
          <motion.div key="ejercicios" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Progress bar */}
            {ejercicios.length > 0 && (
              <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-slate-700">
                    {completedCount}/{ejercicios.length} ejercicios completados
                  </p>
                  {avgScore !== null && (
                    <span className={cn(
                      "text-sm font-black px-2 py-0.5 rounded-lg",
                      avgScore >= 70 ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                    )}>
                      Promedio: {avgScore}%
                    </span>
                  )}
                </div>
                <Progress value={(completedCount / ejercicios.length) * 100} className="h-2" />
              </div>
            )}

            {/* All done banner */}
            {allDone && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-5 rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 flex items-center gap-4"
              >
                <Trophy className="h-10 w-10 text-amber-500 shrink-0" />
                <div className="flex-1">
                  <p className="font-black text-emerald-800 text-lg">¡Ejercicios completados!</p>
                  <p className="text-sm text-emerald-600">+50 XP acreditados · Promedio: {avgScore}%</p>
                </div>
                <Zap className="h-6 w-6 text-amber-400" />
              </motion.div>
            )}

            {ejercicios.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <Gamepad2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-600">Ejercicios en preparación</p>
                <p className="text-sm text-slate-400 mt-1">Los ejercicios interactivos de este bloque estarán disponibles pronto.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ejercicios.map((ej, idx) => (
                  <EjercicioCard
                    key={ej.id}
                    ejercicio={ej}
                    index={idx}
                    onScore={handleScore}
                    score={scores[idx] ?? null}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* PRACTICAR TAB */}
      {!loading && !error && activeTab === "practicar" && (
        <AnimatePresence mode="wait">
          <motion.div key="practicar" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <GraduationCap className="h-5 w-5" /> Práctica con Preguntas CENEVAL
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Practica con preguntas del banco oficial, sistema de repaso espaciado SM-2, y tracking de progreso.
                </p>
                {temaSlug ? (
                  <Link href={`/estudiar/${temaSlug}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-xl border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all">
                      <GraduationCap className="mr-2 h-5 w-5" />
                      Iniciar Lección — {syllabus.module.split(":")[0]}
                    </Button>
                  </Link>
                ) : (
                  <p className="text-sm text-slate-400 text-center italic">Lección no disponible para este bloque</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-teal-800">
                  <Target className="h-5 w-5" /> Simulador de Examen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600">Simula un examen CENEVAL real con preguntas mixtas de todos los bloques.</p>
                <Link href="/simulator">
                  <Button variant="outline" className="w-full border-2 border-teal-300 text-teal-700 hover:bg-teal-50 font-bold py-5 rounded-xl">
                    <Target className="mr-2 h-5 w-5" /> Ir al Simulador
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
