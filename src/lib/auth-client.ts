"use client";

import { supabase } from "@/lib/supabase";

export async function buildAuthHeaders(base: HeadersInit = {}) {
  const sb = supabase();
  const {
    data: { session },
  } = await sb.auth.getSession();

  if (!session?.access_token || !session.user?.id) {
    throw new Error("Debes iniciar sesión con Google para usar esta función.");
  }

  return {
    ...base,
    Authorization: `Bearer ${session.access_token}`,
  };
}

