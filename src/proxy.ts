import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const session = await auth();

  // /dashboard requiere premium
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    const accessLevel = (session.user as any).access_level;
    if (accessLevel === "free" || !accessLevel) {
      return NextResponse.redirect(new URL("/paywall", req.url));
    }
  }

  // /admin requiere super_admin
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const role = (session?.user as any)?.role;
    if (!session || role !== "super_admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
