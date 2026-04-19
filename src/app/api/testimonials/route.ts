import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId, sanitizeText } from "@/lib/security";

export async function GET() {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("testimonials")
    .select("id, content, rating, user_name, user_role")
    .eq("approved", true)
    .eq("show_on_landing", true)
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({ testimonials: data ?? [] });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const body = (await req.json()) as {
    content?: string;
    rating?: number;
    user_name?: string;
    user_role?: string;
  };

  const content = sanitizeText(body.content ?? "", 800);
  if (!content) return NextResponse.json({ error: "content requerido." }, { status: 400 });

  const rating = Math.min(Math.max(Math.floor(Number(body.rating) || 5), 1), 5);
  const user_name = body.user_name ? sanitizeText(body.user_name, 100) : null;
  const user_role = body.user_role ? sanitizeText(body.user_role, 150) : null;

  const sb = supabaseAdmin();
  const { error } = await sb.from("testimonials").insert({
    user_id: userId,
    content,
    rating,
    user_name,
    user_role,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
