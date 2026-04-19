import { supabaseAdmin } from "@/lib/supabase";

export type AccessLevel = "free" | "premium" | "b2b_active" | "super_admin";

export type AccessInfo = {
  level: AccessLevel;
  expires_at: string | null;
  organization_id: string | null;
  exam_cycle: string | null;
  role: "user" | "super_admin";
  active: boolean;
};

export async function getUserAccess(userId: string | null): Promise<AccessInfo | null> {
  if (!userId) return null;
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("user_profiles")
    .select("access_level, access_expires_at, organization_id, exam_cycle, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  const role = (data.role as "user" | "super_admin" | null) ?? "user";
  const level = (data.access_level as AccessLevel | null) ?? "free";
  const expires = data.access_expires_at as string | null;
  const active = role === "super_admin" || !expires || new Date(expires) > new Date();

  return {
    level: role === "super_admin" ? "super_admin" : level,
    expires_at: expires,
    organization_id: (data.organization_id as string | null) ?? null,
    exam_cycle: (data.exam_cycle as string | null) ?? null,
    role,
    active,
  };
}

export function computeCycleExpiry(cycle: string | null): string | null {
  if (!cycle) return null;
  if (cycle === "jun_2026") return "2026-06-28T23:59:59.000Z";
  if (cycle === "oct_2026") return "2026-10-25T23:59:59.000Z";
  if (cycle === "recertificacion_5anos") {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 5);
    return d.toISOString();
  }
  return null;
}
