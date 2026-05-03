import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://certifik-pld.vercel.app";

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
    }

    const body = (await req.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }

    const sb = supabaseAdmin();

    // Verify caller is a corporate admin
    const { data: company, error: companyErr } = await sb
      .from("companies")
      .select("id, name, max_seats, seats_used")
      .eq("admin_user_id", userId)
      .single();

    if (companyErr || !company) {
      return NextResponse.json({ error: "No tienes acceso a este recurso." }, { status: 403 });
    }

    if ((company.seats_used ?? 0) >= (company.max_seats ?? 5)) {
      return NextResponse.json({ error: "Se han agotado los lugares disponibles en tu empresa." }, { status: 409 });
    }

    // Check for an existing pending (non-expired, non-accepted) invitation
    const { data: existing } = await sb
      .from("company_invitations")
      .select("token, expires_at")
      .eq("company_id", company.id)
      .eq("email", email)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    let token: string;

    if (existing) {
      token = existing.token as string;
    } else {
      // Insert new invitation — DB generates the token UUID
      const { data: inv, error: invErr } = await sb
        .from("company_invitations")
        .insert({
          company_id: company.id,
          invited_by: userId,
          email,
        })
        .select("token")
        .single();

      if (invErr || !inv) throw invErr ?? new Error("No se pudo crear la invitación.");
      token = inv.token as string;
    }

    const inviteUrl = `${BASE_URL}/register/corporativo?token=${token}`;

    // Optional: send via Supabase Auth invite (creates magic-link to our URL)
    // If RESEND_API_KEY is ever added, wire it here instead.
    console.log(`[Invite] ${email} → ${inviteUrl}`);

    return NextResponse.json({ success: true, inviteUrl, token });
  } catch (error: unknown) {
    console.error("invite error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
