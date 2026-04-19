"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

export default function B2BLanding() {
  const [form, setForm] = useState({
    organization_name: "",
    rfc: "",
    razon_social: "",
    regimen_fiscal: "601",
    email_contacto: "",
    telefono: "",
    seats: 5,
    exam_cycle: "jun_2026",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = form.seats * 999;

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const sb = supabase();
      const { data: { session } } = await sb.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setError("Inicia sesión con Google primero.");
        return;
      }
      const res = await fetch("/api/b2b/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Error");
        return;
      }
      if (json.url) window.location.href = json.url;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold">Licencias corporativas</h1>
        <p className="text-lg text-muted-foreground">
          Prepara a todo tu equipo de compliance para el examen CNBV PLD/FT. $999 MXN por asiento (mínimo 5).
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="p-4">
          <h3 className="font-semibold">Dashboard en tiempo real</h3>
          <p className="text-sm text-muted-foreground">Mide el progreso de cada empleado.</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold">CFDI 4.0 timbrado</h3>
          <p className="text-sm text-muted-foreground">Factura automática para tu contabilidad.</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold">Acceso al foro</h3>
          <p className="text-sm text-muted-foreground">Tu equipo resuelve dudas con la comunidad.</p>
        </Card>
      </div>

      <Card className="space-y-3 p-6">
        <h2 className="text-xl font-semibold">Solicitar licencia corporativa</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder="Nombre de la empresa"
            value={form.organization_name}
            onChange={(e) => setForm({ ...form, organization_name: e.target.value })}
          />
          <Input
            placeholder="RFC"
            value={form.rfc}
            onChange={(e) => setForm({ ...form, rfc: e.target.value.toUpperCase() })}
          />
          <Input
            placeholder="Razón social"
            value={form.razon_social}
            onChange={(e) => setForm({ ...form, razon_social: e.target.value })}
          />
          <Input
            placeholder="Régimen fiscal (ej. 601)"
            value={form.regimen_fiscal}
            onChange={(e) => setForm({ ...form, regimen_fiscal: e.target.value })}
          />
          <Input
            placeholder="Email de contacto"
            type="email"
            value={form.email_contacto}
            onChange={(e) => setForm({ ...form, email_contacto: e.target.value })}
          />
          <Input
            placeholder="Teléfono"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          />
          <Input
            placeholder="Asientos (5-200)"
            type="number"
            min={5}
            max={200}
            value={form.seats}
            onChange={(e) => setForm({ ...form, seats: Math.max(5, Math.min(200, parseInt(e.target.value || "5", 10))) })}
          />
          <select
            className="rounded-md border border-input bg-background p-2 text-sm"
            value={form.exam_cycle}
            onChange={(e) => setForm({ ...form, exam_cycle: e.target.value })}
          >
            <option value="jun_2026">Examen junio 2026</option>
            <option value="oct_2026">Examen octubre 2026</option>
          </select>
        </div>

        <div className="flex items-center justify-between rounded-md bg-accent p-3">
          <span className="text-sm">{form.seats} asientos × $999 MXN</span>
          <span className="text-xl font-bold">${amount.toLocaleString("es-MX")} MXN</span>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button className="w-full" onClick={submit} disabled={loading}>
          {loading ? "Procesando..." : "Pagar y activar licencia"}
        </Button>
      </Card>
    </div>
  );
}
