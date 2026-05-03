"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Download, UserPlus, Clock, Trophy, Flame,
  CheckCircle, XCircle, AlertCircle, ArrowLeft, Copy, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buildAuthHeaders } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TeamMember {
  user_id: string;
  full_name: string | null;
  email: string;
  plan: string;
  last_active_at: string | null;
  total_xp: number;
  current_streak: number;
  simulacros_completados: number;
  score_promedio: number | null;
  progreso_general: number;
}

interface Company {
  id: string;
  name: string;
  max_seats: number;
  seats_used: number;
}

interface TeamData {
  company: Company;
  members: TeamMember[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function semaforo(pct: number) {
  if (pct >= 80) return { dot: "bg-emerald-500", label: "Listo", text: "text-emerald-700", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (pct >= 60) return { dot: "bg-amber-400",   label: "Regular", text: "text-amber-700",  badge: "bg-amber-50 text-amber-700 border-amber-200" };
  return               { dot: "bg-red-500",       label: "Débil",  text: "text-red-700",    badge: "bg-red-50 text-red-700 border-red-200" };
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

function displayName(m: TeamMember) {
  return m.full_name?.trim() || m.email.split("@")[0];
}

function buildCsv(company: Company, members: TeamMember[]): string {
  const header = [
    "Nombre", "Email", "Progreso General (%)", "Simulacros Completados",
    "Score Promedio (%)", "XP Total", "Racha (días)", "Último Acceso",
  ].join(",");

  const rows = members.map((m) => [
    `"${m.full_name ?? ""}"`,
    `"${m.email}"`,
    m.progreso_general,
    m.simulacros_completados,
    m.score_promedio ?? "",
    m.total_xp,
    m.current_streak,
    `"${fmtDate(m.last_active_at)}"`,
  ].join(","));

  const meta = `"Empresa: ${company.name}",,,,,,,"Reporte generado: ${new Date().toLocaleDateString("es-MX")}"`;
  return [meta, header, ...rows].join("\n");
}

// ── Invite modal ─────────────────────────────────────────────────────────────

function InviteModal({ onClose, seatsLeft }: { onClose: () => void; seatsLeft: number }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleInvite() {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const headers = await buildAuthHeaders({ "Content-Type": "application/json" });
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers,
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al generar invitación");
      setInviteUrl(data.inviteUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">Invitar usuario</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
        </div>

        <p className="text-sm text-slate-600">
          {seatsLeft > 0
            ? `Quedan ${seatsLeft} lugar${seatsLeft !== 1 ? "es" : ""} disponibles.`
            : "No quedan lugares disponibles."}
        </p>

        {!inviteUrl ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email del invitado</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                placeholder="usuario@empresa.com"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={seatsLeft === 0}
              />
            </div>
            {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
            <Button
              onClick={handleInvite}
              disabled={loading || !email.trim() || seatsLeft === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl"
            >
              {loading ? "Generando…" : "Generar enlace de invitación"}
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
              <p className="text-xs text-slate-700 break-all flex-1">{inviteUrl}</p>
            </div>
            <Button
              onClick={copyLink}
              variant="outline"
              className="w-full font-bold gap-2"
            >
              {copied ? <><Check className="h-4 w-4" /> ¡Copiado!</> : <><Copy className="h-4 w-4" /> Copiar enlace</>}
            </Button>
            <p className="text-xs text-slate-500 text-center">
              Comparte este enlace con el invitado. Expira en 7 días.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EquipoPage() {
  const router = useRouter();
  const [data, setData] = useState<TeamData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await buildAuthHeaders();
      const res = await fetch("/api/admin/team-progress", { headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al cargar equipo");
      setData(json as TeamData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function exportCsv() {
    if (!data) return;
    const csv = buildCsv(data.company, data.members);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `equipo-${data.company.name.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // ── Error / no access ─────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-red-600 font-semibold text-center max-w-sm">
          {error ?? "No tienes acceso a este panel."}
        </p>
        <Button onClick={() => router.push("/dashboard")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al dashboard
        </Button>
      </div>
    );
  }

  const { company, members } = data;
  const seatsLeft = Math.max(0, company.max_seats - company.seats_used);

  const readyCount  = members.filter((m) => m.progreso_general >= 80).length;
  const regularCount = members.filter((m) => m.progreso_general >= 60 && m.progreso_general < 80).length;
  const weakCount   = members.filter((m) => m.progreso_general < 60).length;

  return (
    <>
      {showInvite && (
        <InviteModal onClose={() => { setShowInvite(false); load(); }} seatsLeft={seatsLeft} />
      )}

      <div className="max-w-5xl mx-auto space-y-6 pb-12">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Panel corporativo</p>
            <h1 className="text-2xl font-black text-slate-900">{company.name}</h1>
            <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {company.seats_used} / {company.max_seats} plazas utilizadas
              {seatsLeft > 0
                ? <span className="text-emerald-600 font-semibold">· {seatsLeft} disponible{seatsLeft !== 1 ? "s" : ""}</span>
                : <span className="text-red-500 font-semibold">· Sin lugares libres</span>}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={exportCsv} variant="outline" className="gap-2 font-bold">
              <Download className="h-4 w-4" /> Exportar CSV
            </Button>
            <Button onClick={() => setShowInvite(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold">
              <UserPlus className="h-4 w-4" /> Invitar usuario
            </Button>
          </div>
        </div>

        {/* ── Semáforo summary ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Listos (≥80%)",    count: readyCount,   dot: "bg-emerald-500", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800" },
            { label: "Regular (60–79%)", count: regularCount, dot: "bg-amber-400",   bg: "bg-amber-50 border-amber-200",     text: "text-amber-800" },
            { label: "Débil (<60%)",     count: weakCount,    dot: "bg-red-500",     bg: "bg-red-50 border-red-200",         text: "text-red-800" },
          ].map((s) => (
            <div key={s.label} className={cn("rounded-2xl border p-4 text-center", s.bg)}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className={cn("h-3 w-3 rounded-full shrink-0", s.dot)} />
                <span className={cn("text-xs font-bold uppercase tracking-wide", s.text)}>{s.label}</span>
              </div>
              <p className={cn("text-3xl font-black", s.text)}>{s.count}</p>
            </div>
          ))}
        </div>

        {/* ── Members table ── */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h2 className="font-black text-slate-800">Miembros del equipo</h2>
            <span className="text-xs text-slate-500 font-medium">{members.length} usuario{members.length !== 1 ? "s" : ""}</span>
          </div>

          {members.length === 0 ? (
            <div className="px-5 py-12 text-center text-slate-500">
              <Users className="mx-auto h-10 w-10 mb-3 text-slate-300" />
              <p className="font-semibold">No hay miembros en el equipo todavía.</p>
              <p className="text-sm mt-1">Usa el botón <strong>Invitar usuario</strong> para agregar compañeros.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead>
                  <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-5 py-3">Usuario</th>
                    <th className="px-5 py-3">Preparación</th>
                    <th className="px-5 py-3 hidden sm:table-cell">Simulacros</th>
                    <th className="px-5 py-3 hidden md:table-cell">Score prom.</th>
                    <th className="px-5 py-3 hidden lg:table-cell">Racha</th>
                    <th className="px-5 py-3 hidden lg:table-cell">Último acceso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {members.map((m) => {
                    const s = semaforo(m.progreso_general);
                    return (
                      <tr key={m.user_id} className="hover:bg-slate-50 transition-colors">
                        {/* User */}
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-slate-900 text-sm truncate max-w-[160px]">{displayName(m)}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[160px]">{m.email}</p>
                        </td>
                        {/* Preparación */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", s.dot)} />
                            <div>
                              <p className={cn("text-sm font-black", s.text)}>{m.progreso_general}%</p>
                              <div className="w-20 h-1.5 rounded-full bg-slate-100 mt-0.5 overflow-hidden">
                                <div
                                  className={cn("h-full rounded-full", m.progreso_general >= 80 ? "bg-emerald-500" : m.progreso_general >= 60 ? "bg-amber-400" : "bg-red-500")}
                                  style={{ width: `${m.progreso_general}%` }}
                                />
                              </div>
                            </div>
                            <Badge variant="outline" className={cn("text-xs shrink-0 hidden sm:inline-flex", s.badge)}>
                              {s.label}
                            </Badge>
                          </div>
                        </td>
                        {/* Simulacros */}
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5">
                            <Trophy className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-sm font-bold text-slate-700">{m.simulacros_completados}</span>
                          </div>
                        </td>
                        {/* Score promedio */}
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          {m.score_promedio != null ? (
                            <span className={cn("text-sm font-black", semaforo(m.score_promedio).text)}>
                              {m.score_promedio}%
                            </span>
                          ) : (
                            <span className="text-slate-300 text-sm">—</span>
                          )}
                        </td>
                        {/* Racha */}
                        <td className="px-5 py-3.5 hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <Flame className={cn("h-3.5 w-3.5", m.current_streak >= 2 ? "text-orange-500" : "text-slate-300")} />
                            <span className="text-sm text-slate-600 font-medium">{m.current_streak}d</span>
                          </div>
                        </td>
                        {/* Último acceso */}
                        <td className="px-5 py-3.5 hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-slate-500">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="text-xs">{fmtDate(m.last_active_at)}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Legend ── */}
        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            Progreso general = promedio de score en simulacros + actividad de estudio (XP)
          </div>
          <div className="flex items-center gap-1.5">
            <XCircle className="h-4 w-4 text-slate-300" />
            — = sin simulacros completados aún
          </div>
        </div>

      </div>
    </>
  );
}
