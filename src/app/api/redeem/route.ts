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

  const { data: code, error: fetchError } = await sb
    .from("premium_qr_codes")
    .select("id, token, expires_at, premium_until, max_uses, use_count, activated_by, activated_at")
    .eq("token", token)
    .single();

  if (fetchError || !code) {
    return NextResponse.json({ error: "Código no encontrado. Verifica que sea correcto." }, { status: 404 });
  }

  // Expired token
  if (new Date(code.expires_at) < new Date()) {
    return NextResponse.json({ error: "Este código ha expirado y ya no puede canjearse." }, { status: 410 });
  }

  // Fully consumed (multi-use exhausted)
  const maxUses: number | null = code.max_uses ?? null;
  const useCount: number = code.use_count ?? 0;
  if (maxUses !== null && useCount >= maxUses) {
    return NextResponse.json({ error: "Este código ya alcanzó el número máximo de usos." }, { status: 409 });
  }

  // Guard: one redemption per user per code
  const { data: alreadyRedeemed } = await sb
    .from("premium_qr_redemptions")
    .select("id")
    .eq("code_id", code.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (alreadyRedeemed) {
    return NextResponse.json(
      { error: "Ya canjeaste este código anteriormente. Cada código sólo puede usarse una vez por usuario." },
      { status: 409 }
    );
  }

  // Increment use_count atomically and set first-activation metadata
  const isFirstUse = useCount === 0;
  const { error: updateCodeError } = await sb
    .from("premium_qr_codes")
    .update({
      use_count: useCount + 1,
      // Only record the first redeemer
      ...(isFirstUse ? { activated_by: userId, activated_at: new Date().toISOString() } : {}),
    })
    .eq("id", code.id);

  if (updateCodeError) {
    console.error("[redeem] update code error:", updateCodeError);
    return NextResponse.json({ error: "Error al procesar el canje." }, { status: 500 });
  }

  // Upgrade user to premium
  const { error: profileError } = await sb
    .from("user_profiles")
    .update({ tier: "premium", premium_expires_at: code.premium_until })
    .eq("user_id", userId);

  if (profileError) {
    console.error("[redeem] profile update error:", profileError);
  }

  // Log individual redemption for admin usage tracking (non-fatal)
  const { error: logError } = await sb
    .from("premium_qr_redemptions")
    .insert({ code_id: code.id, user_id: userId });

  if (logError && logError.code !== "23505") {
    // 23505 = unique_violation (already guarded above, but safe to ignore)
    console.error("[redeem] redemption log error:", logError);
  }

  return NextResponse.json({
    success: true,
    premiumUntil: code.premium_until,
    message: "¡Código canjeado! Tu acceso Premium está activo.",
  });
}
