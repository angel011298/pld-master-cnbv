import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { requireSuperAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const sb = supabaseAdmin();
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    { count: newUsersToday },
    { count: cfdiToday },
    { count: chatToday },
    { count: activeUsers7d },
    { data: salesToday },
    { data: salesMonth },
    { data: results },
    { count: orgsCount },
    { data: seatsAgg },
    { data: b2bRevenue },
  ] = await Promise.all([
    sb.from("user_profiles").select("user_id", { count: "exact", head: true }).gte("created_at", startOfDay.toISOString()),
    sb.from("cfdis").select("id", { count: "exact", head: true }).gte("created_at", startOfDay.toISOString()),
    sb.from("study_events").select("id", { count: "exact", head: true }).eq("event_type", "chat").gte("created_at", startOfDay.toISOString()),
    sb.from("study_events").select("user_id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo.toISOString()),
    sb.from("purchases").select("amount_cents").eq("status", "completed").gte("completed_at", startOfDay.toISOString()),
    sb.from("purchases").select("amount_cents").eq("status", "completed").gte("completed_at", startOfMonth.toISOString()),
    sb.from("exam_results_real").select("passed"),
    sb.from("organizations").select("id", { count: "exact", head: true }),
    sb.from("organizations").select("used_seats"),
    sb.from("purchases").select("amount_cents").eq("status", "completed").eq("purchase_type", "b2b"),
  ]);

  const sumCents = (rows: Array<{ amount_cents: number }> | null) =>
    (rows ?? []).reduce((s, r) => s + (r.amount_cents ?? 0), 0);

  const reported = results ?? [];
  const passedCount = reported.filter((r) => r.passed === true).length;
  const passRate = reported.length > 0 ? (passedCount / reported.length) * 100 : null;

  const totalSeats = (seatsAgg ?? []).reduce((s, r) => s + (r.used_seats ?? 0), 0);

  return NextResponse.json({
    day: {
      new_users: newUsersToday ?? 0,
      cfdis: cfdiToday ?? 0,
      chat_events: chatToday ?? 0,
      revenue_cents: sumCents(salesToday ?? null),
    },
    month: {
      revenue_cents: sumCents(salesMonth ?? null),
    },
    active_users_7d: activeUsers7d ?? 0,
    pass_rate: passRate,
    reported_count: reported.length,
    passed_count: passedCount,
    b2b: {
      organizations: orgsCount ?? 0,
      seats_sold: totalSeats,
      revenue_cents: sumCents(b2bRevenue ?? null),
    },
  });
}
