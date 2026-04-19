export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("blog_posts")
    .select("title, content, published_at, seo_description")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (!data) return notFound();

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Link href="/blog" className="text-sm text-primary hover:underline">← Blog</Link>
      <h1 className="text-4xl font-bold">{data.title}</h1>
      {data.published_at && (
        <p className="text-xs text-muted-foreground">
          {new Date(data.published_at).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      )}
      <div className="prose prose-sm max-w-none whitespace-pre-wrap">{data.content}</div>
    </article>
  );
}
