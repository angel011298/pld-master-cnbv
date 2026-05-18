import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Uses service-role key so it bypasses RLS — only callable from the admin UI
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// GET /api/admin/suggestions
// Returns all suggestions joined with basic user profile info
export async function GET() {
  try {
    const { data, error } = await adminClient
      .from("suggestions")
      .select("id, user_id, content, type, created_at, read_at")
      .order("created_at", { ascending: false })
      .limit(500)

    if (error) {
      console.error("[admin/suggestions GET]", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ suggestions: data ?? [] })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// PATCH /api/admin/suggestions — mark one suggestion as read
export async function PATCH(req: Request) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    const { error } = await adminClient
      .from("suggestions")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
