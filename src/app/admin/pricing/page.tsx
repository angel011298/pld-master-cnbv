"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

type Row = {
  phase: string;
  price_cents: number;
  active: boolean;
  label: string | null;
};

function fmt(cents: number) {
  return `$${(cents / 100).toLocaleString("es-MX")} MXN`;
}

export default function PricingAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const sb = supabase();
    const { data: { session } } = await sb.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      setError("No autenticado.");
      return;
    }
    const res = await fetch("/api/admin/pricing", { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Error");
      return;
    }
    setRows(json.pricing ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activate = async (phase: string) => {
    setBusy(phase);
    const sb = supabase();
    const { data: { session } } = await sb.auth.getSession();
    const token = session?.access_token;
    await fetch("/api/admin/pricing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token ?? ""}`,
      },
      body: JSON.stringify({ phase }),
    });
    setBusy(null);
    await load();
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Precio escalonado</h1>
        <p className="text-sm text-muted-foreground">
          Selecciona la fase de precio activa. La landing lo lee dinámicamente.
        </p>
      </header>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((r) => (
          <Card key={r.phase} className={`space-y-2 p-4 ${r.active ? "border-primary" : ""}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold capitalize">{r.phase.replaceAll("_", " ")}</h3>
              {r.active && (
                <span className="rounded bg-primary/10 px-2 py-1 text-xs text-primary">Activo</span>
              )}
            </div>
            <p className="text-2xl font-bold">{fmt(r.price_cents)}</p>
            {r.label && <p className="text-xs text-muted-foreground">{r.label}</p>}
            {!r.active && (
              <Button size="sm" onClick={() => activate(r.phase)} disabled={busy === r.phase}>
                {busy === r.phase ? "Activando..." : "Activar esta fase"}
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
