import { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/security";
import { supabaseAdmin } from "@/lib/supabase";

export async function isSuperAdmin(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("user_profiles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.role as string | undefined) === "super_admin";
}

export async function requireSuperAdmin(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return {
      ok: false as const,
      status: 401,
      error: "No autenticado.",
    };
  }
  const allowed = await isSuperAdmin(userId);
  if (!allowed) {
    return {
      ok: false as const,
      status: 403,
      error: "Solo super admin.",
    };
  }
  return { ok: true as const, userId };
}
