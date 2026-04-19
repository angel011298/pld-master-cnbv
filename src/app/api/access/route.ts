import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getAuthenticatedUserId } from "@/lib/security";
import { getUserAccess } from "@/lib/access";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ level: "free", active: false, role: "user" });

  const access = await getUserAccess(userId);
  if (!access) return NextResponse.json({ level: "free", active: false, role: "user" });

  return NextResponse.json(access);
}
