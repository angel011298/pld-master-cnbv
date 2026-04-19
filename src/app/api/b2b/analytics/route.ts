import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const sb = supabaseAdmin();
  const { data: org } = await sb
    .from("organizations")
    .select("id, max_seats, used_seats")
    .eq("admin_user_id", userId)
    .maybeSingle();

  if (!org) return NextResponse.json({ error: "Sin organización." }, { status: 403 });

  const { data: members } = await sb
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", org.id);

  const userIds = (members ?? [])
    .map((m: { user_id: string | null }) => m.user_id)
    .filter((id): id is string => Boolean(id));

  if (userIds.length === 0) {
    return NextResponse.json({
      organization: org,
      members_count: 0,
      avg_score: null,
      total_attempts: 0,
      by_user: [],
    });
  }

  const { data: attempts } = await sb
    .from("exam_attempts")
    .select("user_id, score_percent, completed")
    .in("user_id", userIds)
    .eq("completed", true);

  const byUser = new Map<string, { attempts: number; avg: number; total: number }>();
  let totalScore = 0;
  let totalAttempts = 0;

  for (const a of attempts ?? []) {
    const key = a.user_id as string;
    const score = Number(a.score_percent ?? 0);
    const cur = byUser.get(key) ?? { attempts: 0, avg: 0, total: 0 };
    cur.attempts += 1;
    cur.total += score;
    cur.avg = cur.total / cur.attempts;
    byUser.set(key, cur);
    totalScore += score;
    totalAttempts += 1;
  }

  return NextResponse.json({
    organization: org,
    members_count: userIds.length,
    avg_score: totalAttempts ? totalScore / totalAttempts : null,
    total_attempts: totalAttempts,
    by_user: Array.from(byUser.entries()).map(([user_id, stats]) => ({ user_id, ...stats })),
  });
}
