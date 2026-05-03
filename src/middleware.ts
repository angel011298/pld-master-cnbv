import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const TRIAL_QUESTION_LIMIT = 15;
const TRIAL_SIMULACRO_LIMIT = 1;

export const config = {
  matcher: ["/estudiar/:path*", "/simulacro/:path*"],
};

export async function middleware(req: NextRequest) {
  // Extract token from cookie (Supabase stores session in sb-<ref>-auth-token)
  const cookies = req.cookies;
  let accessToken: string | null = null;

  for (const [name, cookie] of cookies) {
    if (name.includes("auth-token")) {
      try {
        const parsed = JSON.parse(cookie.value);
        accessToken = Array.isArray(parsed) ? parsed[0] : parsed?.access_token ?? parsed;
      } catch {
        accessToken = cookie.value;
      }
      break;
    }
  }

  if (!accessToken || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.next();
  }

  // Validate the token and get user
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return NextResponse.next();
  }

  // Fetch plan info
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("plan, trial_questions_used")
    .eq("user_id", user.id)
    .single();

  const plan = profile?.plan ?? "trial";

  // Premium users pass through
  if (plan === "premium_individual" || plan === "corporativo") {
    return NextResponse.next();
  }

  // Trial user — check limits
  const trialQuestionsUsed = profile?.trial_questions_used ?? 0;
  const pathname = req.nextUrl.pathname;

  // /estudiar/* — check question limit
  if (pathname.startsWith("/estudiar")) {
    if (trialQuestionsUsed >= TRIAL_QUESTION_LIMIT) {
      return NextResponse.redirect(
        new URL("/upgrade?reason=quiz_limit", req.url)
      );
    }
    return NextResponse.next();
  }

  // /simulacro (not /simulacro/[id]/resultado) — check simulacro limit
  if (pathname === "/simulacro") {
    const { count } = await supabase
      .from("exam_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("exam_type", "simulacro");

    if ((count ?? 0) >= TRIAL_SIMULACRO_LIMIT) {
      return NextResponse.redirect(
        new URL("/upgrade?reason=simulacro_limit", req.url)
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}
