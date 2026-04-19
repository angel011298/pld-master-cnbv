import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { requireSuperAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const sb = supabaseAdmin();
  const { data } = await sb
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });
  return NextResponse.json({ testimonials: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = (await req.json()) as {
    id?: string;
    approved?: boolean;
    show_on_landing?: boolean;
  };
  if (!body.id) return NextResponse.json({ error: "id requerido." }, { status: 400 });

  const sb = supabaseAdmin();
  const patch: Record<string, boolean> = {};
  if (typeof body.approved === "boolean") patch.approved = body.approved;
  if (typeof body.show_on_landing === "boolean") patch.show_on_landing = body.show_on_landing;

  const { error } = await sb.from("testimonials").update(patch).eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
