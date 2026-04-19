"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

type Analytics = {
  day: { new_users: number; cfdis: number; chat_events: number; revenue_cents: number };
  month: { revenue_cents: number };
  active_users_7d: number;
  pass_rate: number | null;
  reported_count: number;
  passed_count: number;
  b2b: { organizations: number; seats_sold: number; revenue_cents: number };
};

function fmtMxn(cents: number) {
  return `$${(cents / 100).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminOverview() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const sb = supabase();
    const { data: { session } } = await sb.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      setError("Inicia sesión como super admin.");
      return;
    }
    const res = await fetch("/api/admin/analytics", { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Error");
      return;
    }
    setData(json);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (!data) return <p>Cargando...</p>;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Super Admin</h1>
        <nav className="flex gap-3 text-sm">
          <Link href="/admin/pricing" className="text-primary hover:underline">Pricing</Link>
          <Link href="/admin/testimonios" className="text-primary hover:underline">Testimonios</Link>
          <Link href="/admin/foro" className="text-primary hover:underline">Foro</Link>
          <Link href="/admin/facturas" className="text-primary hover:underline">CFDIs</Link>
        </nav>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Hoy</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Nuevos registros</p>
            <p className="text-2xl font-bold">{data.day.new_users}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Ventas</p>
            <p className="text-2xl font-bold">{fmtMxn(data.day.revenue_cents)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">CFDIs emitidos</p>
            <p className="text-2xl font-bold">{data.day.cfdis}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Mensajes chat</p>
            <p className="text-2xl font-bold">{data.day.chat_events}</p>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Mes</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Ingreso mensual</p>
            <p className="text-2xl font-bold">{fmtMxn(data.month.revenue_cents)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Usuarios activos (7d)</p>
            <p className="text-2xl font-bold">{data.active_users_7d}</p>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Tasa de aprobación real (CNBV)</h2>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {data.reported_count} usuarios han reportado su resultado real del examen CNBV.
          </p>
          <p className="mt-2 text-3xl font-bold">
            {data.pass_rate !== null ? `${data.pass_rate.toFixed(1)}%` : "Sin datos"}
          </p>
          <p className="text-xs text-muted-foreground">
            {data.passed_count} aprobados de {data.reported_count} · Meta: &gt;80%
          </p>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">B2B</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Organizaciones</p>
            <p className="text-2xl font-bold">{data.b2b.organizations}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Asientos vendidos</p>
            <p className="text-2xl font-bold">{data.b2b.seats_sold}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Ingreso B2B total</p>
            <p className="text-2xl font-bold">{fmtMxn(data.b2b.revenue_cents)}</p>
          </Card>
        </div>
      </section>
    </div>
  );
}
