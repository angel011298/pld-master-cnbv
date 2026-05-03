import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

export interface TeamMember {
  user_id: string;
  full_name: string | null;
  email: string;
  plan: string;
  last_active_at: string | null;
  total_xp: number;
  current_streak: number;
  simulacros_completados: number;
  score_promedio: number | null;
  progreso_general: number;
}

export interface TeamProgressResponse {
  company: {
    id: string;
    name: string;
    max_seats: number;
    seats_used: number;
  };
  members: TeamMember[];
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
    }

    const sb = supabaseAdmin();

    // Verify user is a corporate admin
    const { data: company, error: companyErr } = await sb
      .from("companies")
      .select("id, name, max_seats, seats_used")
      .eq("admin_user_id", userId)
      .single();

    if (companyErr || !company) {
      return NextResponse.json(
        { error: "No tienes acceso a este recurso." },
        { status: 403 }
      );
    }

    // Fetch all team members (users with this company_id)
    const { data: profiles, error: profilesErr } = await sb
      .from("user_profiles")
      .select("user_id, full_name, plan, last_active_at, total_xp, current_streak")
      .eq("company_id", company.id);

    if (profilesErr) throw profilesErr;

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        company,
        members: [],
      } satisfies TeamProgressResponse);
    }

    const memberIds = profiles.map((p) => p.user_id as string);

    // Fetch auth emails for all members
    const emailMap = new Map<string, string>();
    const { data: authData } = await sb.auth.admin.listUsers({ perPage: 1000 });
    for (const u of authData?.users ?? []) {
      if (memberIds.includes(u.id)) {
        emailMap.set(u.id, u.email ?? "");
      }
    }

    // Fetch simulacro session stats per member
    const { data: sessions } = await sb
      .from("exam_sessions")
      .select("user_id, score")
      .in("user_id", memberIds)
      .eq("exam_type", "simulacro")
      .eq("estado", "completado");

    const simulacroCountMap = new Map<string, number>();
    const simulacroScoresMap = new Map<string, number[]>();
    for (const s of sessions ?? []) {
      const uid = s.user_id as string;
      simulacroCountMap.set(uid, (simulacroCountMap.get(uid) ?? 0) + 1);
      if (s.score != null) {
        const arr = simulacroScoresMap.get(uid) ?? [];
        arr.push(Number(s.score));
        simulacroScoresMap.set(uid, arr);
      }
    }

    const members: TeamMember[] = profiles.map((p) => {
      const uid = p.user_id as string;
      const scores = simulacroScoresMap.get(uid) ?? [];
      const scorePromedio =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : null;

      // progreso_general: average of XP-based score (xp/1000 capped at 100) and simulacro avg score
      const xpScore = Math.min(100, Math.round(((p.total_xp ?? 0) / 1000) * 100));
      const progresoGeneral =
        scorePromedio != null
          ? Math.round((xpScore + scorePromedio) / 2)
          : xpScore;

      return {
        user_id: uid,
        full_name: p.full_name ?? null,
        email: emailMap.get(uid) ?? "",
        plan: p.plan ?? "trial",
        last_active_at: p.last_active_at ?? null,
        total_xp: p.total_xp ?? 0,
        current_streak: p.current_streak ?? 0,
        simulacros_completados: simulacroCountMap.get(uid) ?? 0,
        score_promedio: scorePromedio,
        progreso_general: progresoGeneral,
      };
    });

    return NextResponse.json({ company, members } satisfies TeamProgressResponse);
  } catch (error: unknown) {
    console.error("team-progress error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
