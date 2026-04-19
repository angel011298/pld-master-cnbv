import Link from "next/link";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { Card } from "@/components/ui/card";

export default async function BlogIndex() {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("blog_posts")
    .select("slug, title, excerpt, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });

  const posts = data ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-4xl font-bold">Blog Certifik PLD</h1>
        <p className="text-muted-foreground">
          Guías prácticas, novedades regulatorias y estrategias para aprobar el examen CNBV PLD/FT.
        </p>
      </header>

      <div className="space-y-3">
        {posts.length === 0 && (
          <p className="text-sm text-muted-foreground">Próximamente: los primeros artículos de la serie.</p>
        )}
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`}>
            <Card className="p-4 transition hover:bg-accent">
              <h2 className="text-xl font-semibold">{p.title}</h2>
              {p.excerpt && <p className="mt-1 text-sm text-muted-foreground">{p.excerpt}</p>}
              {p.published_at && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(p.published_at).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
