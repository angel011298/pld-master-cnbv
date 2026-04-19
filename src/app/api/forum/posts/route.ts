import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId, sanitizeText } from "@/lib/security";
import { getUserAccess } from "@/lib/access";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const categorySlug = url.searchParams.get("category");
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") ?? "20", 10) || 20, 1), 50);

  const sb = supabaseAdmin();

  let categoryId: string | null = null;
  if (categorySlug) {
    const { data: cat } = await sb
      .from("forum_categories")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle();
    if (!cat) return NextResponse.json({ posts: [] });
    categoryId = cat.id;
  }

  let query = sb
    .from("forum_posts")
    .select("id, title, content, user_id, category_id, is_pinned, is_solved, views, created_at")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (categoryId) query = query.eq("category_id", categoryId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data ?? [] });
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const access = await getUserAccess(userId);
    if (!access || !access.active || access.level === "free") {
      return NextResponse.json(
        { error: "Necesitas acceso premium o B2B para publicar en el foro." },
        { status: 403 }
      );
    }

    const body = (await req.json()) as {
      title?: string;
      content?: string;
      category_id?: string;
    };

    const title = sanitizeText(body.title ?? "", 200);
    const content = (body.content ?? "").trim().slice(0, 10000);
    const category_id = body.category_id;

    if (!title || !content || !category_id) {
      return NextResponse.json({ error: "title, content y category_id son obligatorios." }, { status: 400 });
    }

    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("forum_posts")
      .insert({ title, content, user_id: userId, category_id })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: data.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
