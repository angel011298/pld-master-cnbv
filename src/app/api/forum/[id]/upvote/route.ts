import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  const sb = supabaseAdmin();

  // Atomic increment using current value
  const { data: post, error: readError } = await sb
    .from("forum_posts")
    .select("upvotes")
    .eq("id", id)
    .single();

  if (readError || !post) {
    return NextResponse.json({ error: "Post no encontrado" }, { status: 404 });
  }

  const { error: updateError } = await sb
    .from("forum_posts")
    .update({ upvotes: (post.upvotes ?? 0) + 1 })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ upvotes: (post.upvotes ?? 0) + 1 });
}
