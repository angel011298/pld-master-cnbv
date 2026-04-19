"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

type Org = {
  id: string;
  name: string;
  max_seats: number;
  used_seats: number;
  access_expires_at: string | null;
};

type Member = {
  id: string;
  email: string | null;
  user_id: string | null;
  role: string;
  invited_at: string;
  accepted_at: string | null;
};

type Analytics = {
  members_count: number;
  avg_score: number | null;
  total_attempts: number;
};

async function authHeader(): Promise<Record<string, string>> {
  const sb = supabase();
  const { data: { session } } = await sb.auth.getSession();
  const token = session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function B2BDashboard() {
  const [org, setOrg] = useState<Org | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [invite, setInvite] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    const headers = await authHeader();
    const [orgRes, memRes, anRes] = await Promise.all([
      fetch("/api/b2b/organization", { headers }).then((r) => r.json()),
      fetch("/api/b2b/members", { headers }).then((r) => r.json()),
      fetch("/api/b2b/analytics", { headers }).then((r) => r.json()).catch(() => null),
    ]);
    setOrg(orgRes.organization ?? null);
    setMembers(memRes.members ?? []);
    setAnalytics(anRes && !anRes.error ? anRes : null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sendInvite = async () => {
    setStatus(null);
    const headers = await authHeader();
    const res = await fetch("/api/b2b/invite", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ email: invite }),
    });
    const j = await res.json();
    if (!res.ok) {
      setStatus(`Error: ${j.error}`);
      return;
    }
    setStatus("Invitación enviada.");
    setInvite("");
    await load();
  };

  const remove = async (id: string) => {
    const headers = await authHeader();
    await fetch(`/api/b2b/members/${id}`, { method: "DELETE", headers });
    await load();
  };

  if (!org) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Dashboard B2B</h1>
        <Card className="p-6">
          <p>No tienes una organización activa. <a className="text-primary underline" href="/b2b">Solicita una licencia corporativa</a>.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{org.name}</h1>
          <p className="text-sm text-muted-foreground">
            {org.used_seats}/{org.max_seats} asientos usados
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          {org.access_expires_at && (
            <>Vence: {new Date(org.access_expires_at).toLocaleDateString()}</>
          )}
        </div>
      </header>

      {analytics && (
        <div className="grid gap-3 md:grid-cols-3">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Empleados</p>
            <p className="text-2xl font-bold">{analytics.members_count}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Score promedio</p>
            <p className="text-2xl font-bold">
              {analytics.avg_score !== null ? `${analytics.avg_score.toFixed(1)}%` : "—"}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Simulacros totales</p>
            <p className="text-2xl font-bold">{analytics.total_attempts}</p>
          </Card>
        </div>
      )}

      <section>
        <h2 className="mb-2 text-lg font-semibold">Invitar empleado</h2>
        <Card className="flex gap-2 p-3">
          <Input
            type="email"
            placeholder="empleado@empresa.com"
            value={invite}
            onChange={(e) => setInvite(e.target.value)}
          />
          <Button onClick={sendInvite} disabled={!invite}>
            Invitar
          </Button>
        </Card>
        {status && <p className="mt-2 text-sm">{status}</p>}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Empleados ({members.length})</h2>
        <Card className="divide-y">
          {members.length === 0 && <p className="p-3 text-sm text-muted-foreground">Aún no invitas a nadie.</p>}
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-3">
              <div>
                <p className="font-medium">{m.email ?? m.user_id ?? "—"}</p>
                <p className="text-xs text-muted-foreground">
                  {m.accepted_at ? "Activado" : "Pendiente"} · {m.role}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => remove(m.id)}>
                Remover
              </Button>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}
