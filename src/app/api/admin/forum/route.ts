import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { requireSuperAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const sb = supabaseAdmin();
  const { data: posts } = await sb
    .from("forum_posts")
    .select("id, title, user_id, category_id, is_pinned, views, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return NextResponse.json({ posts: posts ?? [] });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = (await req.json()) as { id?: string; is_pinned?: boolean };
  if (!body.id) return NextResponse.json({ error: "id requerido." }, { status: 400 });

  const sb = supabaseAdmin();
  await sb.from("forum_posts").update({ is_pinned: Boolean(body.is_pinned) }).eq("id", body.id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requerido." }, { status: 400 });

  const sb = supabaseAdmin();
  await sb.from("forum_posts").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
