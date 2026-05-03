import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getAuthenticatedUserId } from "@/lib/security";
import { getUserPlanInfo } from "@/lib/plan-limits";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
    }

    const info = await getUserPlanInfo(userId);
    return NextResponse.json(info);
  } catch (error: unknown) {
    console.error("plan route error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
