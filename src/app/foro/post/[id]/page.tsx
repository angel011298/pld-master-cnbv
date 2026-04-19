"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

type Post = { id: string; title: string; content: string; views: number; created_at: string };
type Reply = { id: string; content: string; user_id: string; is_accepted_answer: boolean; created_at: string };

export default function ForumPostPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch(`/api/forum/posts/${id}`).then((r) => r.json());
    setPost(res.post ?? null);
    setReplies(res.replies ?? []);
  };

  useEffect(() => {
    load();
  }, [id]);

  const submit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const sb = supabase();
      const { data: { session } } = await sb.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setError("Inicia sesión para responder.");
        return;
      }
      const res = await fetch(`/api/forum/posts/${id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(j.error ?? "Error");
        return;
      }
      setContent("");
      await load();
    } finally {
      setLoading(false);
    }
  };

  if (!post) return <p>Cargando...</p>;

  return (
    <div className="space-y-6">
      <Link href="/foro" className="text-sm text-primary hover:underline">
        ← Foro
      </Link>

      <Card className="space-y-2 p-4">
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <p className="whitespace-pre-wrap text-sm">{post.content}</p>
        <p className="text-xs text-muted-foreground">
          {post.views} vistas · {new Date(post.created_at).toLocaleString()}
        </p>
      </Card>

      <section>
        <h2 className="mb-3 text-lg font-semibold">{replies.length} Respuestas</h2>
        <div className="space-y-2">
          {replies.map((r) => (
            <Card key={r.id} className="p-3">
              <p className="whitespace-pre-wrap text-sm">{r.content}</p>
              {r.is_accepted_answer && (
                <span className="mt-2 inline-block rounded bg-green-500/20 px-2 py-1 text-xs text-green-700">
                  ✓ Respuesta aceptada
                </span>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleString()}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium">Responder</h3>
        <Card className="space-y-2 p-4">
          <textarea
            className="min-h-[100px] w-full rounded-md border border-input bg-background p-2 text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={10000}
            placeholder="Escribe tu respuesta..."
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end">
            <Button onClick={submit} disabled={loading || !content.trim()}>
              {loading ? "Enviando..." : "Responder"}
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
