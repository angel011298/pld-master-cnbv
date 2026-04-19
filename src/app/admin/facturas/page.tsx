"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

type Cfdi = {
  id: string;
  receptor_rfc: string;
  receptor_nombre: string;
  total: number;
  status: string;
  uuid_fiscal: string | null;
  fecha_timbrado: string | null;
  created_at: string;
};

async function authHeader(): Promise<Record<string, string>> {
  const sb = supabase();
  const { data: { session } } = await sb.auth.getSession();
  const token = session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function FacturasAdmin() {
  const [cfdis, setCfdis] = useState<Cfdi[]>([]);
  const [status, setStatus] = useState<string>("");

  const load = useCallback(async () => {
    const url = status ? `/api/admin/cfdis?status=${status}` : "/api/admin/cfdis";
    const res = await fetch(url, { headers: await authHeader() });
    const j = await res.json();
    setCfdis(j.cfdis ?? []);
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">CFDIs</h1>
        <select
          className="rounded-md border border-input bg-background p-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="timbrado">Timbrado</option>
          <option value="cancelado">Cancelado</option>
          <option value="error">Error</option>
        </select>
      </header>

      <div className="space-y-2">
        {cfdis.length === 0 && <p className="text-sm text-muted-foreground">Sin CFDIs.</p>}
        {cfdis.map((c) => (
          <Card key={c.id} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {c.receptor_nombre} <span className="text-xs text-muted-foreground">({c.receptor_rfc})</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.uuid_fiscal ?? "—"} · {new Date(c.created_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">${Number(c.total).toLocaleString("es-MX")}</p>
                <span
                  className={`rounded px-2 py-1 text-xs ${
                    c.status === "timbrado"
                      ? "bg-green-500/20 text-green-700"
                      : c.status === "error"
                      ? "bg-red-500/20 text-red-700"
                      : "bg-yellow-500/20 text-yellow-700"
                  }`}
                >
                  {c.status}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
