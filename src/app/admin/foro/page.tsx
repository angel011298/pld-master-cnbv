"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

type Post = {
  id: string;
  title: string;
  is_pinned: boolean;
  views: number;
  created_at: string;
};

async function authHeader(): Promise<Record<string, string>> {
  const sb = supabase();
  const { data: { session } } = await sb.auth.getSession();
  const token = session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ForoAdmin() {
  const [posts, setPosts] = useState<Post[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/forum", { headers: await authHeader() });
    const j = await res.json();
    setPosts(j.posts ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const togglePin = async (id: string, current: boolean) => {
    const headers = await authHeader();
    await fetch("/api/admin/forum", {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_pinned: !current }),
    });
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar post?")) return;
    const headers = await authHeader();
    await fetch(`/api/admin/forum?id=${id}`, { method: "DELETE", headers });
    await load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Moderación del Foro</h1>
      <div className="space-y-2">
        {posts.map((p) => (
          <Card key={p.id} className="flex items-center justify-between p-3">
            <div>
              <p className="font-medium">
                {p.is_pinned && <span className="mr-2">📌</span>}
                {p.title}
              </p>
              <p className="text-xs text-muted-foreground">{p.views} vistas · {new Date(p.created_at).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => togglePin(p.id, p.is_pinned)}>
                {p.is_pinned ? "Despinear" : "Pinear"}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => remove(p.id)}>
                Eliminar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
