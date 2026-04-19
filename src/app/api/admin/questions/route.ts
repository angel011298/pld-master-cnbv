import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { requireSuperAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const sb = supabaseAdmin();
  const { data } = await sb
    .from("exam_questions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  return NextResponse.json({ questions: data ?? [] });
}

export async function POST(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = (await req.json()) as {
    items?: Array<{
      area: string;
      difficulty?: string;
      question: string;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
      correct_option: "a" | "b" | "c" | "d";
      explanation?: string;
      source?: string;
    }>;
  };

  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) return NextResponse.json({ error: "items requeridos." }, { status: 400 });

  const sb = supabaseAdmin();
  const { error } = await sb.from("exam_questions").insert(items);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ inserted: items.length });
}
