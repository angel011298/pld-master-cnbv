import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

// POST /api/redeem — redeem a premium QR code token
export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Debes iniciar sesión para canjear este código." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token.trim().toLowerCase() : "";
  if (!token) {
    return NextResponse.json({ error: "Token inválido." }, { status: 400 });
  }

  const sb = supabaseAdmin();

  // Fetch the QR code record
  const { data: code, error: fetchError } = await sb
    .from("premium_qr_codes")
    .select("id, token, expires_at, premium_until, activated_by, activated_at")
    .eq("token", token)
    .single();

  if (fetchError || !code) {
    return NextResponse.json({ error: "Código no encontrado. Verifica que sea correcto." }, { status: 404 });
  }

  // Already used by someone else
  if (code.activated_by && code.activated_by !== userId) {
    return NextResponse.json({ error: "Este código ya fue canjeado por otro usuario." }, { status: 409 });
  }

  // Already used by this user
  if (code.activated_by === userId) {
    return NextResponse.json({
      alreadyActivated: true,
      premiumUntil: code.premium_until,
      message: "Ya canjeaste este código. Tu acceso premium está activo.",
    });
  }

  // Expired token
  if (new Date(code.expires_at) < new Date()) {
    return NextResponse.json({ error: "Este código ha expirado y ya no puede canjearse." }, { status: 410 });
  }

  // Mark token as used
  const { error: updateCodeError } = await sb
    .from("premium_qr_codes")
    .update({ activated_by: userId, activated_at: new Date().toISOString() })
    .eq("id", code.id);

  if (updateCodeError) {
    console.error("[redeem] update code error:", updateCodeError);
    return NextResponse.json({ error: "Error al procesar el canje." }, { status: 500 });
  }

  // Upgrade the user profile to premium
  const { error: profileError } = await sb
    .from("user_profiles")
    .update({
      tier: "premium",
      premium_expires_at: code.premium_until,
    })
    .eq("user_id", userId);

  if (profileError) {
    console.error("[redeem] profile update error:", profileError);
    // Don't fail — code is already marked used; log for manual resolution
  }

  return NextResponse.json({
    success: true,
    premiumUntil: code.premium_until,
    message: "¡Código canjeado! Tu acceso Premium está activo.",
  });
}
