import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const sb = supabaseAdmin();

  const { data: post, error } = await sb
    .from("forum_posts")
    .select("id, title, content, user_id, category_id, is_pinned, is_solved, views, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!post) return NextResponse.json({ error: "Post no encontrado." }, { status: 404 });

  const { data: replies } = await sb
    .from("forum_replies")
    .select("id, content, user_id, is_accepted_answer, created_at")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  await sb
    .from("forum_posts")
    .update({ views: (post.views ?? 0) + 1 })
    .eq("id", id);

  return NextResponse.json({ post, replies: replies ?? [] });
}
