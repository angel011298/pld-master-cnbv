"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

type Testimonial = {
  id: string;
  content: string;
  rating: number;
  user_name: string | null;
  user_role: string | null;
  approved: boolean;
  show_on_landing: boolean;
  created_at: string;
};

async function authHeader(): Promise<Record<string, string>> {
  const sb = supabase();
  const { data: { session } } = await sb.auth.getSession();
  const token = session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function TestimoniosAdmin() {
  const [items, setItems] = useState<Testimonial[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/testimonials", { headers: await authHeader() });
    const j = await res.json();
    setItems(j.testimonials ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (id: string, field: "approved" | "show_on_landing", value: boolean) => {
    const headers = await authHeader();
    await fetch("/api/admin/testimonials", {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: value }),
    });
    await load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Testimonios</h1>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-muted-foreground">No hay testimonios.</p>}
        {items.map((t) => (
          <Card key={t.id} className="space-y-2 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">
                  {"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)} — {t.user_name ?? "Anónimo"}
                </p>
                <p className="text-xs text-muted-foreground">{t.user_role}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={t.approved ? "default" : "outline"}
                  onClick={() => toggle(t.id, "approved", !t.approved)}
                >
                  {t.approved ? "Aprobado ✓" : "Aprobar"}
                </Button>
                <Button
                  size="sm"
                  variant={t.show_on_landing ? "default" : "outline"}
                  onClick={() => toggle(t.id, "show_on_landing", !t.show_on_landing)}
                >
                  {t.show_on_landing ? "En landing ✓" : "Mostrar en landing"}
                </Button>
              </div>
            </div>
            <p className="text-sm">{t.content}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
