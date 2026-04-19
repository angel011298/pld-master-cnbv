import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId, sanitizeText } from "@/lib/security";
import { sendEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const body = (await req.json()) as { email?: string };
    const email = sanitizeText(body.email ?? "", 200).toLowerCase();
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Email inválido." }, { status: 400 });

    const sb = supabaseAdmin();
    const { data: org } = await sb
      .from("organizations")
      .select("id, name, max_seats, used_seats")
      .eq("admin_user_id", userId)
      .maybeSingle();

    if (!org) return NextResponse.json({ error: "No eres admin de ninguna organización." }, { status: 403 });
    if (org.used_seats >= org.max_seats) {
      return NextResponse.json({ error: "No quedan asientos disponibles." }, { status: 400 });
    }

    const { error: insErr } = await sb
      .from("organization_members")
      .insert({ organization_id: org.id, email, role: "member" });

    if (insErr) {
      const msg = insErr.message.includes("duplicate") ? "Ese email ya fue invitado." : insErr.message;
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    await sb
      .from("organizations")
      .update({ used_seats: org.used_seats + 1 })
      .eq("id", org.id);

    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://certifik.mx";

    try {
      await sendEmail({
        to: email,
        subject: `Te invitaron a Certifik PLD — ${org.name}`,
        html: `<h1>Invitación a Certifik PLD</h1>
<p>${org.name} te dio acceso a Certifik PLD para que te prepares para la certificación CNBV PLD/FT.</p>
<p><a href="${origin}/">Inicia sesión con Google usando este email</a> para activar tu cuenta.</p>`,
      });
    } catch (e) {
      console.error("invite email failed", e);
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
