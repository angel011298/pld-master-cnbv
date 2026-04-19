import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const body = (await req.json()) as {
      post_id?: string;
      reply_id?: string;
      vote_type?: "up" | "down";
    };

    const vote_type = body.vote_type === "down" ? "down" : "up";
    if (!body.post_id && !body.reply_id) {
      return NextResponse.json({ error: "post_id o reply_id requerido." }, { status: 400 });
    }

    const sb = supabaseAdmin();
    const row = {
      user_id: userId,
      post_id: body.post_id ?? null,
      reply_id: body.reply_id ?? null,
      vote_type,
    };

    const { error } = await sb
      .from("forum_votes")
      .upsert(row, { onConflict: body.post_id ? "user_id,post_id" : "user_id,reply_id" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
