import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUser } from "../_auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const fromDate = ninetyDaysAgo.toISOString().slice(0, 10);

  const admin = supabaseAdmin();

  const { data: events } = await admin
    .from("study_events")
    .select("created_at")
    .eq("user_id", user.id)
    .gte("created_at", `${fromDate}T00:00:00`);

  const { data: exams } = await admin
    .from("exam_sessions")
    .select("completed_at")
    .eq("user_id", user.id)
    .eq("estado", "completado")
    .gte("completed_at", `${fromDate}T00:00:00`);

  const dayCounts = new Map<string, number>();
  for (const event of events || []) {
    const date =
      typeof event.created_at === "string"
        ? event.created_at.slice(0, 10)
        : null;
    if (date) dayCounts.set(date, (dayCounts.get(date) || 0) + 1);
  }
  for (const exam of exams || []) {
    const date =
      typeof exam.completed_at === "string"
        ? exam.completed_at.slice(0, 10)
        : null;
    if (date) dayCounts.set(date, (dayCounts.get(date) || 0) + 1);
  }

  const days = Array.from(dayCounts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({ days });
}
