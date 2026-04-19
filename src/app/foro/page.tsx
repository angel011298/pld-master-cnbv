"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
};

type Post = {
  id: string;
  title: string;
  created_at: string;
  views: number;
  is_pinned: boolean;
};

export default function ForoHome() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [recent, setRecent] = useState<Post[]>([]);

  useEffect(() => {
    fetch("/api/forum/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
    fetch("/api/forum/posts?limit=8")
      .then((r) => r.json())
      .then((d) => setRecent(d.posts ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Foro de Comunidad</h1>
        <p className="text-muted-foreground">
          Comparte experiencias, resuelve dudas y conecta con otros compliance officers.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Categorías</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/foro/${cat.slug}`}>
              <Card className="p-4 transition hover:bg-accent">
                <div className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden>{cat.icon ?? "💬"}</span>
                  <div>
                    <h3 className="font-semibold">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground">{cat.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Posts recientes</h2>
        <div className="space-y-2">
          {recent.length === 0 && (
            <p className="text-sm text-muted-foreground">Aún no hay posts. Sé el primero.</p>
          )}
          {recent.map((post) => (
            <Link key={post.id} href={`/foro/post/${post.id}`}>
              <Card className="p-3 transition hover:bg-accent">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {post.is_pinned && <span className="mr-2 text-xs text-primary">📌</span>}
                    {post.title}
                  </span>
                  <span className="text-xs text-muted-foreground">{post.views} vistas</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
