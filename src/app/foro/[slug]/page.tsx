"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

type Post = { id: string; title: string; content: string; views: number; created_at: string; is_pinned: boolean };
type Category = { id: string; name: string; slug: string; description: string | null };

export default function ForoCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const cats = await fetch("/api/forum/categories").then((r) => r.json());
    const found = (cats.categories as Category[] | undefined)?.find((c) => c.slug === slug) ?? null;
    setCategory(found);
    const res = await fetch(`/api/forum/posts?category=${slug}`).then((r) => r.json());
    setPosts(res.posts ?? []);
  };

  useEffect(() => {
    load();
  }, [slug]);

  const createPost = async () => {
    if (!title || !content || !category) return;
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
      const res = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, content, category_id: category.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Error");
        return;
      }
      setTitle("");
      setContent("");
      await load();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <Link href="/foro" className="text-sm text-primary hover:underline">
          ← Foro
        </Link>
        <h1 className="mt-1 text-3xl font-bold">{category?.name ?? "..."}</h1>
        <p className="text-muted-foreground">{category?.description}</p>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Crear nuevo post</h2>
        <Card className="space-y-2 p-4">
          <Input
            placeholder="Título del post"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
          <textarea
            className="min-h-[120px] w-full rounded-md border border-input bg-background p-2 text-sm"
            placeholder="Escribe tu pregunta o aporte (markdown básico soportado)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={10000}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end">
            <Button onClick={createPost} disabled={loading || !title || !content}>
              {loading ? "Publicando..." : "Publicar"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Publicar requiere acceso premium o B2B.
          </p>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Posts</h2>
        <div className="space-y-2">
          {posts.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay posts en esta categoría aún.</p>
          )}
          {posts.map((p) => (
            <Link key={p.id} href={`/foro/post/${p.id}`}>
              <Card className="p-3 transition hover:bg-accent">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {p.is_pinned && <span className="mr-2 text-xs">📌</span>}
                    {p.title}
                  </span>
                  <span className="text-xs text-muted-foreground">{p.views} vistas</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
