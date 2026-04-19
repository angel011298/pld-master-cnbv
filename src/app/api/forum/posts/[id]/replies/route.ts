import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";
import { getUserAccess } from "@/lib/access";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const access = await getUserAccess(userId);
    if (!access || !access.active || access.level === "free") {
      return NextResponse.json({ error: "Necesitas acceso premium." }, { status: 403 });
    }

    const { id: postId } = await ctx.params;
    const body = (await req.json()) as { content?: string };
    const content = (body.content ?? "").trim().slice(0, 10000);
    if (!content) return NextResponse.json({ error: "content requerido." }, { status: 400 });

    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("forum_replies")
      .insert({ post_id: postId, user_id: userId, content })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: data.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
